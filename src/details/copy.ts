import { bearingToLabel, windSpeedToBeaufort } from "../icons/condition-map";
import { localize, type LocalizeKey } from "../localize";
import type { ForecastItem } from "../types";
import type { WeatherSnapshot } from "../weather/adapter";
import type { DetailMetricId, MetricSeries } from "./types";
import { buildOutlookPhrase } from "./outlook";
import { uvCategory } from "./uv-bar-model";

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

function formatHour(iso: string, language: string | undefined): string {
  try {
    return new Intl.DateTimeFormat(language, { hour: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(11, 16);
  }
}

function daylightRemainingMs(snap: WeatherSnapshot): number | null {
  if (!snap.sunset) return null;
  const set = new Date(snap.sunset).getTime();
  if (Number.isNaN(set)) return null;
  return Math.max(0, set - Date.now());
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
  const { metricId, snap, series, language, bft, gustBft, hourly } = ctx;

  switch (metricId) {
    case "current":
      return buildCurrentConditionsCopy(snap, hourly, language);
    case "humidity":
    case "dew_point":
      return loc(humidityCopyKey(snap.dewPoint), language);
    case "wind_speed":
      return loc("copy_wind_speed", language, {
        bft: String(bft),
        dir: bearingToLabel(snap.windBearing ?? undefined),
      });
    case "wind_gust":
      return loc("copy_wind_gust", language, {
        bft: String(gustBft),
      });
    case "wind_direction":
      return loc("copy_wind_direction", language, {
        dir: bearingToLabel(snap.windBearing ?? undefined),
        bft: String(
          windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit),
        ),
      });
    case "precipitation": {
      const next = firstPrecipHour(series);
      if (next) {
        return loc("copy_precip_next", language, {
          time: formatHour(next, language),
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
      if (snap.isDay) {
        const rem = daylightRemainingMs(snap);
        if (rem != null && rem > 0) {
          return loc("copy_sun_daylight", language, {
            duration: formatDuration(rem, language),
          });
        }
        return loc("copy_sun_set_soon", language);
      }
      return loc("copy_sun_night", language);
    }
    default:
      return "";
  }
}
