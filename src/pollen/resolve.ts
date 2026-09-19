import type { VedurkortCardConfig } from "../config";
import type { HassEntity, HomeAssistant } from "../types";
import {
  entitiesForPollenDevice,
  resolvePollenDeviceId,
} from "./discovery";
import type {
  PollenDailyPeak,
  PollenForecastPoint,
  PollenLevelLabel,
  PollenSnapshot,
  PollenSpeciesKey,
  PollenSpeciesReading,
} from "./types";

const SPECIES_KEYS = new Set([
  "alder",
  "birch",
  "grass",
  "mugwort",
  "olive",
  "ragweed",
]);

/**
 * Resolve pollen snapshot from the configured (or sole) ha-pollen device.
 * Returns null when show_pollen is off or no device/data is available.
 */
export function resolvePollen(
  hass: HomeAssistant,
  config: Pick<VedurkortCardConfig, "show_pollen" | "pollen_device">,
): PollenSnapshot | null {
  if (!config.show_pollen) return null;

  const deviceId = resolvePollenDeviceId(hass, config.pollen_device);
  if (!deviceId) return null;

  const entityIds = entitiesForPollenDevice(hass, deviceId);
  if (!entityIds.length) return null;

  let overall: HassEntity | undefined;
  const species: PollenSpeciesReading[] = [];

  for (const entityId of entityIds) {
    const entity = hass.states[entityId];
    if (!entity) continue;
    const key = speciesKeyFromEntity(entity);
    if (key === "overall") {
      overall = entity;
      continue;
    }
    if (!key || !SPECIES_KEYS.has(key)) continue;
    species.push(readingFromEntity(entity, key));
  }

  species.sort((a, b) => a.species.localeCompare(b.species));

  if (!overall && !species.length) return null;

  const overallLevelLabel = parseLevelLabel(
    overall?.attributes.level_label ?? overall?.state,
  );
  const overallLevel =
    typeof overall?.attributes.level === "number"
      ? overall.attributes.level
      : overallLevelLabel
        ? levelFromLabel(overallLevelLabel)
        : maxLevel(species);

  const dominantRaw = overall?.attributes.dominant_species;
  const dominantSpecies =
    typeof dominantRaw === "string" && SPECIES_KEYS.has(dominantRaw)
      ? (dominantRaw as Exclude<PollenSpeciesKey, "overall">)
      : dominantFromSpecies(species);

  const forecastHourly =
    parseHourly(overall?.attributes.forecast_hourly) ??
    maxHourlyAcross(species);
  const forecastDaily =
    parseDaily(overall?.attributes.forecast_daily) ??
    maxDailyAcross(species);

  const attribution =
    typeof overall?.attributes.attribution === "string"
      ? overall.attributes.attribution
      : typeof species[0] &&
          typeof hass.states[species[0].entityId]?.attributes.attribution ===
            "string"
        ? String(hass.states[species[0].entityId]!.attributes.attribution)
        : null;

  return {
    deviceId,
    provider: String(overall?.attributes.provider ?? "open_meteo"),
    overallLevel: overallLevel ?? null,
    overallLevelLabel:
      overallLevelLabel ??
      (overallLevel != null ? labelFromLevel(overallLevel) : null),
    dominantSpecies,
    overallEntityId: overall?.entity_id ?? null,
    forecastHourly,
    forecastDaily,
    species,
    attribution,
  };
}

function speciesKeyFromEntity(entity: HassEntity): PollenSpeciesKey | null {
  const attr = entity.attributes.species;
  if (typeof attr === "string") {
    if (attr === "overall" || SPECIES_KEYS.has(attr)) {
      return attr as PollenSpeciesKey;
    }
  }
  const id = entity.entity_id;
  if (id.includes("overall")) return "overall";
  for (const key of SPECIES_KEYS) {
    if (id.endsWith(`_${key}`) || id.includes(`pollen_${key}`)) {
      return key as PollenSpeciesKey;
    }
  }
  return null;
}

