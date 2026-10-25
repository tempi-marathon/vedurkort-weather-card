import { describe, expect, it } from "vitest";
import { shouldPauseEffects } from "./effects-visibility";

describe("shouldPauseEffects", () => {
  it("runs when on-screen, tab visible, and motion allowed", () => {
    expect(
      shouldPauseEffects({
        intersecting: true,
        docVisible: true,
        reducedMotion: false,
      }),
    ).toBe(false);
  });

  it("pauses when off-screen", () => {
    expect(
      shouldPauseEffects({
        intersecting: false,
        docVisible: true,
        reducedMotion: false,
      }),
    ).toBe(true);
  });

  it("pauses when the document tab is hidden", () => {
    expect(
      shouldPauseEffects({
        intersecting: true,
        docVisible: false,
        reducedMotion: false,
      }),
    ).toBe(true);
  });

  it("pauses when reduced motion is preferred", () => {
    expect(
      shouldPauseEffects({
        intersecting: true,
        docVisible: true,
        reducedMotion: true,
      }),
    ).toBe(true);
  });

  it("keeps running when a dialog is open even if the host is off-screen", () => {
    expect(
      shouldPauseEffects({
        intersecting: false,
        docVisible: true,
        reducedMotion: false,
        dialogOpen: true,
      }),
    ).toBe(false);
  });

  it("still pauses for reduced motion while a dialog is open", () => {
    expect(
      shouldPauseEffects({
        intersecting: true,
        docVisible: true,
        reducedMotion: true,
        dialogOpen: true,
      }),
    ).toBe(true);
  });

  it("still pauses for a hidden tab while a dialog is open", () => {
    expect(
      shouldPauseEffects({
        intersecting: true,
        docVisible: false,
        reducedMotion: false,
        dialogOpen: true,
      }),
    ).toBe(true);
  });

  it("pauses when multiple pause conditions apply", () => {
    expect(
      shouldPauseEffects({
        intersecting: false,
        docVisible: false,
        reducedMotion: true,
      }),
    ).toBe(true);
  });
});
