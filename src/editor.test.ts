// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import "./editor";
import { SMART_CHIP_ORDER } from "./sections/smart-chips";

type EditorEl = HTMLElement & {
  hass: unknown;
  setConfig(c: Record<string, unknown>): void;
  updateComplete: Promise<boolean>;
};

const hass = {
  language: "en",
  locale: { language: "en" },
  config: { unit_system: {} },
  states: {
    "weather.home": {
      entity_id: "weather.home",
      state: "sunny",
      attributes: { humidity: 50, wind_speed: 3 },
    },
  },
  entities: {},
  devices: {},
};

async function mount(config: Record<string, unknown>) {
  const el = document.createElement("vedurkort-weather-card-editor") as EditorEl;
  el.hass = hass;
  el.setConfig({ entity: "weather.home", ...config });
  document.body.appendChild(el);
  await el.updateComplete;
  const events: Record<string, unknown>[] = [];
  el.addEventListener("config-changed", (ev) =>
    events.push((ev as CustomEvent).detail.config),
  );
  return { el, events, root: el.shadowRoot! };
}

const rowIds = (root: ShadowRoot) =>
  [...root.querySelectorAll<HTMLElement>("[data-chip-row]")].map(
    (r) => r.dataset.chipRow,
  );

afterEach(() => {
  document.body.innerHTML = "";
});

describe("editor chip list", () => {
  it("shows the legacy animated background as Animated", async () => {
    const { root } = await mount({ animated_background: true });
    const sel = root.querySelector<HTMLSelectElement>(
      'select[data-config="background"]',
    );
    expect(sel?.value).toBe("animated");
  });

  it("shows saved select values on first render", async () => {
    const { root } = await mount({
      layout: "compact",
      background: "static",
      daily: { display: "modal" },
    });
    const val = (k: string) =>
      root.querySelector<HTMLSelectElement>(`select[data-config="${k}"]`)?.value;
    expect(val("layout")).toBe("compact");
    expect(val("background")).toBe("static");
    expect(val("daily.display")).toBe("modal");
  });

  it("renders one row per chip in default order; pollen hidden when off", async () => {
    const { root } = await mount({});
    expect(rowIds(root)).toEqual(SMART_CHIP_ORDER.filter((id) => id !== "pollen"));
    const { root: withPollen } = await mount({ show_pollen: true });
    expect(rowIds(withPollen)).toEqual([...SMART_CHIP_ORDER]);
  });

  it("▼ moves a chip and writes chip_order; buttons have accessible names", async () => {
    const { root, events, el } = await mount({});
    const down = root.querySelector<HTMLButtonElement>(
      '[data-chip-row="sun"] .chip-move.down',
    )!;
    expect(down.getAttribute("aria-label")).toMatch(/down/i);
    expect(
      root.querySelector<HTMLButtonElement>('[data-chip-row="sun"] .chip-move.up')
        ?.disabled,
    ).toBe(true);
    down.click();
    await el.updateComplete;
    const cfg = events.at(-1)!;
    expect((cfg.chip_order as string[]).slice(0, 2)).toEqual(["moon", "sun"]);
    expect(rowIds(root).slice(0, 2)).toEqual(["moon", "sun"]);
  });

  it("toggling a chip off keeps its position", async () => {
    const { root, events, el } = await mount({
      chip_order: ["wind", "sun"],
      show_wind: true,
    });
    const box = root.querySelector<HTMLInputElement>(
      '[data-chip-row="wind"] input[data-config="show_wind"]',
    )!;
    box.checked = false;
    box.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(events.at(-1)!.show_wind).toBe(false);
    expect((events.at(-1)!.chip_order as string[])[0]).toBe("wind");
    expect(rowIds(root)[0]).toBe("wind");
  });

  it("Reset order removes chip_order", async () => {
    const { root, events } = await mount({ chip_order: ["wind"] });
    const reset = [...root.querySelectorAll<HTMLButtonElement>(".preset-btn")].find(
      (b) => b.textContent?.includes("Reset order"),
    )!;
    expect(reset.disabled).toBe(false);
    reset.click();
    expect("chip_order" in events.at(-1)!).toBe(false);
  });

  it("keeps Feels like as a plain toggle outside the list", async () => {
    const { root } = await mount({});
    const feels = root.querySelector('input[data-config="show_feels_like"]');
    expect(feels).not.toBeNull();
    expect(feels?.closest("[data-chip-row]")).toBeNull();
    // Sits above the chip list, not after it (it is not a row chip).
    const list = root.querySelector(".chip-list")!;
    expect(
      feels!.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
