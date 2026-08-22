import type { WeatherAlert } from "./types";
import { localize } from "../localize";

/** Format onset/expires for alert detail (date + time). */
export function formatAlertDateTime(
  iso: string | undefined,
  language?: string,
): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(language ?? undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type AlertTimePhase = "preparation" | "active" | "ended" | "unknown";

/**
 * Compact duration like weather_alerts_card: `45m`, `2h 30m`, `1d 4h`.
 * Uses floor so boundaries never show `60m`.
 */
export function formatDurationMs(absMs: number): string {
  const abs = Math.max(0, Math.floor(absMs / 1000));
  if (abs < 60) return "<1m";
  if (abs < 3600) return `${Math.floor(abs / 60)}m`;
  if (abs < 86400) {
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

export function alertTimePhase(
  alert: WeatherAlert,
  nowMs: number = Date.now(),
): AlertTimePhase {
  const onsetMs = alert.onset ? Date.parse(alert.onset) : Number.NaN;
  const expiresMs = alert.expires ? Date.parse(alert.expires) : Number.NaN;
  const onsetOk = Number.isFinite(onsetMs);
  const expiresOk = Number.isFinite(expiresMs);

  if (expiresOk && expiresMs <= nowMs) return "ended";
  if (onsetOk && onsetMs > nowMs) return "preparation";
  if (onsetOk || expiresOk) return "active";
  return "unknown";
}

/**
 * Header status line: relative urgency only (no absolute dates).
 * Examples: `Starts in 2h 30m`, `Ends in 7h`, `Ended 2h ago`.
 */
export function formatAlertTimeStatus(
  alert: WeatherAlert,
  nowMs: number = Date.now(),
  language?: string,
): string {
  const onsetMs = alert.onset ? Date.parse(alert.onset) : Number.NaN;
  const expiresMs = alert.expires ? Date.parse(alert.expires) : Number.NaN;
  const onsetOk = Number.isFinite(onsetMs);
  const expiresOk = Number.isFinite(expiresMs);
  const phase = alertTimePhase(alert, nowMs);

  if (phase === "preparation" && onsetOk) {
    return localize("alert_starts_in", language, {
      duration: formatDurationMs(onsetMs - nowMs),
    });
  }
  if (phase === "active" && expiresOk && expiresMs > nowMs) {
    return localize("alert_ends_in", language, {
      duration: formatDurationMs(expiresMs - nowMs),
    });
  }
  if (phase === "active" && onsetOk && onsetMs <= nowMs) {
    return localize("alert_started_ago", language, {
      duration: formatDurationMs(nowMs - onsetMs),
    });
  }
  if (phase === "ended" && expiresOk) {
    return localize("alert_ended_ago", language, {
      duration: formatDurationMs(nowMs - expiresMs),
    });
  }
  return "";
}

const ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BR",
  "EM",
  "I",
  "LI",
  "OL",
  "P",
  "STRONG",
  "UL",
]);

/** Escape plain text and keep a tiny HTML allowlist for CAP bodies. */
export function sanitizeAlertHtml(input: string): string {
  if (!input) return "";
  const looksHtml = /<[a-z][\s\S]*>/i.test(input);
  if (!looksHtml) {
    return escapeHtml(input).replace(/\r\n|\n|\r/g, "<br>");
  }

  if (typeof DOMParser === "undefined") {
    return escapeHtml(input.replace(/<[^>]+>/g, " "))
      .replace(/\s+/g, " ")
      .trim();
  }

  const parsed = new DOMParser().parseFromString(
    `<div>${input}</div>`,
    "text/html",
  );
  const root = parsed.body.firstElementChild;
  if (!root) return escapeHtml(input);
  scrubNode(root, parsed);
  return root.innerHTML;
}

function scrubNode(node: Element, doc: Document): void {
  for (const child of [...node.childNodes]) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as Element;
    if (!ALLOWED_TAGS.has(el.tagName)) {
      el.replaceWith(doc.createTextNode(el.textContent ?? ""));
      continue;
    }
    if (el.tagName === "A") {
      const href = el.getAttribute("href") ?? "";
      [...el.attributes].forEach((attr) => el.removeAttribute(attr.name));
      if (/^https?:\/\//i.test(href)) {
        el.setAttribute("href", href);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    } else {
      [...el.attributes].forEach((attr) => el.removeAttribute(attr.name));
    }
    scrubNode(el, doc);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
