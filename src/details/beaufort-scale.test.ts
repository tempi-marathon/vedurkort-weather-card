import { describe, expect, it } from "vitest";
import {
  beaufortColor,
  beaufortLegendRangeUnit,
  buildBeaufortLegendRows,
} from "./beaufort-scale";

describe("beaufortColor", () => {
  it("returns palette colors for 0–12", () => {
    expect(beaufortColor(0)).toBe("#7EC8E3");
    expect(beaufortColor(12)).toBe("#C2185B");
    expect(beaufortColor(99)).toBe("#C2185B");
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
