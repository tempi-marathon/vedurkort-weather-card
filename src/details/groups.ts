import type { LocalizeKey } from "../localize";
import type { DetailMetricId } from "./types";

export type DetailMetricGroup =
  | "current"
  | "sun"
  | "wind"
  | "humidity"
  | "dew_point"
  | "precipitation"
  | "cloud_coverage"
  | "uv_index"
  | "pressure"
  | "visibility";

export function metricGroup(metricId: DetailMetricId): DetailMetricGroup {
  switch (metricId) {
    case "wind_speed":
    case "wind_gust":
    case "wind_direction":
      return "wind";
    case "precipitation":
    case "precipitation_probability":
      return "precipitation";
    default:
      return metricId;
  }
}

/** Metric id used for the hourly forecast chart series. */
export function chartMetricId(tapped: DetailMetricId): DetailMetricId {
  const group = metricGroup(tapped);
  if (group === "wind") return "wind_speed";
  if (group === "precipitation") return tapped;
  return tapped;
}

export function groupTitleKey(group: DetailMetricGroup): LocalizeKey {
  const keys: Record<DetailMetricGroup, LocalizeKey> = {
    current: "current_conditions",
    sun: "next_sun",
    wind: "wind",
    humidity: "humidity",
    dew_point: "dew_point",
    precipitation: "precipitation",
    cloud_coverage: "cloud_coverage",
    uv_index: "uv_index",
    pressure: "pressure",
    visibility: "visibility",
  };
  return keys[group];
}
