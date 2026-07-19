import type { MeteoconName } from "./allowlist";
import type { HaWeatherCondition } from "../types";

/**
 * Map HA weather conditions → Meteocon names.
 * Defaults for previously unconfirmed mappings:
 * - lightning → thunderstorms
 * - partlycloudy → day/night via isDay
 * - pouring → extreme-rain
 * - windy-variant → wind
 * - exceptional → weather-alert
 */
export function conditionToMeteocon(
  condition: HaWeatherCondition | undefined,
  isDay = true,
): MeteoconName {
  switch (condition) {
    case "clear-night":
      return "clear-night";
    case "cloudy":
      return "cloudy";
    case "fog":
      return "fog";
    case "hail":
      return "hail";
    case "lightning":
      return "thunderstorms";
    case "lightning-rainy":
      return "thunderstorms-rain";
    case "partlycloudy":
      return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
    case "pouring":
      return "extreme-rain";
    case "rainy":
      return "rain";
    case "snowy":
      return "snow";
    case "snowy-rainy":
      return "sleet";
    case "sunny":
      return "clear-day";
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
