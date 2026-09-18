/** Pollen types for the Veðurkort card (reads ha-pollen entities). */

export type PollenLevelLabel = "none" | "low" | "high";

export type PollenSpeciesKey =
  | "alder"
  | "birch"
  | "grass"
  | "mugwort"
  | "olive"
  | "ragweed"
  | "overall";

export interface PollenForecastPoint {
  t: string;
  value: number | null;
}

export interface PollenDailyPeak {
  date: string;
  value: number | null;
}

export interface PollenSpeciesReading {
  species: Exclude<PollenSpeciesKey, "overall">;
  entityId: string;
  current: number | null;
  unit: string;
  level: number | null;
  levelLabel: PollenLevelLabel | null;
  forecastHourly: PollenForecastPoint[];
  forecastDaily: PollenDailyPeak[];
}

export interface PollenSnapshot {
  deviceId: string;
  provider: string;
  overallLevel: number | null;
  overallLevelLabel: PollenLevelLabel | null;
  dominantSpecies: Exclude<PollenSpeciesKey, "overall"> | null;
  overallEntityId: string | null;
  forecastHourly: PollenForecastPoint[];
  forecastDaily: PollenDailyPeak[];
  species: PollenSpeciesReading[];
  attribution: string | null;
}
