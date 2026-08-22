import { describe, expect, it } from "vitest";
import type { VedurkortCardConfig } from "../config";
import type { HassEntity, HomeAssistant } from "../types";
import {
  fetchForecastOnce,
  getWeatherSnapshot,
  isDaytimeAt,
  isSunUp,
  subscribeForecast,
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

describe("subscribeForecast", () => {
  it("delivers items from weather/subscribe_forecast", async () => {
    let handler: ((event: { forecast?: { datetime: string }[] }) => void) | undefined;
    const hass = mockHass({
      "weather.home": {
        entity_id: "weather.home",
        state: "sunny",
        attributes: {},
      },
    });
    hass.connection.subscribeMessage = async (cb) => {
      handler = cb as typeof handler;
      return () => undefined;
    };

    const updates: Array<{ data: { datetime: string }[]; error: string | null }> =
      [];
    const unsub = await subscribeForecast(
      hass,
      "weather.home",
      "daily",
      (data, error) => {
        updates.push({ data, error });
      },
    );
    handler?.({ forecast: [{ datetime: "2026-08-22" }] });
    expect(updates.at(-1)).toEqual({
      data: [{ datetime: "2026-08-22" }],
      error: null,
    });
    unsub();
  });

  it("does not fall back to attributes.forecast when subscribe and service fail", async () => {
    const hass = mockHass({
      "weather.home": {
        entity_id: "weather.home",
        state: "sunny",
        attributes: {
          forecast: [{ datetime: "2020-01-01", temperature: 1 }],
        },
      },
    });
    hass.connection.subscribeMessage = async () => {
      throw new Error("subscribe unavailable");
    };
    hass.callWS = async () => {
      throw new Error("service unavailable");
    };

    const updates: Array<[unknown[], string | null]> = [];
    await subscribeForecast(hass, "weather.home", "daily", (data, error) => {
      updates.push([data, error]);
    });

    expect(updates).toHaveLength(1);
    expect(updates[0]![0]).toEqual([]);
    expect(updates[0]![1]).toBe("subscribe unavailable");
  });

  it("uses service response instead of attributes.forecast when subscribe fails", async () => {
    const hass = mockHass({
      "weather.home": {
        entity_id: "weather.home",
        state: "sunny",
        attributes: {
          forecast: [{ datetime: "2020-01-01", temperature: 1 }],
        },
      },
    });
    hass.connection.subscribeMessage = async () => {
      throw new Error("subscribe unavailable");
    };
    hass.callWS = async <T>() =>
      ({
        response: {
          "weather.home": {
            forecast: [{ datetime: "2026-08-22", temperature: 20 }],
          },
        },
      }) as T;

    const updates: Array<[unknown[], string | null]> = [];
    await subscribeForecast(hass, "weather.home", "daily", (data, error) => {
      updates.push([data, error]);
    });

    expect(updates[0]![0]).toEqual([
      { datetime: "2026-08-22", temperature: 20 },
    ]);
    expect(updates[0]![1]).toBeNull();
  });
});

describe("fetchForecastOnce", () => {
  it("falls back to attributes.forecast when subscribe fails", async () => {
    const legacy = [{ datetime: "2020-01-01", temperature: 5 }];
    const hass = mockHass({
      "weather.home": {
        entity_id: "weather.home",
        state: "sunny",
        attributes: { forecast: legacy },
      },
    });
    hass.connection.subscribeMessage = async () => {
      throw new Error("subscribe unavailable");
    };

    const items = await fetchForecastOnce(hass, "weather.home", "daily");
    expect(items).toEqual(legacy);
  });
});
