import { html, nothing, type TemplateResult } from "lit";
import type { WeatherAlert } from "../alerts/types";
import type { VedurkortCardConfig } from "../config";
import type { DetailMetricId } from "../details/types";
import {
  bearingToLabel,
  bearingToWindIcon,
  beaufortIcon,
  uvIndexIcon,
  windSpeedToBeaufort,
} from "../icons/condition-map";
import type { MeteoconName } from "../icons/allowlist";
import { localize } from "../localize";
import { tipWrap } from "../ui/tooltip";
import {
  formatNumber,
  formatPrecip,
  formatTemp,
  formatTime,
  type WeatherSnapshot,
} from "../weather/adapter";
import {
  renderAlertsStrip,
  type IconRenderer,
} from "./alerts-section";

export interface CurrentWeatherContext {
  config: VedurkortCardConfig;
  snap: WeatherSnapshot;
  iconName: MeteoconName;
  language: string | undefined;
  alerts: WeatherAlert[];
  showAlertsStrip: boolean;
  showDetails: boolean;
  showNameInCurrent: boolean;
  feelsLikeText: string | null;
  conditionText: string;
  bft: number;
  gustBft: number;
}

function renderDetailButton(
  icon: IconRenderer,
  iconName: MeteoconName,
  text: string | null,
  label: string,
  metricId: DetailMetricId,
  onOpenDetail: (id: DetailMetricId) => void,
): TemplateResult | typeof nothing {
  if (!text) return nothing;
  const tip = `${label}: ${text}`;
  return tipWrap(
    tip,
    html`
      <button
        type="button"
        class="detail"
        aria-label=${tip}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onOpenDetail(metricId);
        }}
      >
        <span class="detail-icon" .innerHTML=${icon(iconName)}></span>
        <span>${text}</span>
      </button>
    `,
    "detail",
  );
}

