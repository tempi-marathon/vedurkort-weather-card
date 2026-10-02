import { describe, expect, it } from "vitest";
import {
  buildHumidityLegendRows,
  humidityColor,
  humidityLabelColor,
  HUMIDITY_GRADIENT_STOPS,
  HUMIDITY_LINE_COLOR,
} from "./humidity-scale";
import { contrastOnWhite } from "./beaufort-scale";

describe("humidityColor", () => {
  it("returns gradient endpoint colors at 0% and 100%", () => {
    expect(humidityColor(0)).toBe(HUMIDITY_GRADIENT_STOPS[0]!.color);
    expect(humidityColor(100)).toBe(
      HUMIDITY_GRADIENT_STOPS[HUMIDITY_GRADIENT_STOPS.length - 1]!.color,
    );
  });

  it("clamps out-of-range values", () => {
    expect(humidityColor(-10)).toBe(humidityColor(0));
    expect(humidityColor(150)).toBe(humidityColor(100));
  });

  it("interpolates between stops", () => {
    const mid = humidityColor(50);
    expect(mid).not.toBe(humidityColor(0));
    expect(mid).not.toBe(humidityColor(100));
    expect(mid).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe("humidityLabelColor", () => {
  it("meets contrast on white for light blues", () => {
    for (const rh of [40, 60, 80, 100]) {
      expect(contrastOnWhite(humidityLabelColor(rh))).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
});

describe("buildHumidityLegendRows", () => {
  it("builds 4 RH comfort bands with localized labels", () => {
    const rows = buildHumidityLegendRows("en");
    expect(rows).toHaveLength(4);
    expect(rows[0]?.range).toBe("0–30%");
    expect(rows[0]?.label).toBe("Air feels dry.");
    expect(rows[1]?.range).toBe("30–50%");
    expect(rows[2]?.range).toBe("50–70%");
    expect(rows[3]?.range).toBe("70–100%");
    expect(rows[3]?.color).toBe(humidityColor(85));
  });

  it("uses Dutch labels when requested", () => {
    const rows = buildHumidityLegendRows("nl");
    expect(rows[0]?.label).toBe("Droge lucht.");
  });
});

describe("HUMIDITY_LINE_COLOR", () => {
  it("is a valid hex color", () => {
    expect(HUMIDITY_LINE_COLOR).toMatch(/^#[0-9A-F]{6}$/);
  });
});
