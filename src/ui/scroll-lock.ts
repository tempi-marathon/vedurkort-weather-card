const SCROLLABLE_OVERFLOW = new Set(["auto", "scroll", "overlay"]);

interface LockedStyle {
  el: HTMLElement;
  overflow: string;
  overflowY: string;
  position?: string;
  top?: string;
  width?: string;
  scrollTop?: number;
}

function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (!SCROLLABLE_OVERFLOW.has(style.overflowY)) return false;
  return el.scrollHeight > el.clientHeight;
}

/** Walk light DOM and shadow hosts upward from `start`. */
function* ancestors(start: Element): Generator<HTMLElement> {
  let node: Element | null = start;
  while (node) {
    const parent: Element | null =
      node.parentElement ??
      ((node.getRootNode() as ShadowRoot).host as Element | undefined) ??
      null;
    if (parent instanceof HTMLElement) yield parent;
    node = parent;
  }
}

function collectLockTargets(host: Element): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const out: HTMLElement[] = [];

  const add = (el: HTMLElement | null | undefined) => {
    if (!el || seen.has(el)) return;
    seen.add(el);
    out.push(el);
  };

  add(document.documentElement);
  add(document.body);

  for (const el of ancestors(host)) {
    if (isScrollable(el)) add(el);
  }

  return out;
}

/**
 * Lock dashboard / page scroll while a modal is open.
 * Returns an unlock function (safe to call more than once).
 */
export function lockScroll(host: Element): () => void {
  const targets = collectLockTargets(host);
  const locked: LockedStyle[] = [];
  const scrollY = window.scrollY;

  for (const el of targets) {
    const entry: LockedStyle = {
      el,
      overflow: el.style.overflow,
      overflowY: el.style.overflowY,
    };

    if (el === document.body) {
      entry.position = el.style.position;
      entry.top = el.style.top;
      entry.width = el.style.width;
      entry.scrollTop = scrollY;
      el.style.position = "fixed";
      el.style.top = `-${scrollY}px`;
      el.style.width = "100%";
    }

    el.style.overflow = "hidden";
    el.style.overflowY = "hidden";
    locked.push(entry);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;

    for (const entry of locked) {
      entry.el.style.overflow = entry.overflow;
      entry.el.style.overflowY = entry.overflowY;
      if (entry.position !== undefined) {
        entry.el.style.position = entry.position;
        entry.el.style.top = entry.top ?? "";
        entry.el.style.width = entry.width ?? "";
      }
    }

    if (scrollY) {
      window.scrollTo(0, scrollY);
    }
  };
}
