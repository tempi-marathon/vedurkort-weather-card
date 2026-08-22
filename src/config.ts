import { ICON_STYLES, type IconStyle } from "./icons/allowlist";
import type { ActionConfig } from "./types";

export type PrecipType = "rainfall" | "probability";
export type CardLayout = "default" | "compact" | "minimal";
export const CARD_LAYOUTS: CardLayout[] = ["default", "compact", "minimal"];

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
  /** Show location/title header (uses `name` or entity friendly name). */
  show_name: boolean;
  /** Visual density: default, compact (inline hero), minimal (temp + icon). */
  layout: CardLayout;
  icon_style: IconStyle;
  animated_icons: boolean;
  animated_background: boolean;
  /** Current conditions (condition, temp, icon, detail chips). */
  show_current: boolean;
  show_sun: boolean;
  show_wind_speed: boolean;
  show_wind_direction: boolean;
  show_wind_gust: boolean;
  show_humidity: boolean;
  show_uv_index: boolean;
  show_pressure: boolean;
  show_cloud_coverage: boolean;
  show_feels_like: boolean;
  show_dew_point: boolean;
  show_visibility: boolean;
  show_precipitation: boolean;
  show_precipitation_probability: boolean;
  /**
   * Show weather alerts strip when an alert source is configured and active.
   * Default false — existing cards unchanged.
   */
  show_alerts: boolean;
  /** CAP Alerts (or similar) device id — discovers child alert sensors. */
  alerts_device?: string;
  /** MeteoAlarm / CAP alert entities to read (one or more). */
  alerts_entities?: string[];
  /** Optional override for current condition (scene, icon, label). Forecast unchanged. */
  condition_entity?: string;
  temperature_entity?: string;
  humidity_entity?: string;
  wind_speed_entity?: string;
  wind_bearing_entity?: string;
  wind_gust_entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
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
  show_name: true,
  layout: "default",
  show_current: true,
  show_sun: false,
  show_wind_speed: false,
  show_wind_direction: false,
  show_wind_gust: false,
  show_humidity: false,
  show_uv_index: false,
  show_pressure: false,
  show_cloud_coverage: false,
  show_feels_like: false,
  show_dew_point: false,
  show_visibility: false,
  show_precipitation: false,
  show_precipitation_probability: false,
  show_alerts: false,
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

  const alertsEntities = normalizeAlertEntities(input);

  return {
    ...DEFAULT_CONFIG,
    ...input,
    entity: input.entity ?? "",
    show_name: Boolean(input.show_name ?? DEFAULT_CONFIG.show_name),
    show_current: Boolean(
      input.show_current ?? DEFAULT_CONFIG.show_current,
    ),
    show_alerts: Boolean(input.show_alerts ?? DEFAULT_CONFIG.show_alerts),
    alerts_device: emptyToUndef(input.alerts_device),
    alerts_entities: alertsEntities.length ? alertsEntities : undefined,
    daily,
    hourly,
    icon_style: normalizeIconStyle(input.icon_style),
    layout: normalizeLayout(input.layout),
    animated_icons: input.animated_icons ?? DEFAULT_CONFIG.animated_icons,
    animated_background:
      input.animated_background ?? DEFAULT_CONFIG.animated_background,
    tap_action: input.tap_action,
    hold_action: input.hold_action,
    double_tap_action: input.double_tap_action,
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

function normalizeLayout(value: unknown): CardLayout {
  return CARD_LAYOUTS.includes(value as CardLayout)
    ? (value as CardLayout)
    : DEFAULT_CONFIG.layout;
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

function emptyToUndef(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t ? t : undefined;
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const t = item.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Merge legacy `alerts_entity` into `alerts_entities` on load. */
function normalizeAlertEntities(
  input: Partial<VedurkortCardConfig> & {
    alerts_entity?: string;
    alerts_entities?: string[];
  },
): string[] {
  const list = normalizeStringList(input.alerts_entities);
  const legacy =
    typeof input.alerts_entity === "string"
      ? input.alerts_entity.trim()
      : "";
  if (legacy && !list.includes(legacy)) {
    return [legacy, ...list];
  }
  return list;
}
