import {
  bearingToLabel,
  beaufortIcon,
  uvIndexIcon,
} from "../icons/condition-map";
import type { MeteoconName } from "../icons/allowlist";
import type { PrecipType } from "../config";
import { localize, type LocalizeKey } from "../localize";
import { sliceHourlyForecast } from "../charts/hourly-window";
import type { ForecastItem } from "../types";
import {
  formatNumber,
  formatPrecip,
  formatTemp,
  formatTime,
  type WeatherSnapshot,
} from "../weather/adapter";
import { buildInterpretationCopy } from "./copy";
import {
  chartMetricId,
  groupTitleKey,
  metricGroup,
  type DetailMetricGroup,
} from "./groups";
import { seriesFromHourly, currentConditionsSeries } from "./series";
import { buildSunArcModel } from "./sun-arc-model";
import { buildUvBarModel } from "./uv-bar-model";
import type { DetailMetricId, DetailModel } from "./types";

export interface BuildDetailContext {
  metricId: DetailMetricId;
  snap: WeatherSnapshot;
  iconName: MeteoconName;
  hourlyForecast: ForecastItem[];
  language: string | undefined;
  bft: number;
  gustBft: number;
  hourlyPrecipType: PrecipType;
}

function heroForMetric(ctx: BuildDetailContext): {
  value: string;
  icon: MeteoconName;
} {
  const { metricId, snap, iconName, language, bft } = ctx;
  const group = metricGroup(metricId);

  if (group === "wind") {
    return {
      value:
        snap.windSpeed != null
          ? `${Math.round(snap.windSpeed)} ${snap.windSpeedUnit}`
          : "—",
      icon: beaufortIcon(bft),
    };
  }

  switch (metricId) {
    case "current":
      return {
        value: formatTemp(snap.temperature, snap.temperatureUnit) ?? "—",
        icon: iconName,
      };
    case "sun":
      return { value: "", icon: "sunrise" };
    case "humidity":
      return {
        value: formatNumber(snap.humidity, "%", 0) ?? "—",
        icon: "humidity",
      };
    case "dew_point":
      return {
        value: formatNumber(snap.dewPoint, snap.temperatureUnit) ?? "—",
        icon: "thermometer-raindrop",
      };
    case "uv_index":
      return {
        value: formatNumber(snap.uvIndex, "", 0) ?? "—",
        icon: uvIndexIcon(snap.uvIndex),
      };
    case "pressure":
      return {
        value: formatNumber(snap.pressure, ` ${snap.pressureUnit}`, 0) ?? "—",
        icon: "barometer",
      };
    case "cloud_coverage":
      return {
        value: formatNumber(snap.cloudCoverage, "%", 0) ?? "—",
        icon: "cloudy",
      };
    case "visibility":
      return {
        value:
          formatNumber(snap.visibility, ` ${snap.visibilityUnit}`, 0) ?? "—",
        icon: "fog",
      };
    case "precipitation":
      return {
        value: formatPrecip(snap.precipitation, snap.precipitationUnit) ?? "—",
        icon: "rain",
      };
    case "precipitation_probability":
      return {
        value: formatNumber(snap.precipitationProbability, "%", 0) ?? "—",
        icon: "rain",
      };
    default:
      return { value: "—", icon: "not-available" };
  }
}

function unitForSeries(metricId: DetailMetricId, snap: WeatherSnapshot): string {
  switch (metricId) {
    case "current":
    case "dew_point":
      return snap.temperatureUnit;
    case "humidity":
    case "cloud_coverage":
    case "precipitation_probability":
      return "%";
    case "wind_speed":
    case "wind_gust":
    case "wind_direction":
      return snap.windSpeedUnit;
    case "precipitation":
      return snap.precipitationUnit;
    default:
      return "";
  }
}

function relatedStats(ctx: BuildDetailContext): DetailModel["related"] {
  const { metricId, snap, language, bft, gustBft } = ctx;
  const group = metricGroup(metricId);
  const out: DetailModel["related"] = [];

  const push = (labelKey: LocalizeKey, value: string | null) => {
    if (!value || value === "—") return;
    out.push({ label: localize(labelKey, language), value });
  };

  switch (group) {
    case "current":
      push(
        "feels_like",
        formatNumber(snap.feelsLike, snap.temperatureUnit),
      );
      push("humidity", formatNumber(snap.humidity, "%", 0));
      break;
    case "wind":
      push(
        "wind_gust",
        snap.windGust != null
          ? `${Math.round(snap.windGust)} ${snap.windSpeedUnit}`
          : null,
      );
      push("wind_direction", bearingToLabel(snap.windBearing ?? undefined));
      push("beaufort", String(bft));
      break;
    case "humidity":
      push("dew_point", formatNumber(snap.dewPoint, snap.temperatureUnit));
      break;
    case "dew_point":
      push("humidity", formatNumber(snap.humidity, "%", 0));
      break;
    case "precipitation":
      if (metricId === "precipitation") {
        push(
          "precipitation_probability",
          formatNumber(snap.precipitationProbability, "%", 0),
        );
      } else {
        push(
          "precipitation",
          formatPrecip(snap.precipitation, snap.precipitationUnit),
        );
      }
      break;
    case "cloud_coverage":
      push("condition", snap.conditionLabel);
      break;
    case "sun":
      break;
    default:
      break;
  }

  return out.slice(0, 4);
}

