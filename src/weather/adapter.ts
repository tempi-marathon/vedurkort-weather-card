import type { VedurkortCardConfig } from "../config";
import type {
  ForecastItem,
  HaWeatherCondition,
  HassEntity,
  HomeAssistant,
} from "../types";

export interface WeatherSnapshot {
  name: string;
  condition: HaWeatherCondition;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windBearing: number | string | null;
  temperatureUnit: string;
  windSpeedUnit: string;
  isDay: boolean;
  sunrise: string | null;
  sunset: string | null;
}

function numAttr(entity: HassEntity | undefined, key: string): number | null {
  if (!entity) return null;
  const v = entity.attributes[key];
  if (typeof v === "number") return v;
  if (typeof v === "string" && v !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return null;
}

function stateNumber(entity: HassEntity | undefined): number | null {
  if (!entity || entity.state === "unknown" || entity.state === "unavailable") {
    return null;
  }
  const n = Number(entity.state);
  return Number.isNaN(n) ? null : n;
}

export function isSunUp(hass: HomeAssistant, sunEntity = "sun.sun"): boolean {
  const sun = hass.states[sunEntity];
  if (!sun) return true;
  return sun.state === "above_horizon";
}

export function getWeatherSnapshot(
  hass: HomeAssistant,
  config: VedurkortCardConfig,
): WeatherSnapshot | null {
  const entity = hass.states[config.entity];
  if (!entity) return null;

  const tempOverride = config.temperature_entity
    ? hass.states[config.temperature_entity]
    : undefined;
  const humidOverride = config.humidity_entity
    ? hass.states[config.humidity_entity]
    : undefined;
  const windOverride = config.wind_speed_entity
    ? hass.states[config.wind_speed_entity]
    : undefined;
  const bearingOverride = config.wind_bearing_entity
    ? hass.states[config.wind_bearing_entity]
    : undefined;
  const sun = hass.states[config.sun_entity ?? "sun.sun"];

  const temperature =
    stateNumber(tempOverride) ?? numAttr(entity, "temperature");
  const humidity = stateNumber(humidOverride) ?? numAttr(entity, "humidity");
  const windSpeed =
    stateNumber(windOverride) ?? numAttr(entity, "wind_speed");
  const windBearing =
    stateNumber(bearingOverride) ??
    (entity.attributes.wind_bearing as number | string | undefined) ??
    null;

  const nextRising = sun?.attributes.next_rising as string | undefined;
  const nextSetting = sun?.attributes.next_setting as string | undefined;

  return {
    name:
      config.name ??
      (entity.attributes.friendly_name as string | undefined) ??
      config.entity,
    condition: entity.state as HaWeatherCondition,
    temperature,
    humidity,
    windSpeed,
    windBearing,
    temperatureUnit:
      (entity.attributes.temperature_unit as string | undefined) ??
      hass.config.unit_system.temperature ??
      "°C",
    windSpeedUnit:
      (entity.attributes.wind_speed_unit as string | undefined) ??
      hass.config.unit_system.wind_speed ??
      "km/h",
    isDay: isSunUp(hass, config.sun_entity ?? "sun.sun"),
    sunrise: nextRising ?? null,
    sunset: nextSetting ?? null,
  };
}

export async function fetchForecast(
  hass: HomeAssistant,
  entityId: string,
  type: "daily" | "hourly",
): Promise<ForecastItem[]> {
  try {
    const result = await hass.callWS<
      Record<string, { forecast: ForecastItem[] }>
    >({
      type: "weather/get_forecasts",
      entity_id: entityId,
      forecast_type: type,
    });
    return result?.[entityId]?.forecast ?? [];
  } catch {
    // Older HA or unsupported: try attributes.forecast
    const entity = hass.states[entityId];
    const legacy = entity?.attributes.forecast as ForecastItem[] | undefined;
    return legacy ?? [];
  }
}

export function formatTemp(
  value: number | null | undefined,
  unit: string,
  decimals = 0,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}${unit}`;
}

export function formatTime(iso: string | null, language?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(language ?? undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
