import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Chart } from "chart.js";
import { formatAlertDateTime } from "./alerts/format";
import { resolveAlerts } from "./alerts/resolve";
import {
  highestSeverityIcon,
  severityAccentClass,
  summaryLabel,
  alertIconName,
} from "./alerts/summary";
import type { WeatherAlert } from "./alerts/types";
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
  normalizeEditorConfig,
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
  @state() private _alertsOpen = false;
  @state() private _selectedAlertId: string | null = null;

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
    _entities: string[],
  ): Partial<VedurkortCardConfig> {
    return { ...DEFAULT_CONFIG };
  }

  public setConfig(config: Partial<VedurkortCardConfig>): void {
    this._config = config.entity
      ? normalizeConfig(config)
      : (normalizeEditorConfig(config) as VedurkortCardConfig);
  }

  public getCardSize(): number {
    if (!this._config) return 3;
    let size = this._config.show_current ? 3 : 1;
    if (this._config.daily.enabled) size += 3;
    if (this._config.hourly.enabled) size += 3;
    if (
      this._config.show_alerts &&
      this.hass &&
      resolveAlerts(this.hass, this._config).length > 0
    ) {
      size += 1;
    }
    return size;
  }

  protected updated(changed: Map<string, unknown>): void {
    if (
      (changed.has("hass") || changed.has("_config")) &&
      this._config &&
      this.hass
    ) {
      void this._ensureForecastSubscription();
      if (
        this._alertsOpen &&
        resolveAlerts(this.hass, this._config).length === 0
      ) {
        this._alertsOpen = false;
      }
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

  private _openAlerts(alerts: WeatherAlert[], preferredId?: string): void {
    this._selectedAlertId = preferredId ?? alerts[0]?.id ?? null;
    this._alertsOpen = true;
  }

  private _closeAlerts(): void {
    this._alertsOpen = false;
  }

  private _renderAlertsStrip(alerts: WeatherAlert[]) {
    if (!alerts.length) return nothing;
    const top = alerts[0]!;
    const icon = highestSeverityIcon(alerts);
    return html`
      <button
        type="button"
        class="alerts-strip ${severityAccentClass(top)}"
        @click=${() => this._openAlerts(alerts)}
        aria-haspopup="dialog"
      >
        <span class="alerts-strip-icon" .innerHTML=${this._icon(icon)}></span>
        <span class="alerts-strip-label">${summaryLabel(alerts)}</span>
        <span class="alerts-strip-chevron" aria-hidden="true">›</span>
      </button>
    `;
  }

  private _renderAlertsDialog(alerts: WeatherAlert[], language?: string) {
    if (!this._alertsOpen || !alerts.length) return nothing;

    const selected =
      alerts.find((a) => a.id === this._selectedAlertId) ?? alerts[0]!;

    return html`
      <ha-dialog
        open
        @closed=${() => this._closeAlerts()}
        .heading=${"Weather alerts"}
      >
        <div class="alerts-dialog">
          <ul class="alerts-list">
            ${alerts.map(
              (alert) => html`
                <li>
                  <button
                    type="button"
                    class="alerts-list-item ${severityAccentClass(alert)} ${alert.id === selected.id
                      ? "is-selected"
                      : ""}"
                    @click=${() => {
                      this._selectedAlertId = alert.id;
                    }}
                  >
                    <span
                      class="alerts-list-icon"
                      .innerHTML=${this._icon(alertIconName(alert))}
                    ></span>
                    <span class="alerts-list-text">
                      <span class="alerts-list-title"
                        >${alert.headline || alert.event}</span
                      >
                      <span class="alerts-list-meta"
                        >${alert.severityLabel}${alert.awarenessColor
                          ? ` · ${alert.awarenessColor}`
                          : ""}</span
                      >
                    </span>
                  </button>
                </li>
              `,
            )}
          </ul>
          <div class="alerts-detail">
            <div class="alerts-detail-title">
              ${selected.headline || selected.event}
            </div>
            <div class="alerts-detail-meta">
              <span>${selected.severityLabel}</span>
              ${selected.event && selected.event !== selected.headline
                ? html`<span>· ${selected.event}</span>`
                : nothing}
            </div>
            <dl class="alerts-times">
              <div>
                <dt>Onset</dt>
                <dd>${formatAlertDateTime(selected.onset, language)}</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>${formatAlertDateTime(selected.expires, language)}</dd>
              </div>
            </dl>
            ${selected.description
              ? html`<p class="alerts-body">${selected.description}</p>`
              : nothing}
            ${selected.instruction
              ? html`<p class="alerts-instruction">
                  <strong>Instructions</strong><br />${selected.instruction}
                </p>`
              : nothing}
          </div>
        </div>
        <mwc-button slot="primaryAction" dialogAction="close">Close</mwc-button>
      </ha-dialog>
    `;
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

    if (!this._config.entity) {
      return html`
        <ha-card>
          <div class="pad empty">
            Configure a weather entity for this card.
          </div>
        </ha-card>
      `;
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

    const iconName = conditionToMeteocon(
      snap.condition,
      snap.isDay,
      snap.cloudCoverage,
    );
    const scene = conditionToScene(snap.condition, snap.isDay);
    const language =
      this.hass.locale?.language ??
      this.hass.language ??
      this.hass.config.language;

    const bft = windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit);
    const showCurrent = this._config.show_current;
    const showDaily = this._config.daily.enabled;
    const showHourly = this._config.hourly.enabled;
    const alerts = resolveAlerts(this.hass, this._config);
    const showAlertsStrip = alerts.length > 0;
    const showDetails =
      showCurrent &&
      (this._config.show_sun ||
        this._config.show_humidity ||
        this._config.show_wind_speed ||
        this._config.show_wind_direction ||
        this._config.show_uv_index ||
        this._config.show_pressure ||
        this._config.show_cloud_coverage ||
        this._config.show_dew_point ||
        this._config.show_visibility ||
        this._config.show_precipitation ||
        this._config.show_precipitation_probability);
    const feelsLikeText = this._config.show_feels_like
      ? formatNumber(snap.feelsLike, snap.temperatureUnit)
      : null;

    if (!showCurrent && !showDaily && !showHourly && !showAlertsStrip) {
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
                      ${this._renderAlertsStrip(alerts)}
                      <div class="temp-row">
                        <div class="temp">
                          ${formatTemp(snap.temperature, snap.temperatureUnit)}
                        </div>
                        ${feelsLikeText
                          ? html`<div class="feels-like">
                              Feels like ${feelsLikeText}
                            </div>`
                          : nothing}
                      </div>
                      <div class="condition">${snap.conditionLabel}</div>
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
                            ? snap.isDay
                              ? this._detail(
                                  "sunset",
                                  formatTime(snap.sunset, language),
                                  "Sunset",
                                )
                              : this._detail(
                                  "sunrise",
                                  formatTime(snap.sunrise, language),
                                  "Sunrise",
                                )
                            : nothing}
                          ${this._config.show_humidity
                            ? this._detail(
                                "humidity",
                                formatNumber(snap.humidity, "%", 0),
                                "Humidity",
                              )
                            : nothing}
                          ${this._config.show_wind_speed &&
                          snap.windSpeed != null
                            ? tipWrap(
                                `Wind ${Math.round(snap.windSpeed)} ${snap.windSpeedUnit} (Beaufort ${bft})`,
                                html`
                                  <span
                                    class="detail-icon"
                                    .innerHTML=${this._icon(beaufortIcon(bft))}
                                  ></span>
                                  <span
                                    >${Math.round(snap.windSpeed)}
                                    ${snap.windSpeedUnit}</span
                                  >
                                `,
                                "detail",
                              )
                            : nothing}
                          ${this._config.show_wind_direction
                            ? this._detail(
                                bearingToWindIcon(
                                  snap.windBearing ?? undefined,
                                ),
                                bearingToLabel(
                                  snap.windBearing ?? undefined,
                                ),
                                "Wind direction",
                              )
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
            : showAlertsStrip
              ? html`<div class="section section-alerts">
                  ${this._renderAlertsStrip(alerts)}
                </div>`
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
        ${this._renderAlertsDialog(alerts, language)}
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
      .section-current {
        container-type: inline-size;
        container-name: current;
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
      .alerts-strip {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        margin-top: 8px;
        margin-bottom: 2px;
        padding: 6px 8px;
        border: 1px solid color-mix(in srgb, var(--vk-alert-accent, #f59e0b) 55%, transparent);
        border-radius: 8px;
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 16%,
          transparent
        );
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
      }
      .alerts-strip:hover,
      .alerts-strip:focus-visible {
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 26%,
          transparent
        );
        outline: none;
      }
      .alerts-strip.sev-yellow {
        --vk-alert-accent: #eab308;
      }
      .alerts-strip.sev-orange {
        --vk-alert-accent: #f97316;
      }
      .alerts-strip.sev-red {
        --vk-alert-accent: #ef4444;
      }
      .alerts-strip.sev-purple {
        --vk-alert-accent: #a855f7;
      }
      .alerts-strip.sev-unknown {
        --vk-alert-accent: #94a3b8;
      }
      .alerts-strip-icon {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        display: inline-flex;
      }
      .alerts-strip-icon svg {
        width: 100%;
        height: 100%;
      }
      .alerts-strip-label {
        flex: 1;
        min-width: 0;
        font-size: 0.88rem;
        font-weight: 600;
        line-height: 1.25;
      }
      .alerts-strip-chevron {
        opacity: 0.7;
        font-size: 1.2rem;
        line-height: 1;
      }
      .alerts-dialog {
        display: grid;
        gap: 14px;
        max-width: min(520px, 92vw);
      }
      .alerts-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 6px;
        max-height: 40vh;
        overflow: auto;
      }
      .alerts-list-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px;
        border-radius: 8px;
        border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
        border-left: 3px solid var(--vk-alert-accent, #94a3b8);
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .alerts-list-item.sev-yellow {
        --vk-alert-accent: #eab308;
      }
      .alerts-list-item.sev-orange {
        --vk-alert-accent: #f97316;
      }
      .alerts-list-item.sev-red {
        --vk-alert-accent: #ef4444;
      }
      .alerts-list-item.sev-purple {
        --vk-alert-accent: #a855f7;
      }
      .alerts-list-item.is-selected {
        background: color-mix(in srgb, currentColor 8%, transparent);
      }
      .alerts-list-icon {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }
      .alerts-list-icon svg {
        width: 100%;
        height: 100%;
      }
      .alerts-list-text {
        display: grid;
        gap: 2px;
        min-width: 0;
      }
      .alerts-list-title {
        font-weight: 600;
        font-size: 0.92rem;
      }
      .alerts-list-meta {
        font-size: 0.8rem;
        opacity: 0.75;
        text-transform: capitalize;
      }
      .alerts-detail {
        display: grid;
        gap: 8px;
        padding-top: 4px;
        border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent);
        max-height: 45vh;
        overflow: auto;
      }
      .alerts-detail-title {
        font-size: 1.05rem;
        font-weight: 650;
      }
      .alerts-detail-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        font-size: 0.85rem;
        opacity: 0.8;
      }
      .alerts-times {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 0;
        font-size: 0.85rem;
      }
      .alerts-times dt {
        opacity: 0.65;
        font-size: 0.75rem;
        margin: 0;
      }
      .alerts-times dd {
        margin: 2px 0 0;
        font-weight: 600;
      }
      .alerts-body,
      .alerts-instruction {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.45;
        white-space: pre-wrap;
      }
      .alerts-instruction {
        opacity: 0.92;
      }
      .condition {
        text-transform: capitalize;
        opacity: 0.8;
        font-size: 0.95rem;
        margin-top: 2px;
      }
      .temp-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 10px;
        margin-top: 4px;
      }
      .temp {
        font-size: 2.4rem;
        font-weight: 650;
        line-height: 1.1;
      }
      .feels-like {
        opacity: 0.8;
        font-size: 0.95rem;
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
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 12px;
        row-gap: 10px;
        margin-top: 14px;
        font-size: 0.9rem;
        opacity: 0.95;
      }
      @container current (min-width: 380px) {
        .details {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .detail {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
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
