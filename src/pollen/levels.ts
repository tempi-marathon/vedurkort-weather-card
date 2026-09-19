import type { PollenLevelLabel, PollenSpeciesKey } from "./types";

/** Match ha-pollen EAACI/CAMS onset/peak (grains/m³); mid = (onset+peak)/2. */
const THRESHOLDS: Record<
  Exclude<PollenSpeciesKey, "overall">,
  readonly [number, number]
> = {
  birch: [20, 100],
  alder: [45, 80],
  olive: [10, 200],
  mugwort: [3, 50],
  ragweed: [5, 20],
  grass: [3, 50],
};

/** Map grains/m³ → 0–3, or null when value/species is unknown. */
export function levelForGrains(
  species: Exclude<PollenSpeciesKey, "overall">,
  grains: number | null | undefined,
): number | null {
  if (grains == null || Number.isNaN(grains)) return null;
  const bounds = THRESHOLDS[species];
  if (!bounds) return null;
  const [onset, peak] = bounds;
  const mid = (onset + peak) / 2;
  if (grains >= peak) return 3;
  if (grains >= mid) return 2;
  if (grains >= onset) return 1;
  return 0;
}

export function labelFromLevel(level: number | null | undefined): PollenLevelLabel | null {
  if (level == null || Number.isNaN(level)) return null;
  if (level >= 3) return "high";
  if (level >= 2) return "medium";
  if (level >= 1) return "low";
  return "none";
}
