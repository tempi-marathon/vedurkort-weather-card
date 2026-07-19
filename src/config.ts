import type { IconStyle } from "./icons/allowlist";

export type CardLayout = "basic" | "daily" | "hourly";
export type PrecipType = "rainfall" | "probability";

export interface ForecastBlockConfig {
  show_condition_icons: boolean;
  show_wind: boolean;
  precip_type: PrecipType;
}

export interface DailyConfig extends ForecastBlockConfig {
  days: number;
}

export interface HourlyConfig extends ForecastBlockConfig {
  hours: number;
}

export interface VedurkortCardConfig {
  type?: string;
  entity: string;
  layout: CardLayout;
  name?: string;
  icon_style: IconStyle;
  animated_icons: boolean;
  animated_background: boolean;
  show_sun: boolean;
  show_wind_speed: boolean;
  show_wind_direction: boolean;
  show_humidity: boolean;
  show_uv_index: boolean;
  show_pressure: boolean;
  show_cloud_coverage: boolean;
  show_feels_like: boolean;
  show_dew_point: boolean;
  show_visibility: boolean;
  temperature_entity?: string;
  humidity_entity?: string;
  wind_speed_entity?: string;
  wind_bearing_entity?: string;
  uv_index_entity?: string;
  pressure_entity?: string;
  cloud_coverage_entity?: string;
  feels_like_entity?: string;
  dew_point_entity?: string;
  visibility_entity?: string;
  sun_entity?: string;
  daily: DailyConfig;
  hourly: HourlyConfig;
}

const DEFAULT_FORECAST_BLOCK: ForecastBlockConfig = {
  show_condition_icons: true,
  show_wind: true,
  precip_type: "rainfall",
};

export const DEFAULT_CONFIG: Omit<VedurkortCardConfig, "entity"> = {
  layout: "basic",
  icon_style: "fill",
  animated_icons: true,
  animated_background: false,
  show_sun: false,
  show_wind_speed: false,
  show_wind_direction: false,
  show_humidity: false,
  show_uv_index: false,
  show_pressure: false,
  show_cloud_coverage: false,
  show_feels_like: false,
  show_dew_point: false,
  show_visibility: false,
  sun_entity: "sun.sun",
  daily: {
    ...DEFAULT_FORECAST_BLOCK,
    days: 5,
  },
  hourly: {
    ...DEFAULT_FORECAST_BLOCK,
    hours: 12,
  },
};

export function normalizeConfig(
  input: Partial<VedurkortCardConfig> & { entity?: string },
): VedurkortCardConfig {
  if (!input.entity) {
    throw new Error("Please define a weather entity");
  }

  const daily = {
    ...DEFAULT_CONFIG.daily,
    ...(input.daily ?? {}),
  };
  const hourly = {
    ...DEFAULT_CONFIG.hourly,
    ...(input.hourly ?? {}),
  };

  const legacy = (input as { forecast?: Partial<DailyConfig & HourlyConfig> })
    .forecast;
  if (legacy) {
    if (legacy.days != null) daily.days = legacy.days;
    if (legacy.hours != null) hourly.hours = legacy.hours;
    if (legacy.show_condition_icons != null) {
      daily.show_condition_icons = legacy.show_condition_icons;
      hourly.show_condition_icons = legacy.show_condition_icons;
    }
    if (legacy.show_wind != null) {
      daily.show_wind = legacy.show_wind;
      hourly.show_wind = legacy.show_wind;
    }
    if (legacy.precip_type != null) {
      daily.precip_type = legacy.precip_type;
      hourly.precip_type = legacy.precip_type;
    }
  }

  daily.days = clampInt(daily.days, 2, 7, DEFAULT_CONFIG.daily.days);
  hourly.hours = clampInt(hourly.hours, 2, 48, DEFAULT_CONFIG.hourly.hours);

  return {
    ...DEFAULT_CONFIG,
    ...input,
    entity: input.entity,
    daily,
    hourly,
    layout: input.layout ?? DEFAULT_CONFIG.layout,
    icon_style: input.icon_style ?? DEFAULT_CONFIG.icon_style,
    animated_icons: input.animated_icons ?? DEFAULT_CONFIG.animated_icons,
    animated_background:
      input.animated_background ?? DEFAULT_CONFIG.animated_background,
  };
}

function clampInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