function readingFromEntity(
  entity: HassEntity,
  species: Exclude<PollenSpeciesKey, "overall">,
): PollenSpeciesReading {
  const current = stateNumber(entity);
  const levelLabel = parseLevelLabel(entity.attributes.level_label);
  const level =
    typeof entity.attributes.level === "number"
      ? entity.attributes.level
      : levelLabel
        ? levelFromLabel(levelLabel)
        : null;
  return {
    species,
    entityId: entity.entity_id,
    current,
    unit: String(entity.attributes.unit ?? "grains_m3"),
    level,
    levelLabel,
    forecastHourly: parseHourly(entity.attributes.forecast_hourly) ?? [],
    forecastDaily: parseDaily(entity.attributes.forecast_daily) ?? [],
  };
}

function stateNumber(entity: HassEntity): number | null {
  if (entity.state === "unknown" || entity.state === "unavailable") return null;
  const n = Number(entity.state);
  return Number.isNaN(n) ? null : n;
}

function parseLevelLabel(value: unknown): PollenLevelLabel | null {
  if (
    value === "none" ||
    value === "low" ||
    value === "medium" ||
    value === "high"
  ) {
    return value;
  }
  return null;
}

function levelFromLabel(label: PollenLevelLabel): number {
  if (label === "high") return 3;
  if (label === "medium") return 2;
  if (label === "low") return 1;
  return 0;
}

function labelFromLevel(level: number): PollenLevelLabel {
  if (level >= 3) return "high";
  if (level >= 2) return "medium";
  if (level >= 1) return "low";
  return "none";
}

function maxLevel(species: PollenSpeciesReading[]): number | null {
  let max: number | null = null;
  for (const s of species) {
    if (s.level == null) continue;
    if (max == null || s.level > max) max = s.level;
  }
  return max;
}

function dominantFromSpecies(
  species: PollenSpeciesReading[],
): Exclude<PollenSpeciesKey, "overall"> | null {
  let best: PollenSpeciesReading | null = null;
  for (const s of species) {
    if (s.level == null || s.level <= 0) continue;
    if (
      !best ||
      (s.level ?? 0) > (best.level ?? 0) ||
      ((s.level ?? 0) === (best.level ?? 0) &&
        (s.current ?? 0) > (best.current ?? 0))
    ) {
      best = s;
    }
  }
  return best?.species ?? null;
}

function parseHourly(raw: unknown): PollenForecastPoint[] | null {
  if (!Array.isArray(raw)) return null;
  const out: PollenForecastPoint[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const t = (item as { t?: unknown }).t;
    const value = (item as { value?: unknown }).value;
    if (typeof t !== "string") continue;
    out.push({
      t,
      value: typeof value === "number" ? value : null,
    });
  }
  return out;
}

function parseDaily(raw: unknown): PollenDailyPeak[] | null {
  if (!Array.isArray(raw)) return null;
  const out: PollenDailyPeak[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const date = (item as { date?: unknown }).date;
    const value = (item as { value?: unknown }).value;
    if (typeof date !== "string") continue;
    out.push({
      date,
      value: typeof value === "number" ? value : null,
    });
  }
  return out;
}

function maxHourlyAcross(
  species: PollenSpeciesReading[],
): PollenForecastPoint[] {
  const first = species.find((s) => s.forecastHourly.length)?.forecastHourly;
  if (!first?.length) return [];
  return first.map((p, i) => {
    const values = species
      .map((s) => s.forecastHourly[i]?.value)
      .filter((v): v is number => v != null);
    return { t: p.t, value: values.length ? Math.max(...values) : null };
  });
}

function maxDailyAcross(species: PollenSpeciesReading[]): PollenDailyPeak[] {
  const byDate = new Map<string, number[]>();
  for (const s of species) {
    for (const d of s.forecastDaily) {
      if (d.value == null) continue;
      const list = byDate.get(d.date) ?? [];
      list.push(d.value);
      byDate.set(d.date, list);
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, value: Math.max(...vals) }));
}
