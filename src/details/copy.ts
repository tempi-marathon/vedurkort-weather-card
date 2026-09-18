import { bearingToLabel, windSpeedToBeaufort } from "../icons/condition-map";
import { localize, type LocalizeKey } from "../localize";
import type { ForecastItem } from "../types";
import {
  formatTime,
  nextSunEvent,
  type WeatherSnapshot,
} from "../weather/adapter";
import {
  formatWindHeading,
  formatWindSpeed,
  type WindSpeedDisplayUnit,
} from "../weather/wind-units";
import type { DetailMetricId, MetricSeries } from "./types";
import { buildOutlookPhrase } from "./outlook";
import { uvCategory } from "./uv-bar-model";
import { metricGroup } from "./groups";

function loc(
  key: LocalizeKey,
  language: string | undefined,
  vars?: Record<string, string>,
): string {
  return localize(key, language, vars);
}

export interface CopyContext {
  metricId: DetailMetricId;
  snap: WeatherSnapshot;
  series: MetricSeries | null;
  language: string | undefined;
  bft: number;
  gustBft: number;
  high: number | null;
  low: number | null;
  hourly: ForecastItem[];
  windSpeedUnit?: WindSpeedDisplayUnit;
}

function humidityComfort(dewPoint: number | null): string {
  if (dewPoint == null || Number.isNaN(dewPoint)) return "unknown";
  if (dewPoint < 10) return "dry";
  if (dewPoint < 16) return "comfortable";
  if (dewPoint < 21) return "humid";
  return "muggy";
}

function pressureBand(pressure: number | null, unit: string): string {
  if (pressure == null || Number.isNaN(pressure)) return "unknown";
  const u = unit.toLowerCase();
  let hPa = pressure;
  if (u.includes("inhg") || u.includes("in")) hPa = pressure * 33.8639;
  else if (u.includes("mbar") || u === "mb") hPa = pressure;
  else if (u.includes("kpa")) hPa = pressure * 10;
  if (hPa < 1000) return "low";
  if (hPa > 1025) return "high";
  return "normal";
}

function visibilityBand(visibility: number | null, unit: string): string {
  if (visibility == null || Number.isNaN(visibility)) return "unknown";
  const u = unit.toLowerCase();
  let km = visibility;
  if (u.includes("mi")) km = visibility * 1.60934;
  else if (u.includes("ft") || u.includes("feet")) km = visibility * 0.0003048;
  if (km < 1) return "fog";
  if (km < 4) return "haze";
  return "clear";
}

function cloudBand(coverage: number | null): string {
  if (coverage == null || Number.isNaN(coverage)) return "unknown";
  if (coverage < 25) return "clear";
  if (coverage < 65) return "partly";
  if (coverage < 90) return "mostly";
  return "overcast";
}

function uvCopyKey(uv: number | null): LocalizeKey {
  const map: Record<string, LocalizeKey> = {
    low: "copy_uv_low",
    moderate: "copy_uv_moderate",
    high: "copy_uv_high",
    very_high: "copy_uv_very_high",
    extreme: "copy_uv_extreme",
    unknown: "copy_uv_unknown",
  };
  return map[uvCategory(uv)] ?? "copy_uv_unknown";
}

function humidityCopyKey(dewPoint: number | null): LocalizeKey {
  const map: Record<string, LocalizeKey> = {
    dry: "copy_humidity_dry",
    comfortable: "copy_humidity_comfortable",
    humid: "copy_humidity_humid",
    muggy: "copy_humidity_muggy",
    unknown: "copy_humidity_unknown",
  };
  return map[humidityComfort(dewPoint)] ?? "copy_humidity_unknown";
}

function cloudCopyKey(coverage: number | null): LocalizeKey {
  const map: Record<string, LocalizeKey> = {
    clear: "copy_cloud_clear",
    partly: "copy_cloud_partly",
    mostly: "copy_cloud_mostly",
    overcast: "copy_cloud_overcast",
    unknown: "copy_cloud_unknown",
  };
  return map[cloudBand(coverage)] ?? "copy_cloud_unknown";
}

