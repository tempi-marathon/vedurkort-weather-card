import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  backgroundStyles,
  conditionToScene,
  renderBackground,
} from "./backgrounds/scenes";
import {
  buildDailySeries,
  buildHourlySeries,
  createForecastChart,
} from "./charts/forecast-chart";
import { renderForecastRow } from "./charts/forecast-row";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  type VedurkortCardConfig,
} from "./config";
import { bearingToLabel, bearingToWindIcon, conditionToMeteocon } from "./icons/condition-map";
import { getMeteoconSvg } from "./icons/meteocons";
import type { ForecastItem, HomeAssistant, LovelaceCardEditor } from "./types";
import {
  fetchForecast,
  formatTemp,
  formatTime,
  getWeatherSnapshot,
} from "./weather/adapter";
import type { Chart } from "chart.js";

@customElement("vedurkort-weather-card")
export class VedurkortWeatherCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: VedurkortCardConfig;
  @state() private _forecast: ForecastItem[] = [];
  @state() private _forecastError: string | null = null;

  private _chart: Chart | null = null;
  private _forecastKey = "";

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
      void this._loadForecastIfNeeded();
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
    this._destroyChart();
  }

  private async _loadForecastIfNeeded(): Promise<void> {
    const layout = this._config.layout;
    if (layout === "basic") {
      this._forecast = [];
      this._forecastKey = "";
      return;
    }
    const key = `${this._config.entity}:${layout}`;
    if (key === this._forecastKey && this._forecast.length) return;
    this._forecastKey = key;
    try {
      this._forecast = await fetchForecast(
        this.hass,
        this._config.entity,
        layout === "daily" ? "daily" : "hourly",
      );
      this._forecastError = null;
    } catch (err) {
      this._forecast = [];
      this._forecastError =
        err instanceof Error ? err.message : "Failed to load forecast";
    }
  }

  private _destroyChart(): void {
    this._chart?.destroy();
    this._chart = null;
  }

  private _renderChart(): void {
    const canvas = this.renderRoot.querySelector(
      "canvas.forecast-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas || !this._config || this._config.layout === "basic") {
      this._destroyChart();
      return;
    }
    const language =
      this.hass.locale?.language ?? this.hass.config.language;
    const series =
      this._config.layout === "daily"
        ? buildDailySeries(
            this._forecast,
            this._config.daily.days,
            this._config.daily.precip_type,
            language,
          )
        : buildHourlySeries(
            this._forecast,
            this._config.hourly.hours,
            this._config.hourly.precip_type,
            language,
          );

    this._destroyChart();
    if (!series.labels.length) return;
    this._chart = createForecastChart(
      canvas,
      series,
      this._config.layout === "daily" ? "daily" : "hourly",
      this._config.layout === "daily"
        ? this._config.daily.precip_type
        : this._config.hourly.precip_type,
    );
  }

  protected render() {
    if (!this._config) {
      return html``;
    }
    if (!this.hass) {
      return html`<ha-card><div class="pad">Waiting for Home Assistant…</div></ha-card>`;
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
    const iconSvg = getMeteoconSvg(
      iconName,
      this._config.icon_style,
      this._config.animated_icons,
    );
    const scene = conditionToScene(snap.condition, snap.isDay);
    const language =
      this.hass.locale?.language ?? this.hass.config.language;

    const showDetails =
      this._config.show_sun ||
      this._config.show_humidity ||
      this._config.show_wind_speed ||
      this._config.show_wind_direction;

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
        ${renderBackground(this._config.animated_background, scene)}
        <div class="content">
          <div class="main">
            <div class="main-text">
              <div class="location">${snap.name}</div>
              <div class="condition">${snap.condition.replace(/-/g, " ")}</div>
              <div class="temp">
                ${formatTemp(snap.temperature, snap.temperatureUnit)}
              </div>
            </div>
            <div class="main-icon" .innerHTML=${iconSvg}></div>
          </div>

          ${showDetails
            ? html`
                <div class="details">
                  ${this._config.show_sun
                    ? html`
                        <div class="detail">
                          <span
                            class="detail-icon"
                            .innerHTML=${getMeteoconSvg(
                              "sunrise",
                              this._config.icon_style,
                              this._config.animated_icons,
                            )}
                          ></span>
                          <span>${formatTime(snap.sunrise, language)}</span>
                          <span
                            class="detail-icon"
                            .innerHTML=${getMeteoconSvg(
                              "sunset",
                              this._config.icon_style,
                              this._config.animated_icons,
                            )}
                          ></span>
                          <span>${formatTime(snap.sunset, language)}</span>
                        </div>
                      `
                    : nothing}
                  ${this._config.show_humidity
                    ? html`
                        <div class="detail">
                          <span
                            class="detail-icon"
                            .innerHTML=${getMeteoconSvg(
                              "humidity",
                              this._config.icon_style,
                              this._config.animated_icons,
                            )}
                          ></span>
                          <span
                            >${snap.humidity != null
                              ? `${Math.round(snap.humidity)}%`
                              : "—"}</span
                          >
                        </div>
                      `
                    : nothing}
                  ${this._config.show_wind_speed ||
                  this._config.show_wind_direction
                    ? html`
                        <div class="detail">
                          ${this._config.show_wind_direction
                            ? html`<span
                                class="detail-icon"
                                .innerHTML=${getMeteoconSvg(
                                  bearingToWindIcon(
                                    snap.windBearing ?? undefined,
                                  ),
                                  this._config.icon_style,
                                  this._config.animated_icons,
                                )}
                              ></span>`
                            : nothing}
                          ${this._config.show_wind_direction
                            ? html`<span
                                >${bearingToLabel(
                                  snap.windBearing ?? undefined,
                                )}</span
                              >`
                            : nothing}
                          ${this._config.show_wind_speed
                            ? html`<span
                                >${snap.windSpeed != null
                                  ? `${Math.round(snap.windSpeed)} ${snap.windSpeedUnit}`
                                  : "—"}</span
                              >`
                            : nothing}
                        </div>
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
                    ? html`<div class="warn">No forecast data available</div>`
                    : nothing}
                  ${forecastSlice.length
                    ? html`
                        <div class="chart-wrap">
                          <canvas class="forecast-canvas"></canvas>
                        </div>
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
                        })}
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
        gap: 12px 18px;
        margin-top: 14px;
        font-size: 0.9rem;
        opacity: 0.95;
      }
      .detail {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .detail-icon {
        width: 22px;
        height: 22px;
        display: inline-flex;
      }
      .detail-icon svg {
        width: 100%;
        height: 100%;
      }
      .forecast {
        margin-top: 16px;
      }
      .chart-wrap {
        height: 180px;
        width: 100%;
      }
      .forecast-row {
        display: grid;
        grid-template-columns: repeat(var(--cols, 5), minmax(0, 1fr));
        gap: 4px;
        margin-top: 8px;
      }
      .forecast-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .forecast-icon {
        width: 36px;
        height: 36px;
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
      .wind-icon {
        width: 20px;
        height: 20px;
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
