import type { MeteoconName } from "../icons/allowlist";

/**
 * Synodic month length (days). Same constant used by many lunar calculators.
 * Phase mapping aligned with Home Assistant's Moon sensor (astral-style age).
 */
export const SYNODIC_MONTH_DAYS = 29.53058867;

/** Known new moon: 2000-01-06 18:14 UTC. */
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

/** HA Moon / astral phase keys. */
export type MoonPhaseId =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export interface MoonSnapshot {
  /** Age in days since last new moon, in [0, synodic). */
  ageDays: number;
  /** Progress through lunation, 0 = new, 0.5 ≈ full, 1 = next new. */
  progress: number;
  phase: MoonPhaseId;
  /** Illuminated fraction 0–100. */
  illuminationPct: number;
  nextFull: Date;
  nextNew: Date;
}

/** Lunar age in days for `now` (UTC-based epoch). */
export function lunarAgeDays(now: Date = new Date()): number {
  const days = (now.getTime() - KNOWN_NEW_MOON_MS) / 86_400_000;
  const age = days % SYNODIC_MONTH_DAYS;
  return age < 0 ? age + SYNODIC_MONTH_DAYS : age;
}

/**
 * Map age (0–~29.53) onto HA Moon buckets.
 * Astral uses ~0–28; we scale thresholds to the synodic month.
 */
export function phaseFromAge(ageDays: number): MoonPhaseId {
  const syn = SYNODIC_MONTH_DAYS;
  const a = ((ageDays % syn) + syn) % syn;
  // Scale HA/astral cutoffs (on ~28-day scale) to synodic length.
  const s = syn / 28;
  if (a < 0.5 * s || a > 27.5 * s) return "new_moon";
  if (a < 6.5 * s) return "waxing_crescent";
  if (a < 7.5 * s) return "first_quarter";
  if (a < 13.5 * s) return "waxing_gibbous";
  if (a < 14.5 * s) return "full_moon";
  if (a < 20.5 * s) return "waning_gibbous";
  if (a < 21.5 * s) return "last_quarter";
  return "waning_crescent";
}

/** Illumination % from age (simple cosine model). */
export function illuminationFromAge(ageDays: number): number {
  const syn = SYNODIC_MONTH_DAYS;
  const a = ((ageDays % syn) + syn) % syn;
  const frac = a / syn;
  const lit = (1 - Math.cos(2 * Math.PI * frac)) / 2;
  return Math.round(lit * 1000) / 10;
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 86_400_000);
}

export function nextFullMoon(now: Date, ageDays: number): Date {
  const syn = SYNODIC_MONTH_DAYS;
  const a = ((ageDays % syn) + syn) % syn;
  const fullAt = syn / 2;
  // At/after exact full, advance to the next lunation (not "today").
  const days = a < fullAt ? fullAt - a : syn - a + fullAt;
  return addDays(now, days);
}

export function nextNewMoon(now: Date, ageDays: number): Date {
  const syn = SYNODIC_MONTH_DAYS;
  const a = ((ageDays % syn) + syn) % syn;
  const days = a < 1e-9 ? syn : syn - a;
  return addDays(now, days);
}

export function getMoonSnapshot(now?: Date): MoonSnapshot {
  const at = now ?? new Date();
  const ageDays = lunarAgeDays(at);
  const progress = ageDays / SYNODIC_MONTH_DAYS;
  return {
    ageDays,
    progress,
    phase: phaseFromAge(ageDays),
    illuminationPct: illuminationFromAge(ageDays),
    nextFull: nextFullMoon(at, ageDays),
    nextNew: nextNewMoon(at, ageDays),
  };
}

const PHASE_ICONS: Record<MoonPhaseId, MeteoconName> = {
  new_moon: "moon-new",
  waxing_crescent: "moon-waxing-crescent",
  first_quarter: "moon-first-quarter",
  waxing_gibbous: "moon-waxing-gibbous",
  full_moon: "moon-full",
  waning_gibbous: "moon-waning-gibbous",
  last_quarter: "moon-last-quarter",
  waning_crescent: "moon-waning-crescent",
};

export function moonPhaseIcon(phase: MoonPhaseId): MeteoconName {
  return PHASE_ICONS[phase];
}

export function moonPhaseLocalizeKey(
  phase: MoonPhaseId,
): `moon_phase_${MoonPhaseId}` {
  return `moon_phase_${phase}`;
}
