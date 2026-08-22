import { DEFAULT_CONFIG } from "./config";
import type { HomeAssistant } from "./types";

export interface EntitySuggestion {
  config: Record<string, unknown>;
  label?: string;
}

export type GetEntitySuggestion = (
  hass: HomeAssistant,
  entityId: string,
) => EntitySuggestion | EntitySuggestion[] | null;

export function getWeatherEntitySuggestion(
  hass: HomeAssistant,
  entityId: string,
): EntitySuggestion | null {
  if (entityId.split(".")[0] !== "weather") return null;
  if (!hass.states[entityId]) return null;

  return {
    config: {
      type: "custom:vedurkort-weather-card",
      entity: entityId,
      ...DEFAULT_CONFIG,
      animated_background: true,
    },
  };
}
