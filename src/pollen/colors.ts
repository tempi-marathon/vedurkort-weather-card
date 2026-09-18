import type { PollenLevelLabel } from "./types";

/** CSS class for low/high pollen levels; omitted for none/unknown. */
export function pollenLevelClass(
  level: PollenLevelLabel | null | undefined,
): string | undefined {
  if (level === "low") return "pollen-level--low";
  if (level === "high") return "pollen-level--high";
  return undefined;
}
