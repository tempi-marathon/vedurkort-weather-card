import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { BackgroundScene } from "../backgrounds/scenes";
import type { ForecastBlockConfig, PrecipType } from "../config";
import type { ForecastItem } from "../types";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Filler,
  Legend,
  Tooltip,
  ChartDataLabels,
);

export interface ChartSeries {
  labels: string[];
  high: (number | null)[];
  low: (number | null)[];
  precip: (number | null)[];
}

export interface ChartChrome {
  tick: string;
  grid: string;
}

/** Light/dark chart chrome from the active CSS background scene. */
export function chartChromeForScene(
  animatedBackground: boolean,
  scene: BackgroundScene,
): ChartChrome {
  if (!animatedBackground) {
    return {
      tick: "rgba(120, 120, 120, 0.95)",
      grid: "rgba(120, 120, 120, 0.18)",
    };
  }
  const darkScenes: BackgroundScene[] = ["clear-night", "storm", "rain"];
  if (darkScenes.includes(scene)) {
    return {
      tick: "rgba(245, 245, 245, 0.92)",
      grid: "rgba(255, 255, 255, 0.22)",
    };
  }
  // cloudy, fog, snow, wind, clear-day — lighter skies need darker axes
  return {
    tick: "rgba(28, 28, 28, 0.9)",
    grid: "rgba(28, 28, 28, 0.18)",
  };
}

export function buildDailySeries(
  items: ForecastItem[],
  days: number,
  precipType: PrecipType,
  language?: string,
): ChartSeries {
  const slice = items.slice(0, days);
  const labels = slice.map((i) => {
    try {
      return new Intl.DateTimeFormat(language, { weekday: "short" }).format(
        new Date(i.datetime),
      );
    } catch {
      return i.datetime.slice(0, 10);
    }
  });
  return {
    labels,
    high: slice.map((i) => i.temperature ?? null),
    low: slice.map((i) => i.templow ?? null),
    precip: slice.map((i) =>
      precipType === "probability"
        ? (i.precipitation_probability ?? null)
        : (i.precipitation ?? null),
    ),
  };
}

export function buildHourlySeries(
  items: ForecastItem[],
  hours: number,
  precipType: PrecipType,
  language?: string,
): ChartSeries {
  const slice = items.slice(0, hours);
  const labels = slice.map((i) => {
    try {
      return new Intl.DateTimeFormat(language, {
        hour: "numeric",
      }).format(new Date(i.datetime));
    } catch {
      return i.datetime.slice(11, 16);
    }
  });
  return {
    labels,
    high: slice.map((i) => i.temperature ?? null),
    low: slice.map(() => null),
    precip: slice.map((i) =>
      precipType === "probability"
        ? (i.precipitation_probability ?? null)
        : (i.precipitation ?? null),
    ),
  };
}

function buildDatasets(
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
): ChartConfiguration["data"]["datasets"] {
  const hasLow = series.low.some((v) => v != null);
  const datasets: ChartConfiguration["data"]["datasets"] = [
    {
      type: "line",
      label: mode === "daily" ? "High" : "Temp",
      data: series.high,
      borderColor: "rgba(255, 152, 0, 1)",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      datalabels: {
        align: "top",
        color: "rgba(255, 152, 0, 1)",
        formatter: (v: number | null) => (v == null ? "" : `${Math.round(v)}°`),
      },
    },
  ];

  if (hasLow) {
    datasets.push({
      type: "line",
      label: "Low",
      data: series.low,
      borderColor: "rgba(68, 115, 158, 1)",
      backgroundColor: "rgba(68, 115, 158, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      datalabels: {
        align: "bottom",
        color: "rgba(68, 115, 158, 1)",
        formatter: (v: number | null) => (v == null ? "" : `${Math.round(v)}°`),
      },
    });
  }

  datasets.push({
    type: "bar",
    label: precipType === "probability" ? "Precip %" : "Precip",
    data: series.precip,
    backgroundColor: "rgba(132, 209, 253, 0.65)",
    borderRadius: 3,
    yAxisID: "yPrecip",
    order: 1,
    datalabels: {
      display: false,
    },
  });

  return datasets;
}

function applyChrome(chart: Chart, chrome: ChartChrome): void {
  const scales = chart.options.scales;
  if (!scales) return;
  for (const key of ["x", "yTemp", "yPrecip"] as const) {
    const scale = scales[key];
    if (!scale || typeof scale !== "object") continue;
    scale.ticks = {
      ...scale.ticks,
      color: chrome.tick,
    };
    if (key === "yTemp") {
      scale.grid = {
        ...scale.grid,
        color: chrome.grid,
      };
    }
  }
}

export function createForecastChart(
  canvas: HTMLCanvasElement,
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
  chrome: ChartChrome,
): Chart {
  const config: ChartConfiguration = {
    type: "bar",
    data: {
      labels: series.labels,
      datasets: buildDatasets(series, mode, precipType),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        datalabels: {
          clamp: true,
          font: { size: 10, weight: "bold" },
        },
      },
      scales: {
        x: {
          ticks: { maxRotation: 0, autoSkip: true, color: chrome.tick },
          grid: { display: false },
        },
        yTemp: {
          type: "linear",
          position: "left",
          grid: { color: chrome.grid },
          ticks: {
            color: chrome.tick,
            callback: (v) => `${v}°`,
          },
        },
        yPrecip: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          beginAtZero: true,
          ticks: {
            color: chrome.tick,
            callback: (v) =>
              precipType === "probability" ? `${v}%` : `${v}`,
          },
        },
      },
    },
  };

  return new Chart(canvas, config);
}

/** Update an existing chart without re-animating from zero. */
export function syncForecastChart(
  chart: Chart,
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
  chrome: ChartChrome,
): void {
  const nextDatasets = buildDatasets(series, mode, precipType);
  const structureChanged =
    chart.data.datasets.length !== nextDatasets.length ||
    chart.data.datasets.some((d, i) => d.type !== nextDatasets[i]?.type);

  if (structureChanged) {
    chart.data.datasets = nextDatasets;
  } else {
    chart.data.datasets.forEach((ds, i) => {
      const next = nextDatasets[i];
      if (!next) return;
      ds.data = next.data;
      ds.label = next.label;
    });
  }

  chart.data.labels = series.labels;
  applyChrome(chart, chrome);
  chart.options.animation = false;
  chart.update("none");
}

export function seriesFingerprint(series: ChartSeries): string {
  return JSON.stringify(series);
}

export type { ForecastBlockConfig };
