import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  type VedurkortCardConfig,
} from "./config";
import { ICON_STYLES } from "./icons/allowlist";
import type { HomeAssistant } from "./types";

@customElement("vedurkort-weather-card-editor")
export class VedurkortWeatherCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: VedurkortCardConfig;

  public setConfig(config: Partial<VedurkortCardConfig>): void {
    this._config = normalizeConfig({
      ...DEFAULT_CONFIG,
      entity: config.entity ?? "weather.home",
      ...config,
    });
  }

  private _fire(config: VedurkortCardConfig): void {
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
    const target = ev.target as HTMLInputElement | HTMLSelectElement;
    const key = target.getAttribute("data-config");
    if (!key || !this._config) return;

    const next: VedurkortCardConfig = structuredClone(this._config);

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
      value = target.value;
    }

    setNested(key, value === "" ? undefined : value);
    this._fire(normalizeConfig(next));
  }

  protected render() {
    if (!this._config) return html``;
    const c = this._config;

    return html`
      <div class="form">
        <label>
          Weather entity
          <input
            type="text"
            .value=${c.entity}
            data-config="entity"
            @change=${this._value}
            placeholder="weather.home"
          />
        </label>

        <label>
          Layout
          <select
            .value=${c.layout}
            data-config="layout"
            @change=${this._value}
          >
            <option value="basic">basic</option>
            <option value="daily">daily</option>
            <option value="hourly">hourly</option>
          </select>
        </label>

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

        <fieldset>
          <legend>Details</legend>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.show_sun}
              data-config="show_sun"
              @change=${this._value}
            />
            Sunrise / sunset
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.show_humidity}
              data-config="show_humidity"
              @change=${this._value}
            />
            Humidity
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.show_wind_speed}
              data-config="show_wind_speed"
              @change=${this._value}
            />
            Wind speed
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.show_wind_direction}
              data-config="show_wind_direction"
              @change=${this._value}
            />
            Wind direction
          </label>
        </fieldset>

        <fieldset>
          <legend>Optional sensors</legend>
          <label>
            Temperature entity
            <input
              type="text"
              .value=${c.temperature_entity ?? ""}
              data-config="temperature_entity"
              @change=${this._value}
            />
          </label>
          <label>
            Humidity entity
            <input
              type="text"
              .value=${c.humidity_entity ?? ""}
              data-config="humidity_entity"
              @change=${this._value}
            />
          </label>
          <label>
            Wind speed entity
            <input
              type="text"
              .value=${c.wind_speed_entity ?? ""}
              data-config="wind_speed_entity"
              @change=${this._value}
            />
          </label>
          <label>
            Wind bearing entity
            <input
              type="text"
              .value=${c.wind_bearing_entity ?? ""}
              data-config="wind_bearing_entity"
              @change=${this._value}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Daily forecast</legend>
          <label>
            Days
            <input
              type="number"
              min="1"
              max="14"
              .value=${String(c.daily.days)}
              data-config="daily.days"
              @change=${this._value}
            />
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.daily.show_condition_icons}
              data-config="daily.show_condition_icons"
              @change=${this._value}
            />
            Condition icons
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.daily.show_wind}
              data-config="daily.show_wind"
              @change=${this._value}
            />
            Wind
          </label>
          <label>
            Precipitation
            <select
              .value=${c.daily.precip_type}
              data-config="daily.precip_type"
              @change=${this._value}
            >
              <option value="rainfall">rainfall</option>
              <option value="probability">probability</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Hourly forecast</legend>
          <label>
            Hours
            <input
              type="number"
              min="1"
              max="48"
              .value=${String(c.hourly.hours)}
              data-config="hourly.hours"
              @change=${this._value}
            />
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.hourly.show_condition_icons}
              data-config="hourly.show_condition_icons"
              @change=${this._value}
            />
            Condition icons
          </label>
          <label class="row">
            <input
              type="checkbox"
              .checked=${c.hourly.show_wind}
              data-config="hourly.show_wind"
              @change=${this._value}
            />
            Wind
          </label>
          <label>
            Precipitation
            <select
              .value=${c.hourly.precip_type}
              data-config="hourly.precip_type"
              @change=${this._value}
            >
              <option value="rainfall">rainfall</option>
              <option value="probability">probability</option>
            </select>
          </label>
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "vedurkort-weather-card-editor": VedurkortWeatherCardEditor;
  }
}
