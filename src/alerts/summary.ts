import type { MeteoconName } from "../icons/allowlist";
import type { AlertSeverity, WeatherAlert } from "./types";

/** Map severity / awareness color to curated Meteocon alert icons. */
export function alertIconName(alert: WeatherAlert): MeteoconName {
  const color = alert.awarenessColor?.toLowerCase();
  if (color === "yellow" || color === "code-yellow") return "code-yellow";
  if (color === "orange" || color === "code-orange") return "code-orange";
  if (color === "red" || color === "code-red") return "code-red";
  if (color === "purple" || color === "code-purple") return "code-purple";

  return severityToIcon(alert.severity);
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

export function summaryLabel(alerts: WeatherAlert[]): string {
  if (alerts.length === 0) return "";
  if (alerts.length === 1) {
    const a = alerts[0]!;
    const color = formatColor(a);
    const event = shortEvent(a);
    if (color && event) return `${color} · ${event}`;
    return a.headline || a.event || a.severityLabel;
  }
  const top = alerts[0]!;
  const color = formatColor(top) || top.severityLabel;
  return `${alerts.length} alerts · highest ${color}`;
}

function formatColor(alert: WeatherAlert): string {
  if (alert.awarenessColor) {
    return (
      alert.awarenessColor.charAt(0).toUpperCase() +
      alert.awarenessColor.slice(1).toLowerCase()
    );
  }
  return alert.severityLabel;
}

function shortEvent(alert: WeatherAlert): string {
  const raw = alert.event || alert.headline;
  if (raw.length <= 42) return raw;
  return `${raw.slice(0, 39)}…`;
}

/** CSS custom property / class token for severity accent. */
export function severityAccentClass(alert: WeatherAlert): string {
  const color = alert.awarenessColor?.toLowerCase();
  if (color === "yellow") return "sev-yellow";
  if (color === "orange") return "sev-orange";
  if (color === "red") return "sev-red";
  if (color === "purple") return "sev-purple";
  switch (alert.severity) {
    case "minor":
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
