import { html, nothing, type TemplateResult } from "lit";
import { sliceHourlyForecast } from "../charts/hourly-window";
import { renderForecastRow } from "../charts/forecast-row";
import type { VedurkortCardConfig } from "../config";
import { localize } from "../localize";
import type { ForecastItem, HomeAssistant } from "../types";
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
): TemplateResult | typeof nothing {
  const block = mode === "daily" ? config.daily : config.hourly;
  if (!block.enabled) return nothing;

  const items =
    mode === "daily" ? state.dailyForecast : state.hourlyForecast;
  const error = mode === "daily" ? state.dailyError : state.hourlyError;
  const slice =
    mode === "daily"
      ? items.slice(0, config.daily.days)
      : sliceHourlyForecast(items, config.hourly.hours);
  const plotLeft =
    mode === "daily" ? state.dailyPlotLeft : state.hourlyPlotLeft;
  const plotWidth =
    mode === "daily" ? state.dailyPlotWidth : state.hourlyPlotWidth;
  const scrollable = mode === "hourly" && config.hourly.hours > 12;

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
                <canvas class="forecast-canvas-${mode}"></canvas>
              </div>
              <div
                class="forecast-row-slot"
                style=${!scrollable && plotWidth
                  ? `margin-left:${plotLeft}px;width:${plotWidth}px`
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
                })}
              </div>
            </div>
          `
        : nothing}
    </div>
  `;
}
