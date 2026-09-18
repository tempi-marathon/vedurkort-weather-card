import { describe, expect, it } from "vitest";
import {
  convertWindSpeed,
  formatWindHeading,
  formatWindSpeed,
  windUnitLabel,
} from "./wind-units";

describe("convertWindSpeed", () => {
  it("converts km/h to m/s", () => {
    expect(convertWindSpeed(36, "km/h", "m/s")).toBeCloseTo(10, 5);
  });

  it("converts km/h to mph", () => {
    expect(convertWindSpeed(16.09344, "km/h", "mph")).toBeCloseTo(10, 1);
  });

  it("converts km/h to Beaufort", () => {
    // ~15 km/h ≈ 4.2 m/s → Beaufort 3
    expect(convertWindSpeed(15, "km/h", "beaufort")).toBe(3);
  });

  it("returns null for missing values", () => {
    expect(convertWindSpeed(null, "km/h", "m/s")).toBeNull();
  });
});

describe("formatWindSpeed", () => {
  it("formats native km/h as rounded", () => {
    expect(formatWindSpeed(15.4, "km/h", "native")).toEqual({
      text: "15 km/h",
      number: 15,
      unitLabel: "km/h",
    });
  });

  it("formats Beaufort", () => {
    expect(formatWindSpeed(15, "km/h", "beaufort")).toEqual({
      text: "3 Bft",
      number: 3,
      unitLabel: "Bft",
    });
  });

  it("formats m/s with one decimal", () => {
    const result = formatWindSpeed(36, "km/h", "m/s");
    expect(result?.text).toBe("10 m/s");
    expect(result?.number).toBe(10);
  });
});

describe("formatWindHeading", () => {
  it("joins speed and direction", () => {
    expect(formatWindHeading(15, "S", "km/h", "native")).toBe("15 km/h · S");
  });

  it("omits missing pieces", () => {
    expect(formatWindHeading(null, "SW", "km/h", "native")).toBe("SW");
    expect(formatWindHeading(15, "—", "km/h", "native")).toBe("15 km/h");
  });
});

describe("windUnitLabel", () => {
  it("maps display prefs", () => {
    expect(windUnitLabel("beaufort", "km/h")).toBe("Bft");
    expect(windUnitLabel("native", "km/h")).toBe("km/h");
    expect(windUnitLabel("m/s", "km/h")).toBe("m/s");
  });
});
