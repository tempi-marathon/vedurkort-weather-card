export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language?: string };
  config: {
    unit_system: {
      temperature: string;
      length: string;
      wind_speed?: string;
    };
    language?: string;
  };
  callWS: <T>(message: Record<string, unknown>) => Promise<T>;
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
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
  precipitation?: number;
  precipitation_probability?: number;
  wind_speed?: number;
  wind_bearing?: number | string;
  humidity?: number;
}
