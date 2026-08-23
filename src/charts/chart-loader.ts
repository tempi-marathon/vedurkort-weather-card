/** Lazy-load Chart.js forecast module when forecasts are enabled. */
let chartModulePromise: Promise<typeof import("./forecast-chart")> | undefined;
let metricChartModulePromise: Promise<typeof import("./metric-chart")> | undefined;

export function loadForecastChartModule(): Promise<
  typeof import("./forecast-chart")
> {
  if (!chartModulePromise) {
    chartModulePromise = import("./forecast-chart");
  }
  return chartModulePromise;
}

export function loadMetricChartModule(): Promise<
  typeof import("./metric-chart")
> {
  if (!metricChartModulePromise) {
    metricChartModulePromise = import("./metric-chart");
  }
  return metricChartModulePromise;
}

export function resetForecastChartModuleForTests(): void {
  chartModulePromise = undefined;
  metricChartModulePromise = undefined;
}
