import { html, type TemplateResult } from "lit";
import type { MeteoconName } from "../icons/allowlist";
import type { IconRenderer } from "../sections/alerts-section";
import { localize } from "../localize";
import { renderDetailHero } from "./hero";
import type { PressureScaleModel } from "./pressure-scale";

export function renderPressureBarHero(
  scale: PressureScaleModel,
  icon: IconRenderer,
  hero: { icon: MeteoconName; value: string },
  copy: string,
  language?: string,
): TemplateResult {
  const ariaLabel = `${localize("pressure", language)} ${scale.valueLabel}, ${scale.bandLabel}`;

  const gradient = `linear-gradient(to right, ${scale.gradientStops
    .map((s) => `${s.color} ${s.pct}%`)
    .join(", ")})`;

  return html`
    <div class="detail-pressure-hero" role="img" aria-label=${ariaLabel}>
      ${renderDetailHero(icon, hero)}
      <div class="detail-pressure-bar-wrap">
        <div class="detail-pressure-bar-track" style="background:${gradient}">
          <span
            class="detail-pressure-bar-dot"
            style="left: ${scale.markerPct}%"
          ></span>
        </div>
      </div>
      ${copy ? html`<p class="detail-copy">${copy}</p>` : ""}
    </div>
  `;
}
