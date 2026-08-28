import type { MeteoconName } from "../icons/allowlist";
import { localize } from "../localize";
import type { AlertSeverity, WeatherAlert } from "./types";

/**
 * Official MeteoAlarm awareness_type ids → Meteocon.
 * Language-independent; preferred over translated event titles.
 * @see https://www.meteoalarm.org (awareness type codes)
 */
const AWARENESS_TYPE_ICONS: Record<number, MeteoconName> = {
  1: "wind",
  2: "sleet",
  3: "thunderstorms",
  4: "fog",
  5: "clear-day",
  6: "thermometer",
  7: "wind", // coastal event
  8: "weather-alert", // forest-fire
  9: "avalanche-danger-alert",
  10: "rain",
  12: "extreme-rain", // flooding
  13: "extreme-rain", // rain-flood
};

/** English awareness_type labels from CAP parameters (not localized event text). */
const AWARENESS_LABEL_ICONS: [readonly string[], MeteoconName][] = [
  [["high-temperature", "high temperature"], "clear-day"],
  [["low-temperature", "low temperature"], "thermometer"],
  [["snow-ice", "snow ice"], "sleet"],
  [["forest-fire", "forest fire"], "weather-alert"],
  [["coastal"], "wind"],
  [["thunderstorm"], "thunderstorms"],
  [["flood"], "extreme-rain"],
  [["rain"], "rain"],
  [["fog"], "fog"],
  [["wind"], "wind"],
  [["avalanche"], "avalanche-danger-alert"],
];

/** Map CAP/provider MDI icons to Meteocons — never render MDI itself. */
const MDI_TO_METEOCON: Record<string, MeteoconName> = {
  "mdi:weather-sunny-alert": "clear-day",
  "mdi:weather-sunny": "clear-day",
  "mdi:thermometer-high": "clear-day",
  "mdi:thermometer-low": "thermometer",
  "mdi:thermometer": "thermometer",
  "mdi:weather-fog": "fog",
  "mdi:weather-pouring": "rain",
  "mdi:weather-rainy": "rain",
  "mdi:weather-snowy-heavy": "snow",
  "mdi:weather-snowy": "snow",
  "mdi:weather-snowy-rainy": "sleet",
  "mdi:snowflake": "sleet",
  "mdi:weather-lightning": "thunderstorms",
  "mdi:weather-lightning-rainy": "thunderstorms-rain",
  "mdi:weather-windy": "wind",
  "mdi:weather-windy-variant": "wind",
  "mdi:weather-hail": "hail",
  "mdi:weather-dust": "dust",
  "mdi:smoke": "extreme-smoke",
  "mdi:fire": "weather-alert",
  "mdi:home-flood": "extreme-rain",
  "mdi:waves": "wind",
  "mdi:weather-hurricane": "cyclone-alert",
  "mdi:weather-tornado": "weather-alert",
  "mdi:alert-circle-outline": "weather-alert",
  "mdi:alert": "weather-alert",
};

/**
 * Pick a Meteocon without relying on translated event titles.
 * Order: awareness_type code → English type label → provider MDI map → severity.
 */
export function alertIconName(alert: WeatherAlert): MeteoconName {
  if (
    alert.awarenessTypeCode != null &&
    AWARENESS_TYPE_ICONS[alert.awarenessTypeCode]
  ) {
    return AWARENESS_TYPE_ICONS[alert.awarenessTypeCode]!;
  }

  const fromLabel = iconFromAwarenessLabel(alert.awarenessType);
  if (fromLabel) return fromLabel;

  const fromMdi = iconFromProviderMdi(alert.providerIcon);
  if (fromMdi) return fromMdi;

  return severityToIcon(alert.severity);
}

function iconFromAwarenessLabel(
  label: string | undefined,
): MeteoconName | undefined {
  if (!label) return undefined;
  const e = label.toLowerCase().replace(/[-_/]/g, " ").trim();
  for (const [patterns, icon] of AWARENESS_LABEL_ICONS) {
    if (patterns.some((p) => e.includes(p.replace(/-/g, " ")) || e.includes(p))) {
      return icon;
    }
  }
  return undefined;
}

function iconFromProviderMdi(
  icon: string | undefined,
): MeteoconName | undefined {
  if (!icon) return undefined;
  const key = icon.trim().toLowerCase();
  if (!key.startsWith("mdi:")) return undefined;
  // Always a Meteocon — never pass through the MDI string.
  return MDI_TO_METEOCON[key];
}

export function severityToIcon(severity: AlertSeverity): MeteoconName {
  switch (severity) {
    case "minor":
    case "moderate":
      return "code-yellow";
    case "severe":
      return "code-orange";
    case "extreme":
      return "code-red";
    default:
      return "weather-alert";
  }
}

export function highestSeverityIcon(alerts: WeatherAlert[]): MeteoconName {
  if (alerts.length === 0) return "weather-alert";
  return alertIconName(alerts[0]!);
}

export function summaryLabel(
  alerts: WeatherAlert[],
  language?: string,
): string {
  if (alerts.length === 0) return "";
  if (alerts.length === 1) return shortEvent(alerts[0]!);
  return localize("active_warnings", language, {
    count: String(alerts.length),
  });
}

/** Primary line for an alert row. */
export function alertTitle(alert: WeatherAlert): string {
  return alert.event || alert.headline || alert.severityLabel;
}

/**
 * Secondary line: location only (no repeated event/headline text).
 * Prefer CAP area_desc; else strip a leading title from the headline.
 */
export function alertSubtitle(alert: WeatherAlert): string | undefined {
  const fromHeadline = locationFromHeadline(alert);
  if (fromHeadline) return fromHeadline;
  const area = alert.areaDesc?.trim();
  return area || undefined;
}

function locationFromHeadline(alert: WeatherAlert): string | undefined {
  const title = alertTitle(alert).trim();
  const headline = alert.headline?.trim();
  if (!headline || !title) return undefined;
  if (normalizeText(headline) === normalizeText(title)) return undefined;

  const titleNorm = normalizeText(title);
  const headlineNorm = normalizeText(headline);
  if (!headlineNorm.startsWith(titleNorm)) return undefined;

  // Slice using original casing length of the matched prefix.
  let rest = headline.slice(title.length).trim();
  rest = rest
    .replace(/^(in|for|voor|en|à|a)\s+/i, "")
    .replace(/^[-–—:]\s*/, "")
    .trim();
  return rest || undefined;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function shortEvent(alert: WeatherAlert): string {
  const raw = alertTitle(alert);
  if (raw.length <= 42) return raw;
  return `${raw.slice(0, 39)}…`;
}

/** CSS custom property / class token for severity accent. */
export function severityAccentClass(alert: WeatherAlert): string {
  const color = alert.awarenessColor?.toLowerCase();
  if (color === "green") return "sev-green";
  if (color === "yellow") return "sev-yellow";
  if (color === "orange") return "sev-orange";
  if (color === "red") return "sev-red";
  switch (alert.severity) {
    case "minor":
      return "sev-green";
    case "moderate":
      return "sev-yellow";
    case "severe":
      return "sev-orange";
    case "extreme":
      return "sev-red";
    default:
      return "sev-unknown";
  }
}
