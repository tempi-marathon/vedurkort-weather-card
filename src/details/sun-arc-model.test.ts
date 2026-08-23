import { describe, expect, it } from "vitest";
import {
  buildSunArcPaths,
  sunArcX,
  sunArcY,
  SUN_ARC_HORIZON,
} from "./sun-arc-model";

describe("sun arc model", () => {
  it("peaks at noon and crosses horizon at dawn/dusk hours", () => {
    expect(sunArcY(12)).toBeLessThan(SUN_ARC_HORIZON);
    expect(sunArcY(0)).toBeGreaterThan(SUN_ARC_HORIZON);
    expect(sunArcY(6)).toBeCloseTo(SUN_ARC_HORIZON, 0);
    expect(sunArcY(18)).toBeCloseTo(SUN_ARC_HORIZON, 0);
  });

  it("maps hours to full chart width", () => {
    expect(sunArcX(0)).toBe(0);
    expect(sunArcX(24)).toBe(360);
    expect(sunArcX(12)).toBe(180);
  });

  it("builds separate day and night path segments", () => {
    const { dayPath, nightPath } = buildSunArcPaths(48);
    expect(dayPath).toMatch(/^M /);
    expect(nightPath).toMatch(/^M /);
    expect(dayPath).not.toEqual(nightPath);
  });
});
