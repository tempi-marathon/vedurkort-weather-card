import { describe, expect, it } from "vitest";
import { effectiveTapAction, fireCardAction } from "./actions";

describe("actions", () => {
  it("defaults tap to more-info on weather entity", () => {
    expect(effectiveTapAction({ entity: "weather.home" })).toEqual({
      action: "more-info",
      entity: "weather.home",
    });
  });

  it("respects explicit tap_action", () => {
    expect(
      effectiveTapAction({
        entity: "weather.home",
        tap_action: { action: "navigate", navigation_path: "/weather" },
      }),
    ).toEqual({
      action: "navigate",
      navigation_path: "/weather",
    });
  });

  it("fireCardAction dispatches hass-action", () => {
    let detail: unknown;
    const el = {
      dispatchEvent(ev: Event) {
        detail = (ev as CustomEvent).detail;
        return true;
      },
    } as unknown as HTMLElement;
    fireCardAction(el, { action: "more-info" }, "weather.home");
    expect(detail).toEqual({
      action: "more-info",
      config: { action: "more-info", entity: "weather.home" },
    });
  });

  it("skips none action", () => {
    let fired = false;
    const el = {
      dispatchEvent() {
        fired = true;
        return true;
      },
    } as unknown as HTMLElement;
    fireCardAction(el, { action: "none" }, "weather.home");
    expect(fired).toBe(false);
  });
});
