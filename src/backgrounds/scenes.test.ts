/**
 * @vitest-environment jsdom
 */
import { render } from "lit";
import { describe, expect, it } from "vitest";
import { conditionToScene, renderBackground } from "./scenes";

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
    expect(conditionToScene("fog", false)).toBe("fog-night");
    expect(conditionToScene("cloudy", true)).toBe("cloudy");
    expect(conditionToScene("cloudy", false)).toBe("cloudy-night");
  });

  it("returns exceptional when escalate is true", () => {
    expect(conditionToScene("rainy", true, true)).toBe("exceptional");
    expect(conditionToScene("sunny", false, true)).toBe("exceptional");
  });
});

describe("renderBackground", () => {
  function mount(mode: "off" | "static" | "animated") {
    const root = document.createElement("div");
    render(renderBackground(mode, "rain", 40), root);
    return root;
  }

  it("renders nothing when off", () => {
    const root = mount("off");
    expect(root.querySelector(".vk-bg")).toBeNull();
  });

  it("renders full scene layers for static and animated", () => {
    for (const mode of ["static", "animated"] as const) {
      const root = mount(mode);
      const bg = root.querySelector(".vk-bg");
      expect(bg).not.toBeNull();
      expect(bg!.classList.contains("vk-bg--rain")).toBe(true);
      expect(root.querySelector(".vk-bg__precip")).not.toBeNull();
      expect(root.querySelector(".vk-bg__fx")).not.toBeNull();
      expect(root.querySelector(".vk-bg__clouds")).not.toBeNull();
    }
  });

  it("adds vk-bg--static only for static mode", () => {
    expect(
      mount("static").querySelector(".vk-bg")!.classList.contains("vk-bg--static"),
    ).toBe(true);
    expect(
      mount("animated")
        .querySelector(".vk-bg")!
        .classList.contains("vk-bg--static"),
    ).toBe(false);
  });
});
