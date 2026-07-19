import type { IconStyle, MeteoconName } from "./allowlist";

const animatedModules = import.meta.glob("../assets/meteocons/animated/*/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const staticModules = import.meta.glob("../assets/meteocons/static/*/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function key(kind: "animated" | "static", style: IconStyle, name: MeteoconName): string {
  return `../assets/meteocons/${kind}/${style}/${name}.svg`;
}

export function getMeteoconSvg(
  name: MeteoconName,
  style: IconStyle,
  animated: boolean,
): string {
  const map = animated ? animatedModules : staticModules;
  const kind = animated ? "animated" : "static";
  const primary = map[key(kind, style, name)];
  if (primary) return primary;
  // Fallback chain
  const fallbacks: Array<[typeof kind, IconStyle, MeteoconName]> = [
    [kind, style, "not-available"],
    ["static", style, name],
    ["static", "fill", name],
    ["static", "fill", "not-available"],
  ];
  for (const [k, s, n] of fallbacks) {
    const m = k === "animated" ? animatedModules : staticModules;
    const svg = m[key(k, s, n)];
    if (svg) return svg;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="8" y="36" font-size="12">?</text></svg>`;
}
