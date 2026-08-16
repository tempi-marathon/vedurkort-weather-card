import { describe, expect, it } from "vitest";
import { normalizeConfig, normalizeEditorConfig } from "./config";

describe("alerts config compatibility", () => {
  it("defaults show_alerts to false for legacy configs", () => {
    const cfg = normalizeConfig({ entity: "weather.home" });
    expect(cfg.show_alerts).toBe(false);
    expect(cfg.alerts_device).toBeUndefined();
    expect(cfg.alerts_entity).toBeUndefined();
    expect(cfg.alerts_entities).toBeUndefined();
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
});
