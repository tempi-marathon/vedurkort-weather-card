import { describe, expect, it } from "vitest";
import {
  buildPressureLegendRows,
  buildPressureScaleModel,
} from "./pressure-scale";
import { pressureBand } from "./metric-bands";

describe("buildPressureScaleModel", () => {
  it("returns null without a usable reading", () => {
    expect(buildPressureScaleModel(null, "hPa", "en")).toBeNull();
    expect(buildPressureScaleModel(undefined, "hPa", "en")).toBeNull();
    expect(buildPressureScaleModel(NaN, "hPa", "en")).toBeNull();
  });

  it("splits the scale at 1000 and 1025 hPa", () => {
    const m = buildPressureScaleModel(1012, "hPa", "en")!;
    const [low, normal, high] = m.segments;
    expect(low!.fromPct).toBe(0);
    expect(low!.toPct).toBeCloseTo(((1000 - 970) / 80) * 100);
    expect(normal!.fromPct).toBe(low!.toPct);
    expect(normal!.toPct).toBeCloseTo(((1025 - 970) / 80) * 100);
    expect(high!.fromPct).toBe(normal!.toPct);
    expect(high!.toPct).toBe(100);
  });

  it("places the marker and band for low, normal and high readings", () => {
    const low = buildPressureScaleModel(985, "hPa", "en")!;
    const mid = buildPressureScaleModel(1012, "hPa", "en")!;
    const high = buildPressureScaleModel(1040, "hPa", "en")!;
    expect([low.band, mid.band, high.band]).toEqual(["low", "normal", "high"]);
    expect(low.markerPct).toBeCloseTo(18.75);
    expect(mid.markerPct).toBeCloseTo(52.5);
    expect(high.markerPct).toBeCloseTo(87.5);
  });

  it("clamps markers outside the display range", () => {
    expect(buildPressureScaleModel(950, "hPa", "en")!.markerPct).toBe(0);
    expect(buildPressureScaleModel(1100, "hPa", "en")!.markerPct).toBe(100);
  });

  it("agrees with pressureBand in every unit", () => {
    for (const [value, unit] of [
      [985, "hPa"],
      [1013, "mbar"],
      [101.3, "kPa"],
      [29.92, "inHg"],
      [31, "inHg"],
      [760, "mmHg"],
    ] as const) {
      expect(buildPressureScaleModel(value, unit, "en")!.band).toBe(
        pressureBand(value, unit),
      );
    }
  });

  it("labels the reading with its unit", () => {
    expect(buildPressureScaleModel(1012.4, "hPa", "en")!.valueLabel).toBe(
      "1012 hPa",
    );
    expect(buildPressureScaleModel(29.92, "inHg", "en")!.valueLabel).toBe(
      "29.92 inHg",
    );
  });

  it("includes the band name for the accessible label", () => {
    expect(buildPressureScaleModel(985, "hPa", "en")!.bandLabel).toBe("Low");
    expect(buildPressureScaleModel(985, "hPa", "nl")!.bandLabel).toBe("Laag");
  });
});

describe("buildPressureLegendRows", () => {
  it("shows ranges in hPa", () => {
    const rows = buildPressureLegendRows("hPa", "en");
    expect(rows.map((r) => r.range)).toEqual([
      "< 1000 hPa",
      "1000–1025 hPa",
      "> 1025 hPa",
    ]);
    expect(rows.map((r) => r.label)).toEqual(["Low", "Normal", "High"]);
  });

  it("converts ranges to kPa and inHg", () => {
    expect(buildPressureLegendRows("kPa", "en")[1]!.range).toBe(
      "100.0–102.5 kPa",
    );
    expect(buildPressureLegendRows("inHg", "en")[1]!.range).toBe(
      "29.53–30.27 inHg",
    );
  });
});
