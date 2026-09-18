import { windSpeedToBeaufort } from "../icons/condition-map";

/** User-facing wind speed display preference. */
export type WindSpeedDisplayUnit =
  | "native"
  | "km/h"
  | "beaufort"
  | "m/s"
  | "mph";

export const WIND_SPEED_DISPLAY_UNITS: WindSpeedDisplayUnit[] = [
  "native",
  "km/h",
  "beaufort",
  "m/s",
  "mph",
];

export interface FormattedWindSpeed {
  /** Display text including unit, e.g. "25 km/h" or "5 Bft". */
  text: string;
  /** Numeric value in the display unit (Beaufort 0–12, etc.). */
  number: number;
  /** Unit label for charts/tables, e.g. "km/h" or "Bft". */
  unitLabel: string;
}

/** Normalize HA / sensor unit strings to a conversion key. */
export function normalizeWindUnit(unit?: string | null): string {
  const u = (unit ?? "km/h").toLowerCase().replace(/\s/g, "");
  if (u.includes("km") || u === "kph" || u === "km/h") return "km/h";
  if (u.includes("mph") || u === "mi/h") return "mph";
  if (u.includes("kt") || u.includes("knot")) return "kt";
  if (u === "bft" || u.includes("beaufort")) return "beaufort";
  if (u === "m/s" || u === "ms" || u.includes("meter")) return "m/s";
  return "m/s";
}

function toMs(speed: number, fromUnit: string): number {
  const u = normalizeWindUnit(fromUnit);
  switch (u) {
    case "km/h":
      return speed / 3.6;
    case "mph":
      return speed * 0.44704;
    case "kt":
      return speed * 0.514444;
    case "beaufort": {
      // Midpoint of Beaufort band (approx), for converting Bft → other units.
      const midMs = [
        0, 0.9, 2.5, 4.4, 6.7, 9.4, 12.3, 15.5, 19.0, 22.6, 26.5, 30.5, 34.0,
      ];
      const n = Math.max(0, Math.min(12, Math.round(speed)));
      return midMs[n] ?? 0;
    }
    default:
      return speed;
  }
}

function fromMs(ms: number, toUnit: string): number {
  const u = normalizeWindUnit(toUnit);
  switch (u) {
    case "km/h":
      return ms * 3.6;
    case "mph":
      return ms / 0.44704;
    case "kt":
      return ms / 0.514444;
    case "beaufort":
      return windSpeedToBeaufort(ms, "m/s");
    default:
      return ms;
  }
}

/** Convert a wind speed between units (via m/s). */
export function convertWindSpeed(
  value: number | null | undefined,
  fromUnit: string,
  toUnit: string,
): number | null {
  if (value == null || Number.isNaN(value)) return null;
  const from = normalizeWindUnit(fromUnit);
  const to = normalizeWindUnit(toUnit);
  if (from === to) return value;
  return fromMs(toMs(value, from), to);
}

/** Resolve the concrete unit string used for conversion/display. */
export function resolveWindDisplayUnit(
  display: WindSpeedDisplayUnit | undefined,
  nativeUnit: string,
): string {
  if (!display || display === "native") return nativeUnit;
  if (display === "beaufort") return "beaufort";
  return display;
}

/** Chart / table unit label for a display preference. */
export function windUnitLabel(
  display: WindSpeedDisplayUnit | undefined,
  nativeUnit: string,
): string {
  const resolved = resolveWindDisplayUnit(display, nativeUnit);
  const n = normalizeWindUnit(resolved);
  if (n === "beaufort") return "Bft";
  return n === "km/h" || n === "mph" || n === "m/s" || n === "kt"
    ? n
    : nativeUnit;
}

/**
 * Format a wind speed in the user's preferred display unit.
 * Returns null when value is missing.
 */
export function formatWindSpeed(
  value: number | null | undefined,
  fromUnit: string,
  display: WindSpeedDisplayUnit | undefined = "native",
): FormattedWindSpeed | null {
  if (value == null || Number.isNaN(value)) return null;
  const target = resolveWindDisplayUnit(display, fromUnit);
  const unitLabel = windUnitLabel(display, fromUnit);
  const converted = convertWindSpeed(value, fromUnit, target);
  if (converted == null) return null;

  const n = normalizeWindUnit(target);
  let number: number;
  let text: string;
  if (n === "beaufort") {
    number = Math.max(0, Math.min(12, Math.round(converted)));
    text = `${number} ${unitLabel}`;
  } else if (n === "m/s") {
    number = Math.round(converted * 10) / 10;
    text = `${number} ${unitLabel}`;
  } else {
    number = Math.round(converted);
    text = `${number} ${unitLabel}`;
  }
  return { text, number, unitLabel };
}

/** Main chip / hero line: "25 km/h · SW" (omits missing pieces). */
export function formatWindHeading(
  speed: number | null | undefined,
  bearingLabel: string | null | undefined,
  fromUnit: string,
  display: WindSpeedDisplayUnit | undefined = "native",
): string {
  const parts: string[] = [];
  const formatted = formatWindSpeed(speed, fromUnit, display);
  if (formatted) parts.push(formatted.text);
  if (bearingLabel && bearingLabel !== "—") parts.push(bearingLabel);
  return parts.join(" · ");
}
