export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface HassConnection {
  subscribeMessage: <T>(
    callback: (message: T) => void,
    subscribeMessage: Record<string, unknown>,
  ) => Promise<() => void>;
}

/** Entity registry entry (present on hass in Lovelace). */
export interface HassEntityRegistryEntry {
  entity_id: string;
  device_id?: string | null;
  platform?: string;
  disabled_by?: string | null;
}

/** Device registry entry (present on hass in Lovelace). */
export interface HassDeviceRegistryEntry {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
}

export interface ActionConfig {
  action: string;
  entity?: string;
  navigation_path?: string;
  url_path?: string;
  service?: string;
  service_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
  confirmation?: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  /** Entity registry — used to resolve CAP Alerts device children. */
  entities?: Record<string, HassEntityRegistryEntry>;
  /** Device registry — used to label CAP Alerts devices in the editor. */
  devices?: Record<string, HassDeviceRegistryEntry>;
  locale?: { language?: string };
  language?: string;
  config: {
    unit_system: {
      temperature: string;
      length: string;
      pressure?: string;
      wind_speed?: string;
    };
    language?: string;
  };
  connection: HassConnection;
  callWS: <T>(message: Record<string, unknown>) => Promise<T>;
  callService?: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: Record<string, unknown>,
    returnResponse?: boolean,
  ) => Promise<unknown>;
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  formatEntityAttributeValue?: (
    stateObj: HassEntity,
    attribute: string,
    value?: unknown,
  ) => string;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: Record<string, unknown>): void;
}

export type HaWeatherCondition =
  | "clear-night"
  | "cloudy"
  | "fog"
  | "hail"
  | "lightning"
  | "lightning-rainy"
  | "partlycloudy"
  | "pouring"
  | "rainy"
  | "snowy"
  | "snowy-rainy"
  | "sunny"
  | "windy"
  | "windy-variant"
  | "exceptional"
  | string;

export interface ForecastItem {
  datetime: string;
  condition?: HaWeatherCondition;
  temperature?: number;
  templow?: number;
  apparent_temperature?: number;
  precipitation?: number;
  precipitation_probability?: number;
  wind_speed?: number;
  wind_bearing?: number | string;
  humidity?: number;
  is_daytime?: boolean;
  cloud_coverage?: number;
}
