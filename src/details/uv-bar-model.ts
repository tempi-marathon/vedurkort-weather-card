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

export function uvCategory(uv: number | null | undefined): UvCategory {
  if (uv == null || Number.isNaN(uv)) return "unknown";
  if (uv <= 2) return "low";
  if (uv <= 5) return "moderate";
  if (uv <= 7) return "high";
  if (uv <= 10) return "very_high";
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

/** Map UV index 0–11+ to horizontal bar position (percent). */
export function uvBarPosition(uv: number): number {
  const clamped = Math.max(0, Math.min(uv, 11));
  return (clamped / 11) * 100;
}

export function buildUvBarModel(
  snap: WeatherSnapshot,
  language: string | undefined,
): UvBarModel | null {
  const value = snap.uvIndex;
  if (value == null || Number.isNaN(value)) return null;

  const category = uvCategory(value);
  return {
    value,
    valueLabel: formatNumber(value, "", 0) ?? String(Math.round(value)),
    heroIcon: uvIndexIcon(value),
    category,
    categoryLabel: localize(categoryLabelKey(category), language),
    advice: localize(adviceKey(category), language),
    barPosition: uvBarPosition(value),
  };
}
