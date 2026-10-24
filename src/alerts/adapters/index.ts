import type { HassEntity } from "../../types";
import type { AlertAdapter, WeatherAlert } from "../types";
import { severityRank } from "../utils";
import { capAdapter } from "./cap";
import { meteoalarmAdapter } from "./meteoalarm";

/** Prefer CAP marker before generic MeteoAlarm attribution. */
export const ALERT_ADAPTERS: readonly AlertAdapter[] = [
  capAdapter,
  meteoalarmAdapter,
];

export function adapterForAttributes(
  attributes: Record<string, unknown>,
): AlertAdapter | undefined {
  return ALERT_ADAPTERS.find((a) => a.canHandle(attributes));
}

export function parseEntityAlerts(entity: HassEntity): WeatherAlert[] {
  const adapter = adapterForAttributes(entity.attributes);
  if (!adapter) return [];
  return adapter.parse(entity.entity_id, entity.state, entity.attributes);
}

export function sortAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  return [...alerts].sort((a, b) => {
    const bySev = severityRank(b.severity) - severityRank(a.severity);
    if (bySev !== 0) return bySev;
    const aOnset = a.onset ?? "";
    const bOnset = b.onset ?? "";
    return aOnset.localeCompare(bOnset);
  });
}

export function dedupeAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  const seen = new Set<string>();
  const out: WeatherAlert[] = [];
  for (const alert of alerts) {
    if (seen.has(alert.id)) continue;
    seen.add(alert.id);
    out.push(alert);
  }
  return out;
}

/**
 * Drop alerts superseded via CAP `references`, then collapse near-duplicates
 * that share phenomenon + area + onset + severity but different CAP ids
 * (common for overlapping KNMI / MeteoAlarm messages).
 *
 * Soft-collapse requires a non-empty `areaDesc` on both sides — never hide
 * an alert when the area is missing or different.
 */
export function collapseNearDuplicateAlerts(
  alerts: WeatherAlert[],
): WeatherAlert[] {
  const afterRefs = collapseByReferences(alerts);
  const bestByKey = new Map<string, WeatherAlert>();
  const passthrough: WeatherAlert[] = [];

  for (const alert of afterRefs) {
    const key = softDedupeKey(alert);
    if (key == null) {
      passthrough.push(alert);
      continue;
    }
    const existing = bestByKey.get(key);
    if (!existing || preferAlert(alert, existing) < 0) {
      bestByKey.set(key, alert);
    }
  }

  const kept = new Set<WeatherAlert>([
    ...bestByKey.values(),
    ...passthrough,
  ]);
  return afterRefs.filter((a) => kept.has(a));
}

/** Null when area is missing — caller must not soft-collapse. */
function softDedupeKey(alert: WeatherAlert): string | null {
  const area = (alert.areaDesc ?? "").trim().toLowerCase();
  if (!area) return null;

  const type =
    alert.awarenessTypeCode != null
      ? `t:${alert.awarenessTypeCode}`
      : `e:${alert.event.trim().toLowerCase()}`;
  const onset = alert.onset ?? "";
  return `${type}|${area}|${onset}|${alert.severity}`;
}

/** Prefer left over right when compare < 0. */
function preferAlert(a: WeatherAlert, b: WeatherAlert): number {
  const bySev = severityRank(b.severity) - severityRank(a.severity);
  if (bySev !== 0) return bySev;

  const aUpdate = a.phase?.toLowerCase() === "update" ? 1 : 0;
  const bUpdate = b.phase?.toLowerCase() === "update" ? 1 : 0;
  if (aUpdate !== bUpdate) return bUpdate - aUpdate;

  const byLen = b.description.length - a.description.length;
  if (byLen !== 0) return byLen;

  return 0;
}

/**
 * If alert A’s `references` lists B’s `identifier`, drop B (A supersedes B).
 * CAP references are space-separated `sender,identifier,sent` triples
 * (bare identifiers also accepted).
 */
function collapseByReferences(alerts: WeatherAlert[]): WeatherAlert[] {
  const superseded = new Set<string>();

  for (const alert of alerts) {
    const referenced = referencedIdentifiers(alert.references);
    if (!referenced.size) continue;
    for (const other of alerts) {
      if (other === alert || !other.identifier) continue;
      if (referenced.has(other.identifier)) {
        superseded.add(other.id);
      }
    }
  }

  if (!superseded.size) return alerts;
  return alerts.filter((a) => !superseded.has(a.id));
}

/** Exact identifiers cited in a CAP `references` attribute. */
export function referencedIdentifiers(
  references: string | undefined,
): Set<string> {
  const out = new Set<string>();
  if (!references?.trim()) return out;
  for (const token of references.trim().split(/\s+/)) {
    if (!token) continue;
    const id = token.includes(",")
      ? token.split(",")[1]?.trim()
      : token.trim();
    if (id) out.add(id);
  }
  return out;
}
