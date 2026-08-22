import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Chart } from "chart.js";
import { formatAlertDateTime, formatAlertTimeStatus, sanitizeAlertHtml } from "./alerts/format";
import { resolveAlerts } from "./alerts/resolve";
import {
  highestSeverityIcon,
  severityAccentClass,
  summaryLabel,
  alertIconName,
  alertTitle,
  alertSubtitle,
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

/** Tiny map pin for alert location line (not MDI / not Meteocon). */
const LOCATION_PIN = html`
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
    <path
      d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"
    />
  </svg>
`;

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
  @state() private _expandedAlertIds: string[] = [];

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
    this._expandedAlertIds = preferredId
      ? [preferredId]
      : alerts[0]
        ? [alerts[0].id]
        : [];
    this._alertsOpen = true;
  }

  private _closeAlerts(): void {
    this._alertsOpen = false;
    this._expandedAlertIds = [];
  }

  private _toggleAlertExpanded(id: string): void {
    this._expandedAlertIds = this._expandedAlertIds.includes(id)
      ? this._expandedAlertIds.filter((x) => x !== id)
      : [...this._expandedAlertIds, id];
  }

  private _renderAlertsStrip(alerts: WeatherAlert[]) {
    if (!alerts.length) return nothing;
    const top = alerts[0]!;
    const icon = highestSeverityIcon(alerts);
    const single = alerts.length === 1;
    const timeStatus = single ? formatAlertTimeStatus(top) : "";
    return html`
      <button
        type="button"
        class="alerts-strip ${single ? "alerts-strip--single" : "alerts-strip--multi"} ${severityAccentClass(top)}"
        @click=${() => this._openAlerts(alerts)}
        aria-haspopup="dialog"
      >
        <span class="alerts-strip-icon" .innerHTML=${this._icon(icon)}></span>
        <span class="alerts-strip-text">
          <span class="alerts-strip-label">${summaryLabel(alerts)}</span>
          ${timeStatus
            ? html`<span class="alerts-strip-sub">${timeStatus}</span>`
            : nothing}
        </span>
        <span class="alerts-strip-chevron" aria-hidden="true">›</span>
      </button>
    `;
  }

  private _renderAlertBadges(alert: WeatherAlert) {
    return html`
      <div class="alerts-badges">
        <span class="alerts-badge ${severityAccentClass(alert)}"
          >${alert.severityLabel}</span
        >
        ${alert.phase
          ? html`<span class="alerts-badge alerts-badge-phase"
              >${alert.phase}</span
            >`
          : nothing}
      </div>
    `;
  }

  private _renderAlertsDialog(alerts: WeatherAlert[], language?: string) {
    if (!this._alertsOpen || !alerts.length) return nothing;

    return html`
      <div
        class="alerts-modal-root"
        role="presentation"
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === "Escape") this._closeAlerts();
        }}
      >
        <div
          class="alerts-modal-backdrop"
          @click=${() => this._closeAlerts()}
        ></div>
        <div
          class="alerts-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Weather alerts"
          tabindex="-1"
        >
          <div class="alerts-modal-header">
            <h2 class="alerts-modal-title">Weather alerts</h2>
            <button
              type="button"
              class="alerts-modal-close"
              @click=${() => this._closeAlerts()}
            >
              Close
            </button>
          </div>
          <ul class="alerts-accordion">
            ${alerts.map((alert) => {
              const expanded = this._expandedAlertIds.includes(alert.id);
              const subtitle = alertSubtitle(alert);
              const relative = formatAlertTimeStatus(alert);
              return html`
                <li
                  class="alerts-acc-item ${severityAccentClass(alert)}${expanded
                    ? " is-expanded"
                    : ""}"
                >
                  <button
                    type="button"
                    class="alerts-acc-header"
                    aria-expanded=${expanded}
                    @click=${() => this._toggleAlertExpanded(alert.id)}
                  >
                    <span
                      class="alerts-acc-icon"
                      .innerHTML=${this._icon(alertIconName(alert))}
                    ></span>
                    <span class="alerts-acc-main">
                      <span class="alerts-acc-title">${alertTitle(alert)}</span>
                      ${subtitle
                        ? html`<span class="alerts-acc-sub">
                            <span class="alerts-acc-pin" aria-hidden="true"
                              >${LOCATION_PIN}</span
                            >
                            <span>${subtitle}</span>
                          </span>`
                        : nothing}
                      ${this._renderAlertBadges(alert)}
                      ${relative
                        ? html`<span class="alerts-acc-time">${relative}</span>`
                        : nothing}
                    </span>
                    <span class="alerts-acc-chevron" aria-hidden="true"
                      >${expanded ? "▾" : "›"}</span
                    >
                  </button>
                  ${expanded
                    ? html`
                        <div class="alerts-acc-body">
                          <dl class="alerts-times">
                            <div>
                              <dt>Onset</dt>
                              <dd>
                                ${formatAlertDateTime(alert.onset, language)}
                              </dd>
                            </div>
                            <div>
                              <dt>Expires</dt>
                              <dd>
                                ${formatAlertDateTime(alert.expires, language)}
                              </dd>
                            </div>
                          </dl>
                          ${alert.description
                            ? html`<div
                                class="alerts-body"
                                .innerHTML=${sanitizeAlertHtml(
                                  alert.description,
                                )}
                              ></div>`
                            : nothing}
                          ${alert.instruction
                            ? html`<div class="alerts-instruction">
                                <strong>Instructions</strong>
                                <div
                                  .innerHTML=${sanitizeAlertHtml(
                                    alert.instruction,
                                  )}
                                ></div>
                              </div>`
                            : nothing}
                        </div>
                      `
                    : nothing}
                </li>
              `;
            })}
          </ul>
        </div>
      </div>
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
    const showName = this._config.show_name;
    const showNameInCurrent = showName && showCurrent;
    const showNameHeader = showName && !showCurrent;
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
          ${showNameHeader
            ? html`
                <div class="section section-header">
                  <div class="location">${snap.name}</div>
                </div>
              `
            : nothing}
          ${showCurrent
            ? html`
                <div class="section section-current">
                  <div class="main">
                    <div class="main-text">
                      ${showNameInCurrent
                        ? html`<div class="location">${snap.name}</div>`
                        : nothing}
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

                  ${showAlertsStrip
                    ? this._renderAlertsStrip(alerts)
                    : nothing}

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
      </ha-card>
      ${this._renderAlertsDialog(alerts, language)}
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
      .section-header + .section {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
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
        margin-top: 12px;
        margin-bottom: 0;
        border: 1px solid color-mix(in srgb, var(--vk-alert-accent, #f59e0b) 70%, transparent);
        border-radius: 8px;
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 38%,
          var(--card-background-color, #fff) 40%
        );
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
      }
      .alerts-strip--single {
        padding: 8px 10px;
      }
      .alerts-strip--multi {
        padding: 5px 10px;
      }
      .section-current .alerts-strip + .details {
        margin-top: 12px;
      }
      .alerts-strip:hover,
      .alerts-strip:focus-visible {
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 48%,
          var(--card-background-color, #fff) 30%
        );
        outline: none;
      }
      .alerts-strip.sev-green {
        --vk-alert-accent: #22c55e;
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
      ha-card.has-bg .alerts-strip {
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 42%,
          rgba(0, 0, 0, 0.4)
        );
        border-color: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 80%,
          #fff
        );
      }
      ha-card.has-bg .alerts-strip:hover,
      ha-card.has-bg .alerts-strip:focus-visible {
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #f59e0b) 52%,
          rgba(0, 0, 0, 0.35)
        );
      }
      .alerts-strip-icon {
        flex-shrink: 0;
        display: inline-flex;
      }
      .alerts-strip--single .alerts-strip-icon {
        width: 28px;
        height: 28px;
      }
      .alerts-strip--multi .alerts-strip-icon {
        width: 22px;
        height: 22px;
      }
      .alerts-strip-icon svg {
        width: 100%;
        height: 100%;
      }
      .alerts-strip-text {
        flex: 1;
        min-width: 0;
        display: grid;
        gap: 2px;
      }
      .alerts-strip-label {
        font-size: 0.88rem;
        font-weight: 600;
        line-height: 1.25;
      }
      .alerts-strip--multi .alerts-strip-label {
        font-size: 0.84rem;
        font-weight: 650;
      }
      .alerts-strip-sub {
        font-size: 0.78rem;
        font-weight: 500;
        opacity: 0.82;
        line-height: 1.2;
      }
      .alerts-strip-chevron {
        opacity: 0.7;
        font-size: 1.2rem;
        line-height: 1;
      }
      .alerts-modal-root {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
      }
      .alerts-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
      }
      .alerts-modal {
        position: relative;
        z-index: 1;
        width: min(520px, 100%);
        max-height: min(85vh, 720px);
        overflow: auto;
        border-radius: 12px;
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
        padding: 14px 16px 16px;
        box-sizing: border-box;
      }
      .alerts-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }
      .alerts-modal-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 650;
      }
      .alerts-modal-close {
        appearance: none;
        border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
        background: color-mix(in srgb, currentColor 6%, transparent);
        color: inherit;
        border-radius: 8px;
        padding: 6px 12px;
        font: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
      }
      .alerts-modal-close:hover,
      .alerts-modal-close:focus-visible {
        background: color-mix(in srgb, currentColor 12%, transparent);
        outline: none;
      }
      .alerts-accordion {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }
      .alerts-acc-item {
        border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
        border-left: 3px solid var(--vk-alert-accent, #94a3b8);
        border-radius: 10px;
        overflow: hidden;
        background: color-mix(in srgb, currentColor 3%, transparent);
        transition: background 0.15s ease, border-color 0.15s ease;
      }
      .alerts-acc-item:hover,
      .alerts-acc-item:has(.alerts-acc-header:focus-visible) {
        background: color-mix(in srgb, currentColor 7%, transparent);
        border-color: color-mix(in srgb, currentColor 22%, transparent);
      }
      .alerts-acc-item.sev-green {
        --vk-alert-accent: #22c55e;
      }
      .alerts-acc-item.sev-yellow {
        --vk-alert-accent: #eab308;
      }
      .alerts-acc-item.sev-orange {
        --vk-alert-accent: #f97316;
      }
      .alerts-acc-item.sev-red {
        --vk-alert-accent: #ef4444;
      }
      .alerts-acc-item.sev-purple {
        --vk-alert-accent: #a855f7;
      }
      .alerts-acc-item.sev-unknown {
        --vk-alert-accent: #94a3b8;
      }
      .alerts-acc-header {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .alerts-acc-header:focus-visible {
        outline: none;
      }
      .alerts-acc-item.is-expanded .alerts-acc-header {
        padding-bottom: 8px;
      }
      .alerts-acc-icon {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .alerts-acc-icon svg {
        width: 100%;
        height: 100%;
      }
      .alerts-acc-main {
        display: grid;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }
      .alerts-acc-title {
        font-weight: 650;
        font-size: 0.95rem;
        line-height: 1.25;
      }
      .alerts-acc-sub {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.82rem;
        opacity: 0.78;
        line-height: 1.3;
      }
      .alerts-acc-pin {
        display: inline-flex;
        flex-shrink: 0;
        opacity: 0.85;
      }
      .alerts-acc-pin svg {
        display: block;
      }
      .alerts-acc-time {
        font-size: 0.8rem;
        opacity: 0.72;
      }
      .alerts-acc-chevron {
        opacity: 0.65;
        font-size: 1.1rem;
        line-height: 1;
        margin-top: 4px;
      }
      .alerts-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .alerts-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        text-transform: capitalize;
        background: color-mix(
          in srgb,
          var(--vk-alert-accent, #94a3b8) 22%,
          transparent
        );
        color: inherit;
        border: 1px solid
          color-mix(in srgb, var(--vk-alert-accent, #94a3b8) 45%, transparent);
      }
      .alerts-badge.sev-green {
        --vk-alert-accent: #22c55e;
      }
      .alerts-badge.sev-yellow {
        --vk-alert-accent: #eab308;
      }
      .alerts-badge.sev-orange {
        --vk-alert-accent: #f97316;
      }
      .alerts-badge.sev-red {
        --vk-alert-accent: #ef4444;
      }
      .alerts-badge.sev-purple {
        --vk-alert-accent: #a855f7;
      }
      .alerts-badge.sev-unknown {
        --vk-alert-accent: #94a3b8;
      }
      .alerts-badge-phase {
        --vk-alert-accent: color-mix(in srgb, currentColor 55%, transparent);
        font-weight: 600;
        text-transform: none;
      }
      .alerts-acc-body {
        display: grid;
        gap: 10px;
        padding: 0 12px 12px 54px;
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
      }
      .alerts-body {
        white-space: normal;
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
