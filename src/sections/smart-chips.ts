import {
  dewComfort,
  pressureBand,
  visibilityBand,
} from "../details/metric-bands";
import { nearMajorMoonPhase } from "../details/moon-phase";
import { uvCategory } from "../details/uv-bar-model";
import type { PollenLevelLabel } from "../pollen/types";

/** Detail chips that can appear in the current-weather row. */
export type SmartChipId =
  | "sun"
  | "moon"
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
  "moon",
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

/**
 * Normalize a saved `chip_order`: keep known ids (first occurrence), then
 * append missing ids in default order. Non-arrays → default order.
 */
export function resolveChipOrder(raw: unknown): SmartChipId[] {
  if (!Array.isArray(raw)) return [...SMART_CHIP_ORDER];
  const out: SmartChipId[] = [];
  for (const id of raw) {
    if (
      SMART_CHIP_ORDER.includes(id as SmartChipId) &&
      !out.includes(id as SmartChipId)
    ) {
      out.push(id as SmartChipId);
    }
  }
  for (const id of SMART_CHIP_ORDER) {
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** Move the chip at `from` to `to` (indexes clamped); returns a new array. */
export function moveChip(
  order: readonly SmartChipId[],
  from: number,
  to: number,
): SmartChipId[] {
  const out = [...order];
  if (!out.length) return out;
  const last = out.length - 1;
  const f = Math.min(Math.max(0, from), last);
  const t = Math.min(Math.max(0, to), last);
  if (f === t) return out;
  const [chip] = out.splice(f, 1);
  out.splice(t, 0, chip!);
  return out;
}

/**
 * Drop `id` before/after `targetId` (drag-and-drop in the editor).
 * Unknown ids → unchanged copy.
 */
export function dropChip(
  order: readonly SmartChipId[],
  id: SmartChipId,
  targetId: SmartChipId,
  after: boolean,
): SmartChipId[] {
  const from = order.indexOf(id);
  const target = order.indexOf(targetId);
  if (from < 0 || target < 0 || id === targetId) return [...order];
  const to = after
    ? target > from
      ? target
      : target + 1
    : target > from
      ? target - 1
      : target;
  return moveChip(order, from, to);
}

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
  /** Current time (card minute clock). */
  nowMs: number;
  /** Next sunrise/sunset (epoch ms), or null when unknown. */
  sunNextEventMs: number | null;
  /** Lunar age in days at `nowMs`. */
  moonAgeDays: number;
  /** Resolved user chip order (tie-breaks + More order). */
  order: readonly SmartChipId[];
}

export function isPrecipCondition(condition: string): boolean {
  return PRECIP_CONDITIONS.has(condition.replace(/_/g, "-"));
}

/** Sun chip is noteworthy this long before sunrise/sunset. */
export const SUN_NEAR_WINDOW_MS = 60 * 60_000;

/** Moon chip is noteworthy within this many days of a major phase. */
export const MOON_NEAR_WINDOW_DAYS = 1;

/** Whether an enabled chip with a value belongs in the primary row. */
export function isChipNoteworthy(
  id: SmartChipId,
  values: SmartChipValues,
): boolean {
  switch (id) {
    case "sun": {
      if (values.sunNextEventMs == null) return false;
      const until = values.sunNextEventMs - values.nowMs;
      return until > 0 && until <= SUN_NEAR_WINDOW_MS;
    }
    case "moon":
      return nearMajorMoonPhase(values.moonAgeDays, MOON_NEAR_WINDOW_DAYS);
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
 * Higher = earlier in the primary row; the lowest is demoted into More first.
 * Only meaningful for chips that pass `isChipNoteworthy`. A near sun leads;
 * a near moon trails every other noteworthy chip.
 */
export function chipSeverity(id: SmartChipId, values: SmartChipValues): number {
  switch (id) {
    case "sun":
      return 10_000;
    case "moon":
      return 1;
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

function orderIndex(id: SmartChipId, order: readonly SmartChipId[]): number {
  const i = order.indexOf(id);
  return i < 0 ? 999 : i;
}

export interface SmartChipPartition {
  /** Primary row: severity high → low, then user order. */
  primary: SmartChipId[];
  /** More menu: user order. */
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
    const sev = chipSeverity(b, values) - chipSeverity(a, values);
    if (sev !== 0) return sev;
    return orderIndex(a, values.order) - orderIndex(b, values.order);
  });

  overflow.sort(
    (a, b) => orderIndex(a, values.order) - orderIndex(b, values.order),
  );

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
 * Move lowest-priority primary chips (end of the severity-sorted list) into
 * overflow so More can stay on the same row. `count` is how many to demote.
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

  while (left > 0 && primary.length > 0) {
    const chip = primary.pop();
    if (chip) demoted.push(chip);
    left -= 1;
  }

  // Popped lowest-first; reverse so More lists them in on-row order.
  demoted.reverse();
  return { primary, overflow: [...demoted, ...quiet] };
}

/** Fallback spare px before undemoting when the returning chip's width is unknown. */
export const MORE_PACK_UNDEMOTE_SPARE_PX = 120;

/** Extra margin (px) beyond the returning chip + gap before undemoting. */
export const MORE_PACK_FIT_MARGIN_PX = 8;

/** Container width change (px) that invalidates a latch. */
export const MORE_PACK_LATCH_WIDTH_TOLERANCE_PX = 2;

/**
 * Lowest demotion count proven to keep More on the first line at this width
 * for this (pre-demotion) primary set.
 */
export interface MorePackLatch {
  widthPx: number;
  minStable: number;
  /** Noteworthy primary ids before demotion, joined with ",". */
  key: string;
}

export interface MorePackMeasure {
  smartChips: boolean;
  /** More control is in the DOM. */
  hasMore: boolean;
  moreWrapped: boolean;
  sparePx: number;
  /** Primary chip elements currently on the row (excludes More). */
  primaryCount: number;
  current: number;
  /** Primary chips before demotion; caps demotion at `preCount − 1`. */
  preCount?: number;
  /** Primary chips rendered below the first line (any wrap triggers demotion). */
  wrappedChips?: number;
  /** Width of the More control (credited when the last demoted chip returns). */
  moreWidthPx?: number;
  /** Last measured width of the chip that would return on undemote. */
  nextReturnWidthPx?: number | null;
  columnGapPx?: number;
  containerWidthPx?: number;
  /** Pre-demotion primary ids joined with "," (stable across demotions). */
  key?: string;
  latch?: MorePackLatch | null;
}

export interface MorePackResult {
  demotions: number;
  latch: MorePackLatch | null;
}

/**
 * Next demotion count from a layout measure.
 * Demote one when More wraps (and latch that count at this width). Undemote
 * one only when the returning chip actually fits and no latch forbids it, so
 * the row cannot flip between two layouts at a fixed width.
 */
export function nextMorePackDemotions(m: MorePackMeasure): MorePackResult {
  if (!m.smartChips) return { demotions: 0, latch: null };
  const wrappedChips = m.wrappedChips ?? 0;
  const wrapped = m.moreWrapped || wrappedChips > 0;
  if (!m.hasMore && !wrapped) return { demotions: 0, latch: null };

  const width = m.containerWidthPx ?? 0;
  const key = m.key ?? "";
  let latch = m.latch ?? null;
  if (
    latch &&
    (Math.abs(width - latch.widthPx) > MORE_PACK_LATCH_WIDTH_TOLERANCE_PX ||
      key !== latch.key)
  ) {
    latch = null;
  }

  const total = m.preCount ?? m.primaryCount;
  const maxDemote = Math.max(0, total - 1);
  let next = Math.min(Math.max(0, m.current), maxDemote);

  if (wrapped && next < maxDemote) {
    // Move every chip that fell off the first line at once (at least one).
    next = Math.min(maxDemote, next + Math.max(1, wrappedChips));
    return { demotions: next, latch: { widthPx: width, minStable: next, key } };
  }

  if (!wrapped && next > 0) {
    const gap = m.columnGapPx ?? 0;
    // Returning the last demoted chip also removes More and its gap.
    const moreCredit =
      next === 1 && m.moreWidthPx != null ? m.moreWidthPx + gap : 0;
    const fits =
      m.nextReturnWidthPx == null
        ? m.sparePx > MORE_PACK_UNDEMOTE_SPARE_PX
        : m.sparePx + moreCredit >=
          m.nextReturnWidthPx + gap + MORE_PACK_FIT_MARGIN_PX;
    const allowed = !latch || next - 1 >= latch.minStable;
    if (fits && allowed) return { demotions: next - 1, latch };
  }

  return { demotions: next, latch };
}

export interface ChipLayout {
  /** Partition before More-pack demotion. */
  pre: SmartChipPartition;
  /** What renders: primary row + More. */
  final: SmartChipPartition;
  /** Chip that would come back on undemote, if any. */
  returning: SmartChipId | null;
}

/**
 * Single source for the rendered chip layout (section + card measuring).
 * Smart mode fills the row: noteworthy chips first (by severity), then quiet
 * chips in user order. Whatever doesn't fit on one line is demoted into More.
 */
export function computeChipLayout(
  smartChips: boolean,
  available: readonly SmartChipId[],
  values: SmartChipValues,
  demotions: number,
): ChipLayout {
  const split = resolveDetailChips(smartChips, available, values);
  if (!smartChips) return { pre: split, final: split, returning: null };
  const pre: SmartChipPartition = {
    primary: [...split.primary, ...split.overflow],
    overflow: [],
  };
  const final = demotePrimaryChips(pre, demotions);
  const returning =
    final.primary.length < pre.primary.length
      ? (final.overflow[0] ?? null)
      : null;
  return { pre, final, returning };
}
