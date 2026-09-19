import { localize, type LocalizeKey } from "../localize";
import {
  convertWindSpeed,
  normalizeWindUnit,
  resolveWindDisplayUnit,
  type WindSpeedDisplayUnit,
} from "../weather/wind-units";

/** Apple Weather–style Beaufort palette (0–12), cool → warm. */
export const BEAUFORT_COLORS: readonly string[] = [
  "#7EC8E3", // 0
  "#5BB8B0", // 1
  "#4CAF9A", // 2
  "#5CB85C", // 3
  "#8BC34A", // 4
  "#CDDC39", // 5
  "#FFEB3B", // 6
  "#FFC107", // 7
  "#FF9800", // 8
  "#F57C00", // 9
  "#E64A19", // 10
  "#D32F2F", // 11
  "#C2185B", // 12
];

/**
 * Apple Weather km/h bands for Beaufort 0–12.
 * Open ends use null (shown as < / >).
 */
const BEAUFORT_KMH_BANDS: ReadonlyArray<{
  min: number | null;
  max: number | null;
}> = [
  { min: null, max: 2 }, // < 2
  { min: 2, max: 5 },
  { min: 6, max: 11 },
  { min: 12, max: 19 },
  { min: 20, max: 28 },
  { min: 29, max: 38 },
  { min: 39, max: 49 },
  { min: 50, max: 61 },
  { min: 62, max: 74 },
  { min: 75, max: 87 },
  { min: 88, max: 102 },
  { min: 103, max: 117 },
  { min: 118, max: null }, // > 118
];

const BFT_DESC_KEYS: LocalizeKey[] = [
  "bft_desc_0",
  "bft_desc_1",
  "bft_desc_2",
  "bft_desc_3",
  "bft_desc_4",
  "bft_desc_5",
  "bft_desc_6",
  "bft_desc_7",
  "bft_desc_8",
  "bft_desc_9",
  "bft_desc_10",
  "bft_desc_11",
  "bft_desc_12",
];

export function beaufortColor(bft: number): string {
  const n = Math.max(0, Math.min(12, Math.round(bft)));
  return BEAUFORT_COLORS[n]!;
}

/** Relative luminance (WCAG) for an sRGB hex color. */
function relativeLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1]!, 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 0xff);
  const g = channel((n >> 8) & 0xff);
  const b = channel(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio of `hex` against white (#FFFFFF). */
export function contrastOnWhite(hex: string): number {
  const L = relativeLuminance(hex);
  return (1.05) / (L + 0.05);
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 0xff) / 255;
  const g = ((n >> 8) & 0xff) / 255;
  const b = (n & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toByte = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v + m)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`.toUpperCase();
}

/**
 * Beaufort color darkened (same hue) until contrast on a white pill is ≥ 4.5:1.
 * Line/border colors keep {@link beaufortColor}; label text uses this.
 */
export function beaufortLabelColor(bft: number): string {
  const base = beaufortColor(bft);
  if (contrastOnWhite(base) >= 4.5) return base;

  const hsl = hexToHsl(base);
  if (!hsl) return base;

  let lo = 0;
  let hi = hsl.l;
  let best = base;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const candidate = hslToHex(hsl.h, hsl.s, mid);
    if (contrastOnWhite(candidate) >= 4.5) {
      best = candidate;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

/** Unit used for the legend range column. */
export function beaufortLegendRangeUnit(
  display: WindSpeedDisplayUnit | undefined,
  nativeUnit: string,
): string {
  const resolved = resolveWindDisplayUnit(display, nativeUnit);
  if (normalizeWindUnit(resolved) === "beaufort") return nativeUnit;
  return resolved;
}

function rangeUnitLabel(unit: string): string {
  const n = normalizeWindUnit(unit);
  if (n === "beaufort") return "Bft";
  if (n === "km/h" || n === "mph" || n === "m/s" || n === "kt") return n;
  return unit;
}

function formatBound(kmh: number, targetUnit: string): string {
  const n = normalizeWindUnit(targetUnit);
  const converted = convertWindSpeed(kmh, "km/h", n);
  if (converted == null) return String(Math.round(kmh));
  if (n === "m/s") return String(Math.round(converted * 10) / 10);
  return String(Math.round(converted));
}

function formatBandRange(
  band: { min: number | null; max: number | null },
  targetUnit: string,
): string {
  const label = rangeUnitLabel(targetUnit);
  if (band.min == null && band.max != null) {
    return `< ${formatBound(band.max, targetUnit)} ${label}`;
  }
  if (band.max == null && band.min != null) {
    return `> ${formatBound(band.min, targetUnit)} ${label}`;
  }
  if (band.min != null && band.max != null) {
    return `${formatBound(band.min, targetUnit)} – ${formatBound(band.max, targetUnit)} ${label}`;
  }
  return "";
}

export interface BeaufortLegendRow {
  bft: number;
  color: string;
  description: string;
  range: string;
}

export function buildBeaufortLegendRows(
  language: string | undefined,
  display: WindSpeedDisplayUnit | undefined,
  nativeUnit: string,
): BeaufortLegendRow[] {
  const rangeUnit = beaufortLegendRangeUnit(display, nativeUnit);
  return BEAUFORT_KMH_BANDS.map((band, bft) => ({
    bft,
    color: beaufortColor(bft),
    description: localize(BFT_DESC_KEYS[bft]!, language),
    range: formatBandRange(band, rangeUnit),
  }));
}
