const SCROLLABLE_OVERFLOW = new Set(["auto", "scroll", "overlay"]);

function eventPath(ev: Event): EventTarget[] {
  if (typeof ev.composedPath === "function") return ev.composedPath();
  return [];
}

function dialogBodyFromEvent(ev: Event): HTMLElement | null {
  for (const t of eventPath(ev)) {
    if (t instanceof HTMLElement && t.classList.contains("vk-modal-body")) {
      return t;
    }
  }
  return null;
}

function isScrollableX(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (!SCROLLABLE_OVERFLOW.has(style.overflowX)) return false;
  return el.scrollWidth > el.clientWidth + 1;
}

/** Nearest horizontally scrollable ancestor in the event path (within the modal). */
function horizontalScrollerFromEvent(ev: Event): HTMLElement | null {
  for (const t of eventPath(ev)) {
    if (!(t instanceof HTMLElement)) continue;
    if (t.classList.contains("vk-modal-body")) {
      return isScrollableX(t) ? t : null;
    }
    if (isScrollableX(t)) return t;
  }
  return null;
}

/** dy: touch delta Y (finger down = positive). */
function canScrollY(el: HTMLElement, dy: number): boolean {
  if (el.scrollHeight <= el.clientHeight + 1) return false;
  if (dy > 0) return el.scrollTop > 0;
  if (dy < 0) {
    return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
  }
  return true;
}

/** dx: touch delta X (finger right = positive). */
function canScrollX(el: HTMLElement, dx: number): boolean {
  if (el.scrollWidth <= el.clientWidth + 1) return false;
  if (dx > 0) return el.scrollLeft > 0;
  if (dx < 0) {
    return el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  }
  return true;
}

/**
 * Light scroll lock for modal dialogs.
 *
 * Blocks background touch/wheel. Inside the modal, allows:
 * - vertical scroll of `.vk-modal-body` when it can scroll that way
 * - horizontal scroll of nested scroller (e.g. `.forecast-scroll`) when it can
 * Otherwise preventDefault so gestures don't chain to the HA dashboard.
 *
 * No overflow / position:fixed / scrollTop mutation.
 */
export function lockScroll(_host: Element, dialog?: Element | null): () => void {
  let touchStartX = 0;
  let touchStartY = 0;

  const onTouchStart = (ev: TouchEvent) => {
    touchStartX = ev.touches[0]?.clientX ?? 0;
    touchStartY = ev.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (ev: TouchEvent) => {
    if (!dialog) {
      ev.preventDefault();
      return;
    }
    const body = dialogBodyFromEvent(ev);
    if (!body) {
      ev.preventDefault();
      return;
    }

    const x = ev.touches[0]?.clientX ?? touchStartX;
    const y = ev.touches[0]?.clientY ?? touchStartY;
    const dx = x - touchStartX;
    const dy = y - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Wait until direction is clear so we don't kill horizontal intent early.
    if (absX < 6 && absY < 6) return;

    if (absX > absY) {
      const scroller = horizontalScrollerFromEvent(ev);
      if (scroller && canScrollX(scroller, dx)) return;
      ev.preventDefault();
      return;
    }

    if (canScrollY(body, dy)) return;
    ev.preventDefault();
  };

  const onWheel = (ev: WheelEvent) => {
    if (!dialog) {
      ev.preventDefault();
      return;
    }
    const body = dialogBodyFromEvent(ev);
    if (!body) {
      ev.preventDefault();
      return;
    }

    const absX = Math.abs(ev.deltaX);
    const absY = Math.abs(ev.deltaY);

    if (absX > absY) {
      const scroller = horizontalScrollerFromEvent(ev);
      // wheel deltaX > 0 → scroll right → need room on the right
      if (scroller && canScrollX(scroller, -ev.deltaX)) return;
      ev.preventDefault();
      return;
    }

    if (canScrollY(body, -ev.deltaY)) return;
    ev.preventDefault();
  };

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("wheel", onWheel, { passive: false });

  let released = false;
  return () => {
    if (released) return;
    released = true;
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("wheel", onWheel);
  };
}
