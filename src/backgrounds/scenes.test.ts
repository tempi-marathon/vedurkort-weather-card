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

  it("maps precip conditions to distinct scenes", () => {
    expect(conditionToScene("rainy", true)).toBe("rain");
    expect(conditionToScene("pouring", true)).toBe("pouring");
    expect(conditionToScene("hail", true)).toBe("hail");
    expect(conditionToScene("snowy", true)).toBe("snow");
    expect(conditionToScene("snowy-rainy", true)).toBe("snowy-rainy");
  });

  it("maps lightning variants separately", () => {
    expect(conditionToScene("lightning", true)).toBe("lightning");
    expect(conditionToScene("lightning-rainy", true)).toBe("lightning-rainy");
  });

  it("maps windy and windy-variant to wind", () => {
    expect(conditionToScene("windy", true)).toBe("wind");
    expect(conditionToScene("windy-variant", true)).toBe("wind");
  });

  it("maps exceptional and fog", () => {
    expect(conditionToScene("exceptional", true)).toBe("exceptional");
    expect(conditionToScene("fog", true)).toBe("fog");
    expect(conditionToScene("cloudy", true)).toBe("cloudy");
  });
});
