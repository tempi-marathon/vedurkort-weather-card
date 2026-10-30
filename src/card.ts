import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Chart } from "chart.js";
import { bindCardActions, effectiveTapAction } from "./actions";
import { resolveAlerts } from "./alerts/resolve";
import { shouldEscalateForAlerts } from "./alerts/utils";
import type { WeatherAlert } from "./alerts/types";
import { resolvePollen } from "./pollen/resolve";
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
import { buildCurrentConditionsCopy } from "./details/copy";
import { renderDetailSheetBody } from "./details/detail-sheet";
import {
  insertSunEventsIntoHourly,
  sunTimesFromSnapshot,
} from "./details/sun-events";
import type { DetailMetricId, DetailModel } from "./details/types";
import { metricSeriesFingerprint } from "./details/series";
import {
  DEFAULT_CONFIG,
  dailyShowsInline,
  dailyShowsModalTrigger,
  dailyWantsData,
  hasBackground,
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
  currentChipLayout,
  renderAlertsOnlySection,
  renderCurrentWeatherSection,
  renderNameHeader,
  type CurrentWeatherContext,
} from "./sections/current-weather";
import {
  renderDailyDialog,
  renderDailyLink,
  renderForecastSection,
  type ForecastSectionState,
} from "./sections/forecast-section";
import {
  nextMorePackDemotions,
  type MorePackLatch,
} from "./sections/smart-chips";
import type { ForecastItem, HomeAssistant, LovelaceCardEditor } from "./types";
import { shouldPauseEffects } from "./ui/effects-visibility";
import { trapFocus } from "./ui/focus-trap";
import { lockScroll } from "./ui/scroll-lock";
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
  @state() private _detailPlotLeft = 0;
  @state() private _detailPlotWidth = 0;
  @state() private _alertsOpen = false;
  @state() private _dailyOpen = false;
  @state() private _expandedAlertIds: string[] = [];
  @state() private _detailMetric: DetailMetricId | null = null;
  @state() private _beaufortLegendOpen = false;
  @state() private _pollenLegendOpen = false;
  @state() private _uvLegendOpen = false;
  @state() private _humidityLegendOpen = false;
  @state() private _dailyModalPlotLeft = 0;
  @state() private _dailyModalPlotWidth = 0;
  /** Demote N lowest-priority primary chips into More to keep More on-row. */
  @state() private _morePackDemotions = 0;
  /** Latch that stops the More row flipping at a fixed width. */
  private _morePackLatch: MorePackLatch | null = null;
  /** Last measured on-row width per chip (for fit-aware undemote). */
  private _chipWidths = new Map<string, number>();
  /** Minute clock for time-based smart chips (sun/moon near a change). */
  @state() private _nowMs = Date.now();
  private _clockTimer: ReturnType<typeof setTimeout> | undefined;
  /** Context of the last rendered current-weather section. */
  private _lastCurrentCtx: CurrentWeatherContext | undefined;

  private _dailyChart: Chart | null = null;
  private _dailyModalChart: Chart | null = null;
  private _hourlyChart: Chart | null = null;
  private _metricChart: Chart | null = null;
  private _metricChartFingerprint = "";
  private _metricChartModeKey = "";
  private _dailyChartFingerprint = "";
  private _dailyModalChartFingerprint = "";
  private _hourlyChartFingerprint = "";
  private _dailyChartModeKey = "";
  private _dailyModalChartModeKey = "";
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
  private _unlockScroll: (() => void) | undefined;
  private _alertsTrigger: HTMLElement | null = null;
  private _dailyTrigger: HTMLElement | null = null;
  private _detailTrigger: HTMLElement | null = null;
  private _boundDialog: HTMLDialogElement | null = null;
  private _hourlyScrollKey = "";
  private _hourlyScrollUserAdjusted = false;
  private _hourlyScrollProgrammatic = false;
  private _detailScrollKey = "";
  private _detailScrollUserAdjusted = false;
  private _detailScrollProgrammatic = false;
  /** Stable anchor while the detail modal is open (chart + icon row). */
  private _detailWindowNowMs = 0;

  /** Optimistic until the first IntersectionObserver callback. */
  private _effectsIntersecting = true;
  private _effectsDocVisible = true;
  private _effectsReducedMotion = false;
  private _effectsIntersectionObserver: IntersectionObserver | undefined;
  private _effectsMotionQuery: MediaQueryList | undefined;
  private _morePackObserver: ResizeObserver | undefined;
  private _morePackRaf = 0;
  private readonly _onEffectsVisibilityChange = (): void => {
    this._effectsDocVisible = document.visibilityState === "visible";
    this._syncEffectsPaused();
  };
  private readonly _onEffectsMotionChange = (): void => {
    this._effectsReducedMotion = this._effectsMotionQuery?.matches ?? false;
    this._syncEffectsPaused();
  };

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
    const prevSmart = this._config?.smart_chips;
    this._config = config.entity
      ? normalizeConfig(config)
      : (normalizeEditorConfig(config) as VedurkortCardConfig);
    if (prevSmart !== this._config.smart_chips) {
      this._morePackDemotions = 0;
      this._morePackLatch = null;
      this._chipWidths.clear();
    }
    this._syncClock();
  }

  /** Tick `_nowMs` on each minute while smart sun/moon chips can change. */
  private _syncClock(): void {
    const c = this._config;
    const wanted =
      this.isConnected && !!c?.smart_chips && (c.show_sun || c.show_moon);
    if (!wanted) {
      if (this._clockTimer !== undefined) clearTimeout(this._clockTimer);
      this._clockTimer = undefined;
      return;
    }
    if (this._clockTimer !== undefined) return;
    const tick = () => {
      this._nowMs = Date.now();
      this._clockTimer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };
    this._nowMs = Date.now();
    this._clockTimer = setTimeout(tick, 60_000 - (Date.now() % 60_000));
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
      if (this._dailyOpen && !dailyShowsModalTrigger(this._config.daily)) {
        this._dailyOpen = false;
        this._destroyDailyModalChart();
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
    if (
      changed.has("_config") ||
      changed.has("hass") ||
      changed.has("_nowMs") ||
      changed.has("_morePackDemotions")
    ) {
      this.updateComplete.then(() => {
        this._ensureMorePackObserver();
        this._bindMorePackObserver();
      });
    }
    if (
      changed.has("_alertsOpen") ||
      changed.has("_detailMetric") ||
      changed.has("_dailyOpen")
    ) {
      this._syncEffectsPaused();
      if (
        !this._alertsOpen &&
        this._detailMetric == null &&
        !this._dailyOpen
      ) {
        this._releaseDialog();
        (
          this._detailTrigger ??
          this._alertsTrigger ??
          this._dailyTrigger
        )?.focus();
        this._alertsTrigger = null;
        this._detailTrigger = null;
        this._dailyTrigger = null;
      }
    }
    if (
      this._alertsOpen ||
      this._detailMetric != null ||
      this._dailyOpen
    ) {
      this.updateComplete.then(() => {
        this._ensureDialogOpen();
        if (this._dailyOpen) void this._renderCharts();
      });
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

  connectedCallback(): void {
    super.connectedCallback();
    // Fresh defaults — avoid stale off-screen state after reconnect.
    this._effectsIntersecting = true;
    this._effectsDocVisible = document.visibilityState === "visible";
    document.addEventListener(
      "visibilitychange",
      this._onEffectsVisibilityChange,
    );

    if (typeof window.matchMedia === "function") {
      this._effectsMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      this._effectsReducedMotion = this._effectsMotionQuery.matches;
      this._effectsMotionQuery.addEventListener(
        "change",
        this._onEffectsMotionChange,
      );
    } else {
      this._effectsReducedMotion = false;
    }

    this._effectsIntersectionObserver?.disconnect();
    this._effectsIntersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        this._effectsIntersecting = entry.isIntersecting;
        this._syncEffectsPaused();
      },
      { threshold: 0 },
    );
    this._effectsIntersectionObserver.observe(this);
    this._syncEffectsPaused();
    this._ensureMorePackObserver();
    this._syncClock();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener(
      "visibilitychange",
      this._onEffectsVisibilityChange,
    );
    this._effectsMotionQuery?.removeEventListener(
      "change",
      this._onEffectsMotionChange,
    );
    this._effectsMotionQuery = undefined;
    this._effectsIntersectionObserver?.disconnect();
    this._effectsIntersectionObserver = undefined;
    this._teardownMorePackObserver();
    this._syncClock();
    this._teardownForecast();
    this._destroyCharts();
    this._destroyMetricChart();
    this._unbindActions?.();
    this._unbindActions = undefined;
    this._unbindFocusTrap?.();
    this._unbindFocusTrap = undefined;
    this._unlockScroll?.();
    this._unlockScroll = undefined;
  }

  private _effectsDialogOpen(): boolean {
    return (
      this._alertsOpen ||
      this._detailMetric != null ||
      this._dailyOpen
    );
  }

  private _syncEffectsPaused(): void {
    const pause = shouldPauseEffects({
      intersecting: this._effectsIntersecting,
      docVisible: this._effectsDocVisible,
      reducedMotion: this._effectsReducedMotion,
      dialogOpen: this._effectsDialogOpen(),
    });
    if (pause) this.setAttribute("data-effects-paused", "");
    else this.removeAttribute("data-effects-paused");
  }

  private _ensureMorePackObserver(): void {
    if (this._morePackObserver) return;
    if (typeof ResizeObserver !== "function") return;
    this._morePackObserver = new ResizeObserver(() => {
      this._scheduleMorePackSync();
    });
    this.updateComplete.then(() => this._bindMorePackObserver());
  }

  private _teardownMorePackObserver(): void {
    if (this._morePackRaf) {
      cancelAnimationFrame(this._morePackRaf);
      this._morePackRaf = 0;
    }
    this._morePackObserver?.disconnect();
    this._morePackObserver = undefined;
  }

  private _bindMorePackObserver(): void {
    const details = this.renderRoot.querySelector(
      ".section-current .details",
    );
    if (!details || !this._morePackObserver) return;
    this._morePackObserver.disconnect();
    this._morePackObserver.observe(details);
    this._scheduleMorePackSync();
  }

  private _scheduleMorePackSync(): void {
    if (this._morePackRaf) cancelAnimationFrame(this._morePackRaf);
    this._morePackRaf = requestAnimationFrame(() => {
      this._morePackRaf = 0;
      this._syncMorePackDemotions();
    });
  }

  /** Keep More on the first chip row by demoting lowest-priority primaries. */
  private _syncMorePackDemotions(): void {
    const details = this.renderRoot.querySelector(
      ".section-current .details",
    ) as HTMLElement | null;
    const more = details?.querySelector(".detail-more") as HTMLElement | null;
    const chipEls = details
      ? ([
          ...details.querySelectorAll(":scope > .tip, :scope > .detail-more"),
        ] as HTMLElement[])
      : [];
    const primaryEls = chipEls.filter(
      (el) => !el.classList.contains("detail-more"),
    );
    const rowTop = primaryEls[0]?.offsetTop ?? 0;
    const moreWrapped = !!more && more.offsetTop > rowTop + 4;
    const wrappedChips = primaryEls.filter(
      (el) => el.offsetTop > rowTop + 4,
    ).length;
    const spare =
      details && more
        ? details.clientWidth - (more.offsetLeft + more.offsetWidth)
        : 0;

    for (const el of primaryEls) {
      const id = el.dataset.chip;
      if (id) this._chipWidths.set(id, el.offsetWidth);
    }

    const layout = this._lastCurrentCtx
      ? currentChipLayout(this._lastCurrentCtx)
      : undefined;
    const returning = layout?.returning;
    const gap = details ? parseFloat(getComputedStyle(details).columnGap) : 0;

    const next = nextMorePackDemotions({
      smartChips: !!this._config?.smart_chips,
      hasMore: !!more,
      moreWrapped,
      sparePx: spare,
      primaryCount: primaryEls.length,
      current: this._morePackDemotions,
      preCount: layout?.pre.primary.length,
      wrappedChips,
      moreWidthPx: more?.offsetWidth,
      nextReturnWidthPx: returning
        ? (this._chipWidths.get(returning) ?? null)
        : null,
      columnGapPx: Number.isNaN(gap) ? 0 : gap,
      containerWidthPx: details?.clientWidth ?? 0,
      key: layout?.pre.primary.join(",") ?? "",
      latch: this._morePackLatch,
    });

    this._morePackLatch = next.latch;
    if (next.demotions !== this._morePackDemotions) {
      this._morePackDemotions = next.demotions;
    }
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
    if (
      !this._alertsOpen &&
      this._detailMetric == null &&
      !this._dailyOpen
    ) {
      return;
    }

    const dlg = this.renderRoot.querySelector(
      "dialog.vk-modal",
    ) as HTMLDialogElement | null;
    if (!dlg) return;

    if (!dlg.open) {
      try {
        // Native modal dialog: top layer + inert background (same as HA more-info).
        dlg.showModal();
      } catch {
        return;
      }
    }

    if (!this._unlockScroll) {
      this._unlockScroll = lockScroll(this, dlg);
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
    this._unlockScroll?.();
    this._unlockScroll = undefined;
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
    const wantDaily = dailyWantsData(this._config.daily);
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

  private _destroyDailyModalChart(): void {
    this._dailyModalChart?.destroy();
    this._dailyModalChart = null;
    this._dailyModalChartFingerprint = "";
    this._dailyModalChartModeKey = "";
    this._dailyModalPlotLeft = 0;
    this._dailyModalPlotWidth = 0;
  }

  private _destroyCharts(): void {
    this._destroyChart("daily");
    this._destroyDailyModalChart();
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

  private _syncDetailPlotArea(): void {
    const mod = this._chartMod;
    if (!mod || !this._metricChart) return;
    const area = mod.getChartPlotArea(this._metricChart);
    if (!area) return;
    if (
      Math.abs(area.left - this._detailPlotLeft) > 0.5 ||
      Math.abs(area.width - this._detailPlotWidth) > 0.5
    ) {
      this._detailPlotLeft = area.left;
      this._detailPlotWidth = area.width;
    }
  }

  private _renderCharts(): void {
    if (!this._config) {
      this._destroyCharts();
      return;
    }
    const wantDaily =
      dailyShowsInline(this._config.daily) || this._dailyOpen;
    if (!wantDaily && !this._config.hourly.enabled) {
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
    if (dailyShowsInline(this._config.daily)) {
      this._renderOneChart("daily");
    } else {
      this._destroyChart("daily");
    }
    if (this._dailyOpen) {
      this._renderDailyModalChart();
    } else {
      this._destroyDailyModalChart();
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
    const snap = this.hass
      ? getWeatherSnapshot(this.hass, this._config)
      : null;
    const slice = sliceHourlyForecast(
      this._hourlyForecast,
      this._config.hourly.hours,
    );
    const slots = insertSunEventsIntoHourly(
      slice,
      snap ? sunTimesFromSnapshot(snap) : null,
    );
    if (!slots.length) return "";
    return `${this._config.hourly.hours}:${slots.map((i) => i.datetime).join(",")}`;
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
    const snap = getWeatherSnapshot(this.hass, this._config);
    const slots = insertSunEventsIntoHourly(
      slice,
      snap ? sunTimesFromSnapshot(snap) : null,
    );
    const pos = findHourlyNowPosition(slots.map((i) => i.datetime));
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

  private _buildOpenDetailModel(snap: ReturnType<typeof getWeatherSnapshot>): DetailModel | null {
    if (!this._detailMetric || !this._config || !this.hass || !snap) return null;
    const escalate = this._shouldEscalateForAlerts();
    return buildDetailModel({
      metricId: this._detailMetric,
      snap,
      iconName: conditionToMeteocon(
        snap.condition,
        snap.isDay,
        snap.cloudCoverage,
        escalate,
      ),
      hourlyForecast: this._hourlyForecast,
      language: resolveLanguage(this.hass),
      bft: windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit),
      gustBft: windSpeedToBeaufort(snap.windGust, snap.windSpeedUnit),
      hourlyPrecipType: this._config.hourly.precip_type,
      windSpeedUnit: this._config.wind_speed_unit,
      pollen: resolvePollen(this.hass, this._config),
      nowMs: this._detailWindowNowMs || Date.now(),
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

    const model = this._buildOpenDetailModel(snap);
    if (!model?.series) return;
    const datetimes = model.series.points.map((p) => p.t);
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

  private _shouldEscalateForAlerts(): boolean {
    if (!this._config || !this.hass) return false;
    return shouldEscalateForAlerts(resolveAlerts(this.hass, this._config));
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
    const escalate = this._shouldEscalateForAlerts();
    const scene = conditionToScene(
      snap?.condition,
      snap?.isDay ?? true,
      escalate,
    );
    const textColor = this._chartTextColor();
    const chrome = mod.chartChromeForScene(
      hasBackground(this._config.background),
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
            undefined,
            snap
              ? sunTimesFromSnapshot(snap)
              : undefined,
          );

    if (!series.labels.length) {
      this._destroyChart(mode);
      return;
    }

    const modeKey = `${mode}:${precipType}:${precipUnit}:${temperatureUnit}:${textColor}:${hasBackground(this._config.background)}:${scene}:${mode === "hourly" ? `${snap?.sunrise ?? ""}|${snap?.sunset ?? ""}` : ""}`;
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

  private _syncDailyModalPlotArea(): void {
    const mod = this._chartMod;
    if (!mod || !this._dailyModalChart) return;
    const area = mod.getChartPlotArea(this._dailyModalChart);
    if (!area) return;
    if (
      Math.abs(area.left - this._dailyModalPlotLeft) > 0.5 ||
      Math.abs(area.width - this._dailyModalPlotWidth) > 0.5
    ) {
      this._dailyModalPlotLeft = area.left;
      this._dailyModalPlotWidth = area.width;
    }
  }

  private _renderDailyModalChart(): void {
    const mod = this._chartMod;
    if (!mod || !this._config) return;
    const canvas = this.renderRoot.querySelector(
      "canvas.forecast-canvas-daily-modal",
    ) as HTMLCanvasElement | null;
    if (!canvas) {
      this._destroyDailyModalChart();
      return;
    }

    const snap = getWeatherSnapshot(this.hass, this._config);
    const escalate = this._shouldEscalateForAlerts();
    const scene = conditionToScene(
      snap?.condition,
      snap?.isDay ?? true,
      escalate,
    );
    const textColor = this._chartTextColor();
    const chrome = mod.chartChromeForScene(
      hasBackground(this._config.background),
      scene,
      textColor,
    );
    const precipUnit =
      (snap?.entity.attributes.precipitation_unit as string | undefined) ??
      "mm";
    const temperatureUnit = snap?.temperatureUnit ?? "°C";
    const language = resolveLanguage(this.hass);
    const precipType = this._config.daily.precip_type;
    const series = mod.buildDailySeries(
      this._dailyForecast,
      this._config.daily.days,
      precipType,
      language,
    );

    if (!series.labels.length) {
      this._destroyDailyModalChart();
      return;
    }

    const modeKey = `daily-modal:${precipType}:${precipUnit}:${temperatureUnit}:${textColor}:${hasBackground(this._config.background)}:${scene}`;
    const fingerprint = mod.seriesFingerprint(series);
    const existing = this._dailyModalChart;

    if (
      existing &&
      this._dailyModalChartModeKey === modeKey &&
      this._dailyModalChartFingerprint === fingerprint
    ) {
      this._syncDailyModalPlotArea();
      return;
    }

    if (existing) {
      mod.syncForecastChart(
        existing,
        series,
        "daily",
        precipType,
        chrome,
        precipUnit,
        temperatureUnit,
        language,
      );
      this._dailyModalChartFingerprint = fingerprint;
      this._dailyModalChartModeKey = modeKey;
      this._syncDailyModalPlotArea();
      return;
    }

    this._destroyDailyModalChart();
    this._dailyModalChart = mod.createForecastChart(
      canvas,
      series,
      "daily",
      precipType,
      chrome,
      precipUnit,
      temperatureUnit,
      language,
    );
    this._dailyModalChartFingerprint = fingerprint;
    this._dailyModalChartModeKey = modeKey;
    requestAnimationFrame(() => this._syncDailyModalPlotArea());
  }

  private _icon: IconRenderer = (name: MeteoconName): string => {
    return getMeteoconSvg(
      name,
      this._config.icon_style,
      this._config.animated_icons,
      "main",
    );
  };

  /** Separate id scope from card/More icons so fill paint servers stay valid. */
  private _iconModal: IconRenderer = (name: MeteoconName): string => {
    return getMeteoconSvg(
      name,
      this._config.icon_style,
      this._config.animated_icons,
      "modal",
    );
  };

  private _destroyMetricChart(): void {
    this._metricChart?.destroy();
    this._metricChart = null;
    this._metricChartFingerprint = "";
    this._metricChartModeKey = "";
    this._detailPlotLeft = 0;
    this._detailPlotWidth = 0;
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

    const model = this._buildOpenDetailModel(snap);

    if (!model?.series) {
      this._destroyMetricChart();
      return;
    }

    const series = model.series;
    const escalate = this._shouldEscalateForAlerts();

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

    const scene = conditionToScene(snap.condition, snap.isDay, escalate);
    const textColor = this._modalTextColor();
    const chrome = mod.chartChromeForScene(
      hasBackground(this._config.background),
      scene,
      textColor,
    );

    const language = resolveLanguage(this.hass);
    const temperatureUnit = snap.temperatureUnit;
    const sunKey =
      series.id === "current"
        ? `${snap.sunrise ?? ""}|${snap.sunset ?? ""}|${snap.todaySunrise ?? ""}|${snap.todaySunset ?? ""}`
        : "";
    const colCount = series.points.length;
    const sunColCount = series.points.filter((p) => p.sunEvent).length;
    const modeKey = `${series.id}:${colCount}:${sunColCount}:${textColor}:${hasBackground(this._config.background)}:${scene}:${sunKey}`;
    const fingerprint = metricSeriesFingerprint(series);
    const prevColCount = this._metricChart?.data.labels?.length ?? 0;

    if (
      this._metricChart &&
      this._metricChartModeKey === modeKey &&
      this._metricChartFingerprint === fingerprint
    ) {
      this._syncDetailPlotArea();
      return;
    }

    if (
      this._metricChart &&
      this._metricChartModeKey === modeKey &&
      prevColCount === colCount
    ) {
      mod.syncDetailMetricChart(
        this._metricChart,
        series,
        chrome,
        language,
        temperatureUnit,
      );
      this._metricChartFingerprint = fingerprint;
      this._syncDetailPlotArea();
      return;
    }

    this._destroyMetricChart();
    this._metricChart = mod.createDetailMetricChart(
      canvas,
      series,
      chrome,
      language,
      temperatureUnit,
    );
    this._metricChartFingerprint = fingerprint;
    this._metricChartModeKey = modeKey;
    requestAnimationFrame(() => this._syncDetailPlotArea());
  }

  private _openDetail(metricId: DetailMetricId): void {
    this._closeDialogElements();
    this._detailTrigger = document.activeElement as HTMLElement | null;
    this._alertsOpen = false;
    this._dailyOpen = false;
    this._destroyDailyModalChart();
    this._detailMetric = metricId;
    this._beaufortLegendOpen = false;
    this._pollenLegendOpen = false;
    this._uvLegendOpen = false;
    this._humidityLegendOpen = false;
    this._detailScrollKey = "";
    this._detailScrollUserAdjusted = false;
    this._detailWindowNowMs = Date.now();
  }

  private _closeDetail(): void {
    this._closeDialogElements();
    this._detailMetric = null;
    this._beaufortLegendOpen = false;
    this._pollenLegendOpen = false;
    this._uvLegendOpen = false;
    this._humidityLegendOpen = false;
    this._detailScrollKey = "";
    this._detailScrollUserAdjusted = false;
    this._detailWindowNowMs = 0;
    this._destroyMetricChart();
  }

  private _toggleBeaufortLegend(): void {
    this._beaufortLegendOpen = !this._beaufortLegendOpen;
  }

  private _togglePollenLegend(): void {
    this._pollenLegendOpen = !this._pollenLegendOpen;
  }

  private _toggleUvLegend(): void {
    this._uvLegendOpen = !this._uvLegendOpen;
  }

  private _toggleHumidityLegend(): void {
    this._humidityLegendOpen = !this._humidityLegendOpen;
  }

  private _openAlerts(alerts: WeatherAlert[], preferredId?: string): void {
    this._closeDialogElements();
    this._detailMetric = null;
    this._dailyOpen = false;
    this._destroyDailyModalChart();
    this._destroyMetricChart();
    this._alertsTrigger = document.activeElement as HTMLElement | null;
    this._expandedAlertIds = preferredId
      ? [preferredId]
      : alerts[0]
        ? [alerts[0].id]
        : [];
    this._alertsOpen = true;
  }

  private _closeAlerts(): void {
    this._closeDialogElements();
    this._alertsOpen = false;
    this._expandedAlertIds = [];
  }

  private _openDaily(): void {
    this._closeDialogElements();
    this._detailMetric = null;
    this._alertsOpen = false;
    this._destroyMetricChart();
    this._dailyTrigger = document.activeElement as HTMLElement | null;
    this._dailyOpen = true;
  }

  private _closeDaily(): void {
    this._closeDialogElements();
    this._dailyOpen = false;
    this._destroyDailyModalChart();
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

    const alerts = resolveAlerts(this.hass, this._config);
    const pollen = resolvePollen(this.hass, this._config);
    const escalate = shouldEscalateForAlerts(alerts);
    const iconName = conditionToMeteocon(
      snap.condition,
      snap.isDay,
      snap.cloudCoverage,
      escalate,
    );
    const scene = conditionToScene(snap.condition, snap.isDay, escalate);

    const bft = windSpeedToBeaufort(snap.windSpeed, snap.windSpeedUnit);
    const gustBft = windSpeedToBeaufort(snap.windGust, snap.windSpeedUnit);
    const layout = this._config.layout ?? "default";
    const showCurrent = this._config.show_current;
    const showName = this._config.show_name;
    const showNameInCurrent = showName && showCurrent;
    const showNameHeader = showName && !showCurrent;
    const showDailyInline = dailyShowsInline(this._config.daily);
    const showDailyModalTrigger = dailyShowsModalTrigger(this._config.daily);
    const showHourly = this._config.hourly.enabled;
    const showAlertsStrip = alerts.length > 0;
    const showDetails =
      showCurrent &&
      (this._config.show_sun ||
        this._config.show_moon ||
        this._config.show_humidity ||
        this._config.show_wind ||
        this._config.show_uv_index ||
        this._config.show_pressure ||
        this._config.show_cloud_coverage ||
        this._config.show_dew_point ||
        this._config.show_visibility ||
        this._config.show_precipitation ||
        this._config.show_precipitation_probability ||
        (this._config.show_pollen && pollen != null));
    const feelsLikeText = this._config.show_feels_like
      ? formatNumber(snap.feelsLike, snap.temperatureUnit)
      : null;
    const conditionText = buildCurrentConditionsCopy(
      snap,
      sliceHourlyForecast(this._hourlyForecast, 24),
      language,
    );

    if (
      !showCurrent &&
      !showDailyInline &&
      !showDailyModalTrigger &&
      !showHourly &&
      !showAlertsStrip
    ) {
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
    const onOpenDaily = () => this._openDaily();
    const detailModel =
      this._detailMetric != null ? this._buildOpenDetailModel(snap) : null;
    const currentCtx: CurrentWeatherContext = {
      config: this._config,
      snap,
      iconName,
      language,
      alerts,
      showAlertsStrip,
      showDetails,
      showDailyLink: showDailyModalTrigger,
      showNameInCurrent,
      feelsLikeText,
      conditionText,
      bft,
      gustBft,
      pollen,
      morePackDemotions: this._morePackDemotions,
      nowMs: this._nowMs,
    };
    this._lastCurrentCtx = showCurrent ? currentCtx : undefined;
    const dialogShell = {
      background: this._config.background,
      scene,
      cloudCoverage: snap.cloudCoverage,
    };

    return html`
      <ha-card class="${[
        hasBackground(this._config.background) ? "has-bg" : "",
        `layout-${layout}`,
      ]
        .filter(Boolean)
        .join(" ")}">
        ${renderBackground(
          this._config.background,
          scene,
          snap.cloudCoverage,
        )}
        <div class="content">
          ${showNameHeader ? renderNameHeader(snap.name) : nothing}
          ${showCurrent
            ? renderCurrentWeatherSection(
                currentCtx,
                this._icon,
                onOpenAlerts,
                onOpenDetail,
                onOpenDaily,
              )
            : showAlertsStrip
              ? renderAlertsOnlySection(
                  alerts,
                  this._icon,
                  language,
                  onOpenAlerts,
                )
              : nothing}

          ${!showCurrent && showDailyModalTrigger
            ? html`
                <div class="daily-link-wrap">
                  ${renderDailyLink(language, onOpenDaily)}
                </div>
              `
            : nothing}

          ${showDailyInline
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
        this._iconModal,
        language,
        {
          onClose: () => this._closeAlerts(),
          onToggleExpanded: (id) => this._toggleAlertExpanded(id),
        },
        dialogShell,
      )}
      ${renderDailyDialog(
        this._dailyOpen,
        this.hass,
        this._config,
        snap,
        forecastState,
        language,
        () => this._closeDaily(),
        dialogShell,
        this._dailyModalPlotLeft,
        this._dailyModalPlotWidth,
      )}
      ${detailModel
        ? renderViewportDialog({
            open: true,
            title: detailModel.title,
            titleId: "detail-modal-title",
            language,
            background: dialogShell.background,
            scene: dialogShell.scene,
            cloudCoverage: dialogShell.cloudCoverage,
            onClose: () => this._closeDetailDialog(),
            body: renderDetailSheetBody({
              model: detailModel,
              icon: this._iconModal,
              noChartText: localize("detail_no_chart", language),
              hass: this.hass,
              config: this._config,
              entityId: this._config.entity,
              language,
              windSpeedUnit: snap.windSpeedUnit,
              plotLeft: this._detailPlotLeft,
              plotWidth: this._detailPlotWidth,
              onChartScroll: () => this._onDetailScroll(),
              beaufortLegendOpen: this._beaufortLegendOpen,
              onToggleBeaufortLegend: () => this._toggleBeaufortLegend(),
              pollenLegendOpen: this._pollenLegendOpen,
              onTogglePollenLegend: () => this._togglePollenLegend(),
              uvLegendOpen: this._uvLegendOpen,
              onToggleUvLegend: () => this._toggleUvLegend(),
              humidityLegendOpen: this._humidityLegendOpen,
              onToggleHumidityLegend: () => this._toggleHumidityLegend(),
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
