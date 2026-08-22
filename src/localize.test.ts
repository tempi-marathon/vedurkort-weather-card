import { describe, expect, it } from "vitest";
import { localize } from "./localize";

describe("localize", () => {
  it("returns English by default", () => {
    expect(localize("weather_alerts")).toBe("Weather alerts");
  });

  it("returns Icelandic for is locale", () => {
    expect(localize("weather_alerts", "is")).toBe("Veðurviðvaranir");
  });

  it("interpolates variables", () => {
    expect(localize("no_forecast", "en", { mode: "hourly" })).toContain(
      "hourly",
    );
  });
});
