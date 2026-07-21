import { describe, expect, it } from "vitest";
import { bearingToLabel, bearingToWindIcon } from "./condition-map";

describe("bearingToLabel", () => {
  it("maps 348.6° to NNW", () => {
    expect(bearingToLabel(348.6)).toBe("NNW");
  });

  it("maps 350° to N", () => {
    expect(bearingToLabel(350)).toBe("N");
  });

  it("maps 0° and 360° to N", () => {
    expect(bearingToLabel(0)).toBe("N");
    expect(bearingToLabel(360)).toBe("N");
  });

  it("handles NNW/N boundary at 348.75°", () => {
    expect(bearingToLabel(348.74)).toBe("NNW");
    expect(bearingToLabel(348.75)).toBe("N");
  });

  it("returns em dash for invalid input", () => {
    expect(bearingToLabel(undefined)).toBe("—");
    expect(bearingToLabel(Number.NaN)).toBe("—");
  });

  it("accepts string bearings", () => {
    expect(bearingToLabel("348.6")).toBe("NNW");
  });
});

describe("bearingToWindIcon", () => {
  it("keeps 8-point icon mapping for 348.6°", () => {
    expect(bearingToWindIcon(348.6)).toBe("wind-direction-n");
  });
});
