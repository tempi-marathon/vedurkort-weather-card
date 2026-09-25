import { html, nothing, type TemplateResult } from "lit";
import { localize } from "../localize";
import { POLLEN_LEVEL_COLORS } from "../pollen/colors";
import type { PollenLevelLabel } from "../pollen/types";

const LEGEND_LEVELS: Exclude<PollenLevelLabel, "none">[] = [
  "low",
  "medium",
  "high",
];

export function renderPollenLegend(opts: {
  language: string | undefined;
  open: boolean;
  onToggle: () => void;
}): TemplateResult {
  const { language, open, onToggle } = opts;

  return html`
    <div class="pollen-legend">
      <button
        type="button"
        class="pollen-legend-toggle"
        aria-expanded=${open ? "true" : "false"}
        aria-controls="pollen-legend-panel"
        title=${localize("pollen_levels_toggle", language)}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onToggle();
        }}
      >
        <span class="pollen-legend-info" aria-hidden="true">ⓘ</span>
        <span>${localize("pollen_levels", language)}</span>
      </button>
      ${open
        ? html`
            <div
              id="pollen-legend-panel"
              class="pollen-legend-panel"
              role="region"
              aria-label=${localize("pollen_levels", language)}
            >
              ${LEGEND_LEVELS.map((level) => {
                const labelKey =
                  level === "low"
                    ? "pollen_level_low"
                    : level === "medium"
                      ? "pollen_level_medium"
                      : "pollen_level_high";
                return html`
                  <div class="pollen-legend-row">
                    <span
                      class="pollen-legend-swatch"
                      style="background:${POLLEN_LEVEL_COLORS[level]}"
                    ></span>
                    <span>${localize(labelKey, language)}</span>
                  </div>
                `;
              })}
              <div class="pollen-legend-row pollen-legend-none">
                <span
                  class="pollen-legend-swatch"
                  style="background:${POLLEN_LEVEL_COLORS.none}"
                ></span>
                <span>${localize("pollen_level_none", language)}</span>
              </div>
            </div>
          `
        : nothing}
    </div>
  `;
}
