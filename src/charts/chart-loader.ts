/** Lazy-load Chart.js forecast module when forecasts are enabled. */
let chartModulePromise: Promise<typeof import("./forecast-chart")> | undefined;

export function loadForecastChartModule(): Promise<
  typeof import("./forecast-chart")
> {
  if (!chartModulePromise) {
    chartModulePromise = import("./forecast-chart");
  }
  return chartModulePromise;
}

export function resetForecastChartModuleForTests(): void {
  chartModulePromise = undefined;
}
