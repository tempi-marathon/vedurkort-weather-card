import type { AlertSeverity } from "./types";

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
