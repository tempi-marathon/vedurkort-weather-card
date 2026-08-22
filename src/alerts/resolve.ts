import type { VedurkortCardConfig } from "../config";
import type { HassEntity, HomeAssistant } from "../types";
import {
  dedupeAlerts,
  parseEntityAlerts,
  sortAlerts,
} from "./adapters";
import { resolveCapDeviceId } from "./discovery";
import type { WeatherAlert } from "./types";

/**
 * Resolve active alerts from config + hass state.
 * Order: alerts_device (or sole discovered CAP device) → alerts_entities.
 * Returns [] when show_alerts is off or nothing active.
 */
export function resolveAlerts(
  hass: HomeAssistant,
  config: Pick<
    VedurkortCardConfig,
    "show_alerts" | "alerts_device" | "alerts_entities"
  >,
): WeatherAlert[] {
  if (!config.show_alerts) return [];

  const entities = collectAlertEntities(hass, config);
  const alerts: WeatherAlert[] = [];
  for (const entity of entities) {
    alerts.push(...parseEntityAlerts(entity));
  }
  return sortAlerts(dedupeAlerts(alerts));
}

function collectAlertEntities(
  hass: HomeAssistant,
  config: Pick<
    VedurkortCardConfig,
    "alerts_device" | "alerts_entities"
  >,
): HassEntity[] {
  const out: HassEntity[] = [];
  const seen = new Set<string>();

  const push = (entityId: string | undefined) => {
    if (!entityId || seen.has(entityId)) return;
    const entity = hass.states[entityId];
    if (!entity) return;
    seen.add(entityId);
    out.push(entity);
  };

  const deviceId = resolveCapDeviceId(hass, config.alerts_device);
  const hasExplicitEntity = Boolean(config.alerts_entities?.length);

  // Prefer CAP device when set or uniquely discoverable; skip auto device
  // when the user explicitly chose entity source(s) only.
  if (deviceId && (config.alerts_device || !hasExplicitEntity)) {
    for (const id of entitiesForDevice(hass, deviceId)) {
      push(id);
    }
  }

  for (const id of config.alerts_entities ?? []) {
    push(id);
  }

  return out;
}

/** Entity IDs belonging to a device (CAP Alerts grouping). */
export function entitiesForDevice(
  hass: HomeAssistant,
  deviceId: string,
): string[] {
  const entities = hass.entities;
  if (entities) {
    return Object.values(entities)
      .filter((e) => e.device_id === deviceId)
      .map((e) => e.entity_id);
  }

  // Fallback when entity registry isn’t on hass (rare in Lovelace): scan CAP markers.
  return Object.keys(hass.states).filter((id) => {
    const attrs = hass.states[id]?.attributes ?? {};
    return typeof attrs.incident_platform_version === "string";
  });
}
