import { localize, type LocalizeKey } from "../localize";
import { contrastOnWhite } from "./beaufort-scale";

export type HumidityComfort = "dry" | "comfortable" | "humid" | "muggy";

/** Line stroke — sampled from iOS Weather humidity chart. */
export const HUMIDITY_LINE_COLOR = "#4B8AD0";

/**
 * Vertical fill gradient stops (0 = dry/low RH, 1 = humid/high RH).
 * Sampled from iOS Weather; not official Apple constants.
 */
export const HUMIDITY_GRADIENT_STOPS: ReadonlyArray<{
  stop: number;
  color: string;
}> = [
  { stop: 0, color: "#68A37F" },
  { stop: 0.4, color: "#5B96C9" },
  { stop: 0.7, color: "#4B8AD0" },
  { stop: 1, color: "#4780F8" },
];

const COMFORT_LABEL_KEYS: Record<HumidityComfort, LocalizeKey> = {
  dry: "copy_humidity_dry",
  comfortable: "copy_humidity_comfortable",
  humid: "copy_humidity_humid",
  muggy: "copy_humidity_muggy",
};

const HUMIDITY_LEGEND_BANDS: ReadonlyArray<{
  min: number;
  max: number;
  comfort: HumidityComfort;
}> = [
  { min: 0, max: 30, comfort: "dry" },
  { min: 30, max: 50, comfort: "comfortable" },
  { min: 50, max: 70, comfort: "humid" },
  { min: 70, max: 100, comfort: "muggy" },
];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toByte = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`.toUpperCase();
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map relative humidity 0–100% to a gradient color. */
export function humidityColor(rh: number): string {
  const t = Math.max(0, Math.min(1, rh / 100));
  const stops = HUMIDITY_GRADIENT_STOPS;
  let i = 0;
  while (i < stops.length - 1 && t > stops[i + 1]!.stop) i += 1;
  const a = stops[i]!;
  const b = stops[Math.min(i + 1, stops.length - 1)]!;
  const span = b.stop - a.stop;
  const local = span === 0 ? 0 : (t - a.stop) / span;
  const ca = hexToRgb(a.color);
  const cb = hexToRgb(b.color);
  if (!ca || !cb) return HUMIDITY_LINE_COLOR;
  return rgbToHex(
    lerp(ca[0], cb[0], local),
    lerp(ca[1], cb[1], local),
    lerp(ca[2], cb[2], local),
  );
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => v / 255);
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
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/** Darken until contrast on white pill labels is ≥ 4.5:1. */
export function humidityLabelColor(rh: number): string {
  const base = humidityColor(rh);
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

export interface HumidityLegendRow {
  comfort: HumidityComfort;
  color: string;
  range: string;
  label: string;
}

export function buildHumidityLegendRows(
  language: string | undefined,
): HumidityLegendRow[] {
  return HUMIDITY_LEGEND_BANDS.map(({ min, max, comfort }) => {
    const midpoint = (min + max) / 2;
    const range = `${min}–${max}%`;
    return {
      comfort,
      color: humidityColor(midpoint),
      range,
      label: localize(COMFORT_LABEL_KEYS[comfort], language),
    };
  });
}

/** Apply vertical gradient stops to a canvas linear gradient (chart area). */
export function applyHumidityGradientStops(
  gradient: CanvasGradient,
): CanvasGradient {
  for (const { stop, color } of HUMIDITY_GRADIENT_STOPS) {
    gradient.addColorStop(stop, color);
  }
  return gradient;
}
