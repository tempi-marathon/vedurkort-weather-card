import { describe, expect, it } from "vitest";
import {
  bearingToLabel,
  bearingToWindIcon,
  conditionToMeteocon,
  isOvercastCloudCover,
  OVERCAST_CLOUD_COVERAGE,
} from "./condition-map";

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

describe("isOvercastCloudCover", () => {
  it("treats missing and NaN as overcast", () => {
    expect(isOvercastCloudCover(undefined)).toBe(true);
    expect(isOvercastCloudCover(null)).toBe(true);
    expect(isOvercastCloudCover(Number.NaN)).toBe(true);
  });

  it(`treats coverage at/above ${OVERCAST_CLOUD_COVERAGE}% as overcast`, () => {
    expect(isOvercastCloudCover(OVERCAST_CLOUD_COVERAGE)).toBe(true);
    expect(isOvercastCloudCover(100)).toBe(true);
  });

  it(`treats coverage below ${OVERCAST_CLOUD_COVERAGE}% as clearer`, () => {
    expect(isOvercastCloudCover(OVERCAST_CLOUD_COVERAGE - 1)).toBe(false);
    expect(isOvercastCloudCover(0)).toBe(false);
  });
});

describe("conditionToMeteocon", () => {
  it("uses sunless icons when coverage is missing, null, NaN, or high", () => {
    for (const coverage of [undefined, null, Number.NaN, 65, 100] as const) {
      expect(conditionToMeteocon("cloudy", true, coverage)).toBe("overcast");
      expect(conditionToMeteocon("rainy", true, coverage)).toBe("rain");
      expect(conditionToMeteocon("pouring", true, coverage)).toBe("extreme-rain");
      expect(conditionToMeteocon("snowy", true, coverage)).toBe("snow");
      expect(conditionToMeteocon("snowy-rainy", true, coverage)).toBe("sleet");
      expect(conditionToMeteocon("hail", true, coverage)).toBe("hail");
      expect(conditionToMeteocon("lightning", true, coverage)).toBe(
        "thunderstorms",
      );
      expect(conditionToMeteocon("lightning-rainy", true, coverage)).toBe(
        "thunderstorms-rain",
      );
    }
  });

  it("uses day/night variants when coverage is below threshold", () => {
    expect(conditionToMeteocon("cloudy", true, 64)).toBe("overcast-day");
    expect(conditionToMeteocon("cloudy", false, 64)).toBe("overcast-night");
    expect(conditionToMeteocon("rainy", true, 64)).toBe("overcast-day-rain");
    expect(conditionToMeteocon("rainy", false, 64)).toBe("overcast-night-rain");
    expect(conditionToMeteocon("pouring", true, 64)).toBe("extreme-day-rain");
    expect(conditionToMeteocon("pouring", false, 64)).toBe("extreme-night-rain");
    expect(conditionToMeteocon("snowy", true, 64)).toBe("overcast-day-snow");
    expect(conditionToMeteocon("snowy", false, 64)).toBe("overcast-night-snow");
    expect(conditionToMeteocon("snowy-rainy", true, 64)).toBe(
      "overcast-day-sleet",
    );
    expect(conditionToMeteocon("snowy-rainy", false, 64)).toBe(
      "overcast-night-sleet",
    );
    expect(conditionToMeteocon("hail", true, 64)).toBe("overcast-day-hail");
    expect(conditionToMeteocon("hail", false, 64)).toBe("overcast-night-hail");
    expect(conditionToMeteocon("lightning", true, 64)).toBe("thunderstorms-day");
    expect(conditionToMeteocon("lightning", false, 64)).toBe(
      "thunderstorms-night",
    );
    expect(conditionToMeteocon("lightning-rainy", true, 64)).toBe(
      "thunderstorms-day-rain",
    );
    expect(conditionToMeteocon("lightning-rainy", false, 64)).toBe(
      "thunderstorms-night-rain",
    );
  });

  it("keeps fog day/night regardless of coverage", () => {
    expect(conditionToMeteocon("fog", true, 100)).toBe("fog-day");
    expect(conditionToMeteocon("fog", false, 100)).toBe("fog-night");
    expect(conditionToMeteocon("fog", true, null)).toBe("fog-day");
    expect(conditionToMeteocon("fog", false, 0)).toBe("fog-night");
  });

  it("does not let coverage change sunny or partlycloudy", () => {
    expect(conditionToMeteocon("sunny", true, 100)).toBe("clear-day");
    expect(conditionToMeteocon("sunny", false, 100)).toBe("clear-night");
    expect(conditionToMeteocon("partlycloudy", true, 100)).toBe(
      "partly-cloudy-day",
    );
    expect(conditionToMeteocon("partlycloudy", false, 0)).toBe(
      "partly-cloudy-night",
    );
  });
});
