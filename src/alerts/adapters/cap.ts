import type { AlertAdapter, WeatherAlert } from "../types";
import {
  awarenessColor,
  awarenessLevelLabel,
  awarenessLevelToSeverity,
  normalizeSeverity,
  str,
  titleCaseSeverity,
} from "../utils";

export const capAdapter: AlertAdapter = {
  provider: "cap",

  canHandle(attributes) {
    return (
      typeof attributes.incident_platform_version === "string" &&
      typeof attributes.id === "string"
    );
  },

  parse(entityId, state, attributes) {
    if (state === "unavailable" || state === "unknown") return [];

    const id = str(attributes.id);
    if (!id) return [];

    // Terminal / inactive phases — hide from the card.
    const phase = str(attributes.phase).toLowerCase();
    if (phase === "cancel" || phase === "expired") return [];

    const event = str(attributes.event) || "Alert";
    const rawSeverity = str(attributes.severity);
    const normalizedSev = str(attributes.severity_normalized);
    const awarenessLevel = str(attributes.awareness_level);

    const severity =
      (normalizedSev
        ? normalizeSeverity(normalizedSev)
        : undefined) ??
      awarenessLevelToSeverity(awarenessLevel) ??
      normalizeSeverity(rawSeverity);

    const labelSource = rawSeverity || normalizedSev;
    const severityLabel =
      awarenessLevelLabel(awarenessLevel) ||
      (labelSource
        ? labelSource.charAt(0).toUpperCase() +
          labelSource.slice(1).toLowerCase()
        : titleCaseSeverity(severity));

    const onset =
      str(attributes.onset) ||
      str(attributes.effective) ||
      str(attributes.sent) ||
      undefined;
    const expires =
      str(attributes.ends) || str(attributes.expires) || undefined;

    const alert: WeatherAlert = {
      id,
      provider: "cap",
      event,
      headline: str(attributes.headline) || event,
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