export function renderCurrentWeatherSection(
  ctx: CurrentWeatherContext,
  icon: IconRenderer,
  onOpenAlerts: (alerts: WeatherAlert[]) => void,
  onOpenDetail: (id: DetailMetricId) => void,
): TemplateResult {
  const { config, snap, language } = ctx;

  return html`
    <div class="section section-current">
      <div class="main action-target">
        <div class="main-text">
          ${ctx.showNameInCurrent
            ? html`<div class="location">${snap.name}</div>`
            : nothing}
          <div class="temp-row">
            <div class="temp">
              ${formatTemp(snap.temperature, snap.temperatureUnit)}
            </div>
            ${ctx.feelsLikeText
              ? html`<div class="feels-like">
                  ${localize("feels_like", language)} ${ctx.feelsLikeText}
                </div>`
              : nothing}
          </div>
          <div class="condition">${ctx.conditionText}</div>
        </div>
        <div class="main-icon" .innerHTML=${icon(ctx.iconName)}></div>
      </div>

      ${ctx.showAlertsStrip
        ? renderAlertsStrip(ctx.alerts, icon, language, onOpenAlerts)
        : nothing}

      ${ctx.showDetails
        ? html`
            <div class="details">
              ${config.show_sun
                ? snap.isDay
                  ? renderDetailButton(
                      icon,
                      "sunset",
                      formatTime(snap.sunset, language),
                      localize("sunset", language),
                      "sun",
                      onOpenDetail,
                    )
                  : renderDetailButton(
                      icon,
                      "sunrise",
                      formatTime(snap.sunrise, language),
                      localize("sunrise", language),
                      "sun",
                      onOpenDetail,
                    )
                : nothing}
              ${config.show_humidity
                ? renderDetailButton(
                    icon,
                    "humidity",
                    formatNumber(snap.humidity, "%", 0),
                    localize("humidity", language),
                    "humidity",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_wind_speed && snap.windSpeed != null
                ? tipWrap(
                    localize("wind_tip", language, {
                      speed: `${Math.round(snap.windSpeed)} ${snap.windSpeedUnit}`,
                      bft: String(ctx.bft),
                    }),
                    html`
                      <button
                        type="button"
                        class="detail"
                        aria-label=${localize("wind_speed", language)}
                        @click=${(ev: Event) => {
                          ev.stopPropagation();
                          onOpenDetail("wind_speed");
                        }}
                      >
                        <span
                          class="detail-icon"
                          .innerHTML=${icon(beaufortIcon(ctx.bft))}
                        ></span>
                        <span
                          >${Math.round(snap.windSpeed)}
                          ${snap.windSpeedUnit}</span
                        >
                      </button>
                    `,
                    "detail",
                  )
                : nothing}
              ${config.show_wind_gust && snap.windGust != null
                ? tipWrap(
                    localize("wind_tip", language, {
                      speed: `${Math.round(snap.windGust)} ${snap.windSpeedUnit}`,
                      bft: String(ctx.gustBft),
                    }),
                    html`
                      <button
                        type="button"
                        class="detail"
                        aria-label=${localize("wind_gust", language)}
                        @click=${(ev: Event) => {
                          ev.stopPropagation();
                          onOpenDetail("wind_gust");
                        }}
                      >
                        <span
                          class="detail-icon"
                          .innerHTML=${icon(beaufortIcon(ctx.gustBft))}
                        ></span>
                        <span
                          >${Math.round(snap.windGust)}
                          ${snap.windSpeedUnit}</span
                        >
                      </button>
                    `,
                    "detail",
                  )
                : nothing}
              ${config.show_wind_direction
                ? renderDetailButton(
                    icon,
                    bearingToWindIcon(snap.windBearing ?? undefined),
                    bearingToLabel(snap.windBearing ?? undefined),
                    localize("wind_direction", language),
                    "wind_direction",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_uv_index
                ? renderDetailButton(
                    icon,
                    uvIndexIcon(snap.uvIndex),
                    formatNumber(snap.uvIndex, "", 0),
                    localize("uv_index", language),
                    "uv_index",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_pressure
                ? renderDetailButton(
                    icon,
                    "barometer",
                    formatNumber(snap.pressure, ` ${snap.pressureUnit}`, 0),
                    localize("pressure", language),
                    "pressure",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_cloud_coverage
                ? renderDetailButton(
                    icon,
                    "cloudy",
                    formatNumber(snap.cloudCoverage, "%", 0),
                    localize("cloud_coverage", language),
                    "cloud_coverage",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_dew_point
                ? renderDetailButton(
                    icon,
                    "thermometer-raindrop",
                    formatNumber(snap.dewPoint, snap.temperatureUnit),
                    localize("dew_point", language),
                    "dew_point",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_visibility
                ? renderDetailButton(
                    icon,
                    "fog",
                    formatNumber(
                      snap.visibility,
                      ` ${snap.visibilityUnit}`,
                      0,
                    ),
                    localize("visibility", language),
                    "visibility",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_precipitation
                ? renderDetailButton(
                    icon,
                    "rain",
                    formatPrecip(
                      snap.precipitation,
                      snap.precipitationUnit,
                    ),
                    localize("precipitation", language),
                    "precipitation",
                    onOpenDetail,
                  )
                : nothing}
              ${config.show_precipitation_probability
                ? renderDetailButton(
                    icon,
                    "rain",
                    formatNumber(snap.precipitationProbability, "%", 0),
                    localize("precipitation_probability", language),
                    "precipitation_probability",
                    onOpenDetail,
                  )
                : nothing}
            </div>
          `
        : nothing}
    </div>
  `;
}

export function renderAlertsOnlySection(
  alerts: WeatherAlert[],
  icon: IconRenderer,
  language: string | undefined,
  onOpenAlerts: (alerts: WeatherAlert[]) => void,
): TemplateResult {
  return html`
    <div class="section section-alerts">
      ${renderAlertsStrip(alerts, icon, language, onOpenAlerts)}
    </div>
  `;
}

export function renderNameHeader(name: string): TemplateResult {
  return html`
    <div class="section section-header">
      <div class="location">${name}</div>
    </div>
  `;
}
