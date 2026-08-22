import { resolveAlerts } from "./alerts/resolve";
import type { VedurkortCardConfig } from "./config";
import type { HomeAssistant } from "./types";

/** Grid height estimate for Lovelace layout (sections + layout preset + alerts). */
export function computeCardSize(
  config: VedurkortCardConfig,
  hass: HomeAssistant | undefined,
): number {
  let size = config.show_current ? 3 : 1;
  if (config.daily.enabled) size += 3;
  if (config.hourly.enabled) size += 3;
  if (config.layout === "compact") size = Math.max(2, size - 1);
  if (config.layout === "minimal") size = Math.max(1, size - 2);
  if (
    config.show_alerts &&
    hass &&
    resolveAlerts(hass, config).length > 0
  ) {
    size += 1;
  }
  return size;
}
