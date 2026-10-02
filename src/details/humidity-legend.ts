import { html, nothing, type TemplateResult } from "lit";
import { localize } from "../localize";
import { buildHumidityLegendRows } from "./humidity-scale";

export function renderHumidityLegend(opts: {
  language: string | undefined;
  open: boolean;
  onToggle: () => void;
}): TemplateResult {
  const { language, open, onToggle } = opts;
  const rows = open ? buildHumidityLegendRows(language) : [];

  return html`
    <div class="humidity-legend">
      <button
        type="button"
        class="humidity-legend-toggle"
        aria-expanded=${open ? "true" : "false"}
        aria-controls="humidity-legend-panel"
        title=${localize("humidity_scale_toggle", language)}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onToggle();
        }}
      >
        <span class="humidity-legend-info" aria-hidden="true">ⓘ</span>
        <span class="humidity-legend-label"
          >${localize("humidity_scale", language)}</span
        >
      </button>
      ${open
        ? html`
            <div
              id="humidity-legend-panel"
              class="humidity-legend-panel"
              role="region"
              aria-label=${localize("humidity_scale", language)}
            >
              <div class="humidity-legend-head">
                <span class="humidity-legend-swatch"></span>
                <span>${localize("humidity_col_range", language)}</span>
                <span></span>
              </div>
              ${rows.map(
                (row) => html`
                  <div class="humidity-legend-row">
                    <span
                      class="humidity-legend-swatch"
                      style="background:${row.color}"
                    ></span>
                    <span class="humidity-legend-range">${row.range}</span>
                    <span class="humidity-legend-cat">${row.label}</span>
                  </div>
                `,
              )}
            </div>
          `
        : nothing}
    </div>
  `;
}
