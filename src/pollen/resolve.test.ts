import { describe, expect, it } from "vitest";
import type { HomeAssistant } from "../types";
import { findPollenDevices, resolvePollenDeviceId } from "./discovery";
import { resolvePollen } from "./resolve";

function hassFixture(): HomeAssistant {
  return {
    states: {
      "sensor.pollen_overall": {
        entity_id: "sensor.pollen_overall",
        state: "high",
        attributes: {
          provider: "open_meteo",
          species: "overall",
          unit: "level",
          level: 2,
          level_label: "high",
          dominant_species: "grass",
          forecast_hourly: [
            { t: "2026-06-19T00:00", value: 40 },
            { t: "2026-06-19T01:00", value: 60 },
          ],
          forecast_daily: [{ date: "2026-06-19", value: 60 }],
          attribution: "Open-Meteo",
        },
      },
      "sensor.pollen_grass": {
        entity_id: "sensor.pollen_grass",
        state: "60",
        attributes: {
          provider: "open_meteo",
          species: "grass",
          unit: "grains_m3",
          level: 2,
          level_label: "high",
          forecast_hourly: [
            { t: "2026-06-19T00:00", value: 40 },
            { t: "2026-06-19T01:00", value: 60 },
          ],
          forecast_daily: [{ date: "2026-06-19", value: 60 }],
        },
      },
      "sensor.pollen_birch": {
        entity_id: "sensor.pollen_birch",
        state: "10",
        attributes: {
          provider: "open_meteo",
          species: "birch",
          unit: "grains_m3",
          level: 0,
          level_label: "none",
          forecast_hourly: [
            { t: "2026-06-19T00:00", value: 5 },
            { t: "2026-06-19T01:00", value: 10 },
          ],
          forecast_daily: [{ date: "2026-06-19", value: 10 }],
        },
      },
    },
    entities: {
      "sensor.pollen_overall": {
        entity_id: "sensor.pollen_overall",
        device_id: "dev-pollen",
        platform: "pollen",
      },
      "sensor.pollen_grass": {
        entity_id: "sensor.pollen_grass",
        device_id: "dev-pollen",
        platform: "pollen",
      },
      "sensor.pollen_birch": {
        entity_id: "sensor.pollen_birch",
        device_id: "dev-pollen",
        platform: "pollen",
      },
    },
    devices: {
      "dev-pollen": { id: "dev-pollen", name: "Home pollen" },
    },
    config: { unit_system: { temperature: "°C", length: "km" } },
    connection: { subscribeMessage: async () => () => undefined },
    callWS: async () => {
      throw new Error("unused");
    },
  };
}

describe("pollen discovery", () => {
  it("finds the pollen device and auto-resolves when unique", () => {
    const hass = hassFixture();
    expect(findPollenDevices(hass)).toEqual([
      { id: "dev-pollen", name: "Home pollen" },
    ]);
    expect(resolvePollenDeviceId(hass, undefined)).toBe("dev-pollen");
    expect(resolvePollenDeviceId(hass, "explicit")).toBe("explicit");
  });
});

describe("resolvePollen", () => {
  it("returns null when disabled", () => {
    expect(resolvePollen(hassFixture(), { show_pollen: false })).toBeNull();
  });

  it("builds a snapshot from the device sensors", () => {
    const snap = resolvePollen(hassFixture(), { show_pollen: true });
    expect(snap).not.toBeNull();
    expect(snap!.overallLevelLabel).toBe("high");
    expect(snap!.dominantSpecies).toBe("grass");
    expect(snap!.species).toHaveLength(2);
    expect(snap!.forecastHourly).toHaveLength(2);
    expect(snap!.forecastHourly[1]!.value).toBe(60);
  });
});
