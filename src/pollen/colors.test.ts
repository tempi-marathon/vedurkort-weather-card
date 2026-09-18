import { describe, expect, it } from "vitest";
import { pollenLevelClass } from "./colors";

describe("pollenLevelClass", () => {
  it("returns tone classes for low and high", () => {
    expect(pollenLevelClass("low")).toBe("pollen-level--low");
    expect(pollenLevelClass("high")).toBe("pollen-level--high");
  });

  it("omits none and missing", () => {
    expect(pollenLevelClass("none")).toBeUndefined();
    expect(pollenLevelClass(null)).toBeUndefined();
    expect(pollenLevelClass(undefined)).toBeUndefined();
  });
});
