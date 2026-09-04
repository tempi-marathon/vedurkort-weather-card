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
  windGust: number | null;
  uvIndex: number | null;
  pressure: number | null;
  cloudCoverage: number | null;
  feelsLike: number | null;
  dewPoint: number | null;
  visibility: number | null;
  precipitation: number | null;
  precipitationProbability: number | null;
  temperatureUnit: string;
  windSpeedUnit: string;
  pressureUnit: string;
  visibilityUnit: string;
  precipitationUnit: string;
  isDay: boolean;
  /** Next upcoming sunrise (chip + hero at night). */
  sunrise: string | null;
  /** Next upcoming sunset (chip + hero by day). */
  sunset: string | null;
  /** Today's civil dawn, resolved from sun.sun. */
  dawn: string | null;
  /** Today's civil dusk, resolved from sun.sun. */
  dusk: string | null;
  /** Today's sunrise on the local calendar. */
  todaySunrise: string | null;
  /** Today's sunset on the local calendar. */
  todaySunset: string | null;
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

/** Map sun.sun next_* to an occurrence on today's local calendar date. */
export function resolveSunTimeToday(
  nextIso: string | undefined,
  nowMs = Date.now(),
): string | null {
  if (!nextIso) return null;
  const t = new Date(nextIso).getTime();
  if (Number.isNaN(t)) return null;

  const dayMs = 86_400_000;
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + dayMs;

  for (const offset of [-dayMs, 0, dayMs]) {
    const candidate = t + offset;
    if (candidate >= todayStart && candidate < todayEnd) {
      return new Date(candidate).toISOString();
    }
  }
  return null;
}

export type NextSunEvent = {
  kind: "sunrise" | "sunset";
  at: string;
};

/**
 * Sooner of next_rising / next_setting. Prefer this over snap.isDay for
 * sun chip/hero/copy — HA's above_horizon state can lag a few minutes after
 * attributes roll to the next day.
 */
export function nextSunEvent(
  snap: Pick<WeatherSnapshot, "sunrise" | "sunset">,
): NextSunEvent | null {
  const riseMs = snap.sunrise ? new Date(snap.sunrise).getTime() : NaN;
  const setMs = snap.sunset ? new Date(snap.sunset).getTime() : NaN;
  const riseOk = !Number.isNaN(riseMs);
  const setOk = !Number.isNaN(setMs);

  if (riseOk && setOk) {
    return riseMs <= setMs
      ? { kind: "sunrise", at: snap.sunrise! }
      : { kind: "sunset", at: snap.sunset! };
  }
  if (riseOk) return { kind: "sunrise", at: snap.sunrise! };
  if (setOk) return { kind: "sunset", at: snap.sunset! };
  return null;
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
  const gustOverride = config.wind_gust_entity
    ? hass.states[config.wind_gust_entity]
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
  const precipOverride = config.precipitation_entity
    ? hass.states[config.precipitation_entity]
    : undefined;
  const precipProbOverride = config.precipitation_probability_entity
    ? hass.states[config.precipitation_probability_entity]
    : undefined;
  const sun = hass.states[config.sun_entity ?? "sun.sun"];
  const conditionOverride = config.condition_entity
    ? hass.states[config.condition_entity]
    : undefined;
  const conditionState =
    conditionOverride &&
    conditionOverride.state !== "unknown" &&
    conditionOverride.state !== "unavailable"
      ? conditionOverride.state
      : entity.state;
  const condition = conditionState as HaWeatherCondition;

  const temperature =
    stateNumber(tempOverride) ?? numAttr(entity, "temperature");
  const humidity = stateNumber(humidOverride) ?? numAttr(entity, "humidity");
  const windSpeed =
    stateNumber(windOverride) ?? numAttr(entity, "wind_speed");
  const windBearing =
    stateNumber(bearingOverride) ??
    (entity.attributes.wind_bearing as number | string | undefined) ??
    null;
  const windGust =
    stateNumber(gustOverride) ?? numAttr(entity, "wind_gust");
  const uvIndex = stateNumber(uvOverride) ?? numAttr(entity, "uv_index");
  const pressure = stateNumber(pressureOverride) ?? numAttr(entity, "pressure");
  const cloudCoverage =
    stateNumber(cloudOverride) ?? numAttr(entity, "cloud_coverage");
  const feelsLike =
    stateNumber(feelsOverride) ?? numAttr(entity, "apparent_temperature");
  const dewPoint = stateNumber(dewOverride) ?? numAttr(entity, "dew_point");
  const visibility =
    stateNumber(visOverride) ?? numAttr(entity, "visibility");
  const precipitation =
    stateNumber(precipOverride) ?? numAttr(entity, "precipitation");
  const precipitationProbability =
    stateNumber(precipProbOverride) ??
    numAttr(entity, "precipitation_probability");

  const lengthUnit = hass.config.unit_system.length || "";
  const nextRising = sun?.attributes.next_rising as string | undefined;
  const nextSetting = sun?.attributes.next_setting as string | undefined;
  const nextDawn = sun?.attributes.next_dawn as string | undefined;
  const nextDusk = sun?.attributes.next_dusk as string | undefined;
  const nowMs = Date.now();

  const conditionLabel = formatConditionLabel(hass, entity, condition);

  return {
    name:
      config.name ??
      (entity.attributes.friendly_name as string | undefined) ??
      config.entity,
    condition,
    conditionLabel,
    temperature,
    humidity,
    windSpeed,
    windBearing,
    windGust,
    uvIndex,
    pressure,
    cloudCoverage,
    feelsLike,
    dewPoint,
    visibility,
    precipitation,
    precipitationProbability,
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
    precipitationUnit:
      sensorUnit(precipOverride) ??
      (entity.attributes.precipitation_unit as string | undefined) ??
      "mm",
    isDay: isSunUp(hass, config.sun_entity ?? "sun.sun"),
    sunrise: nextRising ?? null,
    sunset: nextSetting ?? null,
    dawn: resolveSunTimeToday(nextDawn, nowMs),
    dusk: resolveSunTimeToday(nextDusk, nowMs),
    todaySunrise: resolveSunTimeToday(nextRising, nowMs),
    todaySunset: resolveSunTimeToday(nextSetting, nowMs),
    entity,
  };
}

