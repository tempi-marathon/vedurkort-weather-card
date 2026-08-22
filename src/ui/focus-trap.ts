const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Trap Tab focus inside `container`; returns cleanup. */
export function trapFocus(container: HTMLElement): () => void {
  const getFocusable = (): HTMLElement[] =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key !== "Tab") return;
    const items = getFocusable();
    if (!items.length) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (ev.shiftKey && document.activeElement === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && document.activeElement === last) {
      ev.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}
