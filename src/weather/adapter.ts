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
  conditionLabel: string;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windBearing: number | string | null;
  uvIndex: number | null;
  pressure: number | null;
  cloudCoverage: number | null;
  feelsLike: number | null;
  dewPoint: number | null;
  visibility: number | null;
  temperatureUnit: string;
  windSpeedUnit: string;
  pressureUnit: string;
  visibilityUnit: string;
  isDay: boolean;
  sunrise: string | null;
  sunset: string | null;
  entity: HassEntity;
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

function sensorUnit(entity: HassEntity | undefined): string | undefined {
  const u = entity?.attributes.unit_of_measurement;
  return typeof u === "string" ? u : undefined;
}

export function isSunUp(hass: HomeAssistant, sunEntity = "sun.sun"): boolean {
  const sun = hass.states[sunEntity];
  if (!sun) return true;
  return sun.state === "above_horizon";
}

/**
 * Whether `iso` falls in daytime for the location, using sun.sun
 * next_rising / next_setting (±1 day). Avoids the crude 06–20 clock heuristic
 * that shows night icons before summer sunsets.
 */
export function isDaytimeAt(
  hass: HomeAssistant,
  iso: string,
  sunEntity = "sun.sun",
): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) {
    const hour = new Date(iso).getHours();
    return hour >= 6 && hour < 20;
  }

  const sun = hass.states[sunEntity];
  const nextRising = sun?.attributes.next_rising as string | undefined;
  const nextSetting = sun?.attributes.next_setting as string | undefined;
  if (!nextRising || !nextSetting) {
    const hour = new Date(iso).getHours();
    return hour >= 6 && hour < 20;
  }

  const rising = new Date(nextRising).getTime();
  const setting = new Date(nextSetting).getTime();
  if (Number.isNaN(rising) || Number.isNaN(setting)) {
    const hour = new Date(iso).getHours();
    return hour >= 6 && hour < 20;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  // Check this rising/setting pair and neighbors (±1 day).
  for (const offset of [-dayMs, 0, dayMs]) {
    const r = rising + offset;
    const s = setting + offset;
    if (r < s) {
      if (t >= r && t < s) return true;
    } else {
      // Setting comes before rising across midnight (pair from adjacent days).
      // Day spans previous rise → this setting, or this rise → next setting.
      if (t >= r - dayMs && t < s) return true;
      if (t >= r && t < s + dayMs) return true;
    }
  }
  return false;
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
  const uvOverride = config.uv_index_entity
    ? hass.states[config.uv_index_entity]
    : undefined;
  const pressureOverride = config.pressure_entity
    ? hass.states[config.pressure_entity]
    : undefined;
  const cloudOverride = config.cloud_coverage_entity
    ? hass.states[config.cloud_coverage_entity]
    : undefined;
  const feelsOverride = config.feels_like_entity
    ? hass.states[config.feels_like_entity]
    : undefined;
  const dewOverride = config.dew_point_entity
    ? hass.states[config.dew_point_entity]
    : undefined;
  const visOverride = config.visibility_entity
    ? hass.states[config.visibility_entity]
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
  const uvIndex = stateNumber(uvOverride) ?? numAttr(entity, "uv_index");
  const pressure = stateNumber(pressureOverride) ?? numAttr(entity, "pressure");
  const cloudCoverage =
    stateNumber(cloudOverride) ?? numAttr(entity, "cloud_coverage");
  const feelsLike =
    stateNumber(feelsOverride) ?? numAttr(entity, "apparent_temperature");
  const dewPoint = stateNumber(dewOverride) ?? numAttr(entity, "dew_point");
  const visibility =
    stateNumber(visOverride) ?? numAttr(entity, "visibility");

  const lengthUnit = hass.config.unit_system.length || "";
  const nextRising = sun?.attributes.next_rising as string | undefined;
  const nextSetting = sun?.attributes.next_setting as string | undefined;

  const conditionLabel = formatConditionLabel(hass, entity, entity.state);

  return {
    name:
      config.name ??
      (entity.attributes.friendly_name as string | undefined) ??
      config.entity,
    condition: entity.state as HaWeatherCondition,
    conditionLabel,
    temperature,
    humidity,
    windSpeed,
    windBearing,
    uvIndex,
    pressure,
    cloudCoverage,
    feelsLike,
    dewPoint,
    visibility,
    temperatureUnit:
      sensorUnit(tempOverride) ??
      (entity.attributes.temperature_unit as string | undefined) ??
      hass.config.unit_system.temperature ??
      "°C",
    windSpeedUnit:
      sensorUnit(windOverride) ??
      (entity.attributes.wind_speed_unit as string | undefined) ??
      hass.config.unit_system.wind_speed ??
      `${lengthUnit}/h`,
    pressureUnit:
      sensorUnit(pressureOverride) ??
      (entity.attributes.pressure_unit as string | undefined) ??
      hass.config.unit_system.pressure ??
      (lengthUnit === "km" ? "hPa" : "inHg"),
    visibilityUnit:
      sensorUnit(visOverride) ??
      (entity.attributes.visibility_unit as string | undefined) ??
      lengthUnit ??
      "km",
    isDay: isSunUp(hass, config.sun_entity ?? "sun.sun"),
    sunrise: nextRising ?? null,
    sunset: nextSetting ?? null,
    entity,
  };
}

