import type { PollenLevelLabel } from "./types";

/** CSS hex colors for pollen level tones (legend swatches + chart). */
export const POLLEN_LEVEL_COLORS: Record<PollenLevelLabel, string> = {
  none: "#94a3b8",
  low: "#eab308",
  medium: "#f97316",
  high: "#ef4444",
};

/** CSS class for low/medium/high pollen levels; omitted for none/unknown. */
export function pollenLevelClass(
  level: PollenLevelLabel | null | undefined,
): string | undefined {
  if (level === "low") return "pollen-level--low";
  if (level === "medium") return "pollen-level--medium";
  if (level === "high") return "pollen-level--high";
  return undefined;
}

export function pollenLevelColor(
  level: PollenLevelLabel | null | undefined,
): string | undefined {
  if (
    level === "none" ||
    level === "low" ||
    level === "medium" ||
    level === "high"
  ) {
    return POLLEN_LEVEL_COLORS[level];
  }
  return undefined;
}
