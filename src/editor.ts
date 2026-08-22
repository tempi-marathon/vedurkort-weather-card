import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  anchorEntityForDevice,
  deviceIdFromEntity,
  findCapAlertDevices,
  isCapAlertsEntity,
  isMeteoAlarmEntity,
} from "./alerts/discovery";
import { forecastHasPrecipProbability } from "./charts/forecast-chart";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  normalizeEditorConfig,
  CARD_LAYOUTS,
  type VedurkortEditorConfig,
} from "./config";
import { ICON_STYLES } from "./icons/allowlist";
import {
  layoutLabel,
  localize,
  resolveLanguage,
  type LocalizeKey,
} from "./localize";
import type { HassEntity, HomeAssistant } from "./types";
import { fetchForecastOnce } from "./weather/adapter";

type DetailToggleKey =
  | "show_sun"
  | "show_humidity"
  | "show_wind_speed"
  | "show_wind_direction"
  | "show_wind_gust"
  | "show_uv_index"
  | "show_pressure"
  | "show_cloud_coverage"
  | "show_feels_like"
  | "show_dew_point"
  | "show_visibility"
  | "show_precipitation"
  | "show_precipitation_probability";

type AlertsSource = "cap" | "entity";

@customElement("vedurkort-weather-card-editor")
export class VedurkortWeatherCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: VedurkortEditorConfig;
  /** null = unknown/loading, true/false = probed from forecast sample */
  @state() private _dailyHasProbability: boolean | null = null;
  @state() private _hourlyHasProbability: boolean | null = null;
  @state() private _alertsSource: AlertsSource = "cap";

  private _probeKey = "";

  private _t(key: LocalizeKey, vars?: Record<string, string>): string {
    return localize(key, resolveLanguage(this.hass), vars);
  }

  public setConfig(config: Partial<VedurkortEditorConfig>): void {
    this._config = normalizeEditorConfig({
      ...DEFAULT_CONFIG,
      ...config,
    });
    this._alertsSource = this._inferAlertsSource(this._config);
  }

  private _inferAlertsSource(config: VedurkortEditorConfig): AlertsSource {
    if (config.alerts_entities?.length) return "entity";
    if (config.alerts_device) return "cap";
    // Neither set — keep the editor's current mode (avoids snap-back on first click).
    return this._alertsSource ?? "cap";
  }

  protected updated(changed: Map<string, unknown>): void {
    if (
      (changed.has("hass") || changed.has("_config")) &&
      this.hass &&
      this._config
    ) {
      void this._probePrecipProbability();
    }
  }

  private async _probePrecipProbability(): Promise<void> {
    const key = this._config.entity;
    if (!key || !this.hass.states[key]) {
      this._probeKey = "";
      this._dailyHasProbability = null;
      this._hourlyHasProbability = null;
      return;
    }
    if (key === this._probeKey) return;
    this._probeKey = key;
    this._dailyHasProbability = null;
    this._hourlyHasProbability = null;
    try {
      const [daily, hourly] = await Promise.all([
        fetchForecastOnce(this.hass, key, "daily"),
        fetchForecastOnce(this.hass, key, "hourly"),
      ]);
      if (this._probeKey !== key) return;
      this._dailyHasProbability = forecastHasPrecipProbability(daily);
      this._hourlyHasProbability = forecastHasPrecipProbability(hourly);
    } catch {
      if (this._probeKey !== key) return;
      this._dailyHasProbability = null;
      this._hourlyHasProbability = null;
    }
  }

  private _fire(config: VedurkortEditorConfig): void {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _value(ev: Event): void {
    const target = ev.target as HTMLInputElement | HTMLSelectElement & {
      value?: string | number | boolean;
    };
    const key =
      target.getAttribute("data-config") ??
      (target as HTMLElement).getAttribute("data-config");
    if (!key || !this._config) return;

    const next: VedurkortEditorConfig = structuredClone(this._config);
    const setNested = (path: string, value: unknown) => {
      const parts = path.split(".");
      let cur: Record<string, unknown> = next as unknown as Record<
        string,
        unknown
      >;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i]!;
        cur[p] = { ...(cur[p] as object) };
        cur = cur[p] as Record<string, unknown>;
      }
      cur[parts[parts.length - 1]!] = value;
    };

    let value: unknown;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    } else if (target instanceof HTMLInputElement && target.type === "number") {
      value = Number(target.value);
    } else {
      value = (target as HTMLSelectElement).value;
    }

    setNested(key, value === "" ? undefined : value);
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _entityChanged(ev: CustomEvent, key: string): void {
    if (!this._config) return;
    const value = (ev.detail as { value?: string })?.value ?? "";
    const next = structuredClone(this._config) as VedurkortEditorConfig &
      Record<string, unknown>;
    (next as Record<string, unknown>)[key] =
      value === "" ? undefined : value;
    if (key === "entity" && !value) return;
    this._fire(
      normalizeConfig({
        ...next,
        entity: key === "entity" ? value : next.entity,
      }),
    );
  }

  private _setAlertsSource(source: AlertsSource): void {
    this._alertsSource = source;
    if (!this._config) return;
    const next = structuredClone(this._config);
    if (source === "cap") {
      next.alerts_entities = undefined;
      const devices = this.hass ? findCapAlertDevices(this.hass) : [];
      if (!next.alerts_device && devices.length === 1) {
        next.alerts_device = devices[0]!.id;
      }
    } else {
      next.alerts_device = undefined;
    }
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _capAnchorEntityChanged(ev: CustomEvent): void {
    if (!this._config) return;
    const entityId = (ev.detail as { value?: string })?.value ?? "";
    const next = structuredClone(this._config);
    if (!entityId) {
      next.alerts_device = undefined;
    } else {
      const deviceId = deviceIdFromEntity(this.hass, entityId);
      if (!deviceId) return;
      next.alerts_device = deviceId;
    }
    next.alerts_entities = undefined;
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _capEntityFilter = (state: HassEntity): boolean =>
    isCapAlertsEntity(this.hass, state.entity_id);

  private _alertEntityFilter = (state: HassEntity): boolean =>
    isMeteoAlarmEntity(this.hass, state.entity_id) ||
    isCapAlertsEntity(this.hass, state.entity_id);

  private _detailFields(): Array<{
    key: DetailToggleKey;
    attrs: string[];
    sun?: boolean;
  }> {
    return [
      { key: "show_sun", attrs: ["next_rising"], sun: true },
      { key: "show_humidity", attrs: ["humidity"] },
      { key: "show_wind_speed", attrs: ["wind_speed"] },
      { key: "show_wind_direction", attrs: ["wind_bearing"] },
      { key: "show_wind_gust", attrs: ["wind_gust"] },
      { key: "show_uv_index", attrs: ["uv_index"] },
      { key: "show_pressure", attrs: ["pressure"] },
      { key: "show_cloud_coverage", attrs: ["cloud_coverage"] },
      { key: "show_feels_like", attrs: ["apparent_temperature"] },
      { key: "show_dew_point", attrs: ["dew_point"] },
      { key: "show_visibility", attrs: ["visibility"] },
      { key: "show_precipitation", attrs: ["precipitation"] },
      {
        key: "show_precipitation_probability",
        attrs: ["precipitation_probability"],
      },
    ];
  }

  private _applyDetailPreset(preset: "available" | "full" | "clear"): void {
    if (!this._config) return;
    const next = structuredClone(this._config);
    const off: Record<DetailToggleKey, boolean> = {
      show_sun: false,
      show_humidity: false,
      show_wind_speed: false,
      show_wind_direction: false,
      show_wind_gust: false,
      show_uv_index: false,
      show_pressure: false,
      show_cloud_coverage: false,
      show_feels_like: false,
      show_dew_point: false,
      show_visibility: false,
      show_precipitation: false,
      show_precipitation_probability: false,
    };
    Object.assign(next, off);
    if (preset === "available") {
      for (const { key, attrs, sun } of this._detailFields()) {
        next[key] = this._detailAvail(attrs, sun) === true;
      }
    } else if (preset === "full") {
      for (const k of Object.keys(off) as DetailToggleKey[]) {
        next[k] = true;
      }
    }
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _addAlertEntity(ev: CustomEvent): void {
    if (!this._config) return;
    const entityId = (ev.detail as { value?: string })?.value ?? "";
    if (!entityId) return;
    const next = structuredClone(this._config);
    const list = [...(next.alerts_entities ?? [])];
    if (list.includes(entityId)) return;
    list.push(entityId);
    next.alerts_entities = list;
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _removeAlertEntity(entityId: string): void {
    if (!this._config) return;
    const next = structuredClone(this._config);
    next.alerts_entities = (next.alerts_entities ?? []).filter(
      (id) => id !== entityId,
    );
    if (!next.alerts_entities.length) next.alerts_entities = undefined;
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _actionChanged(
    ev: CustomEvent,
    key: "tap_action" | "hold_action" | "double_tap_action",
  ): void {
    if (!this._config) return;
    const next = structuredClone(this._config);
    next[key] = (ev.detail as { value?: unknown })?.value as
      | VedurkortEditorConfig[typeof key]
      | undefined;
    this._fire(
      next.entity ? normalizeConfig(next) : normalizeEditorConfig(next),
    );
  }

  private _renderAlertEntitiesField() {
    const entities = this._config.alerts_entities ?? [];

    return html`
      <p class="hint">${this._t("alert_entities_hint")}</p>
      ${entities.length
        ? html`
            <ul class="alert-entity-list">
              ${entities.map(
                (id) => html`
                  <li class="alert-entity-row">
                    <span class="alert-entity-label">
                      ${this.hass.states[id]?.attributes.friendly_name ?? id}
                      <code class="alert-entity-id">${id}</code>
                    </span>
                    <button
                      type="button"
                      class="preset-btn small"
                      @click=${() => this._removeAlertEntity(id)}
                    >
                      ${this._t("remove")}
                    </button>
                  </li>
                `,
              )}
            </ul>
          `
        : nothing}
      <div class="field">
        <span class="label"
          >${entities.length
            ? this._t("add_another_entity")
            : this._t("alert_entities")}</span
        >
        <ha-entity-picker
          .hass=${this.hass}
          .value=${""}
          .includeDomains=${["binary_sensor", "sensor"]}
          .entityFilter=${this._alertEntityFilter}
          .allowCustomEntity=${false}
          @value-changed=${this._addAlertEntity}
        ></ha-entity-picker>
      </div>
    `;
  }

  private _renderCapDeviceField() {
    const devices = this.hass ? findCapAlertDevices(this.hass) : [];
    const deviceId =
      this._config.alerts_device ??
      (devices.length === 1 ? devices[0]!.id : undefined);
    const displayEntity = deviceId
      ? (anchorEntityForDevice(this.hass, deviceId) ?? "")
      : "";

    return html`
      <p class="hint">
        ${this._t("cap_device_hint")}
        ${devices.length === 1 ? ` ${this._t("cap_device_auto")}` : nothing}
      </p>
      <div class="field">
        <span class="label">${this._t("cap_alerts_device")}</span>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${displayEntity}
          .includeDomains=${["sensor", "binary_sensor"]}
          .entityFilter=${this._capEntityFilter}
          .allowCustomEntity=${false}
          @value-changed=${this._capAnchorEntityChanged}
        ></ha-entity-picker>
      </div>
    `;
  }

  private _picker(
    label: string,
    key: keyof VedurkortEditorConfig,
    domainFilter?: string | string[],
    allowCustom = true,
    entityFilter?: (state: HassEntity) => boolean,
  ) {
    const value = (this._config[key] as string | undefined) ?? "";
    return html`
      <div class="field">
        <span class="label">${label}</span>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${value}
          .includeDomains=${domainFilter
            ? Array.isArray(domainFilter)
              ? domainFilter
              : [domainFilter]
            : undefined}
          .entityFilter=${entityFilter}
          .allowCustomEntity=${allowCustom}
          data-config=${key}
          @value-changed=${(ev: CustomEvent) =>
            this._entityChanged(ev, key as string)}
        ></ha-entity-picker>
      </div>
    `;
  }

  private _entityHasAttr(attrs: string[]): boolean | null {
    if (!this.hass || !this._config?.entity) return null;
    const entity = this.hass.states[this._config.entity];
    if (!entity) return null;
    return attrs.some((a) => entity.attributes[a] != null);
  }

  private _detailAvail(attrs: string[], sunSpecial = false): boolean | null {
    if (sunSpecial) {
      const sunId = this._config?.sun_entity ?? "sun.sun";
      const sun = this.hass?.states[sunId];
      if (!sun) return null;
      return (
        attrs.some((a) => sun.attributes[a] != null) || sun.state != null
      );
    }
    return this._entityHasAttr(attrs);
  }

  private _anyDetailMissing(): boolean {
    return this._detailFields().some(
      ({ attrs, sun }) => this._detailAvail(attrs, sun) === false,
    );
  }

  private _detailToggle(
    key: keyof VedurkortEditorConfig,
    label: string,
    attrs: string[],
    sunSpecial = false,
  ) {
    const checked = Boolean(this._config[key]);
    const missing = this._detailAvail(attrs, sunSpecial) === false;

    return html`
      <label class="row">
        <input
          type="checkbox"
          .checked=${checked}
          data-config=${key as string}
          @change=${this._value}
        />
        <span class="row-text"
          >${label}${missing
            ? html`<span class="avail missing" aria-hidden="true">*</span>`
            : nothing}</span
        >
      </label>
    `;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const c = this._config;

    return html`
      <div class="form">
        <fieldset>
          <legend>${this._t("legend_general")}</legend>
          ${this._picker(this._t("weather_entity"), "entity", "weather", false)}
          <label>
            ${this._t("layout")}
            <select
              .value=${c.layout ?? "default"}
              data-config="layout"
              @change=${this._value}
            >
              ${CARD_LAYOUTS.map(
                (l) =>
                  html`<option value=${l}>${layoutLabel(l, resolveLanguage(this.hass))}</option>`,
              )}
            </select>
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.show_name}
              data-config="show_name"
              @change=${this._value}
            />
            ${this._t("show_name")}
          </label>
          ${c.show_name
            ? html`
                <label>
                  ${this._t("name_placeholder")}
                  <input
                    type="text"
                    .value=${c.name ?? ""}
                    data-config="name"
                    @change=${this._value}
                  />
                </label>
              `
            : nothing}
          <label>
            ${this._t("icon_style")}
            <select
              .value=${c.icon_style}
              data-config="icon_style"
              @change=${this._value}
            >
              ${ICON_STYLES.map(
                (s) => html`<option value=${s}>${s}</option>`,
              )}
            </select>
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.animated_icons}
              data-config="animated_icons"
              @change=${this._value}
            />
            ${this._t("animated_icons")}
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.animated_background}
              data-config="animated_background"
              @change=${this._value}
            />
            ${this._t("animated_background")}
          </label>
        </fieldset>

        <fieldset>
          <legend>${this._t("legend_current")}</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.show_current}
              data-config="show_current"
              @change=${this._value}
            />
            ${this._t("show_current_weather")}
          </label>
          ${c.show_current
            ? html`
                <p class="hint">${this._t("current_detail_hint")}</p>
                <div class="preset-row">
                  <button type="button" class="preset-btn" @click=${() => this._applyDetailPreset("available")}>
                    ${this._t("preset_available_details")}
                  </button>
                  <button type="button" class="preset-btn" @click=${() => this._applyDetailPreset("full")}>
                    ${this._t("preset_all_details")}
                  </button>
                  <button type="button" class="preset-btn" @click=${() => this._applyDetailPreset("clear")}>
                    ${this._t("preset_clear_all")}
                  </button>
                </div>
                ${this._detailToggle(
                  "show_sun",
                  this._t("next_sun"),
                  ["next_rising"],
                  true,
                )}
                ${this._detailToggle("show_humidity", this._t("humidity"), [
                  "humidity",
                ])}
                ${this._detailToggle(
                  "show_wind_speed",
                  this._t("wind_speed"),
                  ["wind_speed"],
                )}
                ${this._detailToggle(
                  "show_wind_direction",
                  this._t("wind_direction"),
                  ["wind_bearing"],
                )}
                ${this._detailToggle("show_wind_gust", this._t("wind_gust"), [
                  "wind_gust",
                ])}
                ${this._detailToggle("show_uv_index", this._t("uv_index"), [
                  "uv_index",
                ])}
                ${this._detailToggle("show_pressure", this._t("pressure"), [
                  "pressure",
                ])}
                ${this._detailToggle(
                  "show_cloud_coverage",
                  this._t("cloud_coverage"),
                  ["cloud_coverage"],
                )}
                ${this._detailToggle(
                  "show_feels_like",
                  this._t("feels_like"),
                  ["apparent_temperature"],
                )}
                ${this._detailToggle("show_dew_point", this._t("dew_point"), [
                  "dew_point",
                ])}
                ${this._detailToggle("show_visibility", this._t("visibility"), [
                  "visibility",
                ])}
                ${this._detailToggle(
                  "show_precipitation",
                  this._t("precipitation"),
                  ["precipitation"],
                )}
                ${this._detailToggle(
                  "show_precipitation_probability",
                  this._t("precipitation_probability"),
                  ["precipitation_probability"],
                )}
                ${this._anyDetailMissing()
                  ? html`<p class="hint footnote">
                      ${this._t("footnote_missing_attrs")}
                    </p>`
                  : nothing}
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>${this._t("legend_daily")}</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.daily.enabled}
              data-config="daily.enabled"
              @change=${this._value}
            />
            ${this._t("show_daily_forecast")}
          </label>
          ${c.daily.enabled
            ? html`
                <label>
                  ${this._t("days")}
                  <input
                    type="number"
                    min="2"
                    max="7"
                    .value=${String(c.daily.days)}
                    data-config="daily.days"
                    @change=${this._value}
                  />
                </label>
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.daily.show_condition_icons}
                    data-config="daily.show_condition_icons"
                    @change=${this._value}
                  />
                  ${this._t("condition_icons")}</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.daily.show_wind_speed}
                    data-config="daily.show_wind_speed"
                    @change=${this._value}
                  />
                  ${this._t("wind_speed")}</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.daily.show_wind_direction}
                    data-config="daily.show_wind_direction"
                    @change=${this._value}
                  />
                  ${this._t("wind_direction")}</label
                >
                <label>
                  <span class="row-text"
                    >${this._t("precipitation")}
                    ${c.daily.precip_type === "probability"
                      ? this._dailyHasProbability === false
                        ? html`<span class="avail missing"
                            >${this._t("prob_not_in_forecast")}</span
                          >`
                        : this._dailyHasProbability === true
                          ? html`<span class="avail ok"
                              >${this._t("prob_in_forecast")}</span
                            >`
                          : nothing
                      : nothing}</span
                  >
                  <select
                    .value=${c.daily.precip_type}
                    data-config="daily.precip_type"
                    @change=${this._value}
                  >
                    <option value="rainfall">${this._t("rainfall")}</option>
                    <option value="probability">${this._t("probability")}</option>
                  </select>
                </label>
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>${this._t("legend_hourly")}</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.hourly.enabled}
              data-config="hourly.enabled"
              @change=${this._value}
            />
            ${this._t("show_hourly_forecast")}
          </label>
          ${c.hourly.enabled
            ? html`
                <label>
                  ${this._t("hours")}
                  <input
                    type="number"
                    min="2"
                    max="48"
                    .value=${String(c.hourly.hours)}
                    data-config="hourly.hours"
                    @change=${this._value}
                  />
                </label>
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.hourly.show_condition_icons}
                    data-config="hourly.show_condition_icons"
                    @change=${this._value}
                  />
                  ${this._t("condition_icons")}</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.hourly.show_wind_speed}
                    data-config="hourly.show_wind_speed"
                    @change=${this._value}
                  />
                  ${this._t("wind_speed")}</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.hourly.show_wind_direction}
                    data-config="hourly.show_wind_direction"
                    @change=${this._value}
                  />
                  ${this._t("wind_direction")}</label
                >
                <label>
                  <span class="row-text"
                    >${this._t("precipitation")}
                    ${c.hourly.precip_type === "probability"
                      ? this._hourlyHasProbability === false
                        ? html`<span class="avail missing"
                            >${this._t("prob_not_in_forecast")}</span
                          >`
                        : this._hourlyHasProbability === true
                          ? html`<span class="avail ok"
                              >${this._t("prob_in_forecast")}</span
                            >`
                          : nothing
                      : nothing}</span
                  >
                  <select
                    .value=${c.hourly.precip_type}
                    data-config="hourly.precip_type"
                    @change=${this._value}
                  >
                    <option value="rainfall">${this._t("rainfall")}</option>
                    <option value="probability">${this._t("probability")}</option>
                  </select>
                </label>
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>${this._t("legend_alerts")}</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.show_alerts}
              data-config="show_alerts"
              @change=${this._value}
            />
            ${this._t("show_weather_alerts")}
          </label>
          ${c.show_alerts
            ? html`
                <p class="hint">${this._t("alerts_choose_hint")}</p>
                <div class="field">
                  <span class="label">${this._t("alert_source")}</span>
                  <div
                    class="radio-group"
                    role="radiogroup"
                    aria-label=${this._t("alert_source")}
                  >
                    <label class="row radio">
                      <input
                        type="radio"
                        name="alerts-source"
                        value="cap"
                        .checked=${this._alertsSource === "cap"}
                        @change=${() => this._setAlertsSource("cap")}
                      />
                      ${this._t("cap_alerts_device")}
                    </label>
                    <label class="row radio">
                      <input
                        type="radio"
                        name="alerts-source"
                        value="entity"
                        .checked=${this._alertsSource === "entity"}
                        @change=${() => this._setAlertsSource("entity")}
                      />
                      ${this._t("alert_entities")}
                    </label>
                  </div>
                </div>
                ${this._alertsSource === "cap"
                  ? this._renderCapDeviceField()
                  : this._renderAlertEntitiesField()}
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>${this._t("legend_actions")}</legend>
          <p class="hint">${this._t("actions_default_hint")}</p>
          <div class="field">
            <span class="label">${this._t("tap_action")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ ui_action: {} }}
              .value=${c.tap_action}
              @value-changed=${(ev: CustomEvent) =>
                this._actionChanged(ev, "tap_action")}
            ></ha-selector>
          </div>
          <div class="field">
            <span class="label">${this._t("hold_action")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ ui_action: {} }}
              .value=${c.hold_action}
              @value-changed=${(ev: CustomEvent) =>
                this._actionChanged(ev, "hold_action")}
            ></ha-selector>
          </div>
          <div class="field">
            <span class="label">${this._t("double_tap_action")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{ ui_action: {} }}
              .value=${c.double_tap_action}
              @value-changed=${(ev: CustomEvent) =>
                this._actionChanged(ev, "double_tap_action")}
            ></ha-selector>
          </div>
        </fieldset>

        <fieldset>
          <legend>${this._t("legend_sensors")}</legend>
          <p class="hint">${this._t("sensors_override_hint")}</p>
          ${this._picker(this._t("condition"), "condition_entity", [
            "input_select",
            "sensor",
            "input_text",
          ])}
          ${this._picker(this._t("temperature"), "temperature_entity", "sensor")}
          ${this._picker(this._t("humidity"), "humidity_entity", "sensor")}
          ${this._picker(this._t("wind_speed"), "wind_speed_entity", "sensor")}
          ${this._picker(this._t("wind_bearing"), "wind_bearing_entity", "sensor")}
          ${this._picker(this._t("wind_gust"), "wind_gust_entity", "sensor")}
          ${this._picker(this._t("uv_index"), "uv_index_entity", "sensor")}
          ${this._picker(this._t("pressure"), "pressure_entity", "sensor")}
          ${this._picker(this._t("cloud_coverage"), "cloud_coverage_entity", "sensor")}
          ${this._picker(this._t("feels_like"), "feels_like_entity", "sensor")}
          ${this._picker(this._t("dew_point"), "dew_point_entity", "sensor")}
          ${this._picker(this._t("visibility"), "visibility_entity", "sensor")}
          ${this._picker(this._t("precipitation"), "precipitation_entity", "sensor")}
          ${this._picker(
            this._t("precipitation_probability"),
            "precipitation_probability_entity",
            "sensor",
          )}
          ${this._picker(this._t("sun"), "sun_entity", "sun")}
        </fieldset>
      </div>
    `;
  }

  static styles = css`
    .form {
      display: grid;
      gap: 12px;
      padding: 4px 0 16px;
    }
    .field {
      display: grid;
      gap: 4px;
    }
    .radio-group {
      display: grid;
      gap: 4px;
    }
    label.row.radio {
      font-size: 0.9rem;
    }
    .label {
      font-size: 0.9rem;
    }
    label {
      display: grid;
      gap: 4px;
      font-size: 0.9rem;
    }
    label.row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    label.enable {
      font-weight: 600;
    }
    input[type="text"],
    input[type="number"],
    select {
      padding: 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, inherit);
    }
    fieldset {
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      padding: 10px 12px;
      display: grid;
      gap: 10px;
    }
    legend {
      padding: 0 6px;
      font-weight: 600;
    }
    .hint {
      margin: 0;
      font-size: 0.8rem;
      opacity: 0.8;
      line-height: 1.35;
    }
    .row-text {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px;
    }
    .avail {
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0.85;
      color: var(--primary-text-color, inherit);
    }
    .avail.ok {
      color: var(--success-color, #2e7d32);
    }
    .avail.missing {
      color: var(--primary-text-color, inherit);
    }
    .footnote {
      margin-top: 2px;
    }
    .preset-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .preset-btn {
      appearance: none;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, inherit);
      border-radius: 8px;
      padding: 6px 12px;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }
    .preset-btn:hover {
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 12%, transparent);
    }
    .preset-btn.small {
      padding: 4px 8px;
      font-size: 0.78rem;
    }
    .alert-entity-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 6px;
    }
    .alert-entity-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.85rem;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #ccc);
      background: color-mix(in srgb, var(--primary-text-color, #000) 4%, transparent);
    }
    .alert-entity-label {
      display: grid;
      gap: 2px;
      min-width: 0;
    }
    .alert-entity-id {
      font-size: 0.75rem;
      opacity: 0.75;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "vedurkort-weather-card-editor": VedurkortWeatherCardEditor;
    "ha-selector": HTMLElement;
  }
}
