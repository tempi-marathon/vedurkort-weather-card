import { html, nothing, type TemplateResult } from "lit";
import { localize } from "../localize";
import type { WindSpeedDisplayUnit } from "../weather/wind-units";
import { buildBeaufortLegendRows } from "./beaufort-scale";

export function renderBeaufortLegend(opts: {
  language: string | undefined;
  display: WindSpeedDisplayUnit | undefined;
  nativeUnit: string;
  open: boolean;
  onToggle: () => void;
}): TemplateResult {
  const { language, display, nativeUnit, open, onToggle } = opts;
  const rows = open
    ? buildBeaufortLegendRows(language, display, nativeUnit)
    : [];

  return html`
    <div class="beaufort-legend">
      <button
        type="button"
        class="beaufort-legend-toggle"
        aria-expanded=${open ? "true" : "false"}
        aria-controls="beaufort-legend-panel"
        title=${localize("beaufort_scale_toggle", language)}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onToggle();
        }}
      >
        <span class="beaufort-legend-info" aria-hidden="true">ⓘ</span>
        <span class="beaufort-legend-label"
          >${localize("beaufort_scale", language)}</span
        >
      </button>
      ${open
        ? html`
            <div
              id="beaufort-legend-panel"
              class="beaufort-legend-panel"
              role="region"
              aria-label=${localize("beaufort_scale", language)}
            >
              <div class="beaufort-legend-head">
                <span class="beaufort-legend-swatch"></span>
                <span>${localize("beaufort_col_bft", language)}</span>
                <span>${localize("beaufort_col_desc", language)}</span>
                <span class="beaufort-legend-range"
                  >${localize("beaufort_col_speed", language)}</span
                >
              </div>
              ${rows.map(
                (row) => html`
                  <div class="beaufort-legend-row">
                    <span
                      class="beaufort-legend-swatch"
                      style="background:${row.color}"
                    ></span>
                    <span class="beaufort-legend-bft">${row.bft}</span>
                    <span class="beaufort-legend-desc">${row.description}</span>
                    <span class="beaufort-legend-range">${row.range}</span>
                  </div>
                `,
              )}
            </div>
          `
        : nothing}
    </div>
  `;
}