function highLowFromHourly(
  items: ForecastItem[],
): { high: number | null; low: number | null } {
  const temps = items
    .map((i) => i.temperature)
    .filter((v): v is number => v != null && !Number.isNaN(v));
  if (!temps.length) return { high: null, low: null };
  return { high: Math.max(...temps), low: Math.min(...temps) };
}

export function buildDetailModel(ctx: BuildDetailContext): DetailModel {
  const group = metricGroup(ctx.metricId);
  const hero = heroForMetric(ctx);
  const seriesMetric = chartMetricId(ctx.metricId);
  const unit = unitForSeries(seriesMetric, ctx.snap);
  const series =
    group === "current"
      ? currentConditionsSeries(
          ctx.hourlyForecast,
          ctx.hourlyPrecipType,
          ctx.snap.precipitationUnit,
          unit,
          24,
        )
      : seriesFromHourly(ctx.hourlyForecast, seriesMetric, unit, 24);

  const { high, low } = highLowFromHourly(ctx.hourlyForecast);
  const hourlySlice = sliceHourlyForecast(ctx.hourlyForecast, 24);
  const copyMetricId =
    group === "wind" ? ("wind_speed" as DetailMetricId) : ctx.metricId;
  const copy = buildInterpretationCopy({
    metricId: copyMetricId,
    snap: ctx.snap,
    series,
    language: ctx.language,
    bft: ctx.bft,
    gustBft: ctx.gustBft,
    high,
    low,
    hourly: hourlySlice,
  });

  const model: DetailModel = {
    id: ctx.metricId,
    title: localize(groupTitleKey(group), ctx.language),
    heroValue: hero.value,
    heroIcon: hero.icon,
    copy,
    series,
    related: relatedStats(ctx),
  };

  if (group === "current" && high != null && low != null) {
    model.related.unshift(
      {
        label: localize("chart_high", ctx.language),
        value: formatTemp(high, ctx.snap.temperatureUnit) ?? String(high),
      },
      {
        label: localize("chart_low", ctx.language),
        value: formatTemp(low, ctx.snap.temperatureUnit) ?? String(low),
      },
    );
    model.related.splice(4);
  }

  if (group === "sun") {
    model.sunArc = buildSunArcModel(ctx.snap, ctx.language);
  }

  if (group === "uv_index") {
    model.uvBar = buildUvBarModel(ctx.snap, ctx.language);
  }

  if (group === "wind") {
    model.windForecastItems = sliceHourlyForecast(ctx.hourlyForecast, 24);
    model.showWindRow = model.windForecastItems.length > 0;
  }

  return model;
}

export function metricIdFromChip(
  config: {
    show_sun?: boolean;
    show_humidity?: boolean;
    show_wind_speed?: boolean;
    show_wind_gust?: boolean;
    show_wind_direction?: boolean;
    show_uv_index?: boolean;
    show_pressure?: boolean;
    show_cloud_coverage?: boolean;
    show_dew_point?: boolean;
    show_visibility?: boolean;
    show_precipitation?: boolean;
    show_precipitation_probability?: boolean;
  },
  chip: DetailMetricId,
): DetailMetricId | null {
  const map: Record<DetailMetricId, boolean | undefined> = {
    current: true,
    sun: config.show_sun,
    humidity: config.show_humidity,
    dew_point: config.show_dew_point,
    wind_speed: config.show_wind_speed,
    wind_gust: config.show_wind_gust,
    wind_direction: config.show_wind_direction,
    uv_index: config.show_uv_index,
    pressure: config.show_pressure,
    cloud_coverage: config.show_cloud_coverage,
    visibility: config.show_visibility,
    precipitation: config.show_precipitation,
    precipitation_probability: config.show_precipitation_probability,
  };
  return map[chip] ? chip : null;
}

export { metricGroup, type DetailMetricGroup };
