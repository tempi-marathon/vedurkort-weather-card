import type { AlertAdapter, WeatherAlert } from "../types";
import {
  awarenessColor,
  awarenessLevelLabel,
  awarenessLevelToSeverity,
  awarenessTypeCode,
  awarenessTypeLabel,
  isInformationalAwareness,
  meteoalarmParameter,
  normalizeSeverity,
  providerMdiIcon,
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
    // Keep "unknown" — CAP uses it for green / unclassified severity states.
    if (state === "unavailable") return [];

    const id = str(attributes.id);
    if (!id) return [];

    // Terminal / inactive phases — hide from the card.
    const phase = str(attributes.phase).toLowerCase();
    if (phase === "cancel" || phase === "expired") return [];

    const awarenessLevel = meteoalarmParameter(attributes, "awareness_level");
    // Green = no awareness needed (Europe) — not a real warning.
    if (isInformationalAwareness(awarenessLevel)) return [];

    const event = str(attributes.event) || "Alert";
    const rawSeverity = str(attributes.severity);
    const normalizedSev = str(attributes.severity_normalized);
    const awarenessTypeRaw = meteoalarmParameter(attributes, "awareness_type");
    const typeLabel = awarenessTypeLabel(awarenessTypeRaw);
    const typeCode = awarenessTypeCode(awarenessTypeRaw);

    const severity =
      (normalizedSev && normalizedSev.toLowerCase() !== "unknown"
        ? normalizeSeverity(normalizedSev)
        : undefined) ??
      awarenessLevelToSeverity(awarenessLevel) ??
      normalizeSeverity(rawSeverity);

    const severityLabel =
      awarenessLevelLabel(awarenessLevel) ||
      (rawSeverity
        ? rawSeverity.charAt(0).toUpperCase() +
          rawSeverity.slice(1).toLowerCase()
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
      areaDesc: str(attributes.area_desc) || undefined,
      severity,
      severityLabel,
      awarenessColor: awarenessColor(awarenessLevel),
      awarenessTypeCode: typeCode,
      awarenessType: typeLabel || undefined,
      phase: phase || undefined,
      providerIcon: providerMdiIcon(attributes.icon),
      onset,
      expires,
      entityId,
    };
    return [alert];
  },
};
