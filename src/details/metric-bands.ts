/** Shared metric bands — used by detail copy and smart chips. */

export type DewComfort = "dry" | "comfortable" | "humid" | "muggy" | "unknown";

/** Dew-point comfort bands (also drives humidity detail copy). */
export function dewComfort(dewPoint: number | null | undefined): DewComfort {
  if (dewPoint == null || Number.isNaN(dewPoint)) return "unknown";
  if (dewPoint < 10) return "dry";
  if (dewPoint < 16) return "comfortable";
  if (dewPoint < 21) return "humid";
  return "muggy";
}

export type PressureBand = "low" | "normal" | "high" | "unknown";

/** Pressure band edges (hPa): below LOW is low, above HIGH is high. */
export const PRESSURE_LOW_HPA = 1000;
export const PRESSURE_HIGH_HPA = 1025;

/** Convert a pressure reading in `unit` to hPa (unknown units are taken as hPa). */
export function pressureToHpa(pressure: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u.includes("inhg") || u.includes("in")) return pressure * 33.8639;
  if (u.includes("mmhg")) return pressure * 1.33322;
  if (u.includes("kpa")) return pressure * 10;
  return pressure;
}

/** Pressure bands normalized to hPa. */
export function pressureBand(
  pressure: number | null | undefined,
  unit: string,
): PressureBand {
  if (pressure == null || Number.isNaN(pressure)) return "unknown";
  const hPa = pressureToHpa(pressure, unit);
  if (hPa < PRESSURE_LOW_HPA) return "low";
  if (hPa > PRESSURE_HIGH_HPA) return "high";
  return "normal";
}

/**
 * Smart-chip "noteworthy" cut-offs. Deliberately stricter than the comfort
 * and pressure bands above, which also drive detail copy and legends.
 */
export const HUMIDITY_CHIP_LOW = 25;
export const HUMIDITY_CHIP_HIGH = 80;
export const DEW_POINT_CHIP_LOW_C = 5;
export const DEW_POINT_CHIP_HIGH_C = 18;
export const PRESSURE_CHIP_LOW_HPA = 990;
export const PRESSURE_CHIP_HIGH_HPA = 1030;

export function isHumidityChipNoteworthy(
  humidity: number | null | undefined,
): boolean {
  if (humidity == null || Number.isNaN(humidity)) return false;
  return humidity <= HUMIDITY_CHIP_LOW || humidity >= HUMIDITY_CHIP_HIGH;
}

/** `unit` is the temperature unit of `dewPoint` (default °C). */
export function isDewPointChipNoteworthy(
  dewPoint: number | null | undefined,
  unit = "°C",
): boolean {
  if (dewPoint == null || Number.isNaN(dewPoint)) return false;
  const c = unit.toUpperCase().includes("F") ? ((dewPoint - 32) * 5) / 9 : dewPoint;
  return c < DEW_POINT_CHIP_LOW_C || c >= DEW_POINT_CHIP_HIGH_C;
}

export function isPressureChipNoteworthy(
  pressure: number | null | undefined,
  unit: string,
): boolean {
  if (pressure == null || Number.isNaN(pressure)) return false;
  const hPa = pressureToHpa(pressure, unit);
  return hPa < PRESSURE_CHIP_LOW_HPA || hPa > PRESSURE_CHIP_HIGH_HPA;
}

export type VisibilityBand = "fog" | "haze" | "clear" | "unknown";

/** Visibility bands normalized to km. */
export function visibilityBand(
  visibility: number | null | undefined,
  unit: string,
): VisibilityBand {
  if (visibility == null || Number.isNaN(visibility)) return "unknown";
  const u = unit.toLowerCase();
  let km = visibility;
  if (u.includes("mi")) km = visibility * 1.60934;
  else if (u.includes("ft") || u.includes("feet")) km = visibility * 0.0003048;
  if (km < 1) return "fog";
  if (km < 4) return "haze";
  return "clear";
}

export type CloudBand = "clear" | "partly" | "mostly" | "overcast" | "unknown";

export function cloudBand(coverage: number | null | undefined): CloudBand {
  if (coverage == null || Number.isNaN(coverage)) return "unknown";
  if (coverage < 25) return "clear";
  if (coverage < 65) return "partly";
  if (coverage < 90) return "mostly";
  return "overcast";
}
