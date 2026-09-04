import { sliceHourlyForecast } from "../charts/hourly-window";
import type { PrecipType } from "../config";
import type { ForecastItem } from "../types";
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

/** Extract hourly forecast into a history-ready series (v1: forecast only). */
export function seriesFromHourly(
  items: ForecastItem[],
  metricId: DetailMetricId,
  unit: string,
  hours = 24,
  nowMs?: number,
): MetricSeries | null {
  const field = FIELD_BY_METRIC[metricId];
  if (!field) return null;

  const slice = sliceHourlyForecast(items, hours, nowMs);
  if (!slice.length) return null;

  const points: MetricPoint[] = slice.map((item) => {
    const value = readField(item, field);
    return {
      t: item.datetime,
      value:
        value != null && !Number.isNaN(value) ? value : null,
    };
  });

  const hasAnyValue = points.some((p) => p.value != null);
  if (!hasAnyValue) return null;

  const chartType =
    field === "precipitation" || field === "precipitation_probability"
      ? "bar"
      : "line";

  return {
    id: metricId,
    unit,
    points,
    source: "forecast",
    chartType,
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
  const base = seriesFromHourly(items, "current", temperatureUnit, hours, nowMs);
  if (!base) return null;

  const slice = sliceHourlyForecast(items, hours, nowMs);
  const precip = slice.map((item) => {
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
