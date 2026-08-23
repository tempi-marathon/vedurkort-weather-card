import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Chart } from "chart.js";
import { bindCardActions, effectiveTapAction } from "./actions";
import { resolveAlerts } from "./alerts/resolve";
import type { WeatherAlert } from "./alerts/types";
import { conditionToScene, renderBackground } from "./backgrounds/scenes";
import { computeCardSize } from "./card-size";
import { cardStyles } from "./card-styles";
import {
  loadForecastChartModule,
} from "./charts/chart-loader";
import {
  findHourlyNowPosition,
  sliceHourlyForecast,
} from "./charts/hourly-window";
import { buildDetailModel } from "./details/catalog";
import { renderDetailSheetBody } from "./details/detail-sheet";
import type { DetailMetricId } from "./details/types";
import { metricSeriesFingerprint } from "./details/series";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  normalizeEditorConfig,
  type VedurkortCardConfig,
} from "./config";
import {
  conditionToMeteocon,
  windSpeedToBeaufort,
} from "./icons/condition-map";
import { getMeteoconSvg } from "./icons/meteocons";
import type { MeteoconName } from "./icons/allowlist";
import { localize, resolveLanguage } from "./localize";
import {
  renderAlertsDialog,
  type IconRenderer,
} from "./sections/alerts-section";
import {
  renderAlertsOnlySection,
  renderCurrentWeatherSection,
  renderNameHeader,
} from "./sections/current-weather";
import {
  renderForecastSection,
  type ForecastSectionState,
} from "./sections/forecast-section";
import type { ForecastItem, HomeAssistant, LovelaceCardEditor } from "./types";
import { trapFocus } from "./ui/focus-trap";
import { renderViewportDialog } from "./ui/viewport-dialog";
import {
  formatNumber,
  getWeatherSnapshot,
  subscribeForecast,
} from "./weather/adapter";