export type ForecastType = "daily" | "hourly";

/**
 * Subscribe to forecasts the same way core Lovelace does
 * (`weather/subscribe_forecast`, HA 2023.9+). Falls back to the
 * `weather.get_forecasts` service when subscribe is unavailable.
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
    try {
      const items = await fetchForecastViaService(hass, entityId, type);
      if (items.length) {
        apply(items, null);
      } else {
        apply(
          [],
          subErr instanceof Error
            ? subErr.message
            : `Forecast type "${type}" not available for ${entityId}`,
        );
      }
    } catch (svcErr) {
      apply(
        [],
        svcErr instanceof Error ? svcErr.message : "Failed to load forecast",
      );
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

  return [];
}

/**
 * One-shot forecast read for the config editor. Uses `weather/subscribe_forecast`
 * (same as core Lovelace) and legacy attributes only — never calls
 * `weather.get_forecasts`, which triggers HA global error toasts.
 */
export async function fetchForecastOnce(
  hass: HomeAssistant,
  entityId: string,
  type: ForecastType,
): Promise<ForecastItem[]> {
  return new Promise((resolve) => {
    let settled = false;
    let unsub: (() => void) | undefined;

    const finish = (items: ForecastItem[]) => {
      if (settled) return;
      settled = true;
      unsub?.();
      resolve(items);
    };

    void hass.connection
      .subscribeMessage<{ forecast?: ForecastItem[] | null }>(
        (event) => {
          finish(event?.forecast ?? []);
        },
        {
          type: "weather/subscribe_forecast",
          entity_id: entityId,
          forecast_type: type,
        },
      )
      .then((u) => {
        unsub = u;
      })
      .catch(() => {
        finish(getLegacyForecast(hass, entityId));
      });
  });
}

function getLegacyForecast(
  hass: HomeAssistant,
  entityId: string,
): ForecastItem[] {
  const entity = hass.states[entityId];
  return (entity?.attributes.forecast as ForecastItem[] | undefined) ?? [];
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

export function formatPrecip(
  value: number | null | undefined,
  unit: string,
): string | null {
  if (value == null || Number.isNaN(value)) return null;
  const rounded =
    Math.abs(value) >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${unit}`.trim();
}
