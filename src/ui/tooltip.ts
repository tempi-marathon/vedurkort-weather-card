/**
 * Shared tooltip helpers for Lit templates (shadow-DOM friendly).
 * Uses CSS `data-tip` popovers instead of native title attributes.
 */
import { html, type TemplateResult } from "lit";

export function tipWrap(
  tip: string,
  content: TemplateResult | unknown,
  className = "",
) {
  return html`
    <span class="tip ${className}" data-tip=${tip} aria-label=${tip}>
      ${content}
    </span>
  `;
}
