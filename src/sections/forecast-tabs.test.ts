// @vitest-environment jsdom
import { html, nothing, render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG, normalizeConfig } from "../config";
import {
  forecastTabOrder,
  forecastTabsActive,
  nextTabIndex,
  renderForecastTabs,
  renderForecastTabsArea,
  resolveActiveTab,
} from "./forecast-tabs";

function cfg(extra: Record<string, unknown>) {
  return normalizeConfig({ entity: "weather.home", ...extra });
}

describe("forecastTabsActive", () => {
  it("is off by default", () => {
    expect(
      forecastTabsActive(
        cfg({ daily: { display: "inline" }, hourly: { enabled: true } }),
      ),
    ).toBe(false);
  });

  it("is active with tabs on, inline daily and hourly", () => {
    expect(
      forecastTabsActive(
        cfg({
          forecast_tabs: true,
          daily: { display: "inline" },
          hourly: { enabled: true },
        }),
      ),
    ).toBe(true);
  });

  it("is inactive when daily is a dialog or off", () => {
    for (const display of ["modal", "off"]) {
      expect(
        forecastTabsActive(
          cfg({
            forecast_tabs: true,
            daily: { display },
            hourly: { enabled: true },
          }),
        ),
      ).toBe(false);
    }
  });

  it("is inactive when hourly is off", () => {
    expect(
      forecastTabsActive(
        cfg({
          forecast_tabs: true,
          daily: { display: "inline" },
          hourly: { enabled: false },
        }),
      ),
    ).toBe(false);
  });

  it("stays active when the current section is hidden", () => {
    expect(
      forecastTabsActive(
        cfg({
          forecast_tabs: true,
          show_current: false,
          daily: { display: "inline" },
          hourly: { enabled: true },
        }),
      ),
    ).toBe(true);
  });

  it("default config has tabs off", () => {
    expect(DEFAULT_CONFIG.forecast_tabs).toBe(false);
  });
});

describe("forecastTabOrder / resolveActiveTab", () => {
  it("orders daily first by default and hourly first on request", () => {
    expect(forecastTabOrder(cfg({}))).toEqual(["daily", "hourly"]);
    expect(
      forecastTabOrder(cfg({ forecast_tabs_order: "hourly_first" })),
    ).toEqual(["hourly", "daily"]);
  });

  it("default 'first' follows the order", () => {
    expect(resolveActiveTab(cfg({}), null)).toBe("daily");
    expect(
      resolveActiveTab(cfg({ forecast_tabs_order: "hourly_first" }), null),
    ).toBe("hourly");
  });

  it("an explicit default wins regardless of order", () => {
    expect(
      resolveActiveTab(
        cfg({
          forecast_tabs_order: "hourly_first",
          forecast_tabs_default: "daily",
        }),
        null,
      ),
    ).toBe("daily");
  });

  it("a selection overrides the default", () => {
    expect(
      resolveActiveTab(cfg({ forecast_tabs_default: "daily" }), "hourly"),
    ).toBe("hourly");
  });
});

describe("nextTabIndex", () => {
  it("wraps on arrows and jumps on Home/End", () => {
    expect(nextTabIndex(0, "ArrowRight", 2)).toBe(1);
    expect(nextTabIndex(1, "ArrowRight", 2)).toBe(0);
    expect(nextTabIndex(0, "ArrowLeft", 2)).toBe(1);
    expect(nextTabIndex(1, "Home", 2)).toBe(0);
    expect(nextTabIndex(0, "End", 2)).toBe(1);
  });

  it("ignores other keys", () => {
    expect(nextTabIndex(0, "a", 2)).toBeNull();
    expect(nextTabIndex(0, "ArrowRight", 0)).toBeNull();
  });
});

function mountTabs(active: "daily" | "hourly", onSelect = vi.fn()) {
  const host = document.createElement("div");
  document.body.append(host);
  render(
    renderForecastTabs(["daily", "hourly"], active, onSelect, "en"),
    host,
  );
  return { host, onSelect };
}

describe("renderForecastTabs", () => {
  it("renders tab roles with selection and roving tabindex", () => {
    const { host } = mountTabs("hourly");
    expect(host.querySelector('[role="tablist"]')).not.toBeNull();
    const tabs = [...host.querySelectorAll<HTMLElement>('[role="tab"]')];
    expect(tabs.map((t) => t.textContent?.trim())).toEqual([
      "Daily",
      "Hourly",
    ]);
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual([
      "false",
      "true",
    ]);
    expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual(["-1", "0"]);
  });

  it("selects on click and on arrow keys", () => {
    const { host, onSelect } = mountTabs("daily");
    const tabs = host.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs[1]!.click();
    expect(onSelect).toHaveBeenLastCalledWith("hourly");
    tabs[0]!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(onSelect).toHaveBeenLastCalledWith("hourly");
    tabs[0]!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    expect(onSelect).toHaveBeenLastCalledWith("hourly");
    tabs[1]!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    expect(onSelect).toHaveBeenLastCalledWith("daily");
  });
});

describe("renderForecastTabsArea", () => {
  it("stacks both panels in one container with only one visible", () => {
    const host = document.createElement("div");
    render(
      renderForecastTabsArea({
        tabs: ["hourly", "daily"],
        active: "daily",
        onSelect: () => undefined,
        language: "en",
        panels: {
          daily: html`<p id="d">d</p>`,
          hourly: html`<p id="h">h</p>`,
        },
      }),
      host,
    );
    const container = host.querySelector(".forecast-tabs-panels")!;
    const panels = [
      ...container.querySelectorAll<HTMLElement>(".forecast-tab-panel"),
    ];
    expect(panels).toHaveLength(2);
    expect(panels.map((p) => p.id)).toEqual([
      "forecast-panel-hourly",
      "forecast-panel-daily",
    ]);
    const hidden = panels.filter((p) => p.classList.contains("is-hidden"));
    expect(hidden).toHaveLength(1);
    expect(hidden[0]!.id).toBe("forecast-panel-hourly");
    expect(hidden[0]!.hasAttribute("inert")).toBe(true);
    expect(panels[1]!.hasAttribute("inert")).toBe(false);
    expect(host.querySelector(".forecast-tabs")).not.toBeNull();
  });

  it("renders nothing extra for an empty panel", () => {
    const host = document.createElement("div");
    render(
      renderForecastTabsArea({
        tabs: ["daily", "hourly"],
        active: "daily",
        onSelect: () => undefined,
        language: "en",
        panels: { daily: nothing, hourly: nothing },
      }),
      host,
    );
    expect(host.querySelectorAll(".forecast-tab-panel")).toHaveLength(2);
  });
});