@customElement("vedurkort-weather-card")
export class VedurkortWeatherCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config!: VedurkortCardConfig;
  @state() private _dailyForecast: ForecastItem[] = [];
  @state() private _hourlyForecast: ForecastItem[] = [];
  @state() private _dailyError: string | null = null;
  @state() private _hourlyError: string | null = null;
  @state() private _dailyPlotLeft = 0;
  @state() private _dailyPlotWidth = 0;
  @state() private _hourlyPlotLeft = 0;
  @state() private _hourlyPlotWidth = 0;
  @state() private _alertsOpen = false;
  @state() private _expandedAlertIds: string[] = [];
  @state() private _detailMetric: DetailMetricId | null = null;

  private _dailyChart: Chart | null = null;
  private _hourlyChart: Chart | null = null;
  private _metricChart: Chart | null = null;
  private _metricChartFingerprint = "";
  private _metricChartModeKey = "";
  private _dailyChartFingerprint = "";
  private _hourlyChartFingerprint = "";
  private _dailyChartModeKey = "";
  private _hourlyChartModeKey = "";
  private _forecastKey = "";
  private _unsubDaily: (() => void) | undefined;
  private _unsubHourly: (() => void) | undefined;
  private _forecastLoading = false;
  private _chartMod: Awaited<
    ReturnType<typeof loadForecastChartModule>
  > | null = null;
  private _chartModLoading = false;
  private _unbindActions: (() => void) | undefined;
  private _unbindFocusTrap: (() => void) | undefined;
  private _alertsTrigger: HTMLElement | null = null;
  private _detailTrigger: HTMLElement | null = null;
  private _boundDialog: HTMLDialogElement | null = null;
  private _hourlyScrollKey = "";
  private _hourlyScrollUserAdjusted = false;
  private _hourlyScrollProgrammatic = false;
  private _detailScrollKey = "";
  private _detailScrollUserAdjusted = false;
  private _detailScrollProgrammatic = false;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./editor");
    return document.createElement(
      "vedurkort-weather-card-editor",
    ) as LovelaceCardEditor;
  }

  public static getStubConfig(
    _hass: HomeAssistant,
    _entities: string[],
  ): Partial<VedurkortCardConfig> {
    return { ...DEFAULT_CONFIG };
  }

  public setConfig(config: Partial<VedurkortCardConfig>): void {
    this._config = config.entity
      ? normalizeConfig(config)
      : (normalizeEditorConfig(config) as VedurkortCardConfig);
  }

  public getCardSize(): number {
    if (!this._config) return 3;
    return computeCardSize(this._config, this.hass);
  }

  protected updated(changed: Map<string, unknown>): void {
    if (
      (changed.has("hass") || changed.has("_config")) &&
      this._config &&
      this.hass
    ) {
      void this._ensureForecastSubscription();
      if (
        this._alertsOpen &&
        resolveAlerts(this.hass, this._config).length === 0
      ) {
        this._alertsOpen = false;
      }
    }
    if (
      changed.has("_dailyForecast") ||
      changed.has("_hourlyForecast") ||
      changed.has("_config") ||
      changed.has("hass")
    ) {
      this.updateComplete.then(() => void this._renderCharts());
    }
    if (changed.has("_hourlyForecast") || changed.has("_config")) {
      this.updateComplete.then(() => this._maybeScrollHourlyToNow());
    }
    if (changed.has("_alertsOpen") || changed.has("_detailMetric")) {
      if (!this._alertsOpen && this._detailMetric == null) {
        this._releaseDialog();
        (this._detailTrigger ?? this._alertsTrigger)?.focus();
        this._alertsTrigger = null;
        this._detailTrigger = null;
      }
    }
    if (this._alertsOpen || this._detailMetric != null) {
      this.updateComplete.then(() => this._ensureDialogOpen());
    }
    if (
      changed.has("_detailMetric") ||
      changed.has("_hourlyForecast") ||
      changed.has("_config") ||
      changed.has("hass")
    ) {
      this.updateComplete.then(() => {
        void this._renderMetricChart();
        this._maybeScrollDetailToNow();
      });
    }
    if (changed.has("_config") || changed.has("hass")) {
      this.updateComplete.then(() => this._bindCardActions());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownForecast();
    this._destroyCharts();
    this._destroyMetricChart();
    this._unbindActions?.();
    this._unbindActions = undefined;
    this._unbindFocusTrap?.();
    this._unbindFocusTrap = undefined;
  }

  private _bindCardActions(): void {
    this._unbindActions?.();
    this._unbindActions = undefined;
    if (!this._config?.entity || !this.hass) return;
    const target = this.renderRoot.querySelector(
      ".action-target",
    ) as HTMLElement | null;
    if (!target) return;
    this._unbindActions = bindCardActions(
      target,
      this.hass,
      this._config.entity,
      {
        tap: effectiveTapAction(this._config),
        hold: this._config.hold_action,
        double_tap: this._config.double_tap_action,
      },
      { onDetail: () => this._openDetail("current") },
    );
  }

  private _releaseDialog(): void {
    this._unbindFocusTrap?.();
    this._unbindFocusTrap = undefined;
    this._boundDialog = null;
  }

  private _ensureDialogOpen(): void {
    if (!this._alertsOpen && this._detailMetric == null) return;

    const dlg = this.renderRoot.querySelector(
      "dialog.vk-modal",
    ) as HTMLDialogElement | null;
    if (!dlg) return;

    if (!dlg.open) {
      try {
        dlg.showModal();
      } catch {
        return;
      }
    }

    if (this._boundDialog !== dlg) {
      this._releaseDialog();
      this._boundDialog = dlg;
      dlg.focus();
      this._unbindFocusTrap = trapFocus(dlg);
    }
  }

  private _closeDialogElements(): void {
    for (const dlg of this.renderRoot.querySelectorAll("dialog.vk-modal")) {
      if ((dlg as HTMLDialogElement).open) {
        (dlg as HTMLDialogElement).close();
      }
    }
    this._releaseDialog();
  }

  private _teardownForecast(): void {
    this._unsubDaily?.();
    this._unsubHourly?.();
    this._unsubDaily = undefined;
    this._unsubHourly = undefined;
    this._forecastKey = "";
  }

  private async _ensureForecastSubscription(): Promise<void> {
    const wantDaily = this._config.daily.enabled;
    const wantHourly =
      this._config.hourly.enabled || this._config.show_current;
    if (!wantDaily && !wantHourly) {
      this._teardownForecast();
      this._dailyForecast = [];
      this._hourlyForecast = [];
      this._dailyError = null;
      this._hourlyError = null;
      this._destroyCharts();
      return;
    }

    const key = `${this._config.entity}:d=${wantDaily}:h=${wantHourly}`;
    if (key === this._forecastKey || this._forecastLoading) return;
    this._forecastLoading = true;
    this._teardownForecast();
    this._forecastKey = key;
    this._dailyError = null;
    this._hourlyError = null;

    try {
      if (wantDaily) {
        this._unsubDaily = await subscribeForecast(
          this.hass,
          this._config.entity,
          "daily",
          (items, error) => {
            this._dailyForecast = items;
            this._dailyError = error;
            this.requestUpdate();
          },
        );
      } else {
        this._dailyForecast = [];
        this._destroyChart("daily");
      }
      if (wantHourly) {
        this._unsubHourly = await subscribeForecast(
          this.hass,
          this._config.entity,
          "hourly",
          (items, error) => {
            this._hourlyForecast = items;
            this._hourlyError = error;
            this.requestUpdate();
          },
        );
      } else {
        this._hourlyForecast = [];
        this._destroyChart("hourly");
      }
    } catch (err) {
      const language = resolveLanguage(this.hass);
      const message =
        err instanceof Error
          ? err.message
          : localize("forecast_failed", language);
      if (wantDaily) {
        this._dailyForecast = [];
        this._dailyError = message;
      }
      if (wantHourly) {
        this._hourlyForecast = [];
        this._hourlyError = message;
      }
      this._forecastKey = "";
    } finally {
      this._forecastLoading = false;
    }
  }

  private _destroyChart(mode: "daily" | "hourly"): void {
    if (mode === "daily") {
      this._dailyChart?.destroy();
      this._dailyChart = null;
      this._dailyChartFingerprint = "";
      this._dailyChartModeKey = "";
      this._dailyPlotLeft = 0;
      this._dailyPlotWidth = 0;
    } else {
      this._hourlyChart?.destroy();
      this._hourlyChart = null;
      this._hourlyChartFingerprint = "";
      this._hourlyChartModeKey = "";
      this._hourlyPlotLeft = 0;
      this._hourlyPlotWidth = 0;
    }
  }

  private _destroyCharts(): void {
    this._destroyChart("daily");
    this._destroyChart("hourly");
  }

  private _syncPlotArea(mode: "daily" | "hourly"): void {
    const mod = this._chartMod;
    if (!mod) return;
    const chart = mode === "daily" ? this._dailyChart : this._hourlyChart;
    if (!chart) return;
    const area = mod.getChartPlotArea(chart);
    if (!area) return;
    if (mode === "daily") {
      if (
        Math.abs(area.left - this._dailyPlotLeft) > 0.5 ||
        Math.abs(area.width - this._dailyPlotWidth) > 0.5
      ) {
        this._dailyPlotLeft = area.left;
        this._dailyPlotWidth = area.width;
      }
    } else if (
      Math.abs(area.left - this._hourlyPlotLeft) > 0.5 ||
      Math.abs(area.width - this._hourlyPlotWidth) > 0.5
    ) {
      this._hourlyPlotLeft = area.left;
      this._hourlyPlotWidth = area.width;
    }
  }

  private _renderCharts(): void {
    if (!this._config) {
      this._destroyCharts();
      return;
    }
    if (!this._config.daily.enabled && !this._config.hourly.enabled) {
      this._destroyCharts();
      this._chartMod = null;
      return;
    }
    void this._renderChartsAsync();
  }

  private async _renderChartsAsync(): Promise<void> {
    if (!this._config) return;
    if (!this._chartMod && !this._chartModLoading) {
      this._chartModLoading = true;
      try {
        this._chartMod = await loadForecastChartModule();
      } finally {
        this._chartModLoading = false;
      }
    }
    if (!this._chartMod) return;
    if (this._config.daily.enabled) {
      this._renderOneChart("daily");
    } else {
      this._destroyChart("daily");
    }
    if (this._config.hourly.enabled) {
      this._renderOneChart("hourly");
    } else {
      this._destroyChart("hourly");
      this._hourlyScrollKey = "";
      this._hourlyScrollUserAdjusted = false;
    }
  }

  private _hourlyWindowKey(): string {
    if (!this._config?.hourly.enabled) return "";
    const slice = sliceHourlyForecast(
      this._hourlyForecast,
      this._config.hourly.hours,
    );
    if (!slice.length) return "";
    return `${this._config.hourly.hours}:${slice.map((i) => i.datetime).join(",")}`;
  }

  private _maybeScrollHourlyToNow(): void {
    if (!this._config?.hourly.enabled || this._config.hourly.hours <= 12) return;
    const key = this._hourlyWindowKey();
    if (!key) return;
    if (key !== this._hourlyScrollKey) {
      this._hourlyScrollKey = key;
      this._hourlyScrollUserAdjusted = false;
    }
    if (this._hourlyScrollUserAdjusted) return;
    void this.updateComplete.then(() => this._scrollHourlyToNow());
  }

  private _onHourlyScroll(): void {
    if (this._hourlyScrollProgrammatic) return;
    this._hourlyScrollUserAdjusted = true;
  }

  private _scrollHourlyToNow(): void {
    if (!this._config?.hourly.enabled) return;
    const scrollEl = this.renderRoot.querySelector(
      ".forecast-hourly.forecast-scroll",
    ) as HTMLElement | null;
    if (!scrollEl) return;

    const slice = sliceHourlyForecast(
      this._hourlyForecast,
      this._config.hourly.hours,
    );
    const pos = findHourlyNowPosition(slice.map((i) => i.datetime));
    if (pos < 0) return;

    const colWidth =
      Number.parseFloat(
        getComputedStyle(scrollEl).getPropertyValue("--forecast-col-width"),
      ) || 42;
    this._hourlyScrollProgrammatic = true;
    scrollEl.scrollLeft = Math.max(0, pos * colWidth - scrollEl.clientWidth * 0.2);
    requestAnimationFrame(() => {
      this._hourlyScrollProgrammatic = false;
    });
  }

  private _scrollDetailToNow(): void {
    if (!this._detailMetric || !this._config || !this.hass) return;
    const scrollEl = this.renderRoot.querySelector(
      ".detail-chart-scroll",
    ) as HTMLElement | null;
    if (!scrollEl) return;

    const snap = getWeatherSnapshot(this.hass, this._config);
    if (!snap) return;

    const model = buildDetailModel({
      metricId: this._detailMetric,
      snap,
      iconName: conditionToMeteocon(
        snap.condition,
        snap.isDay,
        snap.cloudCoverage,
      ),
      hourlyForecast: this._hourlyForecast,
      language: resolveLanguage(this.hass),
      bft: windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit),
      gustBft: windSpeedToBeaufort(snap.windGust, snap.windSpeedUnit),
      hourlyPrecipType: this._config.hourly.precip_type,
    });
    const datetimes = model.series?.points.map((p) => p.t) ?? [];
    if (!datetimes.length) return;

    const pos = findHourlyNowPosition(datetimes);
    if (pos < 0) return;

    const colWidth =
      Number.parseFloat(
        getComputedStyle(scrollEl).getPropertyValue("--forecast-col-width"),
      ) || 42;
    this._detailScrollProgrammatic = true;
    scrollEl.scrollLeft = Math.max(0, pos * colWidth - scrollEl.clientWidth * 0.2);
    requestAnimationFrame(() => {
      this._detailScrollProgrammatic = false;
    });
  }

  private _detailScrollWindowKey(): string {
    if (!this._detailMetric || !this._config) return "";
    const slice = sliceHourlyForecast(this._hourlyForecast, 24);
    if (!slice.length) return "";
    return `${this._detailMetric}:${slice.map((i) => i.datetime).join(",")}`;
  }

  private _maybeScrollDetailToNow(): void {
    if (!this._detailMetric) return;
    const key = this._detailScrollWindowKey();
    if (!key) return;
    if (key !== this._detailScrollKey) {
      this._detailScrollKey = key;
      this._detailScrollUserAdjusted = false;
    }
    if (this._detailScrollUserAdjusted) return;
    void this.updateComplete.then(() => this._scrollDetailToNow());
  }

  private _onDetailScroll(): void {
    if (this._detailScrollProgrammatic) return;
    this._detailScrollUserAdjusted = true;
  }

  private _chartTextColor(): string {
    const el =
      (this.renderRoot.querySelector(".content") as HTMLElement | null) ??
      (this.renderRoot.querySelector("ha-card") as HTMLElement | null) ??
      this;
    const styles = getComputedStyle(el);
    return (
      styles.getPropertyValue("--primary-text-color").trim() ||
      styles.color ||
      getComputedStyle(this).color
    );
  }

  private _renderOneChart(mode: "daily" | "hourly"): void {
    const mod = this._chartMod;
    if (!mod) return;
    const canvas = this.renderRoot.querySelector(
      `canvas.forecast-canvas-${mode}`,
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      this._destroyChart(mode);
      return;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    const scene = conditionToScene(
      snap?.condition,
      snap?.isDay ?? true,
    );
    const textColor = this._chartTextColor();
    const chrome = mod.chartChromeForScene(
      this._config.animated_background,
      scene,
      textColor,
    );
    const precipUnit =
      (snap?.entity.attributes.precipitation_unit as string | undefined) ??
      "mm";
    const temperatureUnit = snap?.temperatureUnit ?? "°C";
    const language = resolveLanguage(this.hass);

    const precipType =
      mode === "daily"
        ? this._config.daily.precip_type
        : this._config.hourly.precip_type;
    const items =
      mode === "daily" ? this._dailyForecast : this._hourlyForecast;
    const series =
      mode === "daily"
        ? mod.buildDailySeries(
            items,
            this._config.daily.days,
            precipType,
            language,
          )
        : mod.buildHourlySeries(
            items,
            this._config.hourly.hours,
            precipType,
            language,
          );

    if (!series.labels.length) {
      this._destroyChart(mode);
      return;
    }

    const modeKey = `${mode}:${precipType}:${precipUnit}:${temperatureUnit}:${textColor}:${this._config.animated_background}:${scene}`;
    const fingerprint = mod.seriesFingerprint(series);
    const existing = mode === "daily" ? this._dailyChart : this._hourlyChart;
    const existingKey =
      mode === "daily" ? this._dailyChartModeKey : this._hourlyChartModeKey;
    const existingFp =
      mode === "daily"
        ? this._dailyChartFingerprint
        : this._hourlyChartFingerprint;

    if (existing && existingKey === modeKey && existingFp === fingerprint) {
      this._syncPlotArea(mode);
      return;
    }

    if (existing && existingKey.split(":")[0] === mode) {
      mod.syncForecastChart(
        existing,
        series,
        mode,
        precipType,
        chrome,
        precipUnit,
        temperatureUnit,
        language,
      );
      if (mode === "daily") {
        this._dailyChartFingerprint = fingerprint;
        this._dailyChartModeKey = modeKey;
      } else {
        this._hourlyChartFingerprint = fingerprint;
        this._hourlyChartModeKey = modeKey;
      }
      this._syncPlotArea(mode);
      return;
    }

    this._destroyChart(mode);
    const chart = mod.createForecastChart(
      canvas,
      series,
      mode,
      precipType,
      chrome,
      precipUnit,
      temperatureUnit,
      language,
    );
    if (mode === "daily") {
      this._dailyChart = chart;
      this._dailyChartFingerprint = fingerprint;
      this._dailyChartModeKey = modeKey;
    } else {
      this._hourlyChart = chart;
      this._hourlyChartFingerprint = fingerprint;
      this._hourlyChartModeKey = modeKey;
    }
    requestAnimationFrame(() => this._syncPlotArea(mode));
  }

  private _icon: IconRenderer = (name: MeteoconName): string => {
    return getMeteoconSvg(
      name,
      this._config.icon_style,
      this._config.animated_icons,
    );
  };

  private _destroyMetricChart(): void {
    this._metricChart?.destroy();
    this._metricChart = null;
    this._metricChartFingerprint = "";
    this._metricChartModeKey = "";
  }

  private _modalTextColor(): string {
    const dlg = this.renderRoot.querySelector(
      "dialog.vk-modal",
    ) as HTMLElement | null;
    const el =
      dlg ??
      (this.renderRoot.querySelector(".content") as HTMLElement | null) ??
      (this.renderRoot.querySelector("ha-card") as HTMLElement | null) ??
      this;
    const styles = getComputedStyle(el);
    return (
      styles.getPropertyValue("--primary-text-color").trim() ||
      styles.color ||
      getComputedStyle(this).color
    );
  }

  private async _renderMetricChart(): Promise<void> {
    if (!this._detailMetric || !this._config || !this.hass) {
      this._destroyMetricChart();
      return;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    if (!snap) return;

    const model = buildDetailModel({
      metricId: this._detailMetric,
      snap,
      iconName: conditionToMeteocon(
        snap.condition,
        snap.isDay,
        snap.cloudCoverage,
      ),
      hourlyForecast: this._hourlyForecast,
      language: resolveLanguage(this.hass),
      bft: windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit),
      gustBft: windSpeedToBeaufort(snap.windGust, snap.windSpeedUnit),
      hourlyPrecipType: this._config.hourly.precip_type,
    });

    if (!model.series) {
      this._destroyMetricChart();
      return;
    }

    if (!this._chartMod && !this._chartModLoading) {
      this._chartModLoading = true;
      try {
        this._chartMod = await loadForecastChartModule();
      } finally {
        this._chartModLoading = false;
      }
    }

    const mod = this._chartMod;
    if (!mod) return;

    const canvas = this.renderRoot.querySelector(
      "canvas.detail-chart-canvas",
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      this._destroyMetricChart();
      return;
    }

    const scene = conditionToScene(snap.condition, snap.isDay);
    const textColor = this._modalTextColor();
    const chrome = mod.chartChromeForScene(
      this._config.animated_background,
      scene,
      textColor,
    );

    const language = resolveLanguage(this.hass);
    const temperatureUnit = snap.temperatureUnit;
    const modeKey = `${model.series.id}:${textColor}:${this._config.animated_background}:${scene}`;
    const fingerprint = metricSeriesFingerprint(model.series);

    if (
      this._metricChart &&
      this._metricChartModeKey === modeKey &&
      this._metricChartFingerprint === fingerprint
    ) {
      return;
    }

    if (this._metricChart && this._metricChartModeKey === modeKey) {
      mod.syncDetailMetricChart(
        this._metricChart,
        model.series,
        chrome,
        language,
        temperatureUnit,
      );
      this._metricChartFingerprint = fingerprint;
      return;
    }

    this._destroyMetricChart();
    this._metricChart = mod.createDetailMetricChart(
      canvas,
      model.series,
      chrome,
      language,
      temperatureUnit,
    );
    this._metricChartFingerprint = fingerprint;
    this._metricChartModeKey = modeKey;
  }

  private _openDetail(metricId: DetailMetricId): void {
    this._closeDialogElements();
    this._detailTrigger = document.activeElement as HTMLElement | null;
    this._alertsOpen = false;
    this._detailMetric = metricId;
    this._detailScrollKey = "";
    this._detailScrollUserAdjusted = false;
  }

  private _closeDetail(): void {
    this._closeDialogElements();
    this._detailMetric = null;
    this._detailScrollKey = "";
    this._detailScrollUserAdjusted = false;
    this._destroyMetricChart();
  }

  private _openAlerts(alerts: WeatherAlert[], preferredId?: string): void {
    this._closeDialogElements();
    this._detailMetric = null;
    this._destroyMetricChart();
    this._alertsTrigger = document.activeElement as HTMLElement | null;
    this._expandedAlertIds = preferredId
      ? [preferredId]
      : alerts[0]
        ? [alerts[0].id]
        : [];
    this._alertsOpen = true;
  };

  private _closeAlerts(): void {
    this._closeDialogElements();
    this._alertsOpen = false;
    this._expandedAlertIds = [];
  }

  private _closeDetailDialog(): void {
    this._closeDetail();
  }

  private _toggleAlertExpanded(id: string): void {
    this._expandedAlertIds = this._expandedAlertIds.includes(id)
      ? this._expandedAlertIds.filter((x) => x !== id)
      : [...this._expandedAlertIds, id];
  }

  private _forecastState(): ForecastSectionState {
    return {
      dailyForecast: this._dailyForecast,
      hourlyForecast: this._hourlyForecast,
      dailyError: this._dailyError,
      hourlyError: this._hourlyError,
      dailyPlotLeft: this._dailyPlotLeft,
      dailyPlotWidth: this._dailyPlotWidth,
      hourlyPlotLeft: this._hourlyPlotLeft,
      hourlyPlotWidth: this._hourlyPlotWidth,
    };
  }

  protected render() {
    if (!this._config) return html``;
    const language = resolveLanguage(this.hass);
    if (!this.hass) {
      return html`<ha-card
        ><div class="pad">${localize("waiting", language)}</div></ha-card
      >`;
    }

    if (!this._config.entity) {
      return html`
        <ha-card>
          <div class="pad empty">
            ${localize("configure_entity", language)}
          </div>
        </ha-card>
      `;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    if (!snap) {
      return html`
        <ha-card>
          <div class="pad warn">
            ${localize("entity_not_found", language)}: <code>${this._config.entity}</code>
          </div>
        </ha-card>
      `;
    }

    const iconName = conditionToMeteocon(
      snap.condition,
      snap.isDay,
      snap.cloudCoverage,
    );
    const scene = conditionToScene(snap.condition, snap.isDay);

    const bft = windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit);
    const gustBft = windSpeedToBeaufort(snap.windGust, snap.windSpeedUnit);
    const layout = this._config.layout ?? "default";
    const showCurrent = this._config.show_current;
    const showName = this._config.show_name;
    const showNameInCurrent = showName && showCurrent;
    const showNameHeader = showName && !showCurrent;
    const showDaily = this._config.daily.enabled;
    const showHourly = this._config.hourly.enabled;
    const alerts = resolveAlerts(this.hass, this._config);
    const showAlertsStrip = alerts.length > 0;
    const showDetails =
      showCurrent &&
      (this._config.show_sun ||
        this._config.show_humidity ||
        this._config.show_wind_speed ||
        this._config.show_wind_direction ||
        this._config.show_wind_gust ||
        this._config.show_uv_index ||
        this._config.show_pressure ||
        this._config.show_cloud_coverage ||
        this._config.show_dew_point ||
        this._config.show_visibility ||
        this._config.show_precipitation ||
        this._config.show_precipitation_probability);
    const feelsLikeText = this._config.show_feels_like
      ? formatNumber(snap.feelsLike, snap.temperatureUnit)
      : null;

    if (!showCurrent && !showDaily && !showHourly && !showAlertsStrip) {
      return html`
        <ha-card>
          <div class="pad empty">
            ${localize("enable_section", language)}
          </div>
        </ha-card>
      `;
    }

    const forecastState = this._forecastState();
    const onOpenAlerts = (a: WeatherAlert[]) => this._openAlerts(a);
    const onOpenDetail = (id: DetailMetricId) => this._openDetail(id);
    const detailModel =
      this._detailMetric != null
        ? buildDetailModel({
            metricId: this._detailMetric,
            snap,
            iconName,
            hourlyForecast: this._hourlyForecast,
            language,
            bft,
            gustBft,
            hourlyPrecipType: this._config.hourly.precip_type,
          })
        : null;
    const dialogShell = {
      animatedBackground: this._config.animated_background,
      scene,
      cloudCoverage: snap.cloudCoverage,
    };

    return html`
      <ha-card class="${[
        this._config.animated_background ? "has-bg" : "",
        `layout-${layout}`,
      ]
        .filter(Boolean)
        .join(" ")}">
        ${renderBackground(
          this._config.animated_background,
          scene,
          snap.cloudCoverage,
        )}
        <div class="content">
          ${showNameHeader ? renderNameHeader(snap.name) : nothing}
          ${showCurrent
            ? renderCurrentWeatherSection(
                {
                  config: this._config,
                  snap,
                  iconName,
                  language,
                  alerts,
                  showAlertsStrip,
                  showDetails,
                  showNameInCurrent,
                  feelsLikeText,
                  bft,
                  gustBft,
                },
                this._icon,
                onOpenAlerts,
                onOpenDetail,
              )
            : showAlertsStrip
              ? renderAlertsOnlySection(
                  alerts,
                  this._icon,
                  language,
                  onOpenAlerts,
                )
              : nothing}

          ${showDaily
            ? html`
                <div class="section section-daily">
                  ${renderForecastSection(
                    "daily",
                    this.hass,
                    this._config,
                    snap,
                    forecastState,
                    language,
                  )}
                </div>
              `
            : nothing}
          ${showHourly
            ? html`
                <div class="section section-hourly">
                  ${renderForecastSection(
                    "hourly",
                    this.hass,
                    this._config,
                    snap,
                    forecastState,
                    language,
                    () => this._onHourlyScroll(),
                  )}
                </div>
              `
            : nothing}
        </div>
      </ha-card>
      ${renderAlertsDialog(
        alerts,
        this._alertsOpen,
        this._expandedAlertIds,
        this._icon,
        language,
        {
          onClose: () => this._closeAlerts(),
          onToggleExpanded: (id) => this._toggleAlertExpanded(id),
        },
        dialogShell,
      )}
      ${detailModel
        ? renderViewportDialog({
            open: true,
            title: detailModel.title,
            titleId: "detail-modal-title",
            language,
            animatedBackground: dialogShell.animatedBackground,
            scene: dialogShell.scene,
            cloudCoverage: dialogShell.cloudCoverage,
            onClose: () => this._closeDetailDialog(),
            body: renderDetailSheetBody({
              model: detailModel,
              icon: this._icon,
              noChartText: localize("detail_no_chart", language),
              hass: this.hass,
              config: this._config,
              entityId: this._config.entity,
              language,
              windSpeedUnit: snap.windSpeedUnit,
              onChartScroll: () => this._onDetailScroll(),
            }),
          })
        : nothing}
    `;
  }

  static styles = cardStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "vedurkort-weather-card": VedurkortWeatherCard;
  }
}
