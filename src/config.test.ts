import { describe, expect, it } from "vitest";
import { normalizeConfig, normalizeEditorConfig } from "./config";

describe("alerts config compatibility", () => {
  it("defaults show_alerts to false for legacy configs", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_alerts).toBe(false);
    expect(cfg.alerts_device).toBeUndefined();
    expect(cfg.alerts_entities).toBeUndefined();
  });

  it("defaults show_pollen to false for legacy configs", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_pollen).toBe(false);
    expect(cfg.pollen_device).toBeUndefined();
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

  it("defaults show_wind to false", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_wind).toBe(false);
  });

  it("defaults wind_speed_unit to native", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.wind_speed_unit).toBe("native");
  });

  it("migrates legacy current wind flags to show_wind", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      show_wind_speed: true,
      show_wind_direction: false,
      show_wind_gust: false,
    } as never);
    expect(cfg.show_wind).toBe(true);
    expect(
      (cfg as Record<string, unknown>).show_wind_speed,
    ).toBeUndefined();
    expect(
      (cfg as Record<string, unknown>).show_wind_gust,
    ).toBeUndefined();
  });

  it("prefers explicit show_wind over legacy flags", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      show_wind: false,
      show_wind_speed: true,
    } as never);
    expect(cfg.show_wind).toBe(false);
  });

  it("preserves wind_speed_unit", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      wind_speed_unit: "beaufort",
    });
    expect(cfg.wind_speed_unit).toBe("beaufort");
  });

  it("falls back invalid wind_speed_unit to native", () => {
    const cfg = normalizeEditorConfig({
      entity: "weather.home",
      wind_speed_unit: "knots" as "native",
    });
    expect(cfg.wind_speed_unit).toBe("native");
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
