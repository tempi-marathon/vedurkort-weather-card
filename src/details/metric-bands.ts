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

/** Pressure bands normalized to hPa. */
export function pressureBand(
  pressure: number | null | undefined,
  unit: string,
): PressureBand {
  if (pressure == null || Number.isNaN(pressure)) return "unknown";
  const u = unit.toLowerCase();
  let hPa = pressure;
  if (u.includes("inhg") || u.includes("in")) hPa = pressure * 33.8639;
  else if (u.includes("mbar") || u === "mb") hPa = pressure;
  else if (u.includes("kpa")) hPa = pressure * 10;
  if (hPa < 1000) return "low";
  if (hPa > 1025) return "high";
  return "normal";
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
