import { describe, expect, it } from "vitest";
import type { VedurkortCardConfig } from "../config";
import type { HassEntity, HomeAssistant } from "../types";
import {
  getWeatherSnapshot,
  isDaytimeAt,
  isSunUp,
} from "./adapter";

function mockHass(
  states: Record<string, Partial<HassEntity> & { entity_id: string }>,
): HomeAssistant {
  const full: Record<string, HassEntity> = {};
  for (const [id, partial] of Object.entries(states)) {
    full[id] = {
      entity_id: id,
      state: partial.state ?? "sunny",
      attributes: partial.attributes ?? {},
    };
  }
  return {
    states: full,
    config: {
      unit_system: {
        temperature: "°C",
        length: "km",
        pressure: "hPa",
        wind_speed: "km/h",
      },
    },
    connection: { subscribeMessage: async () => () => undefined },
    callWS: async <T>() => ({}) as T,
  };
}

const baseConfig: VedurkortCardConfig = {
  entity: "weather.home",
  show_name: true,
  layout: "default",
  icon_style: "fill",
  animated_icons: true,
  animated_background: false,
  show_current: true,
  show_sun: false,
  show_wind_speed: false,
  show_wind_direction: false,
  show_wind_gust: true,
  show_humidity: false,
  show_uv_index: false,
  show_pressure: false,
  show_cloud_coverage: false,
  show_feels_like: false,
  show_dew_point: false,
  show_visibility: false,
  show_precipitation: false,
  show_precipitation_probability: false,
  show_alerts: false,
  daily: {
    enabled: false,
    days: 5,
    show_condition_icons: true,
    show_wind_speed: true,
    show_wind_direction: true,
    precip_type: "rainfall",
  },
  hourly: {
    enabled: false,
    hours: 12,
    show_condition_icons: true,
    show_wind_speed: true,
    show_wind_direction: true,
    precip_type: "rainfall",
  },
};

describe("weather adapter", () => {
  it("getWeatherSnapshot reads wind_gust from entity", () => {
    const hass = mockHass({
      "weather.home": {
        entity_id: "weather.home",
        state: "windy",
        attributes: {
          temperature: 15,
          wind_gust: 42,
          friendly_name: "Home",
        },
      },
      "sun.sun": {
        entity_id: "sun.sun",
        state: "above_horizon",
        attributes: {},
      },
    });
    const snap = getWeatherSnapshot(hass, baseConfig);
    expect(snap?.windGust).toBe(42);
  });

  it("getWeatherSnapshot uses wind_gust_entity override", () => {
    const hass = mockHass({
      "weather.home": {
        entity_id: "weather.home",
        state: "windy",
        attributes: { wind_gust: 10 },
      },
      "sensor.gust": {
        entity_id: "sensor.gust",
        state: "55",
        attributes: {},
      },
      "sun.sun": {
        entity_id: "sun.sun",
        state: "above_horizon",
        attributes: {},
      },
    });
    const snap = getWeatherSnapshot(hass, {
      ...baseConfig,
      wind_gust_entity: "sensor.gust",
    });
    expect(snap?.windGust).toBe(55);
  });

  it("isSunUp reads sun.sun state", () => {
    const hass = mockHass({
      "sun.sun": {
        entity_id: "sun.sun",
        state: "below_horizon",
        attributes: {},
      },
    });
    expect(isSunUp(hass)).toBe(false);
  });

  it("isDaytimeAt falls back to clock heuristic without sun attrs", () => {
    const hass = mockHass({
      "sun.sun": { entity_id: "sun.sun", state: "above_horizon", attributes: {} },
    });
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    expect(isDaytimeAt(hass, noon.toISOString())).toBe(true);
  });
});
