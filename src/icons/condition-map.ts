import type { MeteoconName } from "./allowlist";
import type { HaWeatherCondition } from "../types";

/** Prefer sunless icons when coverage is missing or at/above this percent. */
export const OVERCAST_CLOUD_COVERAGE = 65;

/** True when coverage is unknown/NaN or fully enough overcast for sunless icons. */
export function isOvercastCloudCover(
  cloudCoverage?: number | null,
): boolean {
  return (
    cloudCoverage == null ||
    Number.isNaN(cloudCoverage) ||
    cloudCoverage >= OVERCAST_CLOUD_COVERAGE
  );
}

/**
 * Map HA weather conditions → Meteocon names with day/night variants.
 * Cloudy / precip / storm icons use sunless names when cloud coverage is
 * missing or ≥ {@link OVERCAST_CLOUD_COVERAGE}; otherwise day/night peeks.
 */
export function conditionToMeteocon(
  condition: HaWeatherCondition | undefined,
  isDay = true,
  cloudCoverage?: number | null,
): MeteoconName {
  const overcast = isOvercastCloudCover(cloudCoverage);

  switch (condition) {
    case "clear-night":
      return "clear-night";
    case "sunny":
      return isDay ? "clear-day" : "clear-night";
    case "cloudy":
      if (overcast) return "overcast";
      return isDay ? "overcast-day" : "overcast-night";
    case "fog":
      return isDay ? "fog-day" : "fog-night";
    case "hail":
      if (overcast) return "hail";
      return isDay ? "overcast-day-hail" : "overcast-night-hail";
    case "lightning":
      if (overcast) return "thunderstorms";
      return isDay ? "thunderstorms-day" : "thunderstorms-night";
    case "lightning-rainy":
      if (overcast) return "thunderstorms-rain";
      return isDay ? "thunderstorms-day-rain" : "thunderstorms-night-rain";
    case "partlycloudy":
      return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
    case "pouring":
      if (overcast) return "extreme-rain";
      return isDay ? "extreme-day-rain" : "extreme-night-rain";
    case "rainy":
      if (overcast) return "rain";
      return isDay ? "overcast-day-rain" : "overcast-night-rain";
    case "snowy":
      if (overcast) return "snow";
      return isDay ? "overcast-day-snow" : "overcast-night-snow";
    case "snowy-rainy":
      if (overcast) return "sleet";
      return isDay ? "overcast-day-sleet" : "overcast-night-sleet";
    case "windy":
    case "windy-variant":
      return "wind";
    case "exceptional":
      return "weather-alert";
    default:
      return "not-available";
  }
}

export function bearingToWindIcon(
  bearing: number | string | undefined,
): MeteoconName {
  const deg =
    typeof bearing === "string" ? Number.parseFloat(bearing) : bearing;
  if (deg == null || Number.isNaN(deg)) {
    return "wind-direction-n";
  }
  const normalized = ((deg % 360) + 360) % 360;
  const dirs: MeteoconName[] = [
    "wind-direction-n",
    "wind-direction-ne",
    "wind-direction-e",
    "wind-direction-se",
    "wind-direction-s",
    "wind-direction-sw",
    "wind-direction-w",
    "wind-direction-nw",
  ];
  const idx = Math.round(normalized / 45) % 8;
  return dirs[idx]!;
}

export function bearingToLabel(bearing: number | string | undefined): string {
  const deg =
    typeof bearing === "string" ? Number.parseFloat(bearing) : bearing;
  if (deg == null || Number.isNaN(deg)) return "—";
  const labels = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
    "N",
  ];
  const normalized = ((deg % 360) + 360) % 360;
  return labels[Math.floor((normalized + 11.25) / 22.5)]!;
}

/** Convert wind speed to Beaufort 0–12 using the given unit. */
export function windSpeedToBeaufort(
  speed: number | null | undefined,
  unit?: string | null,
): number {
  if (speed == null || Number.isNaN(speed)) return 0;
  const u = (unit ?? "km/h").toLowerCase().replace(/\s/g, "");
  let ms = speed;
  if (u.includes("km") || u === "kph" || u === "km/h") {
    ms = speed / 3.6;
  } else if (u.includes("mph") || u === "mi/h") {
    ms = speed * 0.44704;
  } else if (u.includes("kt") || u.includes("knot")) {
    ms = speed * 0.514444;
  } else if (u === "bft" || u.includes("beaufort")) {
    return Math.max(0, Math.min(12, Math.round(speed)));
  }
  // else assume m/s
  const thresholds = [
    0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7,
  ];
  let bft = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (ms >= thresholds[i]!) bft = i + 1;
  }
  return Math.min(12, bft) as number;
}

export function beaufortIcon(bft: number): MeteoconName {
  const n = Math.max(0, Math.min(12, Math.round(bft)));
  return `wind-beaufort-${n}` as MeteoconName;
}

export function uvIndexIcon(uv: number | null | undefined): MeteoconName {
  if (uv == null || Number.isNaN(uv)) return "uv-index";
  if (uv >= 11) return "uv-index-11-plus";
  const n = Math.max(1, Math.min(11, Math.round(uv)));
  return `uv-index-${n}` as MeteoconName;
}
