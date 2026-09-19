import { describe, expect, it } from "vitest";
import { labelFromLevel, levelForGrains } from "./levels";

describe("levelForGrains", () => {
  it("maps grass through none/low/medium/high", () => {
    expect(levelForGrains("grass", 0)).toBe(0);
    expect(levelForGrains("grass", 3)).toBe(1);
    expect(levelForGrains("grass", 26.5)).toBe(2);
    expect(levelForGrains("grass", 50)).toBe(3);
  });

  it("returns null for missing grains", () => {
    expect(levelForGrains("grass", null)).toBeNull();
  });
});

describe("labelFromLevel", () => {
  it("maps 0–3 to labels", () => {
    expect(labelFromLevel(0)).toBe("none");
    expect(labelFromLevel(1)).toBe("low");
    expect(labelFromLevel(2)).toBe("medium");
    expect(labelFromLevel(3)).toBe("high");
  });
});
