import { sliceHourlyForecast } from "../charts/hourly-window";
import type { PrecipType } from "../config";
import type { ForecastItem } from "../types";
import type { HourlySlotItem } from "./sun-events";
import type { DetailMetricId, MetricPoint, MetricSeries } from "./types";

export type ForecastField =
  | "temperature"
  | "humidity"
  | "wind_speed"
  | "precipitation"
  | "precipitation_probability"
  | "cloud_coverage";

const FIELD_BY_METRIC: Partial<Record<DetailMetricId, ForecastField>> = {
  current: "temperature",
  humidity: "humidity",
  wind_speed: "wind_speed",
  wind_gust: "wind_speed",
  wind_direction: "wind_speed",
  precipitation: "precipitation",
  precipitation_probability: "precipitation_probability",
  cloud_coverage: "cloud_coverage",
};

function readField(item: ForecastItem, field: ForecastField): number | null {
  switch (field) {
    case "temperature":
      return item.temperature ?? null;
    case "humidity":
      return item.humidity ?? null;
    case "wind_speed":
      return item.wind_speed ?? null;
    case "precipitation":
      return item.precipitation ?? null;
    case "precipitation_probability":
      return item.precipitation_probability ?? null;
    case "cloud_coverage":
      return item.cloud_coverage ?? null;
    default:
      return null;
  }
}

/** Build a metric series from an already-sliced hourly window. */
export function seriesFromHourlySlice(
  slice: ForecastItem[] | HourlySlotItem[],
  metricId: DetailMetricId,
  unit: string,
): MetricSeries | null {
  const field = FIELD_BY_METRIC[metricId];
  if (!field) return null;
  if (!slice.length) return null;

  const points: MetricPoint[] = slice.map((item) => {
    const slot = item as HourlySlotItem;
    const value = readField(item, field);
    const point: MetricPoint = {
      t: item.datetime,
      value:
        value != null && !Number.isNaN(value) ? value : null,
    };
    if (slot.sunEvent) point.sunEvent = slot.sunEvent;
    return point;
  });

  const hasAnyValue = points.some((p) => p.value != null);
  if (!hasAnyValue) return null;

  const chartType =
    field === "precipitation" || field === "precipitation_probability"
      ? "bar"
      : "line";

  const series: MetricSeries = {
    id: metricId,
    unit,
    points,
    source: "forecast",
    chartType,
  };

  if (
    metricId === "wind_speed" ||
    metricId === "wind_gust" ||
    metricId === "wind_direction"
  ) {
    const gust = slice.map((item) => {
      const value = item.wind_gust;
      return value != null && !Number.isNaN(value) ? value : null;
    });
    if (gust.some((v) => v != null)) {
      series.gust = gust;
    }
  }

  return series;
}

/** Extract hourly forecast into a history-ready series (v1: forecast only). */
export function seriesFromHourly(
  items: ForecastItem[],
  metricId: DetailMetricId,
  unit: string,
  hours = 24,
  nowMs?: number,
): MetricSeries | null {
  const slice = sliceHourlyForecast(items, hours, nowMs);
  return seriesFromHourlySlice(slice, metricId, unit);
}

/** Current-conditions detail chart from a pre-sliced hourly window. */
export function currentConditionsSeriesFromSlice(
  slice: ForecastItem[] | HourlySlotItem[],
  precipType: PrecipType,
  precipUnit: string,
  temperatureUnit: string,
): MetricSeries | null {
  const base = seriesFromHourlySlice(slice, "current", temperatureUnit);
  if (!base) return null;

  const precip = slice.map((item) => {
    if ((item as HourlySlotItem).sunEvent) return null;
    const value =
      precipType === "probability"
        ? item.precipitation_probability
        : item.precipitation;
    return value != null && !Number.isNaN(value) ? value : null;
  });

  const feelsLike = slice.map((item) => {
    const value = item.apparent_temperature;
    return value != null && !Number.isNaN(value) ? value : null;
  });
  const hasFeelsLike = feelsLike.some((v) => v != null);

  return {
    ...base,
    precip,
    precipType,
    precipUnit,
    feelsLike: hasFeelsLike ? feelsLike : undefined,
  };
}

/** Re-index series arrays onto hourly row timestamps (ms match). */
export function alignMetricSeriesToHourlyRow(
  series: MetricSeries,
  row: ForecastItem[],
): MetricSeries {
  if (series.points.length === row.length) return series;

  const byMs = new Map(
    series.points.map((p, i) => [
      new Date(p.t).getTime(),
      {
        point: p,
        precip: series.precip?.[i] ?? null,
        feelsLike: series.feelsLike?.[i] ?? null,
        gust: series.gust?.[i] ?? null,
      },
    ]),
  );

  const points = row.map((item) => {
    const ms = new Date(item.datetime).getTime();
    const hit = Number.isNaN(ms) ? undefined : byMs.get(ms);
    if (hit) return hit.point;
    const value = item.temperature;
    return {
      t: item.datetime,
      value:
        value != null && !Number.isNaN(value) ? value : null,
    };
  });

  const precip = series.precip
    ? row.map((item) => {
        const ms = new Date(item.datetime).getTime();
        return Number.isNaN(ms) ? null : (byMs.get(ms)?.precip ?? null);
      })
    : undefined;

  const feelsLike = series.feelsLike
    ? row.map((item) => {
        const ms = new Date(item.datetime).getTime();
        if (Number.isNaN(ms)) return null;
        const hit = byMs.get(ms);
        if (hit) return hit.feelsLike;
        const value = item.apparent_temperature;
        return value != null && !Number.isNaN(value) ? value : null;
      })
    : undefined;

  const gust = series.gust
    ? row.map((item) => {
        const ms = new Date(item.datetime).getTime();
        return Number.isNaN(ms) ? null : (byMs.get(ms)?.gust ?? null);
      })
    : undefined;

  return {
    ...series,
    points,
    precip,
    feelsLike,
    gust,
  };
}

/** Current-conditions detail chart: temp line, optional feels-like, precip bars. */
export function currentConditionsSeries(
  items: ForecastItem[],
  precipType: PrecipType,
  precipUnit: string,
  temperatureUnit: string,
  hours = 24,
  nowMs?: number,
): MetricSeries | null {
  const slice = sliceHourlyForecast(items, hours, nowMs);
  return currentConditionsSeriesFromSlice(
    slice,
    precipType,
    precipUnit,
    temperatureUnit,
  );
}

/** Reserved for v2 Recorder merge — returns forecast unchanged today. */
export function mergeSeries(
  forecast: MetricSeries,
  _history: MetricSeries | null,
): MetricSeries {
  return forecast;
}

export function metricSeriesFingerprint(series: MetricSeries): string {
  return JSON.stringify(series);
}
