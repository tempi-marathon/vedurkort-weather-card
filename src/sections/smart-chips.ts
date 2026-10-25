import {
  dewComfort,
  pressureBand,
  visibilityBand,
} from "../details/metric-bands";
import { uvCategory } from "../details/uv-bar-model";
import type { PollenLevelLabel } from "../pollen/types";

/** Detail chips that can appear in the current-weather row. */
export type SmartChipId =
  | "sun"
  | "humidity"
  | "wind"
  | "uv_index"
  | "pressure"
  | "cloud_coverage"
  | "dew_point"
  | "visibility"
  | "precipitation"
  | "precipitation_probability"
  | "pollen";

/** Stable allowlist / overflow order (matches historical chip render order). */
export const SMART_CHIP_ORDER: readonly SmartChipId[] = [
  "sun",
  "humidity",
  "wind",
  "uv_index",
  "pressure",
  "cloud_coverage",
  "dew_point",
  "visibility",
  "precipitation",
  "precipitation_probability",
  "pollen",
] as const;

const PRECIP_CONDITIONS = new Set([
  "rainy",
  "pouring",
  "snowy",
  "snowy-rainy",
  "lightning",
  "lightning-rainy",
  "hail",
]);

export interface SmartChipValues {
  condition: string;
  humidity: number | null;
  windBft: number;
  gustBft: number;
  uvIndex: number | null;
  pressure: number | null;
  pressureUnit: string;
  cloudCoverage: number | null;
  dewPoint: number | null;
  visibility: number | null;
  visibilityUnit: string;
  precipitation: number | null;
  precipitationProbability: number | null;
  pollenLevel: PollenLevelLabel | null;
}

export function isPrecipCondition(condition: string): boolean {
  return PRECIP_CONDITIONS.has(condition.replace(/_/g, "-"));
}

/** Whether an enabled chip with a value belongs in the primary row. */
export function isChipNoteworthy(
  id: SmartChipId,
  values: SmartChipValues,
): boolean {
  switch (id) {
    case "sun":
      return true;
    case "cloud_coverage":
      return false;
    case "uv_index": {
      const cat = uvCategory(values.uvIndex);
      return (
        cat === "moderate" ||
        cat === "high" ||
        cat === "very_high" ||
        cat === "extreme"
      );
    }
    case "wind":
      return values.windBft >= 4 || values.gustBft >= 5;
    case "precipitation":
      return (values.precipitation ?? 0) > 0;
    case "precipitation_probability": {
      const pct = values.precipitationProbability;
      if (pct != null && pct >= 40) return true;
      return isPrecipCondition(values.condition);
    }
    case "pollen":
      return (
        values.pollenLevel != null && values.pollenLevel !== "none"
      );
    case "humidity": {
      const rh = values.humidity;
      if (rh == null || Number.isNaN(rh)) return false;
      return rh <= 30 || rh >= 70;
    }
    case "dew_point": {
      const comfort = dewComfort(values.dewPoint);
      return (
        comfort === "dry" || comfort === "humid" || comfort === "muggy"
      );
    }
    case "pressure": {
      const band = pressureBand(values.pressure, values.pressureUnit);
      return band === "low" || band === "high";
    }
    case "visibility": {
      const band = visibilityBand(values.visibility, values.visibilityUnit);
      return band === "fog" || band === "haze";
    }
    default:
      return false;
  }
}

/**
 * Higher = earlier in the primary row (after sun).
 * Only meaningful for chips that pass `isChipNoteworthy`.
 */
export function chipSeverity(id: SmartChipId, values: SmartChipValues): number {
  switch (id) {
    case "sun":
      return 0;
    case "precipitation": {
      const amount = values.precipitation ?? 0;
      return 920 + Math.min(amount, 50);
    }
    case "visibility": {
      const band = visibilityBand(values.visibility, values.visibilityUnit);
      if (band === "fog") return 910;
      if (band === "haze") return 580;
      return 0;
    }
    case "wind": {
      const bft = Math.max(values.windBft, values.gustBft);
      if (values.windBft >= 7 || values.gustBft >= 8) return 900 + bft;
      return 600 + bft;
    }
    case "uv_index": {
      const uv = values.uvIndex ?? 0;
      const cat = uvCategory(uv);
      if (cat === "extreme") return 880 + uv;
      if (cat === "very_high") return 850 + uv;
      if (cat === "high") return 700 + uv;
      if (cat === "moderate") return 550 + uv;
      return 0;
    }
    case "pollen": {
      if (values.pollenLevel === "high") return 870;
      if (values.pollenLevel === "medium") return 620;
      if (values.pollenLevel === "low") return 250;
      return 0;
    }
    case "precipitation_probability": {
      const pct = values.precipitationProbability ?? 0;
      return 580 + pct;
    }
    case "humidity": {
      const rh = values.humidity ?? 50;
      const extreme = rh <= 30 ? 30 - rh : rh - 70;
      return 200 + extreme;
    }
    case "dew_point": {
      const comfort = dewComfort(values.dewPoint);
      if (comfort === "muggy") return 190;
      if (comfort === "humid") return 175;
      if (comfort === "dry") return 160;
      return 0;
    }
    case "pressure": {
      const band = pressureBand(values.pressure, values.pressureUnit);
      if (band === "low" || band === "high") return 150;
      return 0;
    }
    case "cloud_coverage":
      return 0;
    default:
      return 0;
  }
}

