import { describe, expect, it } from "vitest";
import { normalizeConfig, normalizeEditorConfig } from "./config";

describe("alerts config compatibility", () => {
  it("defaults show_alerts to false for legacy configs", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_alerts).toBe(false);
    expect(cfg.alerts_device).toBeUndefined();
    expect(cfg.alerts_entities).toBeUndefined();
  });

  it("defaults show_name to true for legacy configs", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_name).toBe(true);
  });

  it("preserves show_name false", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      show_name: false,
    });
    expect(cfg.show_name).toBe(false);
  });

  it("normalizes alerts_entities lists", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      show_alerts: true,
      alerts_entities: [" binary_sensor.a ", "binary_sensor.a", "sensor.b", ""],
    });
    expect(cfg.show_alerts).toBe(true);
    expect(cfg.alerts_entities).toEqual(["binary_sensor.a", "sensor.b"]);
  });

  it("merges legacy alerts_entity into alerts_entities", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      show_alerts: true,
      alerts_entities: ["sensor.cap_alert"],
      ...({ alerts_entity: "binary_sensor.meteoalarm" } as Record<
        string,
        unknown
      >),
    });
    expect(cfg.alerts_entities).toEqual([
      "binary_sensor.meteoalarm",
      "sensor.cap_alert",
    ]);
  });
});

describe("config normalization", () => {
  it("defaults layout to default", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.layout).toBe("default");
  });

  it("preserves compact layout", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      layout: "compact",
    });
    expect(cfg.layout).toBe("compact");
  });

  it("falls back invalid layout to default", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      layout: "invalid" as "default",
    });
    expect(cfg.layout).toBe("default");
  });

  it("defaults show_wind_gust to false", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_wind_gust).toBe(false);
  });

  it("clamps hourly hours", () => {
    const cfg = normalizeConfig({
      entity: "weather.home",
      hourly: { enabled: true, hours: 99 } as never,
    });
    expect(cfg.hourly.hours).toBe(48);
  });

  it("clamps daily days", () => {
    const cfg = normalizeConfig({
      entity: "weather.home",
      daily: { enabled: true, days: 1 } as never,
    });
    expect(cfg.daily.days).toBe(2);
  });
});
