import { describe, expect, it } from "vitest";
import {
  getMoonSnapshot,
  illuminationFromAge,
  lunarAgeDays,
  moonPhaseIcon,
  nearMajorMoonPhase,
  nextFullMoon,
  nextNewMoon,
  phaseFromAge,
  SYNODIC_MONTH_DAYS,
} from "./moon-phase";

describe("lunarAgeDays", () => {
  it("returns a value in [0, synodic)", () => {
    const age = lunarAgeDays(new Date("2026-10-25T12:00:00Z"));
    expect(age).toBeGreaterThanOrEqual(0);
    expect(age).toBeLessThan(SYNODIC_MONTH_DAYS);
  });

  it("is stable for a fixed instant", () => {
    const a = lunarAgeDays(new Date("2020-01-01T00:00:00Z"));
    const b = lunarAgeDays(new Date("2020-01-01T00:00:00Z"));
    expect(a).toBe(b);
  });
});

describe("phaseFromAge", () => {
  it("maps near-zero and near-synodic to new_moon", () => {
    expect(phaseFromAge(0)).toBe("new_moon");
    expect(phaseFromAge(SYNODIC_MONTH_DAYS - 0.1)).toBe("new_moon");
  });

  it("maps mid-cycle to full_moon", () => {
    expect(phaseFromAge(SYNODIC_MONTH_DAYS / 2)).toBe("full_moon");
  });

  it("covers all eight HA phases across the month", () => {
    const seen = new Set(
      Array.from({ length: 60 }, (_, i) =>
        phaseFromAge((i / 60) * SYNODIC_MONTH_DAYS),
      ),
    );
    expect(seen).toEqual(
      new Set([
        "new_moon",
        "waxing_crescent",
        "first_quarter",
        "waxing_gibbous",
        "full_moon",
        "waning_gibbous",
        "last_quarter",
        "waning_crescent",
      ]),
    );
  });
});

describe("illuminationFromAge", () => {
  it("is ~0 at new and ~100 at full", () => {
    expect(illuminationFromAge(0)).toBeLessThan(1);
    expect(illuminationFromAge(SYNODIC_MONTH_DAYS / 2)).toBeGreaterThan(99);
  });

  it("stays within 0–100", () => {
    for (let i = 0; i <= 30; i++) {
      const pct = illuminationFromAge(i);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});

describe("nextFullMoon / nextNewMoon", () => {
  it("schedules full after current age toward mid-cycle", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const age = 2;
    const full = nextFullMoon(now, age);
    expect(full.getTime()).toBeGreaterThan(now.getTime());
    const days = (full.getTime() - now.getTime()) / 86_400_000;
    expect(days).toBeCloseTo(SYNODIC_MONTH_DAYS / 2 - age, 5);
  });

  it("at exact full advances to the next lunation", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const age = SYNODIC_MONTH_DAYS / 2;
    const full = nextFullMoon(now, age);
    expect(full.getTime()).toBeGreaterThan(now.getTime());
    const days = (full.getTime() - now.getTime()) / 86_400_000;
    expect(days).toBeCloseTo(SYNODIC_MONTH_DAYS, 5);
  });

  it("schedules next new at remaining synodic days", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const age = 10;
    const neu = nextNewMoon(now, age);
    const days = (neu.getTime() - now.getTime()) / 86_400_000;
    expect(days).toBeCloseTo(SYNODIC_MONTH_DAYS - age, 5);
  });
});

describe("getMoonSnapshot", () => {
  it("returns a coherent snapshot", () => {
    const snap = getMoonSnapshot(new Date("2026-10-25T12:00:00Z"));
    expect(snap.phase).toBe(phaseFromAge(snap.ageDays));
    expect(snap.illuminationPct).toBe(illuminationFromAge(snap.ageDays));
    expect(snap.progress).toBeCloseTo(snap.ageDays / SYNODIC_MONTH_DAYS, 10);
    expect(moonPhaseIcon(snap.phase)).toMatch(/^moon-/);
  });
});

describe("nearMajorMoonPhase", () => {
  const S = SYNODIC_MONTH_DAYS;
  const phases = [0, S / 4, S / 2, (3 * S) / 4];

  it("is true at each major phase and within ±23h", () => {
    for (const p of phases) {
      expect(nearMajorMoonPhase(p)).toBe(true);
      expect(nearMajorMoonPhase(p + 23 / 24)).toBe(true);
      expect(nearMajorMoonPhase(p - 23 / 24)).toBe(true);
    }
  });

  it("is false at ±25h from each major phase", () => {
    for (const p of phases) {
      expect(nearMajorMoonPhase(p + 25 / 24)).toBe(false);
      expect(nearMajorMoonPhase(p - 25 / 24)).toBe(false);
    }
  });

  it("wraps around the new moon at the end of the lunation", () => {
    expect(nearMajorMoonPhase(S - 0.5)).toBe(true);
    expect(nearMajorMoonPhase(S - 1.1)).toBe(false);
  });

  it("normalizes ages outside [0, S)", () => {
    expect(nearMajorMoonPhase(S + S / 2)).toBe(true);
    expect(nearMajorMoonPhase(-0.25)).toBe(true);
    expect(nearMajorMoonPhase(-3)).toBe(false);
  });

  it("honors a custom window", () => {
    expect(nearMajorMoonPhase(S / 2 + 2, 3)).toBe(true);
    expect(nearMajorMoonPhase(S / 2 + 2, 1)).toBe(false);
  });
});
