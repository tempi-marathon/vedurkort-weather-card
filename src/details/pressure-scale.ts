import { localize, type LocalizeKey } from "../localize";
import {
  PRESSURE_HIGH_HPA,
  PRESSURE_LOW_HPA,
  pressureBand,
  pressureToHpa,
  type PressureBand,
} from "./metric-bands";

export type PressureScaleBand = Exclude<PressureBand, "unknown">;

/** Scale spans this range (hPa); readings outside are clamped to the ends. */
export const PRESSURE_SCALE_MIN_HPA = 970;
export const PRESSURE_SCALE_MAX_HPA = 1050;

const BAND_COLORS: Record<PressureScaleBand, string> = {
  low: "#4B8AD0",
  normal: "#68A37F",
  high: "#E0903B",
};

const BAND_LABEL_KEYS: Record<PressureScaleBand, LocalizeKey> = {
  low: "pressure_band_low",
  normal: "pressure_band_normal",
  high: "pressure_band_high",
};

export interface PressureScaleSegment {
  band: PressureScaleBand;
  fromPct: number;
  toPct: number;
  color: string;
}

export interface PressureGradientStop {
  /** Position along the bar, 0–100%, ascending. */
  pct: number;
  color: string;
}

export interface PressureLegendRow {
  band: PressureScaleBand;
  color: string;
  range: string;
  label: string;
}

export interface PressureScaleModel {
  band: PressureScaleBand;
  bandLabel: string;
  /** Marker position on the scale, 0–100%. */
  markerPct: number;
  /** Reading with unit, e.g. "1012 hPa". */
  valueLabel: string;
  segments: PressureScaleSegment[];
  /** Solid band cores with a short blend around each boundary. */
  gradientStops: PressureGradientStop[];
  legendRows: PressureLegendRow[];
}

/** Half-width (scale %) of the color blend centred on each band boundary. */
const BLEND_HALF_PCT = 6;

function pctOfScale(hPa: number): number {
  const span = PRESSURE_SCALE_MAX_HPA - PRESSURE_SCALE_MIN_HPA;
  const raw = ((hPa - PRESSURE_SCALE_MIN_HPA) / span) * 100;
  return Math.min(100, Math.max(0, raw));
}

/** Convert hPa back to the display unit. */
function fromHpa(hPa: number, unit: string): number {
  const ratio = pressureToHpa(1, unit);
  return hPa / ratio;
}

function decimalsFor(unit: string): number {
  const u = unit.toLowerCase();
  if (u.includes("inhg") || u.includes("in")) return 2;
  if (u.includes("kpa")) return 1;
  return 0;
}

function formatPressure(value: number, unit: string): string {
  return value.toFixed(decimalsFor(unit));
}

export function buildPressureLegendRows(
  unit: string,
  language: string | undefined,
): PressureLegendRow[] {
  const low = formatPressure(fromHpa(PRESSURE_LOW_HPA, unit), unit);
  const high = formatPressure(fromHpa(PRESSURE_HIGH_HPA, unit), unit);
  const ranges: Record<PressureScaleBand, string> = {
    low: `< ${low} ${unit}`,
    normal: `${low}–${high} ${unit}`,
    high: `> ${high} ${unit}`,
  };
  return (["low", "normal", "high"] as const).map((band) => ({
    band,
    color: BAND_COLORS[band],
    range: ranges[band],
    label: localize(BAND_LABEL_KEYS[band], language),
  }));
}

/** Null when there is no usable reading. */
export function buildPressureScaleModel(
  pressure: number | null | undefined,
  unit: string,
  language: string | undefined,
): PressureScaleModel | null {
  const band = pressureBand(pressure, unit);
  if (band === "unknown" || pressure == null) return null;
  const lowPct = pctOfScale(PRESSURE_LOW_HPA);
  const highPct = pctOfScale(PRESSURE_HIGH_HPA);
  return {
    band,
    bandLabel: localize(BAND_LABEL_KEYS[band], language),
    markerPct: pctOfScale(pressureToHpa(pressure, unit)),
    valueLabel: `${formatPressure(pressure, unit)} ${unit}`.trim(),
    segments: [
      { band: "low", fromPct: 0, toPct: lowPct, color: BAND_COLORS.low },
      { band: "normal", fromPct: lowPct, toPct: highPct, color: BAND_COLORS.normal },
      { band: "high", fromPct: highPct, toPct: 100, color: BAND_COLORS.high },
    ],
    gradientStops: [
      { pct: 0, color: BAND_COLORS.low },
      { pct: lowPct - BLEND_HALF_PCT, color: BAND_COLORS.low },
      { pct: lowPct + BLEND_HALF_PCT, color: BAND_COLORS.normal },
      { pct: highPct - BLEND_HALF_PCT, color: BAND_COLORS.normal },
      { pct: highPct + BLEND_HALF_PCT, color: BAND_COLORS.high },
      { pct: 100, color: BAND_COLORS.high },
    ],
    legendRows: buildPressureLegendRows(unit, language),
  };
}
