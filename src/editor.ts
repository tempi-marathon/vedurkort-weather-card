import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { findCapAlertDevices } from "./alerts/discovery";
import { forecastHasPrecipProbability } from "./charts/forecast-chart";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  normalizeEditorConfig,
  type VedurkortEditorConfig,
} from "./config";
import { ICON_STYLES } from "./icons/allowlist";
import type { HomeAssistant } from "./types";
import { fetchForecastOnce } from "./weather/adapter";

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

  public setConfig(config: Partial<VedurkortEditorConfig>): void {
    this._config = normalizeEditorConfig({
      ...DEFAULT_CONFIG,
      ...config,
    });
    this._alertsSource = this._inferAlertsSource(this._config);
  }

  private _inferAlertsSource(config: VedurkortEditorConfig): AlertsSource {
    if (config.alerts_device) return "cap";
    if (config.alerts_entity || (config.alerts_entities?.length ?? 0) > 0) {
      return "entity";
    }
    return "cap";
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
    if (key.includes(".")) {
      // not used
    } else {
      (next as Record<string, unknown>)[key] =
        value === "" ? undefined : value;
    }
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
      next.alerts_entity = undefined;
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

  private _alertsSourceChanged(ev: Event): void {
    const value = (ev.target as HTMLSelectElement).value as AlertsSource;
    if (value === "cap" || value === "entity") {
      this._setAlertsSource(value);
    }
  }

  private _renderCapDeviceField() {
    const devices = this.hass ? findCapAlertDevices(this.hass) : [];
    const selected = this._config.alerts_device ?? "";

    if (devices.length === 0) {
      return html`
        <p class="hint footnote">
          No CAP Alerts device found yet. Install
          <a
            href="https://github.com/seevee/cap_alerts"
            target="_blank"
            rel="noopener noreferrer"
            >CAP Alerts</a
          >, add the integration for your region, then reopen this editor. If
          you already installed it, wait until alert sensors appear under the
          device, or set <code>alerts_device</code> in YAML.
        </p>
        <label>
          CAP Alerts device id (optional)
          <input
            type="text"
            .value=${selected}
            placeholder="Paste device id if needed"
            data-config="alerts_device"
            @change=${this._value}
          />
        </label>
      `;
    }

    return html`
      <p class="hint">
        ${devices.length === 1
          ? "One CAP Alerts device was found and can be used automatically."
          : "Select which CAP Alerts device to use. Do not pick individual warning sensors."}
      </p>
      <label>
        CAP Alerts device
        <select
          .value=${selected || (devices.length === 1 ? devices[0]!.id : "")}
          data-config="alerts_device"
          @change=${this._value}
        >
          ${devices.length > 1
            ? html`<option value="">Select a device…</option>`
            : nothing}
          ${devices.map(
            (d) => html`
              <option
                value=${d.id}
                ?selected=${d.id === selected ||
                (!selected && devices.length === 1)}
              >
                ${d.name}
              </option>
            `,
          )}
        </select>
      </label>
    `;
  }

  private _picker(
    label: string,
    key: keyof VedurkortEditorConfig,
    domainFilter?: string | string[],
    allowCustom = true,
  ) {
    const value = (this._config[key] as string | undefined) ?? "";
    // ha-entity-picker is provided by Home Assistant frontend
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
    return (
      this._detailAvail(["next_rising"], true) === false ||
      this._detailAvail(["humidity"]) === false ||
      this._detailAvail(["wind_speed"]) === false ||
      this._detailAvail(["wind_bearing"]) === false ||
      this._detailAvail(["uv_index"]) === false ||
      this._detailAvail(["pressure"]) === false ||
      this._detailAvail(["cloud_coverage"]) === false ||
      this._detailAvail(["apparent_temperature"]) === false ||
      this._detailAvail(["dew_point"]) === false ||
      this._detailAvail(["visibility"]) === false ||
      this._detailAvail(["precipitation"]) === false ||
      this._detailAvail(["precipitation_probability"]) === false
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
          <legend>General</legend>
          ${this._picker("Weather entity", "entity", "weather", false)}
          <label>
            Name (optional)
            <input
              type="text"
              .value=${c.name ?? ""}
              data-config="name"
              @change=${this._value}
            />
          </label>
          <label>
            Icon style
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
            Animated icons
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.animated_background}
              data-config="animated_background"
              @change=${this._value}
            />
            Animated background
          </label>
        </fieldset>

        <fieldset>
          <legend>Current weather</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.show_current}
              data-config="show_current"
              @change=${this._value}
            />
            Show current weather
          </label>
          ${c.show_current
            ? html`
                <p class="hint">
                  Detail chips only appear on the card when the weather entity
                  or an override sensor provides a value. Availability varies
                  by integration.
                </p>
                ${this._detailToggle(
                  "show_sun",
                  "Next sunrise / sunset",
                  ["next_rising"],
                  true,
                )}
                ${this._detailToggle("show_humidity", "Humidity", [
                  "humidity",
                ])}
                ${this._detailToggle(
                  "show_wind_speed",
                  "Wind speed",
                  ["wind_speed"],
                )}
                ${this._detailToggle("show_wind_direction", "Wind direction", [
                  "wind_bearing",
                ])}
                ${this._detailToggle("show_uv_index", "UV index", [
                  "uv_index",
                ])}
                ${this._detailToggle("show_pressure", "Pressure", [
                  "pressure",
                ])}
                ${this._detailToggle(
                  "show_cloud_coverage",
                  "Cloud coverage",
                  ["cloud_coverage"],
                )}
                ${this._detailToggle(
                  "show_feels_like",
                  "Feels like",
                  ["apparent_temperature"],
                )}
                ${this._detailToggle("show_dew_point", "Dew point", [
                  "dew_point",
                ])}
                ${this._detailToggle("show_visibility", "Visibility", [
                  "visibility",
                ])}
                ${this._detailToggle("show_precipitation", "Precipitation", [
                  "precipitation",
                ])}
                ${this._detailToggle(
                  "show_precipitation_probability",
                  "Precipitation probability",
                  ["precipitation_probability"],
                )}
                ${this._anyDetailMissing()
                  ? html`<p class="hint footnote">
                      * Not on this weather entity — add a sensor under
                      Optional sensors below.
                    </p>`
                  : nothing}
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>Daily forecast</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.daily.enabled}
              data-config="daily.enabled"
              @change=${this._value}
            />
            Show daily forecast
          </label>
          ${c.daily.enabled
            ? html`
                <label>
                  Days
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
                  Condition icons</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.daily.show_wind_speed}
                    data-config="daily.show_wind_speed"
                    @change=${this._value}
                  />
                  Wind speed</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.daily.show_wind_direction}
                    data-config="daily.show_wind_direction"
                    @change=${this._value}
                  />
                  Wind direction</label
                >
                <label>
                  <span class="row-text"
                    >Precipitation
                    ${c.daily.precip_type === "probability"
                      ? this._dailyHasProbability === false
                        ? html`<span class="avail missing"
                            >probability not in forecast</span
                          >`
                        : this._dailyHasProbability === true
                          ? html`<span class="avail ok"
                              >probability in forecast</span
                            >`
                          : nothing
                      : nothing}</span
                  >
                  <select
                    .value=${c.daily.precip_type}
                    data-config="daily.precip_type"
                    @change=${this._value}
                  >
                    <option value="rainfall">rainfall</option>
                    <option value="probability">probability</option>
                  </select>
                </label>
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>Hourly forecast</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.hourly.enabled}
              data-config="hourly.enabled"
              @change=${this._value}
            />
            Show hourly forecast
          </label>
          ${c.hourly.enabled
            ? html`
                <label>
                  Hours
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
                  Condition icons</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.hourly.show_wind_speed}
                    data-config="hourly.show_wind_speed"
                    @change=${this._value}
                  />
                  Wind speed</label
                >
                <label class="row"
                  ><input
                    type="checkbox"
                    .checked=${c.hourly.show_wind_direction}
                    data-config="hourly.show_wind_direction"
                    @change=${this._value}
                  />
                  Wind direction</label
                >
                <label>
                  <span class="row-text"
                    >Precipitation
                    ${c.hourly.precip_type === "probability"
                      ? this._hourlyHasProbability === false
                        ? html`<span class="avail missing"
                            >probability not in forecast</span
                          >`
                        : this._hourlyHasProbability === true
                          ? html`<span class="avail ok"
                              >probability in forecast</span
                            >`
                          : nothing
                      : nothing}</span
                  >
                  <select
                    .value=${c.hourly.precip_type}
                    data-config="hourly.precip_type"
                    @change=${this._value}
                  >
                    <option value="rainfall">rainfall</option>
                    <option value="probability">probability</option>
                  </select>
                </label>
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>Weather alerts</legend>
          <label class="row enable">
            <input
              type="checkbox"
              .checked=${c.show_alerts}
              data-config="show_alerts"
              @change=${this._value}
            />
            Show weather alerts
          </label>
          ${c.show_alerts
            ? html`
                <p class="hint">
                  Choose where alerts come from. Recommended:
                  <a
                    href="https://github.com/seevee/cap_alerts"
                    target="_blank"
                    rel="noopener noreferrer"
                    >CAP Alerts</a
                  >
                  (one device for your region). Europe alternative: a single
                  <a
                    href="https://www.home-assistant.io/integrations/meteoalarm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    >MeteoAlarm</a
                  >
                  binary sensor (one alert at a time).
                </p>
                <label>
                  Alert source
                  <select
                    .value=${this._alertsSource}
                    @change=${this._alertsSourceChanged}
                  >
                    <option value="cap">CAP Alerts device</option>
                    <option value="entity">Single alert entity</option>
                  </select>
                </label>
                ${this._alertsSource === "cap"
                  ? this._renderCapDeviceField()
                  : html`
                      <p class="hint">
                        Pick one alert sensor (for example
                        <code>binary_sensor.meteoalarm</code>). Do not pick the
                        individual CAP “Minor … warning” sensors — use CAP
                        Alerts device mode instead.
                      </p>
                      ${this._picker("Alert entity", "alerts_entity", [
                        "binary_sensor",
                        "sensor",
                      ])}
                    `}
              `
            : nothing}
        </fieldset>

        <fieldset>
          <legend>Optional sensors</legend>
          <p class="hint">
            Override values from the weather entity with dedicated sensors.
            Condition override is useful for testing backgrounds without
            changing your main weather entity (e.g. an input_select of HA
            conditions).
          </p>
          ${this._picker("Condition", "condition_entity", [
            "input_select",
            "sensor",
            "input_text",
          ])}
          ${this._picker("Temperature", "temperature_entity", "sensor")}
          ${this._picker("Humidity", "humidity_entity", "sensor")}
          ${this._picker("Wind speed", "wind_speed_entity", "sensor")}
          ${this._picker("Wind bearing", "wind_bearing_entity", "sensor")}
          ${this._picker("UV index", "uv_index_entity", "sensor")}
          ${this._picker("Pressure", "pressure_entity", "sensor")}
          ${this._picker("Cloud coverage", "cloud_coverage_entity", "sensor")}
          ${this._picker("Feels like", "feels_like_entity", "sensor")}
          ${this._picker("Dew point", "dew_point_entity", "sensor")}
          ${this._picker("Visibility", "visibility_entity", "sensor")}
          ${this._picker("Precipitation", "precipitation_entity", "sensor")}
          ${this._picker(
            "Precipitation probability",
            "precipitation_probability_entity",
            "sensor",
          )}
          ${this._picker("Sun", "sun_entity", "sun")}
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "vedurkort-weather-card-editor": VedurkortWeatherCardEditor;
  }
}
