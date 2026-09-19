import {
  bearingToLabel,
  beaufortIcon,
  uvIndexIcon,
} from "../icons/condition-map";
import type { MeteoconName } from "../icons/allowlist";
import type { PrecipType, WindSpeedDisplayUnit } from "../config";
import { localize, type LocalizeKey } from "../localize";
import { sliceHourlyForecast, hourlyForecastStartIndex } from "../charts/hourly-window";
import type { ForecastItem } from "../types";
import {
  formatNumber,
  formatPrecip,
  formatTemp,
  type WeatherSnapshot,
} from "../weather/adapter";
import {
  formatWindHeading,
  formatWindSpeed,
  normalizeWindUnit,
  resolveWindDisplayUnit,
  windUnitLabel,
} from "../weather/wind-units";
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
import type { DetailMetricId, DetailModel, MetricSeries } from "./types";
import { pollenLevelClass } from "../pollen/colors";
import { pollenIcon } from "../pollen/icons";
import type { PollenSnapshot } from "../pollen/types";

export interface BuildDetailContext {
  metricId: DetailMetricId;
  snap: WeatherSnapshot;
  iconName: MeteoconName;
  hourlyForecast: ForecastItem[];
  language: string | undefined;
  bft: number;
  gustBft: number;
  hourlyPrecipType: PrecipType;
  /** Display preference for wind chip/sheet/chart. */
  windSpeedUnit?: WindSpeedDisplayUnit;
  /** ha-pollen snapshot when opening the pollen detail sheet. */
  pollen?: PollenSnapshot | null;
}

function heroForMetric(ctx: BuildDetailContext): {
  value: string;
  icon: MeteoconName;
} {
  const { metricId, snap, iconName, bft, windSpeedUnit } = ctx;
  const group = metricGroup(metricId);

  if (group === "wind") {
    const dir = bearingToLabel(snap.windBearing ?? undefined);
    const heading = formatWindHeading(
      snap.windSpeed,
      dir,
      snap.windSpeedUnit,
      windSpeedUnit,
    );
    return {
      value: heading || "—",
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
    case "pollen": {
      const pollen = ctx.pollen;
      const label = pollen?.overallLevelLabel
        ? localize(
            `pollen_level_${pollen.overallLevelLabel}` as LocalizeKey,
            ctx.language,
          )
        : "—";
      const dominant = pollen?.dominantSpecies
        ? localize(
            `pollen_species_${pollen.dominantSpecies}` as LocalizeKey,
            ctx.language,
          )
        : null;
      return {
        value: dominant ? `${label} · ${dominant}` : label,
        icon: pollenIcon(
          pollen?.overallLevelLabel,
          pollen?.dominantSpecies ?? "overall",
        ),
      };
    }
    default:
      return { value: "—", icon: "not-available" };
  }
}

function unitForSeries(
  metricId: DetailMetricId,
  snap: WeatherSnapshot,
  windDisplay?: WindSpeedDisplayUnit,
): string {
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
      return windUnitLabel(windDisplay, snap.windSpeedUnit);
    case "precipitation":
      return snap.precipitationUnit;
    default:
      return "";
  }
}

function convertWindSeries(
  series: MetricSeries,
  fromUnit: string,
  display: WindSpeedDisplayUnit | undefined,
): MetricSeries {
  const convertPoint = (value: number | null): number | null => {
    if (value == null) return null;
    return formatWindSpeed(value, fromUnit, display)?.number ?? null;
  };

  return {
    ...series,
    unit: windUnitLabel(display, fromUnit),
    points: series.points.map((p) => ({
      t: p.t,
      value: convertPoint(p.value),
    })),
    gust: series.gust?.map((v) => convertPoint(v)),
  };
}

