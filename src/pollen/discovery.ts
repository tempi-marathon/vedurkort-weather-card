import type { HomeAssistant } from "../types";

export interface PollenDevice {
  id: string;
  name: string;
}

/** Discover ha-pollen devices (entity registry platform `pollen`). */
export function findPollenDevices(hass: HomeAssistant): PollenDevice[] {
  const deviceIds = new Set<string>();
  const entities = hass.entities;
  if (!entities) return [];

  for (const entry of Object.values(entities)) {
    if (!entry.device_id || entry.disabled_by) continue;
    if (entry.platform === "pollen") {
      deviceIds.add(entry.device_id);
      continue;
    }
    const state = hass.states[entry.entity_id];
    if (state?.attributes?.provider === "open_meteo") {
      const species = state.attributes.species;
      if (
        typeof species === "string" &&
        (species === "overall" ||
          species === "grass" ||
          species === "birch" ||
          species === "alder" ||
          species === "mugwort" ||
          species === "olive" ||
          species === "ragweed")
      ) {
        deviceIds.add(entry.device_id);
      }
    }
  }

  return [...deviceIds]
    .map((id) => ({ id, name: deviceLabel(hass, id) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function deviceLabel(hass: HomeAssistant, deviceId: string): string {
  const device = hass.devices?.[deviceId];
  const named =
    (typeof device?.name_by_user === "string" && device.name_by_user) ||
    (typeof device?.name === "string" && device.name) ||
    "";
  return named.trim() || `Pollen (${deviceId.slice(0, 8)})`;
}

export function resolvePollenDeviceId(
  hass: HomeAssistant,
  pollenDevice?: string,
): string | undefined {
  if (pollenDevice) return pollenDevice;
  const found = findPollenDevices(hass);
  return found.length === 1 ? found[0]!.id : undefined;
}

export function entitiesForPollenDevice(
  hass: HomeAssistant,
  deviceId: string,
): string[] {
  const entities = hass.entities;
  if (!entities) return [];
  return Object.values(entities)
    .filter((e) => e.device_id === deviceId && !e.disabled_by)
    .map((e) => e.entity_id);
}

export function anchorEntityForPollenDevice(
  hass: HomeAssistant,
  deviceId: string,
): string | undefined {
  const ids = entitiesForPollenDevice(hass, deviceId);
  return (
    ids.find((id) => id.endsWith("_overall") || id.includes("pollen_overall")) ??
    ids[0]
  );
}
