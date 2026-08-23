import type { ActionConfig, HomeAssistant } from "./types";

const HOLD_MS = 500;

/** Effective tap action — defaults to detail sheet on the weather card. */
export function effectiveTapAction(
  config: { entity: string; tap_action?: ActionConfig },
): ActionConfig {
  return (
    config.tap_action ?? {
      action: "detail",
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
  callbacks?: { onDetail?: () => void },
): () => void {
  if (!hass) return () => undefined;

  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let holdFired = false;

  const runAction = (action: ActionConfig | undefined) => {
    if (!action || action.action === "none") return;
    if (action.action === "detail") {
      callbacks?.onDetail?.();
      return;
    }
    fireCardAction(el, action, entityId);
  };

  const onPointerDown = () => {
    holdFired = false;
    if (!actions.hold || actions.hold.action === "none") return;
    holdTimer = setTimeout(() => {
      holdFired = true;
      runAction(actions.hold);
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
    runAction(actions.tap ?? effectiveTapAction({ entity: entityId }));
  };

  const onDblClick = (ev: MouseEvent) => {
    if (!actions.double_tap || actions.double_tap.action === "none") return;
    ev.preventDefault();
    runAction(actions.double_tap);
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
