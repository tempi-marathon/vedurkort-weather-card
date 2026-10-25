/** Inputs that decide whether CSS weather-scene animations should pause. */
export interface EffectsVisibilityInput {
  intersecting: boolean;
  docVisible: boolean;
  reducedMotion: boolean;
  /**
   * True when this card has a viewport dialog open (detail / alerts / daily).
   * Keeps the dialog scene animating even if the host is reported off-screen.
   */
  dialogOpen?: boolean;
}

/**
 * Pause background animations when the card is off-screen, the document tab
 * is hidden, or the user prefers reduced motion. An open dialog on this card
 * overrides off-screen pausing (not reduced-motion or a hidden tab).
 */
export function shouldPauseEffects(input: EffectsVisibilityInput): boolean {
  if (input.reducedMotion || !input.docVisible) return true;
  if (input.dialogOpen) return false;
  return !input.intersecting;
}
