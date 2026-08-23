import type { MeteoconName } from "../icons/allowlist";
import type { PrecipType } from "../config";
import type { ForecastItem } from "../types";
import type { SunArcModel } from "./sun-arc-model";
import type { UvBarModel } from "./uv-bar-model";

export type { SunArcModel } from "./sun-arc-model";
export type { UvBarModel } from "./uv-bar-model";

export type DetailMetricId =
  | "current"
  | "sun"
  | "humidity"
  | "dew_point"
  | "wind_speed"
  | "wind_gust"
  | "wind_direction"
  | "uv_index"
  | "pressure"
  | "cloud_coverage"
  | "visibility"
  | "precipitation"
  | "precipitation_probability";

export type MetricSeriesSource = "forecast" | "history" | "merged";

export interface MetricPoint {
  t: string;
  value: number | null;
}

export interface MetricSeries {
  id: DetailMetricId;
  unit: string;
  points: MetricPoint[];
  source: MetricSeriesSource;
  /** Bar chart for precip series; line otherwise. */
  chartType: "line" | "bar";
  /** Current-conditions chart: hourly precip bars aligned with points. */
  precip?: (number | null)[];
  precipType?: PrecipType;
  precipUnit?: string;
  /** Current-conditions chart: feels-like line when hourly data includes it. */
  feelsLike?: (number | null)[];
}

export interface DetailRelatedStat {
  label: string;
  value: string;
}

export interface DetailModel {
  id: DetailMetricId;
  title: string;
  heroValue: string;
  heroIcon: MeteoconName;
  copy: string;
  series: MetricSeries | null;
  related: DetailRelatedStat[];
  /** Sun sheet: arc replaces the standard hero. */
  sunArc?: SunArcModel | null;
  /** UV sheet: gradient bar replaces the standard hero. */
  uvBar?: UvBarModel | null;
  /** Wind sheet: hourly items for direction row under chart. */
  windForecastItems?: ForecastItem[];
  showWindRow?: boolean;
}
