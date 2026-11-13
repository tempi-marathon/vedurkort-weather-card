// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "./card";

type CardEl = HTMLElement & {
  hass: unknown;
  setConfig(c: Record<string, unknown>): void;
  updateComplete: Promise<boolean>;
};

const hass = {
  language: "en",
  locale: { language: "en" },
  config: { unit_system: { temperature: "°C", length: "km" } },
  states: {
    "weather.home": {
      entity_id: "weather.home",
      state: "sunny",
      attributes: { temperature: 12, humidity: 50, wind_speed: 3 },
    },
  },
  entities: {},
  devices: {},
  connection: { subscribeMessage: async () => () => undefined },
  callWS: async () => ({}),
};

async function mount(config: Record<string, unknown>) {
  const el = document.createElement("vedurkort-weather-card") as CardEl;
  el.hass = hass;
  el.setConfig({
    entity: "weather.home",
    daily: { display: "inline" },
    hourly: { enabled: true },
    ...config,
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, root: el.shadowRoot! };
}

const panels = (root: ShadowRoot) => [
  ...root.querySelectorAll<HTMLElement>(".forecast-tab-panel"),
];

beforeAll(() => {
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", NoopObserver);
  vi.stubGlobal("ResizeObserver", NoopObserver);
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("card forecast tabs", () => {
  it("renders the original stacked sections when tabs are off", async () => {
    const { root } = await mount({});
    expect(root.querySelector(".section-daily")).not.toBeNull();
    expect(root.querySelector(".section-hourly")).not.toBeNull();
    expect(root.querySelector(".forecast-tabs")).toBeNull();
    expect(root.querySelector(".section-forecast-tabs")).toBeNull();
  });

  it("stacks both panels in one container and shows the default tab", async () => {
    const { root } = await mount({ forecast_tabs: true });
    expect(root.querySelector(".section-daily")).toBeNull();
    const container = root.querySelector(".forecast-tabs-panels")!;
    expect(container.querySelectorAll(".forecast-tab-panel")).toHaveLength(2);
    const hidden = panels(root).filter((p) => p.classList.contains("is-hidden"));
    expect(hidden).toHaveLength(1);
    expect(hidden[0]!.id).toBe("forecast-panel-hourly");
    expect(hidden[0]!.hasAttribute("inert")).toBe(true);
    expect(root.querySelector(".forecast-daily")).not.toBeNull();
    expect(root.querySelector(".forecast-hourly")).not.toBeNull();
  });

  it("honours order and default, and switches on click", async () => {
    const { el, root } = await mount({
      forecast_tabs: true,
      forecast_tabs_order: "hourly_first",
    });
    const labels = () =>
      [...root.querySelectorAll('[role="tab"]')].map((t) => t.textContent?.trim());
    expect(labels()).toEqual(["Hourly", "Daily"]);
    const active = () =>
      panels(root).find((p) => !p.classList.contains("is-hidden"))!.id;
    expect(active()).toBe("forecast-panel-hourly");
    (root.querySelectorAll<HTMLElement>('[role="tab"]')[1] as HTMLElement).click();
    await el.updateComplete;
    expect(active()).toBe("forecast-panel-daily");
  });

  it("resets to the configured default when the config changes", async () => {
    const { el, root } = await mount({
      forecast_tabs: true,
      forecast_tabs_default: "daily",
    });
    (root.querySelectorAll<HTMLElement>('[role="tab"]')[1] as HTMLElement).click();
    await el.updateComplete;
    expect(
      panels(root).find((p) => !p.classList.contains("is-hidden"))!.id,
    ).toBe("forecast-panel-hourly");
    el.setConfig({
      entity: "weather.home",
      daily: { display: "inline" },
      hourly: { enabled: true },
      forecast_tabs: true,
      forecast_tabs_default: "daily",
    });
    await el.updateComplete;
    expect(
      panels(root).find((p) => !p.classList.contains("is-hidden"))!.id,
    ).toBe("forecast-panel-daily");
  });

  it("does not use tabs when daily is a dialog, and keeps the daily link", async () => {
    const { root } = await mount({
      forecast_tabs: true,
      daily: { display: "modal" },
    });
    expect(root.querySelector(".forecast-tabs")).toBeNull();
    expect(root.querySelector(".section-hourly")).not.toBeNull();
  });

  it("still shows tabs when the current section is hidden", async () => {
    const { root } = await mount({ forecast_tabs: true, show_current: false });
    expect(root.querySelector(".forecast-tabs")).not.toBeNull();
  });
});
