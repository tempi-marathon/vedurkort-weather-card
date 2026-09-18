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
