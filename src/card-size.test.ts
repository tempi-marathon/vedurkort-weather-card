import { describe, expect, it } from "vitest";
import { computeCardSize } from "./card-size";
import type { VedurkortCardConfig } from "./config";
import type { HassEntity, HomeAssistant } from "./types";

function mockHass(
  states: Record<string, Partial<HassEntity> & { entity_id: string }> = {},
): HomeAssistant {
  const full: Record<string, HassEntity> = {};
  for (const [id, partial] of Object.entries(states)) {
    full[id] = {
      entity_id: id,
      state: partial.state ?? "on",
      attributes: partial.attributes ?? {},
    };
  }
  return {
    states: full,
    config: {
      unit_system: { temperature: "°C", length: "km" },
    },
    connection: { subscribeMessage: async () => () => undefined },
    callWS: async <T>() => ({}) as T,
  };
}

const baseConfig = (): VedurkortCardConfig => ({
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
  show_wind_gust: false,
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
});

describe("computeCardSize", () => {
  it("returns 3 for current-only default layout", () => {
    expect(computeCardSize(baseConfig(), undefined)).toBe(3);
  });

  it("returns 1 when current is disabled", () => {
    const config = baseConfig();
    config.show_current = false;
    expect(computeCardSize(config, undefined)).toBe(1);
  });

  it("adds 3 per forecast section", () => {
    const config = baseConfig();
    config.daily.enabled = true;
    config.hourly.enabled = true;
    expect(computeCardSize(config, undefined)).toBe(9);
  });

  it("compact layout reduces size by 1", () => {
    const config = baseConfig();
    config.layout = "compact";
    expect(computeCardSize(config, undefined)).toBe(2);
  });

  it("minimal layout reduces size by 2", () => {
    const config = baseConfig();
    config.layout = "minimal";
    expect(computeCardSize(config, undefined)).toBe(1);
  });

  it("adds 1 when active alerts are shown", () => {
    const config = baseConfig();
    config.show_alerts = true;
    const hass = mockHass({
      "binary_sensor.meteoalarm": {
        entity_id: "binary_sensor.meteoalarm",
        state: "on",
        attributes: {
          attribution: "Information provided by MeteoAlarm",
          event: "Severe forest-fire warning",
          headline: "Orange forest-fire for Hedmark",
          severity: "Severe",
          awareness_level: "3; orange; Severe",
          awareness_type: "8; forest-fire",
        },
      },
    });
    config.alerts_entities = ["binary_sensor.meteoalarm"];
    expect(computeCardSize(config, hass)).toBe(4);
  });
});