export type ForecastType = "daily" | "hourly";

/**
 * Subscribe to forecasts the same way core Lovelace does
 * (`weather/subscribe_forecast`). Falls back to the
 * `weather.get_forecasts` service (return_response), then legacy attributes.
 */
export async function subscribeForecast(
  hass: HomeAssistant,
  entityId: string,
  type: ForecastType,
  onUpdate: (items: ForecastItem[], error: string | null) => void,
): Promise<() => void> {
  let unsub: (() => void) | undefined;
  let cancelled = false;

  const apply = (items: ForecastItem[], error: string | null = null) => {
    if (!cancelled) onUpdate(items, error);
  };

  try {
    unsub = await hass.connection.subscribeMessage<{
      type?: string;
      forecast?: ForecastItem[] | null;
    }>(
      (event) => {
        apply(event?.forecast ?? [], null);
      },
      {
        type: "weather/subscribe_forecast",
        entity_id: entityId,
        forecast_type: type,
      },
    );
    return () => {
      cancelled = true;
      unsub?.();
    };
  } catch (subErr) {
    // Fall through to service call
    try {
      const items = await fetchForecastViaService(hass, entityId, type);
      apply(items, items.length ? null : null);
      if (!items.length) {
        const legacy = getLegacyForecast(hass, entityId);
        if (legacy.length) {
          apply(legacy);
        } else {
          apply(
            [],
            subErr instanceof Error
              ? subErr.message
              : `Forecast type "${type}" not available for ${entityId}`,
          );
        }
      }
    } catch (svcErr) {
      const legacy = getLegacyForecast(hass, entityId);
      if (legacy.length) {
        apply(legacy);
      } else {
        apply(
          [],
          svcErr instanceof Error
            ? svcErr.message
            : "Failed to load forecast",
        );
      }
    }
    return () => {
      cancelled = true;
    };
  }
}

async function fetchForecastViaService(
  hass: HomeAssistant,
  entityId: string,
  type: ForecastType,
): Promise<ForecastItem[]> {
  // Prefer callWS call_service with return_response (HA 2023.12+)
  try {
    const result = await hass.callWS<{
      response?: Record<string, { forecast?: ForecastItem[] }>;
    }>({
      type: "call_service",
      domain: "weather",
      service: "get_forecasts",
      target: { entity_id: entityId },
      service_data: { type },
      return_response: true,
    });
    const map = result?.response ?? (result as unknown as Record<string, { forecast?: ForecastItem[] }>);
    const forecast =
      map?.[entityId]?.forecast ??
      (result as { response?: Record<string, { forecast?: ForecastItem[] }> })
        ?.response?.[entityId]?.forecast;
    if (forecast?.length) return forecast;
  } catch {
    // continue
  }

  if (hass.callService) {
    const result = (await hass.callService(
      "weather",
      "get_forecasts",
      { type },
      { entity_id: entityId },
      true,
    )) as
      | { response?: Record<string, { forecast?: ForecastItem[] }> }
      | Record<string, { forecast?: ForecastItem[] }>
      | undefined;
    const map =
      (result as { response?: Record<string, { forecast?: ForecastItem[] }> })
        ?.response ??
      (result as Record<string, { forecast?: ForecastItem[] }>);
    return map?.[entityId]?.forecast ?? [];
  }

  return [];
}

function getLegacyForecast(
  hass: HomeAssistant,
  entityId: string,
): ForecastItem[] {
  const entity = hass.states[entityId];
  return (entity?.attributes.forecast as ForecastItem[] | undefined) ?? [];
}

/** @deprecated Prefer subscribeForecast; kept for one-shot callers */
export async function fetchForecast(
  hass: HomeAssistant,
  entityId: string,
  type: ForecastType,
): Promise<ForecastItem[]> {
  const viaService = await fetchForecastViaService(hass, entityId, type);
  if (viaService.length) return viaService;
  return getLegacyForecast(hass, entityId);
}

export function formatConditionLabel(
  hass: HomeAssistant,
  entity: HassEntity | undefined,
  condition: string | undefined,
): string {
  const raw = (condition ?? "unknown").replace(/-/g, " ");
  if (!entity || !condition) return raw;
  return hass.formatEntityState?.(entity, condition) ?? raw;
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

export function formatNumber(
  value: number | null | undefined,
  suffix = "",
  decimals = 0,
): string | null {
  if (value == null || Number.isNaN(value)) return null;
  return `${value.toFixed(decimals)}${suffix}`;
}
