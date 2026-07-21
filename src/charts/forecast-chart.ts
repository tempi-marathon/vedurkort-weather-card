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

export interface ChartPlotArea {
  left: number;
  width: number;
}

function withAlpha(color: string, alpha: number): string {
  const c = color.trim();
  if (c.startsWith("rgba(")) {
    return c.replace(
      /rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*[\d.]+\s*\)/,
      `rgba($1, $2, $3, ${alpha})`,
    );
  }
  if (c.startsWith("rgb(")) {
    return c.replace(
      /rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/,
      `rgba($1, $2, $3, ${alpha})`,
    );
  }
  if (c.startsWith("#") && (c.length === 7 || c.length === 4)) {
    const hex =
      c.length === 4
        ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
        : c;
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(127, 127, 127, ${alpha})`;
}

/**
 * Chart chrome. Prefer the card's computed text color so weekday labels
 * match the rest of the card; fall back to scene-based contrast.
 */
export function chartChromeForScene(
  animatedBackground: boolean,
  scene: BackgroundScene,
  textColor?: string,
): ChartChrome {
  const resolved = textColor?.trim();
  if (resolved) {
    return {
      tick: resolved,
      grid: withAlpha(resolved, 0.08),
    };
  }
  if (!animatedBackground) {
    return {
      tick: "rgba(120, 120, 120, 0.95)",
      grid: "rgba(120, 120, 120, 0.08)",
    };
  }
  const darkScenes: BackgroundScene[] = [
    "clear-night",
    "partlycloudy-night",
    "storm",
    "rain",
  ];
  if (darkScenes.includes(scene)) {
    return {
      tick: "rgba(245, 245, 245, 0.92)",
      grid: "rgba(255, 255, 255, 0.1)",
    };
  }
  return {
    tick: "rgba(28, 28, 28, 0.9)",
    grid: "rgba(28, 28, 28, 0.08)",
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

function formatPrecipLabel(
  value: number | null,
  precipType: PrecipType,
  precipUnit: string,
): string {
  if (value == null || Number.isNaN(value)) return "";
  if (precipType === "probability") return `${Math.round(value)}%`;
  const rounded =
    Math.abs(value) >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${precipUnit}`.trim();
}

function buildDatasets(
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
  precipUnit: string,
  chrome: ChartChrome,
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
      order: 0,
      datalabels: {
        align: "top",
        anchor: "end",
        color: "rgba(255, 152, 0, 1)",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderColor: "rgba(255, 152, 0, 0.85)",
        borderWidth: 1,
        borderRadius: 4,
        padding: { top: 1, bottom: 1, left: 3, right: 3 },
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
      order: 0,
      datalabels: {
        align: "bottom",
        anchor: "start",
        color: "rgba(68, 115, 158, 1)",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderColor: "rgba(68, 115, 158, 0.85)",
        borderWidth: 1,
        borderRadius: 4,
        padding: { top: 1, bottom: 1, left: 3, right: 3 },
        formatter: (v: number | null) => (v == null ? "" : `${Math.round(v)}°`),
      },
    });
  }

  datasets.push({
    type: "bar",
    label: precipType === "probability" ? "Precip %" : "Precip",
    data: series.precip,
    backgroundColor: "rgba(132, 209, 253, 0.55)",
    borderRadius: 3,
    yAxisID: "yPrecip",
    order: 1,
    datalabels: {
      display: (ctx) => {
        const v = ctx.dataset.data[ctx.dataIndex];
        return typeof v === "number" && !Number.isNaN(v);
      },
      // Sit near the base of the bar, inside the plot (not clipped below)
      anchor: "start",
      align: "end",
      offset: 4,
      clamp: false,
      clip: false,
      color: "rgba(30, 90, 130, 1)",
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "rgba(100, 180, 230, 1)",
      borderWidth: 1,
      borderRadius: 4,
      padding: { top: 2, bottom: 2, left: 4, right: 4 },
      font: { size: 10, weight: "bold" },
      formatter: (v: number | null) =>
        formatPrecipLabel(v, precipType, precipUnit),
    },
  });

  // silence unused chrome in datasets (used by scales)
  void chrome;

  return datasets;
}

