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

function assetKey(
  kind: "animated" | "static",
  style: IconStyle,
  name: MeteoconName,
): string {
  return `../assets/meteocons/${kind}/${style}/${name}.svg`;
}

/** Stable uniquified SVG strings — same inputs always return the same markup. */
const uniquifiedCache = new Map<string, string>();

/**
 * Rewrite SVG `id` / `url(#…)` / `href="#…"` with a stable `suffix` so
 * inlines in different scopes (card vs modal) do not share paint servers.
 */
export function uniquifySvgIds(svg: string, suffix: string): string {
  const ids = new Set<string>();
  for (const match of svg.matchAll(/\bid="([^"]+)"/g)) {
    ids.add(match[1]!);
  }
  if (ids.size === 0) return svg;

  let out = svg;
  for (const id of ids) {
    out = out.split(`id="${id}"`).join(`id="${id}${suffix}"`);
    out = out.split(`url(#${id})`).join(`url(#${id}${suffix})`);
    out = out.split(`href="#${id}"`).join(`href="#${id}${suffix}"`);
    out = out.split(`xlink:href="#${id}"`).join(`xlink:href="#${id}${suffix}"`);
  }
  return out;
}

function resolveRawSvg(
  name: MeteoconName,
  style: IconStyle,
  animated: boolean,
): string | undefined {
  const map = animated ? animatedModules : staticModules;
  const kind = animated ? "animated" : "static";
  const primary = map[assetKey(kind, style, name)];
  if (primary) return primary;

  const fallbacks: Array<[typeof kind, IconStyle, MeteoconName]> = [
    [kind, style, "not-available"],
    ["static", style, name],
    ["static", "fill", name],
    ["static", "fill", "not-available"],
  ];
  for (const [k, s, n] of fallbacks) {
    const m = k === "animated" ? animatedModules : staticModules;
    const svg = m[assetKey(k, s, n)];
    if (svg) return svg;
  }
  return undefined;
}

/**
 * @param scope - Isolate paint/mask ids between surfaces that can both be in
 *   the DOM (e.g. `"main"` for the card / More menu, `"modal"` for sheets).
 *   Results are cached so Lit re-renders reuse the same string and animated
 *   icons are not remounted every update.
 */
export function getMeteoconSvg(
  name: MeteoconName,
  style: IconStyle,
  animated: boolean,
  scope = "main",
): string {
  const cacheKey = `${scope}:${animated ? "a" : "s"}:${style}:${name}`;
  const cached = uniquifiedCache.get(cacheKey);
  if (cached) return cached;

  const raw = resolveRawSvg(name, style, animated);
  if (!raw) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="8" y="36" font-size="12">?</text></svg>`;
  }

  // Stable, CSS-safe suffix from the cache key (no per-call counter).
  const suffix = `_vk_${scope}_${animated ? "a" : "s"}_${style}_${name}`.replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  const out = uniquifySvgIds(raw, suffix);
  uniquifiedCache.set(cacheKey, out);
  return out;
}
