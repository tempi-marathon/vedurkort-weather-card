import { html, nothing, type TemplateResult } from "lit";
import type { IconStyle } from "../icons/allowlist";
import { bearingToLabel, bearingToWindIcon, conditionToMeteocon } from "../icons/condition-map";
import { getMeteoconSvg } from "../icons/meteocons";
import type { ForecastItem } from "../types";
import { isSunUp } from "../weather/adapter";
import type { HomeAssistant } from "../types";

export function renderForecastRow(
  hass: HomeAssistant,
  items: ForecastItem[],
  opts: {
    showIcons: boolean;
    showWind: boolean;
    iconStyle: IconStyle;
    animated: boolean;
    windSpeedUnit: string;
    mode: "daily" | "hourly";
    language?: string;
  },
): TemplateResult | typeof nothing {
  if (!opts.showIcons && !opts.showWind) return nothing;

  return html`
    <div class="forecast-row" style="--cols: ${items.length}">
      ${items.map((item) => {
        const isDay =
          opts.mode === "hourly"
            ? new Date(item.datetime).getHours() >= 6 &&
              new Date(item.datetime).getHours() < 20
            : isSunUp(hass);
        const icon = conditionToMeteocon(item.condition, isDay);
        const svg = getMeteoconSvg(icon, opts.iconStyle, opts.animated);
        const windIcon = bearingToWindIcon(item.wind_bearing);
        const windSvg = getMeteoconSvg(
          windIcon,
          opts.iconStyle,
          opts.animated,
        );
        return html`
          <div class="forecast-col">
            ${opts.showIcons
              ? html`<div class="forecast-icon" .innerHTML=${svg}></div>`
              : nothing}
            ${opts.showWind
              ? html`
                  <div class="forecast-wind">
                    <span class="wind-icon" .innerHTML=${windSvg}></span>
                    <span class="wind-meta">
                      ${bearingToLabel(item.wind_bearing)}
                      ${item.wind_speed != null
                        ? html`${Math.round(item.wind_speed)}`
                        : "—"}
                    </span>
                  </div>
                `
              : nothing}
          </div>
        `;
      })}
    </div>
  `;
}
