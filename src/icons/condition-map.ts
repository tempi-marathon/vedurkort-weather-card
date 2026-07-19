import type { MeteoconName } from "./allowlist";
import type { HaWeatherCondition } from "../types";

/**
 * Map HA weather conditions → Meteocon names with day/night variants.
 */
export function conditionToMeteocon(
  condition: HaWeatherCondition | undefined,
  isDay = true,
): MeteoconName {
  switch (condition) {
    case "clear-night":
      return "clear-night";
    case "sunny":
      return isDay ? "clear-day" : "clear-night";
    case "cloudy":
      return isDay ? "overcast-day" : "overcast-night";
    case "fog":
      return isDay ? "fog-day" : "fog-night";
    case "hail":
      return isDay ? "overcast-day-hail" : "overcast-night-hail";
    case "lightning":
      return isDay ? "thunderstorms-day" : "thunderstorms-night";
    case "lightning-rainy":
      return isDay ? "thunderstorms-day-rain" : "thunderstorms-night-rain";
    case "partlycloudy":
      return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
    case "pouring":
      return isDay ? "extreme-day-rain" : "extreme-night-rain";
    case "rainy":
      return isDay ? "overcast-day-rain" : "overcast-night-rain";
    case "snowy":
      return isDay ? "overcast-day-snow" : "overcast-night-snow";
    case "snowy-rainy":
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
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const normalized = ((deg % 360) + 360) % 360;
  return labels[Math.round(normalized / 45) % 8]!;
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
