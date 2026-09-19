import { html, nothing, type TemplateResult } from "lit";
import type { IconStyle } from "../icons/allowlist";
import {
  bearingToLabel,
  bearingToWindIcon,
  beaufortIcon,
  conditionToMeteocon,
  windSpeedToBeaufort,
} from "../icons/condition-map";
import { getMeteoconSvg } from "../icons/meteocons";
import { localize } from "../localize";
import type { ForecastItem, HomeAssistant } from "../types";
import { tipWrap } from "../ui/tooltip";
import { formatConditionLabel, isDaytimeAt, isSunUp } from "../weather/adapter";
import {
  formatWindSpeed,
  type WindSpeedDisplayUnit,
} from "../weather/wind-units";

export function renderForecastRow(
  hass: HomeAssistant,
  items: ForecastItem[],
  opts: {
    showIcons: boolean;
    showWindSpeed: boolean;
    showWindDirection: boolean;
    iconStyle: IconStyle;
    animated: boolean;
    /** Native HA wind speed unit of the forecast values. */
    windSpeedUnit: string;
    /** Optional display preference (modal under-chart row). */
    windDisplayUnit?: WindSpeedDisplayUnit;
    mode: "daily" | "hourly";
    language?: string;
    sunEntity?: string;
    weatherEntityId: string;
    /** Aligned sunrise/sunset markers (current detail sheet). */
    sunEvents?: (("sunrise" | "sunset") | null)[];
  },
): TemplateResult | typeof nothing {
  if (
    !opts.showIcons &&
    !opts.showWindSpeed &&
    !opts.showWindDirection &&
    !opts.sunEvents?.some(Boolean)
  ) {
    return nothing;
  }

  const weatherEntity = hass.states[opts.weatherEntityId];
  const sunEntity = opts.sunEntity ?? "sun.sun";

  return html`
    <div class="forecast-row" style="--cols: ${items.length}">
      ${items.map((item, index) => {
        const sunEvent = opts.sunEvents?.[index] ?? null;
        if (sunEvent) {
          const iconName = sunEvent === "sunrise" ? "sunrise" : "sunset";
          const svg = getMeteoconSvg(iconName, opts.iconStyle, opts.animated);
          const tip = localize(
            sunEvent === "sunrise" ? "sunrise" : "sunset",
            opts.language,
          );
          return html`
            <div class="forecast-col forecast-col-sun">
              ${tipWrap(
                tip,
                html`<div class="forecast-icon" .innerHTML=${svg}></div>`,
              )}
            </div>
          `;
        }

        // Prefer sun rising/setting for hourly so icons match real dusk/dawn.
        // Fall back to forecast is_daytime, then sun.sun for daily.
        const isDay =
          opts.mode === "hourly"
            ? isDaytimeAt(hass, item.datetime, sunEntity)
            : (item.is_daytime ?? isSunUp(hass, sunEntity));
        const icon = conditionToMeteocon(
          item.condition,
          isDay,
          item.cloud_coverage,
        );
        const svg = getMeteoconSvg(icon, opts.iconStyle, opts.animated);
        const conditionLabel = formatConditionLabel(
          hass,
          weatherEntity,
          item.condition,
        );
        const dirLabel = bearingToLabel(item.wind_bearing);
        const windDirIcon = bearingToWindIcon(item.wind_bearing);
        const windDirSvg = getMeteoconSvg(
          windDirIcon,
          opts.iconStyle,
          opts.animated,
        );
        const bft = windSpeedToBeaufort(item.wind_speed, opts.windSpeedUnit);
        const bftSvg = getMeteoconSvg(
          beaufortIcon(bft),
          opts.iconStyle,
          opts.animated,
        );
        const display = opts.windDisplayUnit ?? "native";
        const speedFmt = formatWindSpeed(
          item.wind_speed,
          opts.windSpeedUnit,
          display,
        );
        const speedText = speedFmt?.text ?? "—";
        // Card forecast rows stay native rounded numbers; modal converts.
        const speedDisplay =
          display !== "native"
            ? speedFmt != null
              ? display === "m/s"
                ? String(speedFmt.number)
                : String(Math.round(speedFmt.number))
              : "—"
            : item.wind_speed != null
              ? String(Math.round(item.wind_speed))
              : "—";
        const speedTip = localize("wind_tip", opts.language, {
          speed: speedText,
          bft: String(bft),
        });
        const dirTip = localize("wind_direction_tip", opts.language, {
          dir: dirLabel,
        });
        const showWind = opts.showWindSpeed || opts.showWindDirection;
        return html`
          <div class="forecast-col">
            ${opts.showIcons
              ? tipWrap(
                  conditionLabel,
                  html`<div class="forecast-icon" .innerHTML=${svg}></div>`,
                )
              : nothing}
            ${showWind
              ? html`
                  <div class="forecast-wind">
                    ${opts.showWindSpeed
                      ? tipWrap(
                          speedTip,
                          html`
                            <div class="wind-pair">
                              <span
                                class="wind-icon"
                                .innerHTML=${bftSvg}
                              ></span>
                              <span class="wind-meta">${speedDisplay}</span>
                            </div>
                          `,
                        )
                      : nothing}
                    ${opts.showWindDirection
                      ? tipWrap(
                          dirTip,
                          html`
                            <div class="wind-pair">
                              <span
                                class="wind-icon"
                                .innerHTML=${windDirSvg}
                              ></span>
                              <span class="wind-meta">${dirLabel}</span>
                            </div>
                          `,
                        )
                      : nothing}
                  </div>
                `
              : nothing}
          </div>
        `;
      })}
    </div>
  `;
}
