import type { HomeAssistant } from "../types";

export interface CapAlertDevice {
  id: string;
  name: string;
}

/**
 * Discover CAP Alerts devices from the entity registry / CAP marker attributes.
 */
export function findCapAlertDevices(hass: HomeAssistant): CapAlertDevice[] {
  const deviceIds = new Set<string>();

  const entities = hass.entities;
  if (!entities) return [];

  for (const entry of Object.values(entities)) {
    if (!entry.device_id || entry.disabled_by) continue;

    if (entry.platform === "cap_alerts") {
      deviceIds.add(entry.device_id);
      continue;
    }

    const state = hass.states[entry.entity_id];
    if (typeof state?.attributes.incident_platform_version === "string") {
      deviceIds.add(entry.device_id);
    }
  }

  return [...deviceIds]
    .map((id) => ({
      id,
      name: deviceLabel(hass, id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function deviceLabel(hass: HomeAssistant, deviceId: string): string {
  const device = hass.devices?.[deviceId];
  const named =
    (typeof device?.name_by_user === "string" && device.name_by_user) ||
    (typeof device?.name === "string" && device.name) ||
    "";
  return named.trim() || `CAP Alerts (${deviceId.slice(0, 8)})`;
}

/** Entity registry platform is `cap_alerts` (MeteoAlarm is the data provider, not the platform). */
export function isCapAlertsEntity(
  hass: HomeAssistant,
  entityId: string,
): boolean {
  const reg = hass.entities?.[entityId];
  if (reg?.platform === "cap_alerts") return true;
  const attrs = hass.states[entityId]?.attributes;
  return typeof attrs?.incident_platform_version === "string";
}

/** Core HA MeteoAlarm binary sensor (platform `meteoalarm`). */
export function isMeteoAlarmEntity(
  hass: HomeAssistant,
  entityId: string,
): boolean {
  const reg = hass.entities?.[entityId];
  if (reg?.platform === "meteoalarm") return true;
  const attribution = String(
    hass.states[entityId]?.attributes?.attribution ?? "",
  ).toLowerCase();
  return attribution.includes("meteoalarm");
}

export function deviceIdFromEntity(
  hass: HomeAssistant,
  entityId: string,
): string | undefined {
  const deviceId = hass.entities?.[entityId]?.device_id;
  return deviceId ?? undefined;
}

/** Pick a stable entity on a device for the editor picker display value. */
export function anchorEntityForDevice(
  hass: HomeAssistant,
  deviceId: string,
): string | undefined {
  const entities = hass.entities;
  if (!entities) return undefined;
  const onDevice = Object.values(entities).filter(
    (e) => e.device_id === deviceId,
  );
  const count = onDevice.find((e) => e.entity_id.includes("alert_count"));
  return count?.entity_id ?? onDevice[0]?.entity_id;
}

/**
 * Resolve which CAP device to use: explicit config, else the only discovered device.
 */
export function resolveCapDeviceId(
  hass: HomeAssistant,
  alertsDevice?: string,
): string | undefined {
  if (alertsDevice) return alertsDevice;
  const found = findCapAlertDevices(hass);
  return found.length === 1 ? found[0]!.id : undefined;
}
