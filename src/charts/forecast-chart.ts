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
import { beaufortColor } from "../details/beaufort-scale";
import type { MetricSeries } from "../details/types";
import { metricSeriesFingerprint } from "../details/series";
import { windSpeedToBeaufort } from "../icons/condition-map";
import { sliceHourlyForecast } from "./hourly-window";
import { localize } from "../localize";
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
    "rain",
    "pouring",
    "lightning",
    "lightning-rainy",
    "hail",
    "exceptional",
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
  nowMs?: number,
): ChartSeries {
  const slice = sliceHourlyForecast(items, hours, nowMs);
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
    low: slice.map((i) => i.templow ?? null),
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

/** Shared layout padding — room for top ticks and precip labels below bars. */
const CHART_LAYOUT_PADDING = { left: 2, right: 2, top: 12, bottom: 26 };

/**
 * Extra headroom above the temp range (vs below) so the line sits lower /
 * more centered in the plot instead of hugging the top ticks.
 */
function yTempAfterDataLimits(scale: { min: number; max: number }): void {
  const span = Math.max(scale.max - scale.min, 1);
  scale.max += span * 0.7;
  scale.min -= span * 0.2;
}

function precipDatalabels(
  precipType: PrecipType,
  precipUnit: string,
  display?: (ctx: {
    dataset: { data: unknown[] };
    dataIndex: number;
  }) => boolean,
) {
  return {
    display:
      display ??
      ((ctx: { dataset: { data: unknown[] }; dataIndex: number }) => {
        const v = ctx.dataset.data[ctx.dataIndex];
        return typeof v === "number" && !Number.isNaN(v);
      }),
    // Sit below the bar, in layout bottom padding
    anchor: "start" as const,
    align: "bottom" as const,
    offset: 4,
    clamp: false,
    clip: false,
    color: "rgba(30, 90, 130, 1)",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: "rgba(100, 180, 230, 1)",
    borderWidth: 1,
    borderRadius: 4,
    padding: { top: 2, bottom: 2, left: 4, right: 4 },
    font: { size: 10, weight: "bold" as const },
    formatter: (v: number | null) =>
      formatPrecipLabel(v, precipType, precipUnit),
  };
}

function buildDatasets(
  series: ChartSeries,
  mode: "daily" | "hourly",
  precipType: PrecipType,
  precipUnit: string,
  chrome: ChartChrome,
  language?: string,
): ChartConfiguration["data"]["datasets"] {
  const hasLow = series.low.some((v) => v != null);
  const datasets: ChartConfiguration["data"]["datasets"] = [
    {
      type: "line",
      label:
        mode === "daily"
          ? localize("chart_high", language)
          : localize("chart_temp", language),
      data: series.high,
      borderColor: "rgba(255, 152, 0, 1)",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      order: 0,
      datalabels: {
        align: "center",
        anchor: "center",
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
      label: localize("chart_low", language),
      data: series.low,
      borderColor: "rgba(68, 115, 158, 1)",
      backgroundColor: "rgba(68, 115, 158, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      order: 0,
      datalabels: {
        align: "center",
        anchor: "center",
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
    label:
      precipType === "probability"
        ? localize("chart_precip_pct", language)
        : localize("chart_precip", language),
    data: series.precip,
    backgroundColor: "rgba(132, 209, 253, 0.55)",
    borderRadius: 3,
    yAxisID: "yPrecip",
    order: 1,
    datalabels: precipDatalabels(precipType, precipUnit),
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
  language?: string,
): Chart {
  const config: ChartConfiguration = {
    type: "bar",
    data: {
      labels: series.labels,
      datasets: buildDatasets(
        series,
        mode,
        precipType,
        precipUnit,
        chrome,
        language,
      ),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: {
        padding: CHART_LAYOUT_PADDING,
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
            autoSkip: mode !== "hourly",
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
          afterDataLimits: yTempAfterDataLimits,
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
  language?: string,
): void {
  const nextDatasets = buildDatasets(
    series,
    mode,
    precipType,
    precipUnit,
    chrome,
    language,
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

function detailHourLabels(
  points: MetricSeries["points"],
  language?: string,
): string[] {
  return points.map((p) => {
    try {
      return new Intl.DateTimeFormat(language, { hour: "numeric" }).format(
        new Date(p.t),
      );
    } catch {
      return p.t.slice(11, 16);
    }
  });
}

function detailPrecipType(series: MetricSeries): PrecipType {
  if (series.precipType) return series.precipType;
  return series.id === "precipitation_probability" ? "probability" : "rainfall";
}

function detailPrecipUnit(series: MetricSeries): string {
  return series.precipUnit ?? series.unit;
}

function detailShowValueLabel(ctx: {
  dataset: { data: unknown[] };
  dataIndex: number;
}): boolean {
  const v = ctx.dataset.data[ctx.dataIndex];
  return typeof v === "number" && !Number.isNaN(v);
}

function buildCurrentDetailDatasets(
  series: MetricSeries,
  language?: string,
): ChartConfiguration["data"]["datasets"] {
  const values = series.points.map((p) => p.value);
  const precipType = detailPrecipType(series);
  const precipUnit = detailPrecipUnit(series);
  const tempSuffix = series.unit.trim().startsWith("°")
    ? series.unit.trim()
    : `°${series.unit.trim()}`;

  const datasets: ChartConfiguration["data"]["datasets"] = [
    {
      type: "line",
      label: localize("chart_temp", language),
      data: values,
      borderColor: "rgba(255, 152, 0, 1)",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      spanGaps: true,
      order: 0,
      datalabels: {
        display: detailShowValueLabel,
        align: "center",
        anchor: "center",
        color: "rgba(255, 152, 0, 1)",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderColor: "rgba(255, 152, 0, 0.85)",
        borderWidth: 1,
        borderRadius: 4,
        padding: { top: 1, bottom: 1, left: 3, right: 3 },
        formatter: (v: number | null) =>
          v == null || Number.isNaN(v) ? "" : `${Math.round(v)}${tempSuffix}`,
      },
    },
  ];

  if (series.feelsLike?.some((v) => v != null)) {
    datasets.push({
      type: "line",
      label: localize("feels_like", language),
      data: series.feelsLike,
      borderColor: "rgba(68, 115, 158, 1)",
      backgroundColor: "rgba(68, 115, 158, 0.12)",
      borderDash: [5, 4],
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 2,
      spanGaps: true,
      order: 0,
      datalabels: {
        display: false,
      },
    });
  }

  if (series.precip) {
    datasets.push({
      type: "bar",
      label:
        precipType === "probability"
          ? localize("chart_precip_pct", language)
          : localize("chart_precip", language),
      data: series.precip,
      backgroundColor: "rgba(132, 209, 253, 0.55)",
      borderRadius: 3,
      yAxisID: "yPrecip",
      order: 1,
      datalabels: precipDatalabels(
        precipType,
        precipUnit,
        detailShowValueLabel,
      ),
    });
  }

  return datasets;
}

function detailValueLabel(
  value: number | null,
  series: MetricSeries,
): string {
  if (value == null || Number.isNaN(value)) return "";
  if (series.id === "precipitation") {
    return formatPrecipLabel(value, "rainfall", series.unit);
  }
  if (
    series.id === "precipitation_probability" ||
    series.id === "humidity" ||
    series.id === "cloud_coverage"
  ) {
    return `${Math.round(value)}%`;
  }
  if (series.id === "current") {
    const u = series.unit.trim().startsWith("°")
      ? series.unit.trim()
      : `°${series.unit.trim()}`;
    return `${Math.round(value)}${u}`;
  }
  if (
    series.id === "wind_speed" ||
    series.id === "wind_gust" ||
    series.id === "wind_direction"
  ) {
    const u = series.unit.trim();
    if (u === "Bft" || u.toLowerCase().includes("beaufort")) {
      return `${Math.round(value)} ${u || "Bft"}`;
    }
    if (u === "m/s") {
      return `${Math.round(value * 10) / 10} ${u}`;
    }
    return `${Math.round(value)}${u ? ` ${u}` : ""}`;
  }
  return `${Math.round(value)}`;
}

function isWindSeries(series: MetricSeries): boolean {
  return (
    series.id === "wind_speed" ||
    series.id === "wind_gust" ||
    series.id === "wind_direction"
  );
}

/** Chart.js dataset label for a detail-sheet line series. */
function detailLineLabel(
  seriesId: MetricSeries["id"],
  language?: string,
): string {
  switch (seriesId) {
    case "current":
      return localize("chart_temp", language);
    case "wind_speed":
    case "wind_gust":
    case "wind_direction":
      return localize("wind_speed", language);
    case "humidity":
      return localize("humidity", language);
    case "cloud_coverage":
      return localize("cloud_coverage", language);
    case "dew_point":
      return localize("dew_point", language);
    case "uv_index":
      return localize("uv_index", language);
    case "pressure":
      return localize("pressure", language);
    case "visibility":
      return localize("visibility", language);
    case "pollen":
      return localize("pollen", language);
    case "sun":
      return localize("next_sun", language);
    case "precipitation":
      return localize("chart_precip", language);
    case "precipitation_probability":
      return localize("chart_precip_pct", language);
    default: {
      const _exhaustive: never = seriesId;
      return _exhaustive;
    }
  }
}

function colorForWindValue(
  value: number | null | undefined,
  unit: string,
): string {
  if (value == null || Number.isNaN(value)) return "rgba(255, 152, 0, 1)";
  return beaufortColor(windSpeedToBeaufort(value, unit));
}

function windValueColors(
  values: (number | null)[],
  unit: string,
): string[] {
  return values.map((v) => colorForWindValue(v, unit));
}

function buildDetailDatasets(
  series: MetricSeries,
  language?: string,
): ChartConfiguration["data"]["datasets"] {
  if (series.id === "current" && series.precip) {
    return buildCurrentDetailDatasets(series, language);
  }

  const values = series.points.map((p) => p.value);
  const showValueLabel = detailShowValueLabel;

  if (series.chartType === "bar") {
    const precipType = detailPrecipType(series);
    return [
      {
        type: "bar",
        label:
          precipType === "probability"
            ? localize("chart_precip_pct", language)
            : localize("chart_precip", language),
        data: values,
        backgroundColor: "rgba(132, 209, 253, 0.55)",
        borderRadius: 3,
        yAxisID: "yPrecip",
        order: 1,
        datalabels: precipDatalabels(precipType, series.unit, showValueLabel),
      },
    ];
  }

  const lineLabel = detailLineLabel(series.id, language);

  const wind = isWindSeries(series);
  const speedColors = wind ? windValueColors(values, series.unit) : null;

  const datasets: ChartConfiguration["data"]["datasets"] = [
    {
      type: "line",
      label: lineLabel,
      data: values,
      borderColor: wind ? speedColors![0]! : "rgba(255, 152, 0, 1)",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 3,
      spanGaps: true,
      order: 0,
      ...(speedColors
        ? {
            pointBackgroundColor: speedColors,
            pointBorderColor: speedColors,
            segment: {
              borderColor: (ctx: {
                p1?: { parsed?: { y: number | null } };
              }) => colorForWindValue(ctx.p1?.parsed?.y, series.unit),
            },
          }
        : {}),
      datalabels: {
        display: showValueLabel,
        align: "center",
        anchor: "center",
        color: speedColors
          ? (ctx: { dataIndex: number }) =>
              speedColors[ctx.dataIndex] ?? "rgba(255, 152, 0, 1)"
          : "rgba(255, 152, 0, 1)",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderColor: speedColors
          ? (ctx: { dataIndex: number }) =>
              speedColors[ctx.dataIndex] ?? "rgba(255, 152, 0, 0.85)"
          : "rgba(255, 152, 0, 0.85)",
        borderWidth: 1,
        borderRadius: 4,
        padding: { top: 1, bottom: 1, left: 3, right: 3 },
        formatter: (v: number | null) => detailValueLabel(v, series),
      },
    },
  ];

  if (wind && series.gust?.some((v) => v != null)) {
    const gustColors = windValueColors(series.gust, series.unit);
    datasets.push({
      type: "line",
      label: localize("wind_gust", language),
      data: series.gust,
      borderColor: gustColors[0]!,
      backgroundColor: "rgba(180, 90, 40, 0.08)",
      borderDash: [5, 4],
      tension: 0.35,
      yAxisID: "yTemp",
      pointRadius: 2,
      spanGaps: true,
      order: 0,
      pointBackgroundColor: gustColors,
      pointBorderColor: gustColors,
      segment: {
        borderColor: (ctx: {
          p1?: { parsed?: { y: number | null } };
        }) => colorForWindValue(ctx.p1?.parsed?.y, series.unit),
      },
      datalabels: {
        display: false,
      },
    });
  }

  return datasets;
}

function detailTooltipCallbacks(series: MetricSeries) {
  return {
    label(ctx: {
      parsed: { y: number | null };
      dataset: { label?: string };
    }) {
      const value = ctx.parsed.y;
      if (value == null || Number.isNaN(value)) return "";
      const name = ctx.dataset.label ?? "";
      return `${name}: ${detailValueLabel(value, series)}`;
    },
  };
}

function detailChartOptions(
  series: MetricSeries,
  chrome: ChartChrome,
  language?: string,
  temperatureUnit = "°C",
): ChartConfiguration["options"] {
  const precipType = detailPrecipType(series);
  const precipUnit = detailPrecipUnit(series);
  const hasPrecipBars = Boolean(series.precip);
  const hasTempAxis =
    series.chartType === "line" || series.id === "current";
  const tooltipCallbacksFn = hasPrecipBars
    ? tooltipCallbacks(precipType, precipUnit, temperatureUnit)
    : series.chartType === "bar"
      ? tooltipCallbacks(precipType, precipUnit, temperatureUnit)
      : detailTooltipCallbacks(series);

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: {
      padding: CHART_LAYOUT_PADDING,
    },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: tooltipCallbacksFn,
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
          autoSkip: false,
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
        display: hasTempAxis,
        grid: {
          display: hasTempAxis,
          color: chrome.grid,
          drawTicks: false,
        },
        border: { display: false },
        ticks: { display: false },
        ...(series.id === "wind_speed" ||
        series.id === "wind_gust" ||
        series.id === "wind_direction"
          ? series.unit === "Bft"
            ? {
                min: 0,
                max: 12,
                afterDataLimits: undefined,
              }
            : { afterDataLimits: yTempAfterDataLimits }
          : { afterDataLimits: yTempAfterDataLimits }),
      },
      yPrecip: {
        type: "linear",
        position: "right",
        display: hasPrecipBars || series.chartType === "bar",
        grid: { drawOnChartArea: false, display: false },
        border: { display: false },
        beginAtZero: true,
        ticks: { display: false },
        grace: "25%",
      },
    },
  };
}

/** Detail-sheet chart — matches hourly forecast styling (single series). */
export function createDetailMetricChart(
  canvas: HTMLCanvasElement,
  series: MetricSeries,
  chrome: ChartChrome,
  language?: string,
  temperatureUnit = "°C",
): Chart {
  const labels = detailHourLabels(series.points, language);
  const config: ChartConfiguration = {
    type: "bar",
    data: {
      labels,
      datasets: buildDetailDatasets(series, language),
    },
    options: detailChartOptions(series, chrome, language, temperatureUnit),
  };
  const chart = new Chart(canvas, config);
  applyChrome(chart, chrome);
  return chart;
}

export function syncDetailMetricChart(
  chart: Chart,
  series: MetricSeries,
  chrome: ChartChrome,
  language?: string,
  temperatureUnit = "°C",
): void {
  const nextOptions = detailChartOptions(
    series,
    chrome,
    language,
    temperatureUnit,
  );
  chart.data.labels = detailHourLabels(series.points, language);
  chart.data.datasets = buildDetailDatasets(series, language);
  if (nextOptions) {
    chart.options.layout = nextOptions.layout;
    chart.options.plugins = nextOptions.plugins;
    chart.options.scales = nextOptions.scales;
    chart.options.interaction = nextOptions.interaction;
  }
  applyChrome(chart, chrome);
  chart.update("none");
}

export { metricSeriesFingerprint };

export type { ForecastBlockConfig };