function pressureCopyKey(pressure: number | null, unit: string): LocalizeKey {
  const map: Record<string, LocalizeKey> = {
    low: "copy_pressure_low",
    normal: "copy_pressure_normal",
    high: "copy_pressure_high",
    unknown: "copy_pressure_unknown",
  };
  return map[pressureBand(pressure, unit)] ?? "copy_pressure_unknown";
}

function visibilityCopyKey(
  visibility: number | null,
  unit: string,
): LocalizeKey {
  const map: Record<string, LocalizeKey> = {
    fog: "copy_visibility_fog",
    haze: "copy_visibility_haze",
    clear: "copy_visibility_clear",
    unknown: "copy_visibility_unknown",
  };
  return map[visibilityBand(visibility, unit)] ?? "copy_visibility_unknown";
}

function firstPrecipHour(series: MetricSeries | null): string | null {
  if (!series) return null;
  for (const p of series.points) {
    if (p.value != null && p.value > 0) return p.t;
  }
  return null;
}

function peakValue(series: MetricSeries | null): number | null {
  if (!series?.points.length) return null;
  const values = series.points
    .map((p) => p.value)
    .filter((v): v is number => v != null && !Number.isNaN(v));
  if (!values.length) return null;
  return Math.max(...values);
}

function daylightRemainingMs(
  snap: WeatherSnapshot,
  nowMs = Date.now(),
): number | null {
  const next = nextSunEvent(snap);
  if (!next || next.kind !== "sunset") return null;
  const set = new Date(next.at).getTime();
  if (Number.isNaN(set)) return null;
  return Math.max(0, set - nowMs);
}

function sunriseRemainingMs(
  snap: WeatherSnapshot,
  nowMs = Date.now(),
): number | null {
  const next = nextSunEvent(snap);
  if (!next || next.kind !== "sunrise") return null;
  const rise = new Date(next.at).getTime();
  if (Number.isNaN(rise)) return null;
  return Math.max(0, rise - nowMs);
}

function formatDuration(ms: number, language: string | undefined): string {
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) {
    return loc("duration_hours_mins", language, {
      hours: String(hours),
      mins: String(mins),
    });
  }
  return loc("duration_mins", language, { mins: String(mins) });
}

/** Smallest angle between two bearings (0–180). */
export function bearingDelta(
  a: number | string | null | undefined,
  b: number | string | null | undefined,
): number | null {
  const toNum = (v: number | string | null | undefined): number | null => {
    if (v == null) return null;
    const n = typeof v === "string" ? Number.parseFloat(v) : v;
    return Number.isNaN(n) ? null : n;
  };
  const aa = toNum(a);
  const bb = toNum(b);
  if (aa == null || bb == null) return null;
  const d = Math.abs((((aa - bb) % 360) + 360) % 360);
  return Math.min(d, 360 - d);
}

function windOutlookKey(
  currentBft: number,
  hourly: ForecastItem[],
  unit: string,
): LocalizeKey {
  const speeds = hourly
    .map((h) => h.wind_speed)
    .filter((v): v is number => v != null && !Number.isNaN(v));
  if (!speeds.length) return "copy_wind_outlook_steady";
  const avg =
    speeds.reduce((sum, v) => sum + v, 0) / speeds.length;
  const avgBft = windSpeedToBeaufort(avg, unit);
  if (avgBft >= currentBft + 1) return "copy_wind_outlook_picking_up";
  if (avgBft <= currentBft - 1) return "copy_wind_outlook_easing";
  return "copy_wind_outlook_steady";
}

function windShiftDirection(
  currentBearing: number | string | null | undefined,
  hourly: ForecastItem[],
): string | null {
  const current =
    typeof currentBearing === "string"
      ? Number.parseFloat(currentBearing)
      : currentBearing;
  if (current == null || Number.isNaN(current)) return null;
  let bestDelta = 0;
  let bestBearing: number | string | null = null;
  for (const h of hourly) {
    const delta = bearingDelta(current, h.wind_bearing);
    if (delta != null && delta > bestDelta) {
      bestDelta = delta;
      bestBearing = h.wind_bearing ?? null;
    }
  }
  if (bestDelta < 90 || bestBearing == null) return null;
  const label = bearingToLabel(bestBearing);
  return label === "—" ? null : label;
}

