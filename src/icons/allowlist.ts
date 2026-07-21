/**
 * Curated Meteocon icon names shipped in the bundle.
 * Keep in sync with HA condition map + detail UI icons.
 */
export const CONDITION_ICONS = [
  "clear-day",
  "clear-night",
  "cloudy",
  "fog",
  "fog-day",
  "fog-night",
  "hail",
  "overcast",
  "overcast-day",
  "overcast-night",
  "overcast-day-rain",
  "overcast-night-rain",
  "overcast-day-snow",
  "overcast-night-snow",
  "overcast-day-sleet",
  "overcast-night-sleet",
  "overcast-day-hail",
  "overcast-night-hail",
  "extreme-rain",
  "extreme-day-rain",
  "extreme-night-rain",
  "rain",
  "snow",
  "sleet",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "thunderstorms",
  "thunderstorms-day",
  "thunderstorms-night",
  "thunderstorms-rain",
  "thunderstorms-day-rain",
  "thunderstorms-night-rain",
  "wind",
  "weather-alert",
  "not-available",
] as const;

export const DETAIL_ICONS = [
  "sunrise",
  "sunset",
  "humidity",
  "barometer",
  "cloudy",
  "thermometer",
  "thermometer-raindrop",
  "fog",
  "rain",
  "uv-index",
  "uv-index-1",
  "uv-index-2",
  "uv-index-3",
  "uv-index-4",
  "uv-index-5",
  "uv-index-6",
  "uv-index-7",
  "uv-index-8",
  "uv-index-9",
  "uv-index-10",
  "uv-index-11",
  "uv-index-11-plus",
  "wind-beaufort-0",
  "wind-beaufort-1",
  "wind-beaufort-2",
  "wind-beaufort-3",
  "wind-beaufort-4",
  "wind-beaufort-5",
  "wind-beaufort-6",
  "wind-beaufort-7",
  "wind-beaufort-8",
  "wind-beaufort-9",
  "wind-beaufort-10",
  "wind-beaufort-11",
  "wind-beaufort-12",
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
  ...new Set<MeteoconName>([...CONDITION_ICONS, ...DETAIL_ICONS]),
];
