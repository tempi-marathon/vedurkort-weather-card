import type { MeteoconName } from "../icons/allowlist";
import { uvIndexIcon } from "../icons/condition-map";
import { localize, type LocalizeKey } from "../localize";
import { formatNumber, type WeatherSnapshot } from "../weather/adapter";

export type UvCategory =
  | "low"
  | "moderate"
  | "high"
  | "very_high"
  | "extreme"
  | "unknown";

export interface UvBarModel {
  value: number | null;
  valueLabel: string;
  heroIcon: MeteoconName;
  category: UvCategory;
  categoryLabel: string;
  advice: string;
  /** Dot position on the bar, 0–100%. */
  barPosition: number;
}

/** WHO category for the integer UV index (same number the UI shows). */
export function uvCategory(uv: number | null | undefined): UvCategory {
  if (uv == null || Number.isNaN(uv)) return "unknown";
  const n = Math.round(uv);
  if (n <= 2) return "low";
  if (n <= 5) return "moderate";
  if (n <= 7) return "high";
  if (n <= 10) return "very_high";
  return "extreme";
}

function categoryLabelKey(category: UvCategory): LocalizeKey {
  const map: Record<UvCategory, LocalizeKey> = {
    low: "uv_cat_low",
    moderate: "uv_cat_moderate",
    high: "uv_cat_high",
    very_high: "uv_cat_very_high",
    extreme: "uv_cat_extreme",
    unknown: "uv_cat_unknown",
  };
  return map[category];
}

function adviceKey(category: UvCategory): LocalizeKey {
  const map: Record<UvCategory, LocalizeKey> = {
    low: "uv_advice_low",
    moderate: "uv_advice_moderate",
    high: "uv_advice_high",
    very_high: "uv_advice_very_high",
    extreme: "uv_advice_extreme",
    unknown: "uv_advice_unknown",
  };
  return map[category];
}

/** WHO UV category colors (match `.detail-uv-category-*` / bar gradient). */
export const UV_CATEGORY_COLORS: Readonly<
  Record<Exclude<UvCategory, "unknown">, string>
> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  very_high: "#ef4444",
  extreme: "#a855f7",
};

export interface UvLegendRow {
  category: Exclude<UvCategory, "unknown">;
  color: string;
  range: string;
  label: string;
}

const UV_LEGEND_BANDS: ReadonlyArray<{
  category: Exclude<UvCategory, "unknown">;
  range: string;
}> = [
  { category: "low", range: "0–2" },
  { category: "moderate", range: "3–5" },
  { category: "high", range: "6–7" },
  { category: "very_high", range: "8–10" },
  { category: "extreme", range: "11+" },
];

export function buildUvLegendRows(
  language: string | undefined,
): UvLegendRow[] {
  return UV_LEGEND_BANDS.map(({ category, range }) => ({
    category,
    color: UV_CATEGORY_COLORS[category],
    range,
    label: localize(categoryLabelKey(category), language),
  }));
}

/** Map UV index 0–11+ to horizontal bar position (percent). */
export function uvBarPosition(uv: number): number {
  const clamped = Math.max(0, Math.min(Math.round(uv), 11));
  return (clamped / 11) * 100;
}

export function buildUvBarModel(
  snap: WeatherSnapshot,
  language: string | undefined,
): UvBarModel | null {
  const value = snap.uvIndex;
  if (value == null || Number.isNaN(value)) return null;

  const rounded = Math.round(value);
  const category = uvCategory(value);
  return {
    value,
    valueLabel: formatNumber(value, "", 0) ?? String(rounded),
    heroIcon: uvIndexIcon(value),
    category,
    categoryLabel: localize(categoryLabelKey(category), language),
    advice: localize(adviceKey(category), language),
    barPosition: uvBarPosition(value),
  };
}
