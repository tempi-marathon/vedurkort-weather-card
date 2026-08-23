import { html, nothing, type TemplateResult } from "lit";
import {
  formatAlertDateTime,
  formatAlertTimeStatus,
  sanitizeAlertHtml,
} from "../alerts/format";
import {
  alertIconName,
  alertSubtitle,
  alertTitle,
  highestSeverityIcon,
  severityAccentClass,
  summaryLabel,
} from "../alerts/summary";
import type { WeatherAlert } from "../alerts/types";
import { phaseLabel } from "../alerts/utils";
import type { BackgroundScene } from "../backgrounds/scenes";
import type { MeteoconName } from "../icons/allowlist";
import { localize } from "../localize";
import { renderDetailHero } from "../details/hero";
import { renderViewportDialog } from "../ui/viewport-dialog";

/** Tiny map pin for alert location line (not MDI / not Meteocon). */
const LOCATION_PIN = html`
  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
    <path
      d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"
    />
  </svg>
`;

export type IconRenderer = (name: MeteoconName) => string;

export interface AlertsSectionCallbacks {
  onOpen: (alerts: WeatherAlert[]) => void;
  onClose: () => void;
  onToggleExpanded: (id: string) => void;
}

export interface AlertsDialogShellOptions {
  animatedBackground?: boolean;
  scene?: BackgroundScene;
  cloudCoverage?: number | null;
}

function alertsPresentation(
  alerts: WeatherAlert[],
  language: string | undefined,
  now: number,
): {
  top: WeatherAlert;
  single: boolean;
  icon: MeteoconName;
  label: string;
  timeStatus: string;
} {
  const top = alerts[0]!;
  const single = alerts.length === 1;
  return {
    top,
    single,
    icon: highestSeverityIcon(alerts),
    label: summaryLabel(alerts, language),
    timeStatus: single ? formatAlertTimeStatus(top, now, language) : "",
  };
}

function renderAlertBadges(
  alert: WeatherAlert,
  language: string | undefined,
): TemplateResult {
  const phase = phaseLabel(alert.phase, language);
  return html`
    <div class="alerts-badges">
      <span class="alerts-badge ${severityAccentClass(alert)}"
        >${alert.severityLabel}</span
      >
      ${phase
        ? html`<span class="alerts-badge alerts-badge-phase">${phase}</span>`
        : nothing}
    </div>
  `;
}

export function renderAlertsStrip(
  alerts: WeatherAlert[],
  icon: IconRenderer,
  language: string | undefined,
  onOpen: (alerts: WeatherAlert[]) => void,
): TemplateResult | typeof nothing {
  if (!alerts.length) return nothing;
  const { top, single, icon: alertIcon, label, timeStatus } =
    alertsPresentation(alerts, language, Date.now());
  return html`
    <button
      type="button"
      class="alerts-strip ${single ? "alerts-strip--single" : "alerts-strip--multi"} ${severityAccentClass(top)}"
      @click=${() => onOpen(alerts)}
      aria-haspopup="dialog"
    >
      <span class="alerts-strip-icon" .innerHTML=${icon(alertIcon)}></span>
      <span class="alerts-strip-text">
        <span class="alerts-strip-label">${label}</span>
        ${timeStatus
          ? html`<span class="alerts-strip-sub">${timeStatus}</span>`
          : nothing}
      </span>
      <span class="alerts-strip-chevron" aria-hidden="true">›</span>
    </button>
  `;
}

function renderAlertsHero(
  alerts: WeatherAlert[],
  icon: IconRenderer,
  language: string | undefined,
  now: number,
): TemplateResult {
  const { icon: heroIcon, label, timeStatus } = alertsPresentation(
    alerts,
    language,
    now,
  );

  return renderDetailHero(
    icon,
    {
      icon: heroIcon,
      value: label,
      copy: timeStatus || undefined,
    },
    { valueTone: "text" },
  );
}

function renderAlertsBody(
  alerts: WeatherAlert[],
  expandedIds: string[],
  icon: IconRenderer,
  language: string | undefined,
  onToggleExpanded: (id: string) => void,
): TemplateResult {
  const now = Date.now();
  return html`
    ${renderAlertsHero(alerts, icon, language, now)}
    <ul class="alerts-accordion">
      ${alerts.map((alert) => {
        const expanded = expandedIds.includes(alert.id);
        const bodyId = `alerts-acc-body-${alert.id}`;
        const subtitle = alertSubtitle(alert);
        const relative = formatAlertTimeStatus(alert, now, language);
        return html`
          <li
            class="alerts-acc-item ${severityAccentClass(alert)}${expanded
              ? " is-expanded"
              : ""}"
          >
            <button
              type="button"
              class="alerts-acc-header"
              aria-expanded=${expanded}
              aria-controls=${bodyId}
              @click=${() => onToggleExpanded(alert.id)}
            >
              <span
                class="alerts-acc-icon"
                .innerHTML=${icon(alertIconName(alert))}
              ></span>
              <span class="alerts-acc-main">
                <span class="alerts-acc-title">${alertTitle(alert)}</span>
                ${subtitle
                  ? html`<span class="alerts-acc-sub">
                      <span class="alerts-acc-pin" aria-hidden="true"
                        >${LOCATION_PIN}</span
                      >
                      <span>${subtitle}</span>
                    </span>`
                  : nothing}
                ${renderAlertBadges(alert, language)}
                ${relative
                  ? html`<span class="alerts-acc-time">${relative}</span>`
                  : nothing}
              </span>
              <span class="alerts-acc-chevron" aria-hidden="true"
                >${expanded ? "▾" : "›"}</span
              >
            </button>
            ${expanded
              ? html`
                  <div id=${bodyId} class="alerts-acc-body">
                    <dl class="alerts-times">
                      <div>
                        <dt>${localize("onset", language)}</dt>
                        <dd>
                          ${formatAlertDateTime(alert.onset, language)}
                        </dd>
                      </div>
                      <div>
                        <dt>${localize("expires", language)}</dt>
                        <dd>
                          ${formatAlertDateTime(alert.expires, language)}
                        </dd>
                      </div>
                    </dl>
                    ${alert.description
                      ? html`<div
                          class="alerts-body"
                          .innerHTML=${sanitizeAlertHtml(alert.description)}
                        ></div>`
                      : nothing}
                    ${alert.instruction
                      ? html`<div class="alerts-instruction">
                          <strong>${localize("instructions", language)}</strong>
                          <div
                            .innerHTML=${sanitizeAlertHtml(
                              alert.instruction,
                            )}
                          ></div>
                        </div>`
                      : nothing}
                  </div>
                `
              : nothing}
          </li>
        `;
      })}
    </ul>
  `;
}

export function renderAlertsDialog(
  alerts: WeatherAlert[],
  open: boolean,
  expandedIds: string[],
  icon: IconRenderer,
  language: string | undefined,
  callbacks: Pick<
    AlertsSectionCallbacks,
    "onClose" | "onToggleExpanded"
  >,
  shell?: AlertsDialogShellOptions,
): TemplateResult | typeof nothing {
  if (!open || !alerts.length) return nothing;

  return renderViewportDialog({
    open: true,
    title: localize("weather_alerts", language),
    titleId: "alerts-modal-title",
    language,
    animatedBackground: shell?.animatedBackground,
    scene: shell?.scene,
    cloudCoverage: shell?.cloudCoverage,
    onClose: callbacks.onClose,
    body: renderAlertsBody(
      alerts,
      expandedIds,
      icon,
      language,
      callbacks.onToggleExpanded,
    ),
  });
}
