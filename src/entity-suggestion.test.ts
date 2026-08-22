import { describe, expect, it } from "vitest";
import { getWeatherEntitySuggestion } from "./entity-suggestion";
import type { HomeAssistant } from "./types";

function mockHass(states: Record<string, { entity_id: string; state: string; attributes: Record<string, unknown> }>): HomeAssistant {
  return {
    states,
    config: {
      unit_system: { temperature: "°C", length: "km" },
    },
    connection: { subscribeMessage: async () => () => {} },
    callWS: async () => ({}),
  } as HomeAssistant;
}

describe("getWeatherEntitySuggestion", () => {
  const weatherState = {
    entity_id: "weather.home",
    state: "sunny",
    attributes: {},
  };

  it("returns config with entity for weather entities", () => {
    const hass = mockHass({ "weather.home": weatherState });
    const result = getWeatherEntitySuggestion(hass, "weather.home");

    expect(result).not.toBeNull();
    expect(result!.config).toMatchObject({
      type: "custom:vedurkort-weather-card",
      entity: "weather.home",
      show_current: true,
      animated_background: true,
    });
  });

  it("returns null for non-weather domains", () => {
    const hass = mockHass({ "sensor.temp": { entity_id: "sensor.temp", state: "20", attributes: {} } });
    expect(getWeatherEntitySuggestion(hass, "sensor.temp")).toBeNull();
  });

  it("returns null when entity is missing from hass.states", () => {
    const hass = mockHass({});
    expect(getWeatherEntitySuggestion(hass, "weather.home")).toBeNull();
  });
});
