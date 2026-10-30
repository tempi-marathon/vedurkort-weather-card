/**
 * Shared tooltip helpers for Lit templates (shadow-DOM friendly).
 * Uses CSS `data-tip` popovers instead of native title attributes.
 */
import { html, nothing, type TemplateResult } from "lit";

export function tipWrap(
  tip: string,
  content: TemplateResult | unknown,
  className = "",
  /** Detail chip id, so the card can measure chips on the smart row. */
  chip?: string,
) {
  return html`
    <span
      class="tip ${className}"
      data-tip=${tip}
      aria-label=${tip}
      data-chip=${chip ?? nothing}
    >
      ${content}
    </span>
  `;
}
