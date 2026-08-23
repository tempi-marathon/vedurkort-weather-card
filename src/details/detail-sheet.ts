import { html, nothing, type TemplateResult } from "lit";
import { renderForecastRow } from "../charts/forecast-row";
import type { VedurkortCardConfig } from "../config";
import type { HomeAssistant } from "../types";
import type { IconRenderer } from "../sections/alerts-section";
import { renderDetailHero } from "./hero";
import { renderSunArcHero } from "./sun-arc";
import { renderUvBarHero } from "./uv-bar";
import type { DetailModel } from "./types";

export interface DetailSheetContext {
  model: DetailModel;
  icon: IconRenderer;
  noChartText: string;
  hass?: HomeAssistant;
  config?: VedurkortCardConfig;
  entityId?: string;
  language?: string;
  windSpeedUnit?: string;
  onChartScroll?: () => void;
}

export function renderDetailSheetBody(ctx: DetailSheetContext): TemplateResult {
  const {
    model,
    icon,
    noChartText,
    hass,
    config,
    entityId,
    language,
    windSpeedUnit,
    onChartScroll,
  } = ctx;

  const chartCols = model.series?.points.length ?? 0;
  const showWindRow =
    model.showWindRow &&
    model.windForecastItems?.length &&
    hass &&
    config &&
    entityId &&
    windSpeedUnit;

  return html`
    ${model.sunArc
      ? renderSunArcHero(model.sunArc, icon, model.copy)
      : model.uvBar
        ? renderUvBarHero(model.uvBar, icon, language)
        : renderDetailHero(icon, {
            icon: model.heroIcon,
            value: model.heroValue,
            copy: model.copy || undefined,
          })}
    ${model.series
      ? html`
          <div
            class="detail-chart-scroll forecast-scroll"
            @scroll=${onChartScroll ?? nothing}
          >
            <div
              class="forecast-scroll-inner"
              style="--cols: ${chartCols}"
            >
              <div class="detail-chart-wrap chart-wrap">
                <canvas class="detail-chart-canvas"></canvas>
              </div>
              ${showWindRow
                ? html`
                    <div class="forecast-row-slot">
                      ${renderForecastRow(hass!, model.windForecastItems!, {
                        showIcons: false,
                        showWindSpeed: false,
                        showWindDirection: true,
                        iconStyle: config!.icon_style,
                        animated: config!.animated_icons,
                        windSpeedUnit: windSpeedUnit!,
                        mode: "hourly",
                        language,
                        sunEntity: config!.sun_entity,
                        weatherEntityId: entityId!,
                      })}
                    </div>
                  `
                : nothing}
            </div>
          </div>
        `
      : !model.sunArc && !model.uvBar
        ? html`<p class="detail-no-chart">${noChartText}</p>`
        : nothing}
    ${model.related.length
      ? html`
          <dl class="detail-related">
            ${model.related.map(
              (r) => html`
                <div class="detail-related-row">
                  <dt>${r.label}</dt>
                  <dd>${r.value}</dd>
                </div>
              `,
            )}
          </dl>
        `
      : nothing}
  `;
}
