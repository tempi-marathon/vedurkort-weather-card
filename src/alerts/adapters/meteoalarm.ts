import type { AlertAdapter, WeatherAlert } from "../types";
import {
  awarenessColor,
  awarenessLevelLabel,
  awarenessLevelToSeverity,
  awarenessTypeLabel,
  normalizeSeverity,
  str,
  titleCaseSeverity,
} from "../utils";

export const meteoalarmAdapter: AlertAdapter = {
  provider: "meteoalarm",

  canHandle(attributes) {
    const attribution = str(attributes.attribution).toLowerCase();
    if (attribution.includes("meteoalarm")) return true;
    return (
      typeof attributes.awareness_level === "string" &&
      typeof attributes.awareness_type === "string"
    );
  },

  parse(entityId, state, attributes) {
    // Core binary_sensor is off when idle; also ignore unavailable.
    if (state === "off" || state === "unavailable" || state === "unknown") {
      return [];
    }

    const event = str(attributes.event);
    const headline = str(attributes.headline);
    if (!event && !headline) return [];

    const awarenessLevel = str(attributes.awareness_level);
    const severity =
      awarenessLevelToSeverity(awarenessLevel) ??
      normalizeSeverity(str(attributes.severity));

    const severityLabel =
      awarenessLevelLabel(awarenessLevel) ||
      str(attributes.severity) ||
      titleCaseSeverity(severity);

    const typeLabel = awarenessTypeLabel(str(attributes.awareness_type));
    const eventName = event || typeLabel || headline;
    const onset = str(attributes.onset) || str(attributes.effective) || undefined;
    const expires = str(attributes.expires) || undefined;

    const alert: WeatherAlert = {
      id: `meteoalarm_${entityId}_${eventName}_${onset ?? "open"}`,
      provider: "meteoalarm",
      event: eventName,
      headline: headline || eventName,
      description: str(attributes.description),
      instruction: str(attributes.instruction),
      severity,
      severityLabel,
      awarenessColor: awarenessColor(awarenessLevel),
      onset,
      expires,
      entityId,
    };
    return [alert];
  },
};
