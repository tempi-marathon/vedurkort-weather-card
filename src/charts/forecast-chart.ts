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

export function createForecastChart(
  canvas: HTMLCanvasElement,
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
): Chart {
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

  const config: ChartConfiguration = {
    type: "bar",
    data: {
      labels: series.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
          ticks: { maxRotation: 0, autoSkip: true },
          grid: { display: false },
        },
        yTemp: {
          type: "linear",
          position: "left",
          grid: { color: "rgba(127,127,127,0.15)" },
          ticks: {
            callback: (v) => `${v}°`,
          },
        },
        yPrecip: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          beginAtZero: true,
          ticks: {
            callback: (v) =>
              precipType === "probability" ? `${v}%` : `${v}`,
          },
        },
      },
    },
  };

  return new Chart(canvas, config);
}

export type { ForecastBlockConfig };
