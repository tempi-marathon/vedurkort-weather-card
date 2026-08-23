import { html, nothing, type TemplateResult } from "lit";
import type { MeteoconName } from "../icons/allowlist";
import type { IconRenderer } from "../sections/alerts-section";

export interface DetailHeroContent {
  icon: MeteoconName;
  value: string;
  label?: string;
  copy?: string;
}

export interface DetailHeroOptions {
  rootClass?: string;
  iconClass?: string;
  valueClass?: string;
  /** Smaller, wrapping typography for titles instead of large numeric values. */
  valueTone?: "numeric" | "text";
}

export function renderDetailHero(
  renderIcon: IconRenderer,
  content: DetailHeroContent,
  options: DetailHeroOptions = {},
): TemplateResult {
  const {
    rootClass = "",
    iconClass = "",
    valueClass = "",
    valueTone = "numeric",
  } = options;

  const iconClasses = ["detail-hero-icon", iconClass].filter(Boolean).join(" ");
  const valueClasses = [
    "detail-hero-value",
    valueTone === "text" ? "is-text" : "",
    valueClass,
  ]
    .filter(Boolean)
    .join(" ");

  return html`
    <div class="detail-hero ${rootClass}">
      <span class=${iconClasses} .innerHTML=${renderIcon(content.icon)}></span>
      ${content.label
        ? html`<div class="detail-hero-label">${content.label}</div>`
        : nothing}
      <div class=${valueClasses}>${content.value}</div>
    </div>
    ${content.copy ? html`<p class="detail-copy">${content.copy}</p>` : nothing}
  `;
}
