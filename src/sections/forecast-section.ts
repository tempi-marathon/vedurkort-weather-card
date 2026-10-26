import { html, nothing, type TemplateResult } from "lit";
import { sliceHourlyForecast } from "../charts/hourly-window";
import { renderForecastRow } from "../charts/forecast-row";
import type { BackgroundScene } from "../backgrounds/scenes";
import {
  dailyShowsInline,
  type BackgroundMode,
  type VedurkortCardConfig,
} from "../config";
import {
  insertSunEventsIntoHourly,
  sunTimesFromSnapshot,
  type HourlySlotItem,
} from "../details/sun-events";
import { localize } from "../localize";
import type { ForecastItem, HomeAssistant } from "../types";
import { renderViewportDialog } from "../ui/viewport-dialog";
import type { WeatherSnapshot } from "../weather/adapter";

export interface ForecastSectionState {
  dailyForecast: ForecastItem[];
  hourlyForecast: ForecastItem[];
  dailyError: string | null;
  hourlyError: string | null;
  dailyPlotLeft: number;
  dailyPlotWidth: number;
  hourlyPlotLeft: number;
  hourlyPlotWidth: number;
}

export interface ForecastSectionOptions {
  /** Render even when the block would normally be gated off (daily modal). */
  force?: boolean;
  /** Override canvas class (default `forecast-canvas-${mode}`). */
  canvasClass?: string;
  /** Override plot alignment (e.g. modal daily chart). */
  plotLeft?: number;
  plotWidth?: number;
}

export interface DailyDialogShellOptions {
  background?: BackgroundMode;
  scene?: BackgroundScene;
  cloudCoverage?: number | null;
}

function forecastErrorText(error: string, language?: string): string {
  if (error === "Failed to load forecast") {
    return localize("forecast_failed", language);
  }
  return error;
}

export function renderForecastSection(
  mode: "daily" | "hourly",
  hass: HomeAssistant,
  config: VedurkortCardConfig,
  snap: WeatherSnapshot,
  state: ForecastSectionState,
  language: string | undefined,
  onHourlyScroll?: () => void,
  options?: ForecastSectionOptions,
): TemplateResult | typeof nothing {
  const block = mode === "daily" ? config.daily : config.hourly;
  if (mode === "daily") {
    if (!options?.force && !dailyShowsInline(config.daily)) return nothing;
  } else if (!block.enabled) {
    return nothing;
  }

  const items =
    mode === "daily" ? state.dailyForecast : state.hourlyForecast;
  const error = mode === "daily" ? state.dailyError : state.hourlyError;
  const slice: HourlySlotItem[] | ForecastItem[] =
    mode === "daily"
      ? items.slice(0, config.daily.days)
      : insertSunEventsIntoHourly(
          sliceHourlyForecast(items, config.hourly.hours),
          sunTimesFromSnapshot(snap),
        );
  const sunEvents =
    mode === "hourly"
      ? (slice as HourlySlotItem[]).map((item) => item.sunEvent ?? null)
      : undefined;
  const plotLeft =
    options?.plotLeft ??
    (mode === "daily" ? state.dailyPlotLeft : state.hourlyPlotLeft);
  const plotWidth =
    options?.plotWidth ??
    (mode === "daily" ? state.dailyPlotWidth : state.hourlyPlotWidth);
  const scrollable = mode === "hourly" && config.hourly.hours > 12;
  const canvasClass = options?.canvasClass ?? `forecast-canvas-${mode}`;

  return html`
    <div
      class="forecast forecast-${mode}${scrollable ? " forecast-scroll" : ""}"
      @scroll=${scrollable && onHourlyScroll ? onHourlyScroll : nothing}
    >
      ${error
        ? html`<div class="warn">${forecastErrorText(error, language)}</div>`
        : nothing}
      ${!error && !slice.length
        ? html`<div class="warn">
            ${localize("no_forecast", language, {
              mode: localize(
                mode === "daily" ? "mode_daily" : "mode_hourly",
                language,
              ),
            })} <code>${config.entity}</code>
          </div>`
        : nothing}
      ${slice.length
        ? html`
            <div
              class="forecast-scroll-inner"
              style=${scrollable ? `--cols: ${slice.length}` : ""}
            >
              <div class="chart-wrap">
                <canvas class=${canvasClass}></canvas>
              </div>
              <div
                class="forecast-row-slot"
                style=${plotWidth
                  ? `margin-left:${plotLeft}px;width:${plotWidth}px;max-width:calc(100% - ${plotLeft}px)`
                  : ""}
              >
                ${renderForecastRow(hass, slice, {
                  showIcons: block.show_condition_icons,
                  showWindSpeed: block.show_wind_speed,
                  showWindDirection: block.show_wind_direction,
                  iconStyle: config.icon_style,
                  animated: config.animated_icons,
                  windSpeedUnit: snap.windSpeedUnit,
                  mode,
                  language,
                  sunEntity: config.sun_entity,
                  weatherEntityId: config.entity,
                  sunEvents,
                })}
              </div>
            </div>
          `
        : nothing}
    </div>
  `;
}

/** Quiet text link under current chips that opens the daily forecast modal. */
export function renderDailyLink(
  language: string | undefined,
  onOpen: () => void,
): TemplateResult {
  return html`
    <button
      type="button"
      class="daily-link"
      @click=${() => onOpen()}
      aria-haspopup="dialog"
    >
      ${localize("legend_daily", language)}
      <span class="daily-link-chevron" aria-hidden="true">›</span>
    </button>
  `;
}

export function renderDailyDialog(
  open: boolean,
  hass: HomeAssistant,
  config: VedurkortCardConfig,
  snap: WeatherSnapshot,
  state: ForecastSectionState,
  language: string | undefined,
  onClose: () => void,
  shell?: DailyDialogShellOptions,
  plotLeft = 0,
  plotWidth = 0,
): TemplateResult | typeof nothing {
  if (!open) return nothing;

  return renderViewportDialog({
    open: true,
    title: localize("legend_daily", language),
    titleId: "daily-modal-title",
    language,
    background: shell?.background,
    scene: shell?.scene,
    cloudCoverage: shell?.cloudCoverage,
    onClose,
    body: html`
      <div class="daily-modal-body">
        ${renderForecastSection(
          "daily",
          hass,
          config,
          snap,
          state,
          language,
          undefined,
          {
            force: true,
            canvasClass: "forecast-canvas-daily-modal",
            plotLeft,
            plotWidth,
          },
        )}
      </div>
    `,
  });
}
