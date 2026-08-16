export type AlertProvider = "cap" | "meteoalarm" | "unknown";

export type AlertSeverity =
  | "unknown"
  | "minor"
  | "moderate"
  | "severe"
  | "extreme";

export interface WeatherAlert {
  id: string;
  provider: AlertProvider;
  event: string;
  headline: string;
  description: string;
  instruction: string;
  /** Affected area from CAP `area_desc` when present. */
  areaDesc?: string;
  severity: AlertSeverity;
  severityLabel: string;
  /** MeteoAlarm awareness color label when present (yellow / orange / red). */
  awarenessColor?: string;
  /** MeteoAlarm awareness_type numeric id when present. */
  awarenessTypeCode?: number;
  /** English awareness_type label when present (e.g. high-temperature). */
  awarenessType?: string;
  /** Lifecycle label when present (e.g. New, Update). */
  phase?: string;
  /**
   * Provider MDI icon from entity attributes (e.g. mdi:weather-fog).
   * Never rendered as MDI — mapped to a Meteocon in `alertIconName`.
   */
  providerIcon?: string;
  onset?: string;
  expires?: string;
  entityId?: string;
}

export interface AlertAdapter {
  provider: AlertProvider;
  canHandle(attributes: Record<string, unknown>): boolean;
  /** Return alerts for this entity; empty when inactive / not applicable. */
  parse(
    entityId: string,
    state: string,
    attributes: Record<string, unknown>,
  ): WeatherAlert[];
}
