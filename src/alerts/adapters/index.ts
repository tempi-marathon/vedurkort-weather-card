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
