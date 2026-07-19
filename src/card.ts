import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Chart } from "chart.js";
import {
  backgroundStyles,
  conditionToScene,
  renderBackground,
} from "./backgrounds/scenes";
import {
  buildDailySeries,
  buildHourlySeries,
  chartChromeForScene,
  createForecastChart,
  getChartPlotArea,
  seriesFingerprint,
  syncForecastChart,
} from "./charts/forecast-chart";
import { renderForecastRow } from "./charts/forecast-row";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  type VedurkortCardConfig,
} from "./config";
import {
  bearingToLabel,
  bearingToWindIcon,
  beaufortIcon,
  conditionToMeteocon,
  uvIndexIcon,
  windSpeedToBeaufort,
} from "./icons/condition-map";
import { getMeteoconSvg } from "./icons/meteocons";
import type { ForecastItem, HomeAssistant, LovelaceCardEditor } from "./types";
import { tipWrap } from "./ui/tooltip";
import {
  formatNumber,
  formatTemp,
  formatTime,
  getWeatherSnapshot,
  subscribeForecast,
} from "./weather/adapter";

@customElement("vedurkort-weather-card")
export class VedurkortWeatherCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: VedurkortCardConfig;
  @state() private _forecast: ForecastItem[] = [];
  @state() private _forecastError: string | null = null;
  @state() private _plotLeft = 0;
  @state() private _plotWidth = 0;

  private _chart: Chart | null = null;
  private _chartFingerprint = "";
  private _chartModeKey = "";
  private _forecastKey = "";
  private _unsubForecast: (() => void) | undefined;
  private _forecastLoading = false;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./editor");
    return document.createElement(
      "vedurkort-weather-card-editor",
    ) as LovelaceCardEditor;
  }

  public static getStubConfig(
    _hass: HomeAssistant,
    entities: string[],
  ): Partial<VedurkortCardConfig> {
    const weather = entities.find((e) => e.startsWith("weather."));
    return {
      ...DEFAULT_CONFIG,
      entity: weather ?? "weather.home",
    };
  }

  public setConfig(config: Partial<VedurkortCardConfig>): void {
    this._config = normalizeConfig(config);
  }

  public getCardSize(): number {
    if (!this._config) return 3;
    if (this._config.layout === "basic") return 3;
    return 6;
  }

  protected updated(changed: Map<string, unknown>): void {
    if (
      (changed.has("hass") || changed.has("_config")) &&
      this._config &&
      this.hass
    ) {
      void this._ensureForecastSubscription();
    }
    if (
      changed.has("_forecast") ||
      changed.has("_config") ||
      changed.has("hass")
    ) {
      this.updateComplete.then(() => this._renderChart());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownForecast();
    this._destroyChart();
  }

  private _teardownForecast(): void {
    this._unsubForecast?.();
    this._unsubForecast = undefined;
    this._forecastKey = "";
  }

  private async _ensureForecastSubscription(): Promise<void> {
    const layout = this._config.layout;
    if (layout === "basic") {
      this._teardownForecast();
      this._forecast = [];
      this._forecastError = null;
      return;
    }

    const key = `${this._config.entity}:${layout}`;
    if (key === this._forecastKey || this._forecastLoading) return;
    this._forecastLoading = true;
    this._teardownForecast();
    this._forecastKey = key;
    this._forecastError = null;

    const type = layout === "daily" ? "daily" : "hourly";
    try {
      this._unsubForecast = await subscribeForecast(
        this.hass,
        this._config.entity,
        type,
        (items, error) => {
          this._forecast = items;
          this._forecastError = error;
          this.requestUpdate();
        },
      );
    } catch (err) {
      this._forecast = [];
      this._forecastError =
        err instanceof Error ? err.message : "Failed to load forecast";
      this._forecastKey = "";
    } finally {
      this._forecastLoading = false;
    }
  }

  private _destroyChart(): void {
    this._chart?.destroy();
    this._chart = null;
    this._chartFingerprint = "";
    this._chartModeKey = "";
    this._plotLeft = 0;
    this._plotWidth = 0;
  }

  private _syncPlotArea(): void {
    if (!this._chart) return;
    const area = getChartPlotArea(this._chart);
    if (!area) return;
    if (
      Math.abs(area.left - this._plotLeft) > 0.5 ||
      Math.abs(area.width - this._plotWidth) > 0.5
    ) {
      this._plotLeft = area.left;
      this._plotWidth = area.width;
    }
  }

  private _renderChart(): void {
    const canvas = this.renderRoot.querySelector(
      "canvas.forecast-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas || !this._config || this._config.layout === "basic") {
      this._destroyChart();
      return;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    const scene = conditionToScene(
      snap?.condition,
      snap?.isDay ?? true,
    );
    const textColor = getComputedStyle(this).color;
    const chrome = chartChromeForScene(
      this._config.animated_background,
      scene,
      textColor,
    );
    const precipUnit =
      (snap?.entity.attributes.precipitation_unit as string | undefined) ??
      "mm";

    const language =
      this.hass.locale?.language ??
      this.hass.language ??
      this.hass.config.language;
    const mode = this._config.layout === "daily" ? "daily" : "hourly";
    const precipType =
      mode === "daily"
        ? this._config.daily.precip_type
        : this._config.hourly.precip_type;
    const series =
      mode === "daily"
        ? buildDailySeries(
            this._forecast,
            this._config.daily.days,
            precipType,
            language,
          )
        : buildHourlySeries(
            this._forecast,
            this._config.hourly.hours,
            precipType,
            language,
          );

    if (!series.labels.length) {
      this._destroyChart();
      return;
    }

    const modeKey = `${mode}:${precipType}:${precipUnit}:${this._config.animated_background}:${scene}`;
    const fingerprint = seriesFingerprint(series);
    if (
      this._chart &&
      this._chartModeKey === modeKey &&
      this._chartFingerprint === fingerprint
    ) {
      this._syncPlotArea();
      return;
    }

    if (this._chart && this._chartModeKey.split(":")[0] === mode) {
      syncForecastChart(
        this._chart,
        series,
        mode,
        precipType,
        chrome,
        precipUnit,
      );
      this._chartFingerprint = fingerprint;
      this._chartModeKey = modeKey;
      this._syncPlotArea();
      return;
    }

    this._destroyChart();
    this._chart = createForecastChart(
      canvas,
      series,
      mode,
      precipType,
      chrome,
      precipUnit,
    );
    this._chartFingerprint = fingerprint;
    this._chartModeKey = modeKey;
    // chartArea is ready after layout
    requestAnimationFrame(() => this._syncPlotArea());
  }

  private _icon(
    name: Parameters<typeof getMeteoconSvg>[0],
  ): string {
    return getMeteoconSvg(
      name,
      this._config.icon_style,
      this._config.animated_icons,
    );
  }

  private _detail(
    icon: Parameters<typeof getMeteoconSvg>[0],
    text: string | null,
    label: string,
  ) {
    if (!text) return nothing;
    const tip = `${label}: ${text}`;
    return tipWrap(
      tip,
      html`
        <span class="detail-icon" .innerHTML=${this._icon(icon)}></span>
        <span>${text}</span>
      `,
      "detail",
    );
  }

  protected render() {
    if (!this._config) return html``;
    if (!this.hass) {
      return html`<ha-card
        ><div class="pad">Waiting for Home Assistant…</div></ha-card
      >`;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    if (!snap) {
      return html`
        <ha-card>
          <div class="pad warn">
            Entity not found: <code>${this._config.entity}</code>
          </div>
        </ha-card>
      `;
    }

    const iconName = conditionToMeteocon(snap.condition, snap.isDay);
    const scene = conditionToScene(snap.condition, snap.isDay);
    const language =
      this.hass.locale?.language ??
      this.hass.language ??
      this.hass.config.language;

    const bft = windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit);
    const showDetails =
      this._config.show_sun ||
      this._config.show_humidity ||
      this._config.show_wind_speed ||
      this._config.show_wind_direction ||
      this._config.show_uv_index ||
      this._config.show_pressure ||
      this._config.show_cloud_coverage ||
      this._config.show_feels_like ||
      this._config.show_dew_point ||
      this._config.show_visibility;

    const forecastBlock =
      this._config.layout === "daily"
        ? this._config.daily
        : this._config.layout === "hourly"
          ? this._config.hourly
          : null;

    const forecastSlice =
      this._config.layout === "daily"
        ? this._forecast.slice(0, this._config.daily.days)
        : this._config.layout === "hourly"
          ? this._forecast.slice(0, this._config.hourly.hours)
          : [];

    return html`
      <ha-card class=${this._config.animated_background ? "has-bg" : ""}>
        ${renderBackground(
          this._config.animated_background,
          scene,
          snap.cloudCoverage,
        )}
        <div class="content">
          <div class="main">
            <div class="main-text">
              <div class="location">${snap.name}</div>
              <div class="condition">${snap.conditionLabel}</div>
              <div class="temp">
                ${formatTemp(snap.temperature, snap.temperatureUnit)}
              </div>
            </div>
            ${tipWrap(
              snap.conditionLabel,
              html`<div
                class="main-icon"
                .innerHTML=${this._icon(iconName)}
              ></div>`,
            )}
          </div>

          ${showDetails
            ? html`
                <div class="details">
                  ${this._config.show_sun
                    ? html`
                        <span class="detail">
                          ${tipWrap(
                            `Sunrise ${formatTime(snap.sunrise, language)}`,
                            html`<span
                              class="detail-icon"
                              .innerHTML=${this._icon("sunrise")}
                            ></span>`,
                          )}
                          <span>${formatTime(snap.sunrise, language)}</span>
                          ${tipWrap(
                            `Sunset ${formatTime(snap.sunset, language)}`,
                            html`<span
                              class="detail-icon"
                              .innerHTML=${this._icon("sunset")}
                            ></span>`,
                          )}
                          <span>${formatTime(snap.sunset, language)}</span>
                        </span>
                      `
                    : nothing}
                  ${this._config.show_feels_like
                    ? this._detail(
                        "thermometer",
                        formatNumber(snap.feelsLike, snap.temperatureUnit),
                        "Feels like",
                      )
                    : nothing}
                  ${this._config.show_dew_point
                    ? this._detail(
                        "thermometer-raindrop",
                        formatNumber(snap.dewPoint, snap.temperatureUnit),
                        "Dew point",
                      )
                    : nothing}
                  ${this._config.show_humidity
                    ? this._detail(
                        "humidity",
                        formatNumber(snap.humidity, "%", 0),
                        "Humidity",
                      )
                    : nothing}
                  ${this._config.show_cloud_coverage
                    ? this._detail(
                        "cloudy",
                        formatNumber(snap.cloudCoverage, "%", 0),
                        "Cloud coverage",
                      )
                    : nothing}
                  ${this._config.show_pressure
                    ? this._detail(
                        "barometer",
                        formatNumber(snap.pressure, ` ${snap.pressureUnit}`, 0),
                        "Pressure",
                      )
                    : nothing}
                  ${this._config.show_visibility
                    ? this._detail(
                        "fog",
                        formatNumber(
                          snap.visibility,
                          ` ${snap.visibilityUnit}`,
                          0,
                        ),
                        "Visibility",
                      )
                    : nothing}
                  ${this._config.show_uv_index
                    ? this._detail(
                        uvIndexIcon(snap.uvIndex),
                        formatNumber(snap.uvIndex, "", 0),
                        "UV index",
                      )
                    : nothing}
                  ${this._config.show_wind_speed ||
                  this._config.show_wind_direction
                    ? html`
                        <span class="detail wind-detail">
                          ${this._config.show_wind_speed &&
                          snap.windSpeed != null
                            ? tipWrap(
                                `Wind ${Math.round(snap.windSpeed)} ${snap.windSpeedUnit} (Beaufort ${bft})`,
                                html`
                                  <span class="wind-pair">
                                    <span
                                      class="detail-icon"
                                      .innerHTML=${this._icon(
                                        beaufortIcon(bft),
                                      )}
                                    ></span>
                                    <span
                                      >${Math.round(snap.windSpeed)}
                                      ${snap.windSpeedUnit}</span
                                    >
                                  </span>
                                `,
                              )
                            : nothing}
                          ${this._config.show_wind_direction
                            ? tipWrap(
                                `Wind direction ${bearingToLabel(snap.windBearing ?? undefined)}`,
                                html`
                                  <span class="wind-pair">
                                    <span
                                      class="detail-icon"
                                      .innerHTML=${this._icon(
                                        bearingToWindIcon(
                                          snap.windBearing ?? undefined,
                                        ),
                                      )}
                                    ></span>
                                    <span
                                      >${bearingToLabel(
                                        snap.windBearing ?? undefined,
                                      )}</span
                                    >
                                  </span>
                                `,
                              )
                            : nothing}
                        </span>
                      `
                    : nothing}
                </div>
              `
            : nothing}

          ${forecastBlock
            ? html`
                <div class="forecast">
                  ${this._forecastError
                    ? html`<div class="warn">${this._forecastError}</div>`
                    : nothing}
                  ${!this._forecastError && !forecastSlice.length
                    ? html`<div class="warn">
                        No forecast data available for ${this._config.layout}
                        forecasts on <code>${this._config.entity}</code>
                      </div>`
                    : nothing}
                  ${forecastSlice.length
                    ? html`
                        <div class="chart-wrap">
                          <canvas class="forecast-canvas"></canvas>
                        </div>
                        <div
                          class="forecast-row-slot"
                          style=${this._plotWidth
                            ? `margin-left:${this._plotLeft}px;width:${this._plotWidth}px`
                            : ""}
                        >
                          ${renderForecastRow(this.hass, forecastSlice, {
                            showIcons: forecastBlock.show_condition_icons,
                            showWind: forecastBlock.show_wind,
                            iconStyle: this._config.icon_style,
                            animated: this._config.animated_icons,
                            windSpeedUnit: snap.windSpeedUnit,
                            mode:
                              this._config.layout === "daily"
                                ? "daily"
                                : "hourly",
                            language,
                            sunEntity: this._config.sun_entity,
                          })}
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}
        </div>
      </ha-card>
    `;
  }

  static styles = [
    backgroundStyles,
    css`
      :host {
        display: block;
      }
      ha-card {
        position: relative;
        overflow: hidden;
      }
      ha-card.has-bg {
        color: #fff;
        --primary-text-color: #fff;
        --secondary-text-color: rgba(255, 255, 255, 0.85);
      }
      .content {
        position: relative;
        z-index: 1;
        padding: 16px;
      }
      .pad {
        padding: 16px;
      }
      .warn {
        opacity: 0.9;
        font-size: 0.9rem;
      }
      .main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .location {
        font-size: 1.05rem;
        font-weight: 600;
        opacity: 0.95;
      }
      .condition {
        text-transform: capitalize;
        opacity: 0.8;
        font-size: 0.95rem;
      }
      .temp {
        font-size: 2.4rem;
        font-weight: 650;
        line-height: 1.1;
        margin-top: 4px;
      }
      .main-icon {
        width: 96px;
        height: 96px;
        flex-shrink: 0;
      }
      .main-icon svg {
        width: 100%;
        height: 100%;
      }
      .details {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: 10px 14px;
        margin-top: 14px;
        font-size: 0.9rem;
        opacity: 0.95;
      }
      .detail {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex: 1 1 auto;
        min-width: max-content;
      }
      .wind-detail {
        gap: 14px;
      }
      .wind-pair {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .detail-icon {
        width: 26px;
        height: 26px;
        display: inline-flex;
      }
      .detail-icon svg {
        width: 100%;
        height: 100%;
      }
      .tip {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .tip::after {
        content: attr(data-tip);
        position: absolute;
        left: 50%;
        bottom: calc(100% + 6px);
        transform: translateX(-50%) translateY(2px);
        background: rgba(20, 20, 20, 0.92);
        color: #fff;
        font-size: 0.72rem;
        line-height: 1.25;
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
        max-width: 220px;
        white-space: normal;
        width: max-content;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.12s ease, transform 0.12s ease;
        z-index: 5;
        text-align: center;
      }
      .tip:hover::after,
      .tip:focus-within::after {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      ha-card.has-bg .tip::after {
        background: rgba(255, 255, 255, 0.95);
        color: #111;
      }
      .forecast {
        margin-top: 16px;
      }
      .chart-wrap {
        height: 180px;
        width: 100%;
      }
      .forecast-row-slot {
        box-sizing: border-box;
      }
      .forecast-row {
        display: grid;
        grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
        gap: 0;
        margin-top: 8px;
        width: 100%;
      }
      .forecast-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .forecast-icon {
        width: 40px;
        height: 40px;
      }
      .forecast-icon svg,
      .wind-icon svg {
        width: 100%;
        height: 100%;
      }
      .forecast-wind {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .forecast-wind .wind-pair {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .wind-icon {
        width: 24px;
        height: 24px;
      }
      .wind-meta {
        font-size: 0.7rem;
        opacity: 0.85;
        text-align: center;
        line-height: 1.2;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "vedurkort-weather-card": VedurkortWeatherCard;
  }
}
