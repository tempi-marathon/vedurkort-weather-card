import { html, nothing, type TemplateResult } from "lit";
import type { BackgroundScene } from "../backgrounds/scenes";
import { renderBackground } from "../backgrounds/scenes";
import { localize } from "../localize";

export interface ViewportDialogOptions {
  open: boolean;
  title: string;
  titleId: string;
  language: string | undefined;
  animatedBackground?: boolean;
  scene?: BackgroundScene;
  cloudCoverage?: number | null;
  onClose: () => void;
  body: TemplateResult;
}

export function renderViewportDialog(
  opts: ViewportDialogOptions,
): TemplateResult | typeof nothing {
  if (!opts.open) return nothing;

  const hasBg = Boolean(opts.animatedBackground && opts.scene);

  return html`
    <dialog
      class="vk-modal ${hasBg ? "has-bg" : ""}"
      aria-labelledby=${opts.titleId}
      @cancel=${(ev: Event) => {
        ev.preventDefault();
        opts.onClose();
      }}
      @click=${(ev: MouseEvent) => {
        const dlg = ev.currentTarget as HTMLDialogElement;
        if (ev.target === dlg) opts.onClose();
      }}
    >
      ${hasBg && opts.scene
        ? renderBackground(true, opts.scene, opts.cloudCoverage ?? null)
        : nothing}
      <div class="vk-modal-inner">
        <div class="vk-modal-header">
          <h2 id=${opts.titleId} class="vk-modal-title">${opts.title}</h2>
          <button
            type="button"
            class="vk-modal-close"
            @click=${() => opts.onClose()}
          >
            ${localize("close", opts.language)}
          </button>
        </div>
        <div class="vk-modal-body">${opts.body}</div>
      </div>
    </dialog>
  `;
}