/** Extra unit rows for the wind related table. */
function windExtraUnits(
  display: WindSpeedDisplayUnit | undefined,
  nativeUnit: string,
): WindSpeedDisplayUnit[] {
  const effective = normalizeWindUnit(
    resolveWindDisplayUnit(display, nativeUnit),
  );
  const native = normalizeWindUnit(nativeUnit);

  if (effective === "beaufort") {
    if (native === "km/h") return ["km/h", "m/s"];
    if (native === "mph") return ["mph"];
    if (native === "m/s") return ["m/s"];
    return [];
  }

  if (
    effective === "km/h" ||
    effective === "mph" ||
    effective === "m/s"
  ) {
    return ["beaufort"];
  }

  return [];
}

function relatedStats(ctx: BuildDetailContext): DetailModel["related"] {
  const { metricId, snap, language, windSpeedUnit } = ctx;
  const group = metricGroup(metricId);
  const out: DetailModel["related"] = [];

  const push = (
    labelKey: LocalizeKey,
    value: string | null,
    subline?: string | null,
  ) => {
    if (!value || value === "—") return;
    out.push({
      label: localize(labelKey, language),
      value,
      ...(subline ? { subline } : {}),
    });
  };

  switch (group) {
    case "current":
      push(
        "feels_like",
        formatNumber(snap.feelsLike, snap.temperatureUnit),
      );
      push("humidity", formatNumber(snap.humidity, "%", 0));
      break;
    case "wind": {
      const extras = windExtraUnits(windSpeedUnit, snap.windSpeedUnit);
      const speedSub = formatWindExtraSubline(
        snap.windSpeed,
        snap.windSpeedUnit,
        extras,
      );
      const speedFmt = formatWindSpeed(
        snap.windSpeed,
        snap.windSpeedUnit,
        windSpeedUnit,
      );
      push("wind_speed", speedFmt?.text ?? null, speedSub);

      const gustSub = formatWindExtraSubline(
        snap.windGust,
        snap.windSpeedUnit,
        extras,
      );
      const gustFmt = formatWindSpeed(
        snap.windGust,
        snap.windSpeedUnit,
        windSpeedUnit,
      );
      push("wind_gust", gustFmt?.text ?? null, gustSub);

      push("wind_direction", bearingToLabel(snap.windBearing ?? undefined));
      break;
    }
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

  return group === "wind" ? out : out.slice(0, 4);
}

/** Join alternate-unit readings for a related-stat subline. */
function formatWindExtraSubline(
  value: number | null | undefined,
  fromUnit: string,
  extras: WindSpeedDisplayUnit[],
): string | null {
  if (!extras.length || value == null) return null;
  const parts: string[] = [];
  for (const extra of extras) {
    const fmt = formatWindSpeed(value, fromUnit, extra);
    if (fmt) parts.push(fmt.text);
  }
  return parts.length ? parts.join(" · ") : null;
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
  if (ctx.metricId === "pollen") {
    return buildPollenDetailModel(ctx);
  }

  const group = metricGroup(ctx.metricId);
  const hero = heroForMetric(ctx);
  const seriesMetric = chartMetricId(ctx.metricId);
  const unit =
    group === "wind"
      ? ctx.snap.windSpeedUnit
      : unitForSeries(seriesMetric, ctx.snap, ctx.windSpeedUnit);
  let series =
    group === "current"
      ? currentConditionsSeries(
          ctx.hourlyForecast,
          ctx.hourlyPrecipType,
          ctx.snap.precipitationUnit,
          unit,
          24,
        )
      : seriesFromHourly(ctx.hourlyForecast, seriesMetric, unit, 24);

  if (group === "wind" && series) {
    series = convertWindSeries(
      series,
      ctx.snap.windSpeedUnit,
      ctx.windSpeedUnit,
    );
  }

  const { high, low } = highLowFromHourly(ctx.hourlyForecast);
  const hourlySlice = sliceHourlyForecast(ctx.hourlyForecast, 24);
  const copy = buildInterpretationCopy({
    metricId: ctx.metricId,
    snap: ctx.snap,
    series,
    language: ctx.language,
    bft: ctx.bft,
    gustBft: ctx.gustBft,
    high,
    low,
    hourly: hourlySlice,
    windSpeedUnit: ctx.windSpeedUnit,
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

  if (group === "current" || group === "wind") {
    model.hourlyRowItems = hourlySlice;
    if (group === "current") {
      model.showConditionRow = model.hourlyRowItems.length > 0;
    } else {
      model.showWindRow = model.hourlyRowItems.length > 0;
    }
  }

  return model;
}

function buildPollenDetailModel(ctx: BuildDetailContext): DetailModel {
  const pollen = ctx.pollen;
  const hero = heroForMetric(ctx);
  const series = pollenSeries(pollen);
  const related: DetailModel["related"] = [];
  if (pollen) {
    for (const s of pollen.species) {
      const name = localize(
        `pollen_species_${s.species}` as LocalizeKey,
        ctx.language,
      );
      const grains =
        s.current != null ? `${s.current} grains/m³` : "—";
      const subline =
        s.levelLabel && s.levelLabel !== "none"
          ? localize(
              `pollen_level_${s.levelLabel}` as LocalizeKey,
              ctx.language,
            )
          : undefined;
      const tone = pollenLevelClass(s.levelLabel);
      related.push({
        label: name,
        value: grains,
        ...(subline ? { subline, ...(tone ? { sublineClass: tone } : {}) } : {}),
      });
    }
    if (pollen.attribution) {
      related.push({
        label: localize("pollen_attribution", ctx.language),
        value: pollen.attribution,
      });
    }
  }

  const copy = pollen
    ? localize(
        pollen.overallLevelLabel === "high"
          ? "pollen_copy_high"
          : pollen.overallLevelLabel === "medium"
            ? "pollen_copy_medium"
            : pollen.overallLevelLabel === "low"
              ? "pollen_copy_low"
              : "pollen_copy_none",
        ctx.language,
      )
    : localize("pollen_copy_unavailable", ctx.language);

  return {
    id: "pollen",
    title: localize("pollen", ctx.language),
    heroValue: hero.value,
    heroIcon: hero.icon,
    heroValueClass: pollenLevelClass(pollen?.overallLevelLabel),
    copy,
    series,
    related: related.slice(0, 8),
  };
}

function pollenSeries(
  pollen: PollenSnapshot | null | undefined,
  nowMs: number = Date.now(),
): MetricSeries | null {
  if (!pollen?.forecastHourly.length) return null;
  const asItems = pollen.forecastHourly.map((p) => ({ datetime: p.t }));
  const start = hourlyForecastStartIndex(asItems, nowMs);
  const window = pollen.forecastHourly.slice(start, start + 24);
  const points = window.map((p) => ({
    t: p.t,
    value: p.value,
  }));
  if (!points.some((p) => p.value != null)) return null;
  return {
    id: "pollen",
    unit: "grains/m³",
    points,
    source: "forecast",
    chartType: "line",
  };
}

export function metricIdFromChip(
  config: {
    show_sun?: boolean;
    show_humidity?: boolean;
    show_wind?: boolean;
    show_uv_index?: boolean;
    show_pressure?: boolean;
    show_cloud_coverage?: boolean;
    show_dew_point?: boolean;
    show_visibility?: boolean;
    show_precipitation?: boolean;
    show_precipitation_probability?: boolean;
    show_pollen?: boolean;
  },
  chip: DetailMetricId,
): DetailMetricId | null {
  const map: Record<DetailMetricId, boolean | undefined> = {
    current: true,
    sun: config.show_sun,
    humidity: config.show_humidity,
    dew_point: config.show_dew_point,
    wind_speed: config.show_wind,
    wind_gust: config.show_wind,
    wind_direction: config.show_wind,
    uv_index: config.show_uv_index,
    pressure: config.show_pressure,
    cloud_coverage: config.show_cloud_coverage,
    visibility: config.show_visibility,
    precipitation: config.show_precipitation,
    precipitation_probability: config.show_precipitation_probability,
    pollen: config.show_pollen,
  };
  return map[chip] ? chip : null;
}

export { metricGroup, type DetailMetricGroup };
