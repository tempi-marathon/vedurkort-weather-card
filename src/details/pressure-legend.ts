import { html, nothing, type TemplateResult } from "lit";
import { localize } from "../localize";
import type { PressureLegendRow } from "./pressure-scale";

export function renderPressureLegend(opts: {
  language: string | undefined;
  rows: PressureLegendRow[];
  open: boolean;
  onToggle: () => void;
}): TemplateResult {
  const { language, rows, open, onToggle } = opts;

  return html`
    <div class="pressure-legend">
      <button
        type="button"
        class="pressure-legend-toggle"
        aria-expanded=${open ? "true" : "false"}
        aria-controls="pressure-legend-panel"
        title=${localize("pressure_scale_toggle", language)}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onToggle();
        }}
      >
        <span class="pressure-legend-info" aria-hidden="true">ⓘ</span>
        <span class="pressure-legend-label"
          >${localize("pressure_scale", language)}</span
        >
      </button>
      ${open
        ? html`
            <div
              id="pressure-legend-panel"
              class="pressure-legend-panel"
              role="region"
              aria-label=${localize("pressure_scale", language)}
            >
              <div class="pressure-legend-head">
                <span class="pressure-legend-swatch"></span>
                <span>${localize("pressure_col_range", language)}</span>
                <span></span>
              </div>
              ${rows.map(
                (row) => html`
                  <div class="pressure-legend-row">
                    <span
                      class="pressure-legend-swatch"
                      style="background:${row.color}"
                    ></span>
                    <span class="pressure-legend-range">${row.range}</span>
                    <span class="pressure-legend-cat">${row.label}</span>
                  </div>
                `,
              )}
            </div>
          `
        : nothing}
    </div>
  `;
}
