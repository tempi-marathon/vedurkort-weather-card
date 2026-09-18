import { html, nothing, type TemplateResult } from "lit";
import type { WeatherAlert } from "../alerts/types";
import type { VedurkortCardConfig } from "../config";
import type { DetailMetricId } from "../details/types";
import {
  bearingToLabel,
  beaufortIcon,
  uvIndexIcon,
} from "../icons/condition-map";
import type { MeteoconName } from "../icons/allowlist";
import { localize } from "../localize";
import { tipWrap } from "../ui/tooltip";
import {
  formatNumber,
  formatPrecip,
  formatTemp,
  formatTime,
  nextSunEvent,
  type WeatherSnapshot,
} from "../weather/adapter";
import {
  formatWindHeading,
  formatWindSpeed,
} from "../weather/wind-units";
import { pollenLevelClass } from "../pollen/colors";
import { pollenIcon } from "../pollen/icons";
import type { PollenSnapshot } from "../pollen/types";
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
  pollen: PollenSnapshot | null;
}

function renderDetailButton(
  icon: IconRenderer,
  iconName: MeteoconName,
  text: string | null,
  label: string,
  metricId: DetailMetricId,
  onOpenDetail: (id: DetailMetricId) => void,
  textClass?: string,
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
        <span class=${textClass ?? ""}>${text}</span>
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
                ? (() => {
                    const next = nextSunEvent(snap);
                    const kind =
                      next?.kind ?? (snap.isDay ? "sunset" : "sunrise");
                    const at =
                      next?.at ??
                      (kind === "sunset" ? snap.sunset : snap.sunrise);
                    return renderDetailButton(
                      icon,
                      kind,
                      formatTime(at, language),
                      localize(kind, language),
                      "sun",
                      onOpenDetail,
                    );
                  })()
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
              ${config.show_wind &&
              (snap.windSpeed != null ||
                snap.windBearing != null ||
                snap.windGust != null)
                ? (() => {
                    const dir = bearingToLabel(snap.windBearing ?? undefined);
                    const heading = formatWindHeading(
                      snap.windSpeed,
                      dir,
                      snap.windSpeedUnit,
                      config.wind_speed_unit,
                    );
                    const gustFmt = formatWindSpeed(
                      snap.windGust,
                      snap.windSpeedUnit,
                      config.wind_speed_unit,
                    );
                    const tipSpeed =
                      formatWindSpeed(
                        snap.windSpeed,
                        snap.windSpeedUnit,
                        config.wind_speed_unit,
                      )?.text ?? heading;
                    const tip = localize("wind_tip", language, {
                      speed: tipSpeed,
                      bft: String(ctx.bft),
                    });
                    const aria =
                      heading ||
                      localize("wind", language);
                    return tipWrap(
                      tip,
                      html`
                        <button
                          type="button"
                          class="detail detail-wind"
                          aria-label=${aria}
                          @click=${(ev: Event) => {
                            ev.stopPropagation();
                            onOpenDetail("wind_speed");
                          }}
                        >
                          <span
                            class="detail-icon"
                            .innerHTML=${icon(beaufortIcon(ctx.bft))}
                          ></span>
                          <span class="detail-text">
                            ${heading
                              ? html`<span class="detail-main"
                                  >${heading}</span
                                >`
                              : nothing}
                            ${gustFmt
                              ? html`<span class="detail-sub"
                                  >${localize("wind_gust_line", language, {
                                    speed: gustFmt.text,
                                  })}</span
                                >`
                              : nothing}
                          </span>
                        </button>
                      `,
                      "detail",
                    );
                  })()
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
              ${config.show_pollen && ctx.pollen
                ? renderDetailButton(
                    icon,
                    pollenIcon(
                      ctx.pollen.overallLevelLabel,
                      ctx.pollen.dominantSpecies ?? "overall",
                    ),
                    (() => {
                      const level = ctx.pollen!.overallLevelLabel
                        ? localize(
                            `pollen_level_${ctx.pollen!.overallLevelLabel}`,
                            language,
                          )
                        : null;
                      if (!level) return null;
                      if (!ctx.pollen!.dominantSpecies) return level;
                      const species = localize(
                        `pollen_species_${ctx.pollen!.dominantSpecies}`,
                        language,
                      );
                      return `${level} · ${species}`;
                    })(),
                    localize("pollen", language),
                    "pollen",
                    onOpenDetail,
                    pollenLevelClass(ctx.pollen.overallLevelLabel),
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
