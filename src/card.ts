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
  formatPrecip,
  formatTemp,
  formatTime,
  getWeatherSnapshot,
  subscribeForecast,
} from "./weather/adapter";

@customElement("vedurkort-weather-card")
export class VedurkortWeatherCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: VedurkortCardConfig;
  @state() private _dailyForecast: ForecastItem[] = [];
  @state() private _hourlyForecast: ForecastItem[] = [];
  @state() private _dailyError: string | null = null;
  @state() private _hourlyError: string | null = null;
  @state() private _dailyPlotLeft = 0;
  @state() private _dailyPlotWidth = 0;
  @state() private _hourlyPlotLeft = 0;
  @state() private _hourlyPlotWidth = 0;

  private _dailyChart: Chart | null = null;
  private _hourlyChart: Chart | null = null;
  private _dailyChartFingerprint = "";
  private _hourlyChartFingerprint = "";
  private _dailyChartModeKey = "";
  private _hourlyChartModeKey = "";
  private _forecastKey = "";
  private _unsubDaily: (() => void) | undefined;
  private _unsubHourly: (() => void) | undefined;
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
    let size = this._config.show_current ? 3 : 1;
    if (this._config.daily.enabled) size += 3;
    if (this._config.hourly.enabled) size += 3;
    return size;
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
      changed.has("_dailyForecast") ||
      changed.has("_hourlyForecast") ||
      changed.has("_config") ||
      changed.has("hass")
    ) {
      this.updateComplete.then(() => this._renderCharts());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownForecast();
    this._destroyCharts();
  }

  private _teardownForecast(): void {
    this._unsubDaily?.();
    this._unsubHourly?.();
    this._unsubDaily = undefined;
    this._unsubHourly = undefined;
    this._forecastKey = "";
  }

  private async _ensureForecastSubscription(): Promise<void> {
    const wantDaily = this._config.daily.enabled;
    const wantHourly = this._config.hourly.enabled;
    if (!wantDaily && !wantHourly) {
      this._teardownForecast();
      this._dailyForecast = [];
      this._hourlyForecast = [];
      this._dailyError = null;
      this._hourlyError = null;
      this._destroyCharts();
      return;
    }

    const key = `${this._config.entity}:d=${wantDaily}:h=${wantHourly}`;
    if (key === this._forecastKey || this._forecastLoading) return;
    this._forecastLoading = true;
    this._teardownForecast();
    this._forecastKey = key;
    this._dailyError = null;
    this._hourlyError = null;

    try {
      if (wantDaily) {
        this._unsubDaily = await subscribeForecast(
          this.hass,
          this._config.entity,
          "daily",
          (items, error) => {
            this._dailyForecast = items;
            this._dailyError = error;
            this.requestUpdate();
          },
        );
      } else {
        this._dailyForecast = [];
        this._destroyChart("daily");
      }
      if (wantHourly) {
        this._unsubHourly = await subscribeForecast(
          this.hass,
          this._config.entity,
          "hourly",
          (items, error) => {
            this._hourlyForecast = items;
            this._hourlyError = error;
            this.requestUpdate();
          },
        );
      } else {
        this._hourlyForecast = [];
        this._destroyChart("hourly");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load forecast";
      if (wantDaily) {
        this._dailyForecast = [];
        this._dailyError = message;
      }
      if (wantHourly) {
        this._hourlyForecast = [];
        this._hourlyError = message;
      }
      this._forecastKey = "";
    } finally {
      this._forecastLoading = false;
    }
  }

  private _destroyChart(mode: "daily" | "hourly"): void {
    if (mode === "daily") {
      this._dailyChart?.destroy();
      this._dailyChart = null;
      this._dailyChartFingerprint = "";
      this._dailyChartModeKey = "";
      this._dailyPlotLeft = 0;
      this._dailyPlotWidth = 0;
    } else {
      this._hourlyChart?.destroy();
      this._hourlyChart = null;
      this._hourlyChartFingerprint = "";
      this._hourlyChartModeKey = "";
      this._hourlyPlotLeft = 0;
      this._hourlyPlotWidth = 0;
    }
  }

  private _destroyCharts(): void {
    this._destroyChart("daily");
    this._destroyChart("hourly");
  }

  private _syncPlotArea(mode: "daily" | "hourly"): void {
    const chart = mode === "daily" ? this._dailyChart : this._hourlyChart;
    if (!chart) return;
    const area = getChartPlotArea(chart);
    if (!area) return;
    if (mode === "daily") {
      if (
        Math.abs(area.left - this._dailyPlotLeft) > 0.5 ||
        Math.abs(area.width - this._dailyPlotWidth) > 0.5
      ) {
        this._dailyPlotLeft = area.left;
        this._dailyPlotWidth = area.width;
      }
    } else if (
      Math.abs(area.left - this._hourlyPlotLeft) > 0.5 ||
      Math.abs(area.width - this._hourlyPlotWidth) > 0.5
    ) {
      this._hourlyPlotLeft = area.left;
      this._hourlyPlotWidth = area.width;
    }
  }

  private _renderCharts(): void {
    if (!this._config) {
      this._destroyCharts();
      return;
    }
    if (this._config.daily.enabled) {
      this._renderOneChart("daily");
    } else {
      this._destroyChart("daily");
    }
    if (this._config.hourly.enabled) {
      this._renderOneChart("hourly");
    } else {
      this._destroyChart("hourly");
    }
  }

  private _chartTextColor(): string {
    const el =
      (this.renderRoot.querySelector(".content") as HTMLElement | null) ??
      (this.renderRoot.querySelector("ha-card") as HTMLElement | null) ??
      this;
    const styles = getComputedStyle(el);
    return (
      styles.getPropertyValue("--primary-text-color").trim() ||
      styles.color ||
      getComputedStyle(this).color
    );
  }

  private _renderOneChart(mode: "daily" | "hourly"): void {
    const canvas = this.renderRoot.querySelector(
      `canvas.forecast-canvas-${mode}`,
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      this._destroyChart(mode);
      return;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    const scene = conditionToScene(
      snap?.condition,
      snap?.isDay ?? true,
    );
    const textColor = this._chartTextColor();
    const chrome = chartChromeForScene(
      this._config.animated_background,
      scene,
      textColor,
    );
    const precipUnit =
      (snap?.entity.attributes.precipitation_unit as string | undefined) ??
      "mm";
    const temperatureUnit = snap?.temperatureUnit ?? "°C";
    const language =
      this.hass.locale?.language ??
      this.hass.language ??
      this.hass.config.language;

    const precipType =
      mode === "daily"
        ? this._config.daily.precip_type
        : this._config.hourly.precip_type;
    const items =
      mode === "daily" ? this._dailyForecast : this._hourlyForecast;
    const series =
      mode === "daily"
        ? buildDailySeries(
            items,
            this._config.daily.days,
            precipType,
            language,
          )
        : buildHourlySeries(
            items,
            this._config.hourly.hours,
            precipType,
            language,
          );

    if (!series.labels.length) {
      this._destroyChart(mode);
      return;
    }

    const modeKey = `${mode}:${precipType}:${precipUnit}:${temperatureUnit}:${textColor}:${this._config.animated_background}:${scene}`;
    const fingerprint = seriesFingerprint(series);
    const existing = mode === "daily" ? this._dailyChart : this._hourlyChart;
    const existingKey =
      mode === "daily" ? this._dailyChartModeKey : this._hourlyChartModeKey;
    const existingFp =
      mode === "daily"
        ? this._dailyChartFingerprint
        : this._hourlyChartFingerprint;

    if (existing && existingKey === modeKey && existingFp === fingerprint) {
      this._syncPlotArea(mode);
      return;
    }

    if (existing && existingKey.split(":")[0] === mode) {
      syncForecastChart(
        existing,
        series,
        mode,
        precipType,
        chrome,
        precipUnit,
        temperatureUnit,
      );
      if (mode === "daily") {
        this._dailyChartFingerprint = fingerprint;
        this._dailyChartModeKey = modeKey;
      } else {
        this._hourlyChartFingerprint = fingerprint;
        this._hourlyChartModeKey = modeKey;
      }
      this._syncPlotArea(mode);
      return;
    }

    this._destroyChart(mode);
    const chart = createForecastChart(
      canvas,
      series,
      mode,
      precipType,
      chrome,
      precipUnit,
      temperatureUnit,
    );
    if (mode === "daily") {
      this._dailyChart = chart;
      this._dailyChartFingerprint = fingerprint;
      this._dailyChartModeKey = modeKey;
    } else {
      this._hourlyChart = chart;
      this._hourlyChartFingerprint = fingerprint;
      this._hourlyChartModeKey = modeKey;
    }
    requestAnimationFrame(() => this._syncPlotArea(mode));
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

  private _renderForecastSection(
    mode: "daily" | "hourly",
    snap: NonNullable<ReturnType<typeof getWeatherSnapshot>>,
    language?: string,
  ) {
    const block =
      mode === "daily" ? this._config.daily : this._config.hourly;
    if (!block.enabled) return nothing;

    const items =
      mode === "daily" ? this._dailyForecast : this._hourlyForecast;
    const error = mode === "daily" ? this._dailyError : this._hourlyError;
    const slice =
      mode === "daily"
        ? items.slice(0, this._config.daily.days)
        : items.slice(0, this._config.hourly.hours);
    const plotLeft =
      mode === "daily" ? this._dailyPlotLeft : this._hourlyPlotLeft;
    const plotWidth =
      mode === "daily" ? this._dailyPlotWidth : this._hourlyPlotWidth;

    return html`
      <div class="forecast forecast-${mode}">
        ${error ? html`<div class="warn">${error}</div>` : nothing}
        ${!error && !slice.length
          ? html`<div class="warn">
              No ${mode} forecast data available on
              <code>${this._config.entity}</code>
            </div>`
          : nothing}
        ${slice.length
          ? html`
              <div class="chart-wrap">
                <canvas class="forecast-canvas-${mode}"></canvas>
              </div>
              <div
                class="forecast-row-slot"
                style=${plotWidth
                  ? `margin-left:${plotLeft}px;width:${plotWidth}px`
                  : ""}
              >
                ${renderForecastRow(this.hass, slice, {
                  showIcons: block.show_condition_icons,
                  showWindSpeed: block.show_wind_speed,
                  showWindDirection: block.show_wind_direction,
                  iconStyle: this._config.icon_style,
                  animated: this._config.animated_icons,
                  windSpeedUnit: snap.windSpeedUnit,
                  mode,
                  language,
                  sunEntity: this._config.sun_entity,
                  weatherEntityId: this._config.entity,
                })}
              </div>
            `
          : nothing}
      </div>
    `;
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
    const showCurrent = this._config.show_current;
    const showDaily = this._config.daily.enabled;
    const showHourly = this._config.hourly.enabled;
    const showDetails =
      showCurrent &&
      (this._config.show_sun ||
        this._config.show_humidity ||
        this._config.show_wind_speed ||
        this._config.show_wind_direction ||
        this._config.show_uv_index ||
        this._config.show_pressure ||
        this._config.show_cloud_coverage ||
        this._config.show_feels_like ||
        this._config.show_dew_point ||
        this._config.show_visibility ||
        this._config.show_precipitation ||
        this._config.show_precipitation_probability);

    if (!showCurrent && !showDaily && !showHourly) {
      return html`
        <ha-card>
          <div class="pad empty">
            Enable a section in the card configuration to show weather content.
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card class=${this._config.animated_background ? "has-bg" : ""}>
        ${renderBackground(
          this._config.animated_background,
          scene,
          snap.cloudCoverage,
        )}
        <div class="content">
          ${showCurrent
            ? html`
                <div class="section section-current">
                  <div class="main">
                    <div class="main-text">
                      <div class="location">${snap.name}</div>
                      <div class="condition">${snap.conditionLabel}</div>
                      <div class="temp">
                        ${formatTemp(snap.temperature, snap.temperatureUnit)}
                      </div>
                    </div>
                    <div
                      class="main-icon"
                      .innerHTML=${this._icon(iconName)}
                    ></div>
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
                                  <span
                                    >${formatTime(
                                      snap.sunrise,
                                      language,
                                    )}</span
                                  >
                                  ${tipWrap(
                                    `Sunset ${formatTime(snap.sunset, language)}`,
                                    html`<span
                                      class="detail-icon"
                                      .innerHTML=${this._icon("sunset")}
                                    ></span>`,
                                  )}
                                  <span
                                    >${formatTime(
                                      snap.sunset,
                                      language,
                                    )}</span
                                  >
                                </span>
                              `
                            : nothing}
                          ${this._config.show_humidity
                            ? this._detail(
                                "humidity",
                                formatNumber(snap.humidity, "%", 0),
                                "Humidity",
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
                          ${this._config.show_uv_index
                            ? this._detail(
                                uvIndexIcon(snap.uvIndex),
                                formatNumber(snap.uvIndex, "", 0),
                                "UV index",
                              )
                            : nothing}
                          ${this._config.show_pressure
                            ? this._detail(
                                "barometer",
                                formatNumber(
                                  snap.pressure,
                                  ` ${snap.pressureUnit}`,
                                  0,
                                ),
                                "Pressure",
                              )
                            : nothing}
                          ${this._config.show_cloud_coverage
                            ? this._detail(
                                "cloudy",
                                formatNumber(snap.cloudCoverage, "%", 0),
                                "Cloud coverage",
                              )
                            : nothing}
                          ${this._config.show_feels_like
                            ? this._detail(
                                "thermometer",
                                formatNumber(
                                  snap.feelsLike,
                                  snap.temperatureUnit,
                                ),
                                "Feels like",
                              )
                            : nothing}
                          ${this._config.show_dew_point
                            ? this._detail(
                                "thermometer-raindrop",
                                formatNumber(
                                  snap.dewPoint,
                                  snap.temperatureUnit,
                                ),
                                "Dew point",
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
                          ${this._config.show_precipitation
                            ? this._detail(
                                "rain",
                                formatPrecip(
                                  snap.precipitation,
                                  snap.precipitationUnit,
                                ),
                                "Precipitation",
                              )
                            : nothing}
                          ${this._config.show_precipitation_probability
                            ? this._detail(
                                "rain",
                                formatNumber(
                                  snap.precipitationProbability,
                                  "%",
                                  0,
                                ),
                                "Precipitation probability",
                              )
                            : nothing}
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}

          ${showDaily
            ? html`
                <div class="section section-daily">
                  ${this._renderForecastSection("daily", snap, language)}
                </div>
              `
            : nothing}
          ${showHourly
            ? html`
                <div class="section section-hourly">
                  ${this._renderForecastSection("hourly", snap, language)}
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
      .empty {
        opacity: 0.75;
        text-align: center;
        font-size: 0.95rem;
      }
      .warn {
        opacity: 0.9;
        font-size: 0.9rem;
      }
      .section + .section {
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px solid
          color-mix(in srgb, currentColor 18%, transparent);
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
        justify-content: flex-start;
        align-items: center;
        gap: 8px 16px;
        margin-top: 14px;
        font-size: 0.9rem;
        opacity: 0.95;
      }
      .detail {
        display: inline-flex;
        align-items: center;
        gap: 6px;
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
        margin-top: 0;
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
        margin-top: 2px;
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