function buildWindCopy(ctx: CopyContext): string {
  const { snap, language, bft, gustBft, hourly, windSpeedUnit } = ctx;
  const parts: string[] = [];

  if (!hourly.length) {
    const heading = formatWindHeading(
      snap.windSpeed,
      bearingToLabel(snap.windBearing ?? undefined),
      snap.windSpeedUnit,
      windSpeedUnit,
    );
    if (!heading) return loc("copy_wind_outlook_steady", language);
    return loc("copy_wind_simple", language, { heading });
  }

  parts.push(loc(windOutlookKey(bft, hourly, snap.windSpeedUnit), language));

  if (gustBft >= bft + 1) {
    const gustFmt = formatWindSpeed(
      snap.windGust,
      snap.windSpeedUnit,
      windSpeedUnit,
    );
    if (gustFmt) {
      parts.push(
        loc("copy_wind_gust_extra", language, { gust: gustFmt.text }),
      );
    }
  }

  const shiftDir = windShiftDirection(snap.windBearing, hourly);
  if (shiftDir) {
    parts.push(loc("copy_wind_shift", language, { dir: shiftDir }));
  }

  return parts.join(" ");
}

export function buildCurrentConditionsCopy(
  snap: WeatherSnapshot,
  hourly: ForecastItem[],
  language: string | undefined,
): string {
  if (snap.temperature == null) {
    return loc("copy_current_unknown", language);
  }
  if (!hourly.length) {
    return loc("copy_current_simple", language, {
      condition: snap.conditionLabel,
    });
  }
  const outlook = buildOutlookPhrase(hourly, snap, language);
  return loc("copy_current_with_outlook", language, {
    condition: snap.conditionLabel,
    outlook,
  });
}

export function buildInterpretationCopy(ctx: CopyContext): string {
  const { metricId, snap, series, language, hourly } = ctx;

  if (metricGroup(metricId) === "wind") {
    return buildWindCopy(ctx);
  }

  switch (metricId) {
    case "current":
      return buildCurrentConditionsCopy(snap, hourly, language);
    case "humidity":
    case "dew_point":
      return loc(humidityCopyKey(snap.dewPoint), language);
    case "precipitation": {
      const next = firstPrecipHour(series);
      if (next) {
        return loc("copy_precip_next", language, {
          time: formatTime(next, language),
        });
      }
      return loc("copy_precip_none", language);
    }
    case "precipitation_probability": {
      const peak = peakValue(series);
      if (peak != null && peak > 0) {
        return loc("copy_precip_prob_peak", language, {
          pct: String(Math.round(peak)),
        });
      }
      return loc("copy_precip_prob_low", language);
    }
    case "cloud_coverage":
      return loc(cloudCopyKey(snap.cloudCoverage), language);
    case "uv_index":
      return loc(uvCopyKey(snap.uvIndex), language);
    case "pressure":
      return loc(pressureCopyKey(snap.pressure, snap.pressureUnit), language);
    case "visibility":
      return loc(
        visibilityCopyKey(snap.visibility, snap.visibilityUnit),
        language,
      );
    case "sun": {
      const next = nextSunEvent(snap);
      if (next?.kind === "sunset") {
        const rem = daylightRemainingMs(snap);
        if (rem != null && rem > 0) {
          return loc("copy_sun_daylight", language, {
            duration: formatDuration(rem, language),
          });
        }
        return loc("copy_sun_set_soon", language);
      }
      if (next?.kind === "sunrise") {
        const rem = sunriseRemainingMs(snap);
        if (rem != null && rem > 0) {
          return loc("copy_sun_night", language, {
            duration: formatDuration(rem, language),
          });
        }
      }
      return loc("copy_sun_night_unknown", language);
    }
    default:
      return "";
  }
}
