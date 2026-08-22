/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { trapFocus } from "./focus-trap";

function makeContainer(...buttons: HTMLButtonElement[]): HTMLDivElement {
  const container = document.createElement("div");
  buttons.forEach((b) => {
    Object.defineProperty(b, "offsetParent", {
      configurable: true,
      get: () => document.body,
    });
    container.appendChild(b);
  });
  document.body.appendChild(container);
  return container;
}

describe("trapFocus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("wraps Tab forward from last to first", () => {
    const first = document.createElement("button");
    const last = document.createElement("button");
    const focusFirst = vi.spyOn(first, "focus");
    const container = makeContainer(first, last);
    const cleanup = trapFocus(container);

    vi.spyOn(document, "activeElement", "get").mockReturnValue(last);
    const ev = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(true);
    expect(focusFirst).toHaveBeenCalled();
    cleanup();
    container.remove();
  });

  it("wraps Shift+Tab from first to last", () => {
    const first = document.createElement("button");
    const last = document.createElement("button");
    const focusLast = vi.spyOn(last, "focus");
    const container = makeContainer(first, last);
    const cleanup = trapFocus(container);

    vi.spyOn(document, "activeElement", "get").mockReturnValue(first);
    const ev = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(true);
    expect(focusLast).toHaveBeenCalled();
    cleanup();
    container.remove();
  });

  it("ignores non-Tab keys", () => {
    const btn = document.createElement("button");
    const container = makeContainer(btn);
    const cleanup = trapFocus(container);

    const ev = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(false);
    cleanup();
    container.remove();
  });

  it("cleanup removes listener", () => {
    const first = document.createElement("button");
    const last = document.createElement("button");
    const container = makeContainer(first, last);
    const cleanup = trapFocus(container);
    cleanup();

    vi.spyOn(document, "activeElement", "get").mockReturnValue(last);
    const ev = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(false);
    container.remove();
  });

  it("no-ops when container has no focusable elements", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const cleanup = trapFocus(container);

    const ev = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(false);
    cleanup();
    container.remove();
  });
});
