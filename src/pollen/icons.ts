import type { MeteoconName } from "../icons/allowlist";
import type { PollenLevelLabel, PollenSpeciesKey } from "./types";

type PollenType = "grass" | "tree" | "weed" | "generic";

function speciesType(
  species: PollenSpeciesKey | null | undefined,
): PollenType {
  switch (species) {
    case "grass":
      return "grass";
    case "alder":
    case "birch":
    case "olive":
      return "tree";
    case "mugwort":
    case "ragweed":
      return "weed";
    default:
      return "generic";
  }
}

/** Pick a Meteocons pollen icon for level + species. */
export function pollenIcon(
  level: PollenLevelLabel | null | undefined,
  species?: PollenSpeciesKey | null,
): MeteoconName {
  const type = speciesType(species);
  if (type === "generic" || !level || level === "none") {
    if (type === "grass") return "pollen-grass";
    if (type === "tree") return "pollen-tree";
    if (type === "weed") return "pollen-weed";
    return "pollen";
  }
  const severity = level === "high" ? "high" : "low";
  // medium (and low) share the -low Meteocon; high uses -high
  if (type === "grass") {
    return severity === "high" ? "pollen-grass-high" : "pollen-grass-low";
  }
  if (type === "tree") {
    return severity === "high" ? "pollen-tree-high" : "pollen-tree-low";
  }
  return severity === "high" ? "pollen-weed-high" : "pollen-weed-low";
}
