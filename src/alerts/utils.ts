import { alertTimePhase } from "./format";
import type { AlertSeverity, WeatherAlert } from "./types";
import { localize, type LocalizeKey } from "../localize";

export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function normalizeSeverity(value: string | undefined): AlertSeverity {
  if (!value) return "unknown";
  const v = value.trim().toLowerCase();
  if (v === "extreme" || v === "severe" || v === "moderate" || v === "minor") {
    return v;
  }
  if (v === "unknown" || v === "none" || v === "") return "unknown";
  // CAP / MeteoAlarm sometimes use title case already handled above
  if (v.includes("extreme")) return "extreme";
  if (v.includes("severe")) return "severe";
  if (v.includes("moderate")) return "moderate";
  if (v.includes("minor")) return "minor";
  return "unknown";
}

/** MeteoAlarm awareness_level: "3; orange; Severe" */
export function awarenessLevelToSeverity(
  awarenessLevel: string | undefined,
): AlertSeverity | undefined {
  if (!awarenessLevel) return undefined;
  const levelId = Number.parseInt(awarenessLevel.split(";")[0]!.trim(), 10);
  if (!Number.isFinite(levelId)) return undefined;
  if (levelId >= 4) return "extreme";
  if (levelId === 3) return "severe";
  if (levelId === 2) return "moderate";
  if (levelId === 1) return "minor";
  return undefined;
}

export function awarenessColor(
  awarenessLevel: string | undefined,
): string | undefined {
  if (!awarenessLevel) return undefined;
  const parts = awarenessLevel.split(";");
  const color = parts.length >= 2 ? parts[1]!.trim().toLowerCase() : "";
  return color || undefined;
}

/**
 * MeteoAlarm green (level 1) = "no particular awareness needed" — not a warning.
 * Filter these out of the card UI.
 */
export function isInformationalAwareness(
  awarenessLevel: string | undefined,
): boolean {
  if (!awarenessLevel) return false;
  const levelId = Number.parseInt(awarenessLevel.split(";")[0]!.trim(), 10);
  if (levelId === 1) return true;
  return awarenessColor(awarenessLevel) === "green";
}

export function awarenessLevelLabel(
  awarenessLevel: string | undefined,
): string {
  if (!awarenessLevel) return "";
  const parts = awarenessLevel.split(";");
  return parts.length >= 3 ? parts[2]!.trim() : "";
}

/** MeteoAlarm awareness_type: "1; Wind" */
export function awarenessTypeLabel(awarenessType: string | undefined): string {
  if (!awarenessType) return "";
  const parts = awarenessType.split(";");
  return parts.length > 1 ? parts.slice(1).join(";").trim() : "";
}

/** Numeric MeteoAlarm awareness_type id from "5; high-temperature". */
export function awarenessTypeCode(
  awarenessType: string | undefined,
): number | undefined {
  if (!awarenessType) return undefined;
  const n = Number.parseInt(awarenessType.split(";")[0]!.trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Resolve awareness_level / awareness_type from flat attrs or CAP `parameters`.
 */
export function meteoalarmParameter(
  attributes: Record<string, unknown>,
  key: "awareness_level" | "awareness_type",
): string {
  const direct = str(attributes[key]);
  if (direct) return direct;
  const parameters = attributes.parameters;
  if (parameters && typeof parameters === "object" && !Array.isArray(parameters)) {
    return str((parameters as Record<string, unknown>)[key]);
  }
  return "";
}

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  extreme: 4,
  severe: 3,
  moderate: 2,
  minor: 1,
  unknown: 0,
};

export function severityRank(severity: AlertSeverity): number {
  return SEVERITY_RANK[severity] ?? 0;
}

export function titleCaseSeverity(severity: AlertSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

const PHASE_KEYS: Record<string, LocalizeKey> = {
  new: "phase_new",
  update: "phase_update",
  cancel: "phase_cancel",
  expired: "phase_expired",
};

export function phaseLabel(
  phase: string | undefined,
  language?: string,
): string | undefined {
  if (!phase) return undefined;
  const key = phase.trim().toLowerCase();
  if (!key) return undefined;
  const locKey = PHASE_KEYS[key];
  if (locKey) return localize(locKey, language);
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

/** CAP/provider entity icon — only keep validated `mdi:…` strings for Meteocon mapping. */
export function providerMdiIcon(value: unknown): string | undefined {
  const icon = str(value).toLowerCase();
  if (!icon.startsWith("mdi:")) return undefined;
  return icon;
}

/** MeteoAlarm red (level 4) or CAP `Extreme` severity. */
export function isHighestCategoryAlert(alert: WeatherAlert): boolean {
  if (alert.severity === "extreme") return true;
  return alert.awarenessColor?.toLowerCase() === "red";
}

/** True when the alert window has started (or timestamps are unknown). */
export function isAlertCurrentlyActive(
  alert: WeatherAlert,
  nowMs: number = Date.now(),
): boolean {
  const phase = alertTimePhase(alert, nowMs);
  return phase === "active" || phase === "unknown";
}

/** Escalate card scene + main icon when any highest-category alert is active now. */
export function shouldEscalateForAlerts(
  alerts: WeatherAlert[],
  nowMs: number = Date.now(),
): boolean {
  return alerts.some(
    (alert) =>
      isHighestCategoryAlert(alert) && isAlertCurrentlyActive(alert, nowMs),
  );
}
