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
