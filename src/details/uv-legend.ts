import { html, nothing, type TemplateResult } from "lit";
import { localize } from "../localize";
import { buildUvLegendRows } from "./uv-bar-model";

export function renderUvLegend(opts: {
  language: string | undefined;
  open: boolean;
  onToggle: () => void;
}): TemplateResult {
  const { language, open, onToggle } = opts;
  const rows = open ? buildUvLegendRows(language) : [];

  return html`
    <div class="uv-legend">
      <button
        type="button"
        class="uv-legend-toggle"
        aria-expanded=${open ? "true" : "false"}
        aria-controls="uv-legend-panel"
        title=${localize("uv_scale_toggle", language)}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onToggle();
        }}
      >
        <span class="uv-legend-info" aria-hidden="true">ⓘ</span>
        <span class="uv-legend-label">${localize("uv_scale", language)}</span>
      </button>
      ${open
        ? html`
            <div
              id="uv-legend-panel"
              class="uv-legend-panel"
              role="region"
              aria-label=${localize("uv_scale", language)}
            >
              <div class="uv-legend-head">
                <span class="uv-legend-swatch"></span>
                <span>${localize("uv_col_range", language)}</span>
                <span></span>
              </div>
              ${rows.map(
                (row) => html`
                  <div class="uv-legend-row">
                    <span
                      class="uv-legend-swatch"
                      style="background:${row.color}"
                    ></span>
                    <span class="uv-legend-range">${row.range}</span>
                    <span class="uv-legend-cat">${row.label}</span>
                  </div>
                `,
              )}
            </div>
          `
        : nothing}
    </div>
  `;
}
