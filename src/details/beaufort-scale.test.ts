import { describe, expect, it } from "vitest";
import {
  beaufortColor,
  beaufortLabelColor,
  beaufortLegendRangeUnit,
  buildBeaufortLegendRows,
  contrastOnWhite,
} from "./beaufort-scale";

describe("beaufortColor", () => {
  it("returns palette colors for 0–12", () => {
    expect(beaufortColor(0)).toBe("#7EC8E3");
    expect(beaufortColor(12)).toBe("#C2185B");
    expect(beaufortColor(99)).toBe("#C2185B");
  });
});

describe("beaufortLabelColor", () => {
  it("meets 4.5:1 contrast on white for lime/yellow forces", () => {
    for (const bft of [4, 5, 6, 7]) {
      expect(contrastOnWhite(beaufortLabelColor(bft))).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("keeps already-compliant dark reds unchanged", () => {
    for (const bft of [11, 12]) {
      expect(beaufortLabelColor(bft)).toBe(beaufortColor(bft));
      expect(contrastOnWhite(beaufortLabelColor(bft))).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });

  it("darkens mid-scale colors only as far as needed for contrast", () => {
    for (const bft of [5, 8, 9, 10]) {
      const label = beaufortLabelColor(bft);
      expect(contrastOnWhite(label)).toBeGreaterThanOrEqual(4.5);
      expect(contrastOnWhite(label)).toBeLessThan(6);
    }
  });

  it("preserves hue for Bft 5 (stays green-yellow, not gray)", () => {
    const label = beaufortLabelColor(5);
    expect(label).not.toBe(beaufortColor(5));
    // Darkened olive still has green+red dominance over blue.
    const n = parseInt(label.slice(1), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8) & 0xff;
    const b = n & 0xff;
    expect(g).toBeGreaterThan(b);
    expect(r).toBeGreaterThan(b);
  });
});

describe("beaufortLegendRangeUnit", () => {
  it("uses native when display is Beaufort", () => {
    expect(beaufortLegendRangeUnit("beaufort", "km/h")).toBe("km/h");
    expect(beaufortLegendRangeUnit("beaufort", "mph")).toBe("mph");
  });

  it("uses selected unit otherwise", () => {
    expect(beaufortLegendRangeUnit("m/s", "km/h")).toBe("m/s");
    expect(beaufortLegendRangeUnit("native", "km/h")).toBe("km/h");
  });
});

describe("buildBeaufortLegendRows", () => {
  it("builds 13 localized rows with km/h ranges", () => {
    const rows = buildBeaufortLegendRows("nl", "beaufort", "km/h");
    expect(rows).toHaveLength(13);
    expect(rows[0]?.description).toBe("Windstil");
    expect(rows[0]?.range).toBe("< 2 km/h");
    expect(rows[4]?.description).toBe("Matige wind");
    expect(rows[4]?.range).toBe("20 – 28 km/h");
    expect(rows[12]?.description).toBe("Orkaan");
    expect(rows[12]?.range).toBe("> 118 km/h");
  });

  it("converts ranges to m/s when selected", () => {
    const rows = buildBeaufortLegendRows("en", "m/s", "km/h");
    expect(rows[0]?.range).toMatch(/m\/s$/);
    expect(rows[0]?.range.startsWith("<")).toBe(true);
  });
});
