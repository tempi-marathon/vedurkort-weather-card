import { describe, expect, it } from "vitest";
import type { ForecastItem } from "../types";
import {
  buildOutlookPhrase,
  isWetHour,
  precipTypeFromCondition,
} from "./outlook";

describe("outlook helpers", () => {
  it("detects wet hours from condition or precipitation", () => {
    expect(isWetHour({ datetime: "2026-08-23T10:00:00+00:00", condition: "rainy" })).toBe(true);
    expect(
      isWetHour({
        datetime: "2026-08-23T10:00:00+00:00",
        condition: "cloudy",
        precipitation: 0.5,
      }),
    ).toBe(true);
    expect(
      isWetHour({ datetime: "2026-08-23T10:00:00+00:00", condition: "cloudy" }),
    ).toBe(false);
  });

  it("maps conditions to precip types", () => {
    expect(precipTypeFromCondition("lightning-rainy")).toBe("storm");
    expect(precipTypeFromCondition("snowy-rainy")).toBe("sleet");
    expect(precipTypeFromCondition("hail")).toBe("hail");
    expect(precipTypeFromCondition("rainy")).toBe("rain");
    expect(precipTypeFromCondition("cloudy")).toBe("precip");
  });
});

describe("buildOutlookPhrase", () => {
  const snap = {
    condition: "partlycloudy" as const,
    precipitation: 0,
  };

  it("returns dry outlook when no wet hours", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-08-23T10:00:00+00:00", condition: "partlycloudy" },
    ];
    expect(buildOutlookPhrase(items, snap as never, "en")).toBe(
      "No precipitation expected in the next 24 hours",
    );
  });
});
