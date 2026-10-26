import { html, nothing, type TemplateResult } from "lit";
import type { IconRenderer } from "../sections/alerts-section";
import { renderDetailHero } from "./hero";
import type { LunationArcModel } from "./lunation-arc-model";

export function renderLunationArcHero(
  arc: LunationArcModel,
  icon: IconRenderer,
  copy: string,
): TemplateResult {
  const ariaLabel = [arc.heroLabel, arc.heroValue].filter(Boolean).join(" ");
  const leftPct = (arc.dotX / arc.viewWidth) * 100;
  const topPct = (arc.dotY / arc.viewHeight) * 100;

  return html`
    <div class="detail-lunation-arc">
      ${renderDetailHero(
        icon,
        {
          icon: arc.heroIcon,
          label: arc.heroLabel,
          value: arc.heroValue,
          copy: copy || undefined,
        },
        { valueTone: "text" },
      )}

      <div class="detail-lunation-chart" role="img" aria-label=${ariaLabel}>
        <svg
          viewBox="0 0 ${arc.viewWidth} ${arc.viewHeight}"
          class="detail-lunation-arc-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <line
            class="detail-lunation-baseline"
            x1="0"
            y1=${arc.horizonY}
            x2=${arc.viewWidth}
            y2=${arc.horizonY}
          />
          <path class="detail-lunation-path" d=${arc.path} />
        </svg>
        <div
          class="detail-lunation-now"
          style="left: ${leftPct}%; top: ${topPct}%"
        ></div>
      </div>

      <div class="detail-lunation-marks" aria-hidden="true">
        ${arc.markers.map(
          (mark, i) => html`
            <span
              class="detail-lunation-mark${i === 0 ? " is-start" : ""}${i ===
              arc.markers.length - 1
                ? " is-end"
                : ""}"
              style="left: ${(mark.x / arc.viewWidth) * 100}%"
              >${mark.label}</span
            >
          `,
        )}
      </div>

      ${arc.details.length
        ? html`
            <dl class="detail-lunation-details">
              ${arc.details.map(
                (row) => html`
                  <div
                    class="detail-lunation-detail-row${row.summary
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
