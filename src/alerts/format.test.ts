import { describe, expect, it } from "vitest";
import type { WeatherAlert } from "./types";
import {
  alertTimePhase,
  formatAlertTimeStatus,
  formatDurationMs,
} from "./format";

function alert(partial: Partial<WeatherAlert> = {}): WeatherAlert {
  return {
    id: "1",
    provider: "cap",
    event: "Test",
    headline: "",
    description: "",
    instruction: "",
    severity: "moderate",
    severityLabel: "Moderate",
    ...partial,
  };
}

describe("formatDurationMs", () => {
  it("formats sub-minute as <1m", () => {
    expect(formatDurationMs(30_000)).toBe("<1m");
  });

  it("formats minutes", () => {
    expect(formatDurationMs(45 * 60_000)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatDurationMs((2 * 3600 + 30 * 60) * 1000)).toBe("2h 30m");
  });

  it("formats days and hours", () => {
    expect(formatDurationMs((1 * 86400 + 4 * 3600) * 1000)).toBe("1d 4h");
  });
});

describe("alertTimePhase", () => {
  const now = Date.parse("2026-08-16T12:00:00Z");

  it("returns preparation when onset is in the future", () => {
    expect(
      alertTimePhase(
        alert({ onset: "2026-08-16T14:00:00Z" }),
        now,
      ),
    ).toBe("preparation");
  });

  it("returns active when between onset and expires", () => {
    expect(
      alertTimePhase(
        alert({
          onset: "2026-08-16T10:00:00Z",
          expires: "2026-08-16T18:00:00Z",
        }),
        now,
      ),
    ).toBe("active");
  });

  it("returns ended when expires is in the past", () => {
    expect(
      alertTimePhase(
        alert({ expires: "2026-08-16T10:00:00Z" }),
        now,
      ),
    ).toBe("ended");
  });
});

describe("formatAlertTimeStatus", () => {
  const now = Date.parse("2026-08-16T12:00:00Z");

  it("shows starts-in for preparation phase", () => {
    const text = formatAlertTimeStatus(
      alert({ onset: "2026-08-16T14:00:00Z" }),
      now,
      "en",
    );
    expect(text).toContain("2h");
  });

  it("shows ends-in for active phase with future expires", () => {
    const text = formatAlertTimeStatus(
      alert({
        onset: "2026-08-16T10:00:00Z",
        expires: "2026-08-16T19:00:00Z",
      }),
      now,
      "en",
    );
    expect(text).toContain("7h");
  });

  it("returns empty when no timing data", () => {
    expect(formatAlertTimeStatus(alert(), now, "en")).toBe("");
  });
});
