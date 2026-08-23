import { html, nothing, type TemplateResult } from "lit";
import type { IconRenderer } from "../sections/alerts-section";
import { renderDetailHero } from "./hero";
import type { SunArcModel } from "./sun-arc-model";

export function renderSunArcHero(
  arc: SunArcModel,
  icon: IconRenderer,
  copy: string,
): TemplateResult {
  const ariaLabel = `${arc.heroLabel} ${arc.heroTime}`;
  const leftPct = (arc.dotX / arc.viewWidth) * 100;
  const topPct = (arc.dotY / arc.viewHeight) * 100;

  return html`
    <div class="detail-sun-arc">
      ${renderDetailHero(
        icon,
        {
          icon: arc.heroIcon,
          label: arc.heroLabel,
          value: arc.heroTime,
          copy: copy || undefined,
        },
      )}

      <div class="detail-sun-chart" role="img" aria-label=${ariaLabel}>
        <svg
          viewBox="0 0 ${arc.viewWidth} ${arc.viewHeight}"
          class="detail-sun-arc-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <line
            class="detail-sun-horizon"
            x1="0"
            y1=${arc.horizonY}
            x2=${arc.viewWidth}
            y2=${arc.horizonY}
          />
          <path class="detail-sun-night-path" d=${arc.nightPath} />
          <path class="detail-sun-day-path" d=${arc.dayPath} />
        </svg>
        ${arc.showDot
          ? html`
              <div
                class="detail-sun-now"
                style="left: ${leftPct}%; top: ${topPct}%"
              ></div>
            `
          : nothing}
      </div>

      ${arc.details.length
        ? html`
            <dl class="detail-sun-details">
              ${arc.details.map(
                (row) => html`
                  <div
                    class="detail-sun-detail-row${row.summary
                      ? " is-summary"
                      : ""}"
                  >
                    <dt>${row.label}</dt>
                    <dd>${row.value}</dd>
                  </div>
                `,
              )}
            </dl>
          `
        : nothing}
    </div>
  `;
}
