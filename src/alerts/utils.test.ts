import { describe, expect, it } from "vitest";
import {
  isAlertCurrentlyActive,
  isHighestCategoryAlert,
  shouldEscalateForAlerts,
} from "./utils";
import type { WeatherAlert } from "./types";

function alert(partial: Partial<WeatherAlert> = {}): WeatherAlert {
  return {
    id: "1",
    provider: "cap",
    event: "Alert",
    headline: "Alert",
    description: "",
    instruction: "",
    severity: "moderate",
    severityLabel: "Moderate",
    ...partial,
  };
}

const now = Date.parse("2026-08-16T12:00:00Z");

describe("isHighestCategoryAlert", () => {
  it("matches extreme severity", () => {
    expect(isHighestCategoryAlert(alert({ severity: "extreme" }))).toBe(true);
  });

  it("matches red awareness color", () => {
    expect(isHighestCategoryAlert(alert({ awarenessColor: "red" }))).toBe(true);
  });

  it("rejects severe and lower", () => {
    expect(isHighestCategoryAlert(alert({ severity: "severe" }))).toBe(false);
    expect(isHighestCategoryAlert(alert({ awarenessColor: "orange" }))).toBe(
      false,
    );
  });
});

describe("isAlertCurrentlyActive", () => {
  it("is active between onset and expires", () => {
    expect(
      isAlertCurrentlyActive(
        alert({
          onset: "2026-08-16T10:00:00Z",
          expires: "2026-08-16T18:00:00Z",
        }),
        now,
      ),
    ).toBe(true);
  });

  it("is not active before onset", () => {
    expect(
      isAlertCurrentlyActive(
        alert({
          onset: "2026-08-16T14:00:00Z",
          expires: "2026-08-16T18:00:00Z",
        }),
        now,
      ),
    ).toBe(false);
  });

  it("is not active after expiry", () => {
    expect(
      isAlertCurrentlyActive(
        alert({
          onset: "2026-08-16T08:00:00Z",
          expires: "2026-08-16T10:00:00Z",
        }),
        now,
      ),
    ).toBe(false);
  });

  it("treats unknown timestamps as active", () => {
    expect(isAlertCurrentlyActive(alert(), now)).toBe(true);
  });
});

describe("shouldEscalateForAlerts", () => {
  it("escalates for active highest-category alerts", () => {
    expect(
      shouldEscalateForAlerts(
        [
          alert({
            severity: "extreme",
            onset: "2026-08-16T10:00:00Z",
            expires: "2026-08-16T18:00:00Z",
          }),
        ],
        now,
      ),
    ).toBe(true);
  });

  it("does not escalate for future highest-category alerts", () => {
    expect(
      shouldEscalateForAlerts(
        [
          alert({
            severity: "extreme",
            onset: "2026-08-16T14:00:00Z",
            expires: "2026-08-16T18:00:00Z",
          }),
        ],
        now,
      ),
    ).toBe(false);
  });

  it("does not escalate for active severe alerts", () => {
    expect(
      shouldEscalateForAlerts(
        [
          alert({
            severity: "severe",
            awarenessColor: "orange",
            onset: "2026-08-16T10:00:00Z",
            expires: "2026-08-16T18:00:00Z",
          }),
        ],
        now,
      ),
    ).toBe(false);
  });

  it("returns false for empty list", () => {
    expect(shouldEscalateForAlerts([], now)).toBe(false);
  });
});
