import { ICON_STYLES, type IconStyle } from "./icons/allowlist";

export type PrecipType = "rainfall" | "probability";

export interface ForecastBlockConfig {
  enabled: boolean;
  show_condition_icons: boolean;
  show_wind_speed: boolean;
  show_wind_direction: boolean;
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
  name?: string;
  icon_style: IconStyle;
  animated_icons: boolean;
  animated_background: boolean;
  /** Current conditions header (location, condition, temp, icon). */
  show_current: boolean;
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
  show_precipitation: boolean;
  show_precipitation_probability: boolean;
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
  precipitation_entity?: string;
  precipitation_probability_entity?: string;
  sun_entity?: string;
  daily: DailyConfig;
  hourly: HourlyConfig;
}

const DEFAULT_FORECAST_BLOCK: ForecastBlockConfig = {
  enabled: false,
  show_condition_icons: true,
  show_wind_speed: true,
  show_wind_direction: true,
  precip_type: "rainfall",
};

export const DEFAULT_CONFIG: Omit<VedurkortCardConfig, "entity"> = {
  icon_style: "fill",
  animated_icons: true,
  animated_background: false,
  show_current: true,
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
  show_precipitation: false,
  show_precipitation_probability: false,
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

/** Config while editing; entity may be blank until the user picks one. */
export type VedurkortEditorConfig = Omit<VedurkortCardConfig, "entity"> & {
  entity?: string;
};

function mergeConfigFields(
  input: Partial<VedurkortCardConfig> & { entity?: string },
): VedurkortEditorConfig {
  const daily = {
    ...DEFAULT_CONFIG.daily,
    ...(input.daily ?? {}),
  };
  const hourly = {
    ...DEFAULT_CONFIG.hourly,
    ...(input.hourly ?? {}),
  };

  daily.days = clampInt(daily.days, 2, 7, DEFAULT_CONFIG.daily.days);
  hourly.hours = clampInt(hourly.hours, 2, 48, DEFAULT_CONFIG.hourly.hours);
  daily.enabled = Boolean(daily.enabled);
  hourly.enabled = Boolean(hourly.enabled);

  return {
    ...DEFAULT_CONFIG,
    ...input,
    entity: input.entity ?? "",
    show_current: Boolean(
      input.show_current ?? DEFAULT_CONFIG.show_current,
    ),
    daily,
    hourly,
    icon_style: normalizeIconStyle(input.icon_style),
    animated_icons: input.animated_icons ?? DEFAULT_CONFIG.animated_icons,
    animated_background:
      input.animated_background ?? DEFAULT_CONFIG.animated_background,
  };
}

export function normalizeEditorConfig(
  input: Partial<VedurkortEditorConfig>,
): VedurkortEditorConfig {
  return mergeConfigFields(input);
}

export function normalizeConfig(
  input: Partial<VedurkortCardConfig> & { entity?: string },
): VedurkortCardConfig {
  if (!input.entity) {
    throw new Error("Please define a weather entity");
  }

  return mergeConfigFields(input) as VedurkortCardConfig;
}

function normalizeIconStyle(value: unknown): IconStyle {
  return ICON_STYLES.includes(value as IconStyle)
    ? (value as IconStyle)
    : DEFAULT_CONFIG.icon_style;
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
