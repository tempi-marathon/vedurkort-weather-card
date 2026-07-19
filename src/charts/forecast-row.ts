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
import type { ForecastItem, HomeAssistant } from "../types";
import { tipWrap } from "../ui/tooltip";
import { formatConditionLabel, isSunUp } from "../weather/adapter";

export function renderForecastRow(
  hass: HomeAssistant,
  items: ForecastItem[],
  opts: {
    showIcons: boolean;
    showWindSpeed: boolean;
    showWindDirection: boolean;
    iconStyle: IconStyle;
    animated: boolean;
    windSpeedUnit: string;
    mode: "daily" | "hourly";
    language?: string;
    sunEntity?: string;
    weatherEntityId: string;
  },
): TemplateResult | typeof nothing {
  if (!opts.showIcons && !opts.showWindSpeed && !opts.showWindDirection) {
    return nothing;
  }

  const weatherEntity = hass.states[opts.weatherEntityId];

  return html`
    <div class="forecast-row" style="--cols: ${items.length}">
      ${items.map((item) => {
        const hour = new Date(item.datetime).getHours();
        const isDay =
          item.is_daytime ??
          (opts.mode === "hourly"
            ? hour >= 6 && hour < 20
            : isSunUp(hass, opts.sunEntity));
        const icon = conditionToMeteocon(item.condition, isDay);
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
        const speedText =
          item.wind_speed != null
            ? `${Math.round(item.wind_speed)} ${opts.windSpeedUnit}`
            : "—";
        const speedTip = `Wind ${speedText} (Beaufort ${bft})`;
        const dirTip = `Wind direction ${dirLabel}`;
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
                              <span class="wind-meta"
                                >${item.wind_speed != null
                                  ? Math.round(item.wind_speed)
                                  : "—"}</span
                              >
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
