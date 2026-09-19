import { describe, expect, it } from "vitest";
import { pollenLevelClass, pollenLevelColor } from "./colors";

describe("pollenLevelClass", () => {
  it("returns tone classes for low, medium, and high", () => {
    expect(pollenLevelClass("low")).toBe("pollen-level--low");
    expect(pollenLevelClass("medium")).toBe("pollen-level--medium");
    expect(pollenLevelClass("high")).toBe("pollen-level--high");
  });

  it("omits none and missing", () => {
    expect(pollenLevelClass("none")).toBeUndefined();
    expect(pollenLevelClass(null)).toBeUndefined();
    expect(pollenLevelClass(undefined)).toBeUndefined();
  });
});

describe("pollenLevelColor", () => {
  it("returns swatch colors for active levels", () => {
    expect(pollenLevelColor("low")).toBe("#eab308");
    expect(pollenLevelColor("medium")).toBe("#f97316");
    expect(pollenLevelColor("high")).toBe("#ef4444");
    expect(pollenLevelColor("none")).toBeUndefined();
  });
});