function applyChrome(chart: Chart, chrome: ChartChrome): void {
  const scales = chart.options.scales;
  if (!scales) return;
  const x = scales.x;
  if (x && typeof x === "object") {
    x.ticks = { ...x.ticks, color: chrome.tick };
    x.grid = { ...x.grid, display: false };
  }
  const yTemp = scales.yTemp;
  if (yTemp && typeof yTemp === "object") {
    yTemp.grid = { ...yTemp.grid, color: chrome.grid, display: true };
  }
}

export function getChartPlotArea(chart: Chart): ChartPlotArea | null {
  const area = chart.chartArea;
  if (!area || area.width <= 0) return null;
  return { left: area.left, width: area.width };
}

function tooltipCallbacks(
  precipType: PrecipType,
  precipUnit: string,
  temperatureUnit: string,
) {
  const tempSuffix = temperatureUnit.trim().startsWith("°")
    ? temperatureUnit.trim()
    : `°${temperatureUnit.trim()}`;

  return {
    label(ctx: {
      parsed: { y: number | null };
      dataset: { label?: string; yAxisID?: string };
    }) {
      const value = ctx.parsed.y;
      if (value == null || Number.isNaN(value)) return "";
      const name = ctx.dataset.label ?? "";
      if (ctx.dataset.yAxisID === "yPrecip") {
        return `${name}: ${formatPrecipLabel(value, precipType, precipUnit)}`;
      }
      return `${name}: ${Math.round(value)}${tempSuffix}`;
    },
  };
}

export function createForecastChart(
  canvas: HTMLCanvasElement,
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
  chrome: ChartChrome,
  precipUnit = "mm",
  temperatureUnit = "°C",
): Chart {
  const config: ChartConfiguration = {
    type: "bar",
    data: {
      labels: series.labels,
      datasets: buildDatasets(series, mode, precipType, precipUnit, chrome),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: {
        padding: { left: 2, right: 2, top: 6, bottom: 14 },
      },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: tooltipCallbacks(
            precipType,
            precipUnit,
            temperatureUnit,
          ),
        },
        datalabels: {
          clamp: false,
          clip: false,
          font: { size: 10, weight: "bold" },
        },
      },
      scales: {
        x: {
          position: "top",
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            color: chrome.tick,
            font: { size: 11, weight: "bold" },
          },
          grid: {
            display: false,
            drawTicks: false,
          },
          border: { display: false },
        },
        yTemp: {
          type: "linear",
          position: "left",
          display: true,
          grid: {
            display: true,
            color: chrome.grid,
            drawTicks: false,
          },
          border: { display: false },
          ticks: {
            display: false,
          },
          grace: "15%",
        },
        yPrecip: {
          type: "linear",
          position: "right",
          display: true,
          grid: { drawOnChartArea: false, display: false },
          border: { display: false },
          beginAtZero: true,
          ticks: {
            display: false,
          },
          // Extra headroom so bar labels near the base stay readable
          suggestedMax: undefined,
          grace: "25%",
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
  precipUnit = "mm",
  temperatureUnit = "°C",
): void {
  const nextDatasets = buildDatasets(
    series,
    mode,
    precipType,
    precipUnit,
    chrome,
  );
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
      // refresh datalabel formatters when precip type/unit changes
      (ds as { datalabels?: unknown }).datalabels = (
        next as { datalabels?: unknown }
      ).datalabels;
    });
  }

  chart.data.labels = series.labels;
  applyChrome(chart, chrome);
  if (chart.options.plugins?.tooltip) {
    chart.options.plugins.tooltip.callbacks = tooltipCallbacks(
      precipType,
      precipUnit,
      temperatureUnit,
    );
  }
  chart.options.animation = false;
  chart.update("none");
}

export function seriesFingerprint(series: ChartSeries): string {
  return JSON.stringify(series);
}

export function forecastHasPrecipProbability(items: ForecastItem[]): boolean {
  return items.some(
    (i) =>
      i.precipitation_probability != null &&
      !Number.isNaN(Number(i.precipitation_probability)),
  );
}

export type { ForecastBlockConfig };
