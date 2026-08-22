import type { ActionConfig, HomeAssistant } from "./types";

const HOLD_MS = 500;

/** Effective tap action — defaults to more-info on the weather entity. */
export function effectiveTapAction(
  config: { entity: string; tap_action?: ActionConfig },
): ActionConfig {
  return (
    config.tap_action ?? {
      action: "more-info",
      entity: config.entity,
    }
  );
}

export function fireCardAction(
  el: HTMLElement,
  action: ActionConfig | undefined,
  defaultEntity: string,
): void {
  if (!action || action.action === "none") return;
  const config: ActionConfig = {
    ...action,
    entity: action.entity ?? defaultEntity,
  };
  el.dispatchEvent(
    new CustomEvent("hass-action", {
      bubbles: true,
      composed: true,
      detail: { action: config.action, config },
    }),
  );
}

/** Attach tap / hold / double-tap handlers; returns cleanup. */
export function bindCardActions(
  el: HTMLElement,
  hass: HomeAssistant | undefined,
  entityId: string,
  actions: {
    tap?: ActionConfig;
    hold?: ActionConfig;
    double_tap?: ActionConfig;
  },
): () => void {
  if (!hass) return () => undefined;

  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let holdFired = false;

  const onPointerDown = () => {
    holdFired = false;
    if (!actions.hold || actions.hold.action === "none") return;
    holdTimer = setTimeout(() => {
      holdFired = true;
      fireCardAction(el, actions.hold, entityId);
    }, HOLD_MS);
  };

  const clearHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = undefined;
    }
  };

  const onClick = (ev: MouseEvent) => {
    if (holdFired) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    fireCardAction(el, actions.tap ?? effectiveTapAction({ entity: entityId }), entityId);
  };

  const onDblClick = (ev: MouseEvent) => {
    if (!actions.double_tap || actions.double_tap.action === "none") return;
    ev.preventDefault();
    fireCardAction(el, actions.double_tap, entityId);
  };

  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointerup", clearHold);
  el.addEventListener("pointerleave", clearHold);
  el.addEventListener("pointercancel", clearHold);
  el.addEventListener("click", onClick);
  el.addEventListener("dblclick", onDblClick);

  return () => {
    clearHold();
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointerup", clearHold);
    el.removeEventListener("pointerleave", clearHold);
    el.removeEventListener("pointercancel", clearHold);
    el.removeEventListener("click", onClick);
    el.removeEventListener("dblclick", onDblClick);
  };
}
