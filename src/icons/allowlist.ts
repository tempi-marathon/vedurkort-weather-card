/**
 * Curated Meteocon icon names shipped in the bundle.
 * Keep in sync with HA condition map + detail UI icons.
 */
export const CONDITION_ICONS = [
  "clear-day",
  "clear-night",
  "cloudy",
  "fog",
  "hail",
  "thunderstorms",
  "thunderstorms-rain",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "extreme-rain",
  "rain",
  "snow",
  "sleet",
  "wind",
  "weather-alert",
  "not-available",
] as const;

export const DETAIL_ICONS = [
  "sunrise",
  "sunset",
  "humidity",
  "wind-direction-n",
  "wind-direction-ne",
  "wind-direction-e",
  "wind-direction-se",
  "wind-direction-s",
  "wind-direction-sw",
  "wind-direction-w",
  "wind-direction-nw",
] as const;

export const ICON_STYLES = ["fill", "flat", "line", "monochrome"] as const;

export type IconStyle = (typeof ICON_STYLES)[number];
export type MeteoconName =
  | (typeof CONDITION_ICONS)[number]
  | (typeof DETAIL_ICONS)[number];

export const ALL_ICONS: readonly MeteoconName[] = [
  ...CONDITION_ICONS,
  ...DETAIL_ICONS,
];
