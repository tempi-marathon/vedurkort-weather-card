import { describe, expect, it } from "vitest";
import {
  buildLunationArcModel,
  buildLunationPath,
  lunationArcX,
  lunationArcY,
  LUNATION_ARC_HORIZON,
  LUNATION_ARC_WIDTH,
} from "./lunation-arc-model";

describe("lunationArc geometry", () => {
  it("maps progress to x across the view", () => {
    expect(lunationArcX(0)).toBe(0);
    expect(lunationArcX(1)).toBe(LUNATION_ARC_WIDTH);
    expect(lunationArcX(0.5)).toBe(LUNATION_ARC_WIDTH / 2);
  });

  it("peaks near full and sits on the baseline at new", () => {
    expect(lunationArcY(0)).toBeCloseTo(LUNATION_ARC_HORIZON, 5);
    expect(lunationArcY(1)).toBeCloseTo(LUNATION_ARC_HORIZON, 5);
    expect(lunationArcY(0.5)).toBeLessThan(LUNATION_ARC_HORIZON);
  });

  it("builds a non-empty SVG path", () => {
    const path = buildLunationPath(8);
    expect(path.startsWith("M ")).toBe(true);
    expect(path.includes(" L ")).toBe(true);
  });
});

describe("buildLunationArcModel", () => {
  it("returns hero + details for a fixed instant", () => {
    const model = buildLunationArcModel("en", new Date("2026-10-25T12:00:00Z"));
    expect(model.heroIcon).toMatch(/^moon-/);
    expect(model.heroValue).toMatch(/%$/);
    expect(model.markers).toHaveLength(3);
    expect(model.details.length).toBeGreaterThanOrEqual(4);
    expect(model.dotX).toBeGreaterThanOrEqual(0);
    expect(model.dotX).toBeLessThanOrEqual(LUNATION_ARC_WIDTH);
  });
});
