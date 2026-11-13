import { html, nothing, type TemplateResult } from "lit";
import { dailyShowsInline, type VedurkortCardConfig } from "../config";
import { localize } from "../localize";

export type ForecastTab = "daily" | "hourly";

type TabsConfig = Pick<
  VedurkortCardConfig,
  | "forecast_tabs"
  | "forecast_tabs_order"
  | "forecast_tabs_default"
  | "daily"
  | "hourly"
>;

/**
 * Tabs replace the stacked daily/hourly sections only when the option is on,
 * daily is shown on the card (not in a dialog) and hourly is enabled.
 */
export function forecastTabsActive(config: TabsConfig): boolean {
  return (
    config.forecast_tabs === true &&
    dailyShowsInline(config.daily) &&
    config.hourly.enabled === true
  );
}

/** Left-to-right tab order. */
export function forecastTabOrder(
  config: Pick<TabsConfig, "forecast_tabs_order">,
): ForecastTab[] {
  return config.forecast_tabs_order === "hourly_first"
    ? ["hourly", "daily"]
    : ["daily", "hourly"];
}

/**
 * The tab to show: the viewer's selection if there is one, otherwise the
 * configured default (`first` = leftmost tab).
 */
export function resolveActiveTab(
  config: Pick<TabsConfig, "forecast_tabs_order" | "forecast_tabs_default">,
  selected: ForecastTab | null,
): ForecastTab {
  if (selected === "daily" || selected === "hourly") return selected;
  if (
    config.forecast_tabs_default === "daily" ||
    config.forecast_tabs_default === "hourly"
  ) {
    return config.forecast_tabs_default;
  }
  return forecastTabOrder(config)[0]!;
}

/** Target tab index for a keyboard event on a tab, or null if not handled. */
export function nextTabIndex(
  current: number,
  key: string,
  count: number,
): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

const TAB_LABEL_KEY = {
  daily: "forecast_tab_daily",
  hourly: "forecast_tab_hourly",
} as const;

export function renderForecastTabs(
  tabs: ForecastTab[],
  active: ForecastTab,
  onSelect: (tab: ForecastTab) => void,
  language: string | undefined,
): TemplateResult {
  const onKeydown = (ev: KeyboardEvent, index: number) => {
    const next = nextTabIndex(index, ev.key, tabs.length);
    if (next == null) return;
    ev.preventDefault();
    const list = (ev.currentTarget as HTMLElement).parentElement;
    onSelect(tabs[next]!);
    (list?.querySelectorAll<HTMLElement>('[role="tab"]')[next])?.focus();
  };
  return html`
    <div
      class="forecast-tabs"
      role="tablist"
      aria-label=${localize("forecast_tabs_label", language)}
    >
      ${tabs.map(
        (tab, i) => html`
          <button
            type="button"
            role="tab"
            id="forecast-tab-${tab}"
            class="forecast-tab${tab === active ? " is-active" : ""}"
            aria-selected=${tab === active ? "true" : "false"}
            aria-controls="forecast-panel-${tab}"
            tabindex=${tab === active ? "0" : "-1"}
            @click=${() => onSelect(tab)}
            @keydown=${(ev: KeyboardEvent) => onKeydown(ev, i)}
          >
            ${localize(TAB_LABEL_KEY[tab], language)}
          </button>
        `,
      )}
    </div>
  `;
}

/**
 * Tab control plus both forecast panels stacked in one grid cell. The hidden
 * panel keeps its layout (so the area is as tall as the taller forecast and
 * charts keep their size) but is invisible and inert.
 */
export function renderForecastTabsArea(opts: {
  tabs: ForecastTab[];
  active: ForecastTab;
  onSelect: (tab: ForecastTab) => void;
  language: string | undefined;
  panels: Record<ForecastTab, TemplateResult | typeof nothing>;
}): TemplateResult {
  const { tabs, active, onSelect, language, panels } = opts;
  return html`
    ${renderForecastTabs(tabs, active, onSelect, language)}
    <div class="forecast-tabs-panels">
      ${tabs.map(
        (tab) => html`
          <div
            class="forecast-tab-panel${tab === active ? "" : " is-hidden"}"
            role="tabpanel"
            id="forecast-panel-${tab}"
            aria-labelledby="forecast-tab-${tab}"
            ?inert=${tab !== active}
          >
            ${panels[tab]}
          </div>
        `,
      )}
    </div>
  `;
}