function orderIndex(id: SmartChipId): number {
  const i = SMART_CHIP_ORDER.indexOf(id);
  return i < 0 ? 999 : i;
}

export interface SmartChipPartition {
  /** Primary row: sun first, then severity high → low, then config order. */
  primary: SmartChipId[];
  /** More menu: config order. */
  overflow: SmartChipId[];
}

/**
 * Split chips that are enabled and have a value into primary vs More.
 * Caller must only pass chips that already have displayable values.
 */
export function partitionSmartChips(
  available: readonly SmartChipId[],
  values: SmartChipValues,
): SmartChipPartition {
  const primary: SmartChipId[] = [];
  const overflow: SmartChipId[] = [];

  for (const id of available) {
    if (isChipNoteworthy(id, values)) primary.push(id);
    else overflow.push(id);
  }

  primary.sort((a, b) => {
    if (a === "sun" && b !== "sun") return -1;
    if (b === "sun" && a !== "sun") return 1;
    const sev = chipSeverity(b, values) - chipSeverity(a, values);
    if (sev !== 0) return sev;
    return orderIndex(a) - orderIndex(b);
  });

  overflow.sort((a, b) => orderIndex(a) - orderIndex(b));

  return { primary, overflow };
}

/** Wire smart mode on/off into primary vs overflow lists. */
export function resolveDetailChips(
  smartChips: boolean,
  available: readonly SmartChipId[],
  values: SmartChipValues,
): SmartChipPartition {
  if (!smartChips) {
    return { primary: [...available], overflow: [] };
  }
  return partitionSmartChips(available, values);
}

/**
 * Move lowest-priority primary chips (end of severity-sorted list, never sun)
 * into overflow so More can stay on the same row. `count` is how many to demote.
 * Demoted chips lead the More menu (row order preserved); quiet overflow follows.
 */
export function demotePrimaryChips(
  partition: SmartChipPartition,
  count: number,
): SmartChipPartition {
  if (count <= 0) {
    return {
      primary: [...partition.primary],
      overflow: [...partition.overflow],
    };
  }

  const primary = [...partition.primary];
  const quiet = [...partition.overflow];
  const demoted: SmartChipId[] = [];
  let left = count;

  while (left > 0) {
    let idx = primary.length - 1;
    while (idx >= 0 && primary[idx] === "sun") idx -= 1;
    if (idx < 0) break;
    const [chip] = primary.splice(idx, 1);
    if (chip) demoted.push(chip);
    left -= 1;
  }

  // Popped lowest-first; reverse so More lists them in on-row order.
  demoted.reverse();
  return { primary, overflow: [...demoted, ...quiet] };
}

/** Spare px required before undemoting (wider than demote threshold → hysteresis). */
export const MORE_PACK_UNDEMOTE_SPARE_PX = 120;

export interface MorePackMeasure {
  smartChips: boolean;
  /** More control is in the DOM. */
  hasMore: boolean;
  moreWrapped: boolean;
  sparePx: number;
  /** Primary chip elements currently on the row (excludes More). */
  primaryCount: number;
  current: number;
}

/**
 * Next demotion count from a layout measure.
 * Demote one when More wraps; undemote one only with clear spare (hysteresis).
 * Clamps to `[0, max(0, primaryCount - 1)]`.
 */
export function nextMorePackDemotions(m: MorePackMeasure): number {
  if (!m.smartChips || !m.hasMore) return 0;

  const maxDemote = Math.max(0, m.primaryCount - 1);
  let next = Math.min(Math.max(0, m.current), maxDemote);

  if (m.moreWrapped && next < maxDemote) return next + 1;

  if (
    !m.moreWrapped &&
    next > 0 &&
    m.sparePx > MORE_PACK_UNDEMOTE_SPARE_PX
  ) {
    return next - 1;
  }

  return next;
}
