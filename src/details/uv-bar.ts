import { html, type TemplateResult } from "lit";
import type { IconRenderer } from "../sections/alerts-section";
import { localize } from "../localize";
import { renderDetailHero } from "./hero";
import type { UvBarModel } from "./uv-bar-model";

export function renderUvBarHero(
  uv: UvBarModel,
  icon: IconRenderer,
  language?: string,
): TemplateResult {
  const title = localize("uv_index", language);
  const ariaLabel = `${title} ${uv.valueLabel}, ${uv.categoryLabel}`;

  return html`
    <div class="detail-uv-hero" role="img" aria-label=${ariaLabel}>
      ${renderDetailHero(
        icon,
        { icon: uv.heroIcon, value: uv.categoryLabel },
        {
          valueClass: `detail-uv-category detail-uv-category-${uv.category}`,
        },
      )}
      <div class="detail-uv-bar-wrap">
        <div class="detail-uv-bar-track">
          <span
            class="detail-uv-bar-dot"
            style="left: ${uv.barPosition}%"
          ></span>
        </div>
      </div>
      <p class="detail-copy detail-uv-advice">${uv.advice}</p>
    </div>
  `;
}
