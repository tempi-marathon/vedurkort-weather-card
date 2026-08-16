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
  severity: AlertSeverity;
  severityLabel: string;
  /** MeteoAlarm awareness color label when present (yellow / orange / red). */
  awarenessColor?: string;
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
