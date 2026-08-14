import { describe, expect, it } from "vitest";
import { conditionToScene } from "./scenes";

describe("conditionToScene", () => {
  it("maps sunny to clear-day during the day", () => {
    expect(conditionToScene("sunny", true)).toBe("clear-day");
  });

  it("maps sunny to clear-night after sunset", () => {
    expect(conditionToScene("sunny", false)).toBe("clear-night");
  });

  it("maps partlycloudy to day/night variants", () => {
    expect(conditionToScene("partlycloudy", true)).toBe("partlycloudy-day");
    expect(conditionToScene("partlycloudy", false)).toBe("partlycloudy-night");
  });

  it("maps clear-night regardless of isDay", () => {
    expect(conditionToScene("clear-night", true)).toBe("clear-night");
    expect(conditionToScene("clear-night", false)).toBe("clear-night");
  });
});
