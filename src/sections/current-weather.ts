import { html, nothing, type TemplateResult } from "lit";
import type { WeatherAlert } from "../alerts/types";
import type { VedurkortCardConfig } from "../config";
import type { DetailMetricId } from "../details/types";
import {
  bearingToLabel,
  beaufortIcon,
  uvIndexIcon,
} from "../icons/condition-map";
import type { MeteoconName } from "../icons/allowlist";
import { localize } from "../localize";
import { tipWrap } from "../ui/tooltip";
import {
  formatNumber,
  formatPrecip,
  formatTemp,
  formatTime,
  nextSunEvent,
  type WeatherSnapshot,
} from "../weather/adapter";
import {
  formatWindHeading,
  formatWindSpeed,
} from "../weather/wind-units";
import { pollenLevelClass } from "../pollen/colors";
import { pollenIcon } from "../pollen/icons";
import type { PollenSnapshot } from "../pollen/types";
import {
  renderAlertsStrip,
  type IconRenderer,
} from "./alerts-section";
import { renderDailyLink } from "./forecast-section";
import {
  demotePrimaryChips,
  resolveDetailChips,
  SMART_CHIP_ORDER,
  type SmartChipId,
  type SmartChipValues,
} from "./smart-chips";

export interface CurrentWeatherContext {
  config: VedurkortCardConfig;
  snap: WeatherSnapshot;
  iconName: MeteoconName;
  language: string | undefined;
  alerts: WeatherAlert[];
  showAlertsStrip: boolean;
  showDetails: boolean;
  /** Quiet daily-forecast link under chips (`daily.display: modal`). */
  showDailyLink: boolean;
  showNameInCurrent: boolean;
  feelsLikeText: string | null;
  conditionText: string;
  bft: number;
  gustBft: number;
  pollen: PollenSnapshot | null;
  /**
   * How many lowest-priority primary chips to move into More so the
   * More control stays on the chip row (set by the card via measure).
   */
  morePackDemotions?: number;
}

function metricForChip(id: SmartChipId): DetailMetricId {
  return id === "wind" ? "wind_speed" : id;
}

function chipHasValue(
  id: SmartChipId,
  ctx: CurrentWeatherContext,
): boolean {
  const { snap, config, pollen } = ctx;
  switch (id) {
    case "sun":
      // Match pre-smart behavior: show when enabled (missing times → "—").
      return config.show_sun;
    case "humidity":
      return config.show_humidity && snap.humidity != null;
    case "wind":
      return (
        config.show_wind &&
        (snap.windSpeed != null ||
          snap.windBearing != null ||
          snap.windGust != null)
      );
    case "uv_index":
      return config.show_uv_index && snap.uvIndex != null;
    case "pressure":
      return config.show_pressure && snap.pressure != null;
    case "cloud_coverage":
      return config.show_cloud_coverage && snap.cloudCoverage != null;
    case "dew_point":
      return config.show_dew_point && snap.dewPoint != null;
    case "visibility":
      return config.show_visibility && snap.visibility != null;
    case "precipitation":
      return config.show_precipitation && snap.precipitation != null;
    case "precipitation_probability":
      return (
        config.show_precipitation_probability &&
        snap.precipitationProbability != null
      );
    case "pollen":
      return (
        config.show_pollen &&
        pollen != null &&
        !!pollen.overallLevelLabel
      );
    default:
      return false;
  }
}

function smartValues(ctx: CurrentWeatherContext): SmartChipValues {
  const { snap, pollen } = ctx;
  return {
    condition: snap.condition,
    humidity: snap.humidity,
    windBft: ctx.bft,
    gustBft: ctx.gustBft,
    uvIndex: snap.uvIndex,
    pressure: snap.pressure,
    pressureUnit: snap.pressureUnit,
    cloudCoverage: snap.cloudCoverage,
    dewPoint: snap.dewPoint,
    visibility: snap.visibility,
    visibilityUnit: snap.visibilityUnit,
    precipitation: snap.precipitation,
    precipitationProbability: snap.precipitationProbability,
    pollenLevel: pollen?.overallLevelLabel ?? null,
  };
}

function renderDetailButton(
  icon: IconRenderer,
  iconName: MeteoconName,
  text: string | null,
  label: string,
  metricId: DetailMetricId,
  onOpenDetail: (id: DetailMetricId) => void,
  textClass?: string,
): TemplateResult | typeof nothing {
  if (!text) return nothing;
  const tip = `${label}: ${text}`;
  return tipWrap(
    tip,
    html`
      <button
        type="button"
        class="detail"
        aria-label=${tip}
        @click=${(ev: Event) => {
          ev.stopPropagation();
          onOpenDetail(metricId);
        }}
      >
        <span class="detail-icon" .innerHTML=${icon(iconName)}></span>
        <span class=${textClass ?? ""}>${text}</span>
      </button>
    `,
    "detail",
  );
}

function sunChipParts(
  ctx: CurrentWeatherContext,
): { iconName: MeteoconName; text: string | null; label: string } {
  const { snap, language } = ctx;
  const next = nextSunEvent(snap);
  const kind = next?.kind ?? (snap.isDay ? "sunset" : "sunrise");
  const at = next?.at ?? (kind === "sunset" ? snap.sunset : snap.sunrise);
  return {
    iconName: kind,
    text: formatTime(at, language),
    label: localize(kind, language),
  };
}

function windChipParts(ctx: CurrentWeatherContext): {
  heading: string | null;
  tip: string;
  aria: string;
  gustLine: TemplateResult | typeof nothing;
} {
  const { snap, config, language } = ctx;
  const dir = bearingToLabel(snap.windBearing ?? undefined);
  const heading = formatWindHeading(
    snap.windSpeed,
    dir,
    snap.windSpeedUnit,
    config.wind_speed_unit,
  );
  const gustFmt = formatWindSpeed(
    snap.windGust,
    snap.windSpeedUnit,
    config.wind_speed_unit,
  );
  const tipSpeed =
    formatWindSpeed(
      snap.windSpeed,
      snap.windSpeedUnit,
      config.wind_speed_unit,
    )?.text ?? heading;
  const tip = localize("wind_tip", language, {
    speed: tipSpeed ?? "",
    bft: String(ctx.bft),
  });
  return {
    heading,
    tip,
    aria: heading || localize("wind", language),
    gustLine: gustFmt
      ? html`<span class="detail-sub"
          >${localize("wind_gust_line", language, {
            speed: gustFmt.text,
          })}</span
        >`
      : nothing,
  };
}

function pollenText(ctx: CurrentWeatherContext): string | null {
  const pollen = ctx.pollen;
  if (!pollen?.overallLevelLabel) return null;
  const level = localize(
    `pollen_level_${pollen.overallLevelLabel}`,
    ctx.language,
  );
  if (!pollen.dominantSpecies) return level;
  const species = localize(
    `pollen_species_${pollen.dominantSpecies}`,
    ctx.language,
  );
  return `${level} · ${species}`;
}

function chipLabel(
  id: SmartChipId,
  ctx: CurrentWeatherContext,
): string {
  const language = ctx.language;
  switch (id) {
    case "sun":
      return sunChipParts(ctx).label;
    case "wind":
      return localize("wind", language);
    case "uv_index":
      return localize("uv_index", language);
    case "cloud_coverage":
      return localize("cloud_coverage", language);
    case "dew_point":
      return localize("dew_point", language);
    case "precipitation_probability":
      return localize("precipitation_probability", language);
    default:
      return localize(id, language);
  }
}

function chipDisplayText(
  id: SmartChipId,
  ctx: CurrentWeatherContext,
): string | null {
  const { snap, language } = ctx;
  switch (id) {
    case "sun":
      return sunChipParts(ctx).text;
    case "humidity":
      return formatNumber(snap.humidity, "%", 0);
    case "wind":
      return windChipParts(ctx).heading;
    case "uv_index":
      return formatNumber(snap.uvIndex, "", 0);
    case "pressure":
      return formatNumber(snap.pressure, ` ${snap.pressureUnit}`, 0);
    case "cloud_coverage":
      return formatNumber(snap.cloudCoverage, "%", 0);
    case "dew_point":
      return formatNumber(snap.dewPoint, snap.temperatureUnit);
    case "visibility":
      return formatNumber(snap.visibility, ` ${snap.visibilityUnit}`, 0);
    case "precipitation":
      return formatPrecip(snap.precipitation, snap.precipitationUnit);
    case "precipitation_probability":
      return formatNumber(snap.precipitationProbability, "%", 0);
    case "pollen":
      return pollenText(ctx);
    default:
      return null;
  }
}

function renderChip(
  id: SmartChipId,
  ctx: CurrentWeatherContext,
  icon: IconRenderer,
  onOpenDetail: (id: DetailMetricId) => void,
): TemplateResult | typeof nothing {
  const { snap, language } = ctx;

  switch (id) {
    case "sun": {
      const parts = sunChipParts(ctx);
      return renderDetailButton(
        icon,
        parts.iconName,
        parts.text,
        parts.label,
        "sun",
        onOpenDetail,
      );
    }
    case "humidity":
      return renderDetailButton(
        icon,
        "humidity",
        formatNumber(snap.humidity, "%", 0),
        localize("humidity", language),
        "humidity",
        onOpenDetail,
      );
    case "wind": {
      const parts = windChipParts(ctx);
      return tipWrap(
        parts.tip,
        html`
          <button
            type="button"
            class="detail detail-wind"
            aria-label=${parts.aria}
            @click=${(ev: Event) => {
              ev.stopPropagation();
              onOpenDetail("wind_speed");
            }}
          >
            <span
              class="detail-icon"
              .innerHTML=${icon(beaufortIcon(ctx.bft))}
            ></span>
            <span class="detail-text">
              ${parts.heading
                ? html`<span class="detail-main">${parts.heading}</span>`
                : nothing}
              ${parts.gustLine}
            </span>
          </button>
        `,
        "detail",
      );
    }
    case "uv_index":
      return renderDetailButton(
        icon,
        uvIndexIcon(snap.uvIndex),
        formatNumber(snap.uvIndex, "", 0),
        localize("uv_index", language),
        "uv_index",
        onOpenDetail,
      );
    case "pressure":
      return renderDetailButton(
        icon,
        "barometer",
        formatNumber(snap.pressure, ` ${snap.pressureUnit}`, 0),
        localize("pressure", language),
        "pressure",
        onOpenDetail,
      );
    case "cloud_coverage":
      return renderDetailButton(
        icon,
        "cloudy",
        formatNumber(snap.cloudCoverage, "%", 0),
        localize("cloud_coverage", language),
        "cloud_coverage",
        onOpenDetail,
      );
    case "dew_point":
      return renderDetailButton(
        icon,
        "thermometer-raindrop",
        formatNumber(snap.dewPoint, snap.temperatureUnit),
        localize("dew_point", language),
        "dew_point",
        onOpenDetail,
      );
    case "visibility":
      return renderDetailButton(
        icon,
        "fog",
        formatNumber(snap.visibility, ` ${snap.visibilityUnit}`, 0),
        localize("visibility", language),
        "visibility",
        onOpenDetail,
      );
    case "precipitation":
      return renderDetailButton(
        icon,
        "rain",
        formatPrecip(snap.precipitation, snap.precipitationUnit),
        localize("precipitation", language),
        "precipitation",
        onOpenDetail,
      );
    case "precipitation_probability":
      return renderDetailButton(
        icon,
        "rain",
        formatNumber(snap.precipitationProbability, "%", 0),
        localize("precipitation_probability", language),
        "precipitation_probability",
        onOpenDetail,
      );
    case "pollen":
      return ctx.pollen
        ? renderDetailButton(
            icon,
            pollenIcon(
              ctx.pollen.overallLevelLabel,
              ctx.pollen.dominantSpecies ?? "overall",
            ),
            pollenText(ctx),
            localize("pollen", language),
            "pollen",
            onOpenDetail,
            pollenLevelClass(ctx.pollen.overallLevelLabel),
          )
        : nothing;
    default:
      return nothing;
  }
}

function chipIconName(
  id: SmartChipId,
  ctx: CurrentWeatherContext,
): MeteoconName {
  const { snap } = ctx;
  switch (id) {
    case "sun":
      return sunChipParts(ctx).iconName;
    case "humidity":
      return "humidity";
    case "wind":
      return beaufortIcon(ctx.bft);
    case "uv_index":
      return uvIndexIcon(snap.uvIndex);
    case "pressure":
      return "barometer";
    case "cloud_coverage":
      return "cloudy";
    case "dew_point":
      return "thermometer-raindrop";
    case "visibility":
      return "fog";
    case "precipitation":
    case "precipitation_probability":
      return "rain";
    case "pollen":
      return pollenIcon(
        ctx.pollen?.overallLevelLabel,
        ctx.pollen?.dominantSpecies ?? "overall",
      );
    default:
      return "not-available";
  }
}

function positionMoreMenu(menu: HTMLElement, anchor: HTMLElement): void {
  const margin = 8;
  menu.style.width = "max-content";
  menu.style.maxWidth = `${Math.min(280, window.innerWidth - margin * 2)}px`;
  menu.style.left = "0px";
  menu.style.top = "0px";

  const r = anchor.getBoundingClientRect();
  const menuWidth = Math.max(menu.offsetWidth, 1);
  const maxH = Math.min(window.innerHeight * 0.7, 320);
  const height = Math.min(menu.scrollHeight || 200, maxH);
  const below = r.bottom + 6;
  const fitsBelow = below + height <= window.innerHeight - margin;
  const top = fitsBelow
    ? below
    : Math.max(margin, r.top - height - 6);
  const left = Math.max(
    margin,
    Math.min(r.left, window.innerWidth - menuWidth - margin),
  );

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
  const placement = fitsBelow ? "below" : "above";
  menu.setAttribute("data-placement", placement);
  anchor.setAttribute("data-placement", placement);
}

function renderMoreMenu(
  overflow: SmartChipId[],
  ctx: CurrentWeatherContext,
  icon: IconRenderer,
  onOpenDetail: (id: DetailMetricId) => void,
): TemplateResult {
  const label = localize("more_chips", ctx.language);
  // Stable id within this card's shadow root — popovertarget toggles correctly
  // (manual show/hide fights light-dismiss and re-opens on the same click).
  const menuId = "vk-detail-more";
  return html`
    <div class="detail-more" @click=${(ev: Event) => ev.stopPropagation()}>
      <button
        type="button"
        class="detail detail-more-trigger"
        aria-label=${label}
        aria-haspopup="menu"
        popovertarget=${menuId}
        @click=${(ev: Event) => ev.stopPropagation()}
      >
        <span class="detail-more-label">${label}</span>
        <span class="detail-more-chevron" aria-hidden="true"></span>
      </button>
      <div
        id=${menuId}
        class="detail-more-menu"
        popover="auto"
        role="menu"
        aria-label=${label}
        @toggle=${(ev: Event) => {
          const menu = ev.currentTarget as HTMLElement;
          const btn = menu.previousElementSibling as HTMLElement | null;
          if (!btn) return;
          const open = menu.matches(":popover-open");
          // Set via DOM only — a Lit-bound aria-expanded would reset on every re-render.
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          if (!open) {
            btn.removeAttribute("data-placement");
            menu.removeAttribute("data-placement");
            return;
          }
          positionMoreMenu(menu, btn);
          requestAnimationFrame(() => positionMoreMenu(menu, btn));
        }}
        @beforetoggle=${(ev: Event) => {
          const tev = ev as ToggleEvent;
          if (tev.newState !== "open") return;
          const menu = ev.currentTarget as HTMLElement;
          const btn = menu.previousElementSibling as HTMLElement | null;
          if (btn) {
            btn.setAttribute("aria-expanded", "true");
            positionMoreMenu(menu, btn);
          }
        }}
      >
        ${overflow.map((id) => {
          const text = chipDisplayText(id, ctx);
          const name = chipLabel(id, ctx);
          const tip = text ? `${name}: ${text}` : name;
          return html`
            <button
              type="button"
              class="detail-more-item"
              role="menuitem"
              aria-label=${tip}
              @click=${(ev: Event) => {
                ev.stopPropagation();
                const item = ev.currentTarget as HTMLElement;
                const menu = item.closest(
                  ".detail-more-menu",
                ) as HTMLElement | null;
                if (menu && typeof menu.hidePopover === "function") {
                  menu.hidePopover();
                }
                onOpenDetail(metricForChip(id));
              }}
            >
              <span
                class="detail-icon"
                .innerHTML=${icon(chipIconName(id, ctx))}
              ></span>
              <span class="detail-more-item-text">
                <span class="detail-more-item-label">${name}</span>
                ${text
                  ? html`<span class="detail-more-item-value">${text}</span>`
                  : nothing}
              </span>
            </button>
          `;
        })}
      </div>
    </div>
  `;
}

export function renderCurrentWeatherSection(
  ctx: CurrentWeatherContext,
  icon: IconRenderer,
  onOpenAlerts: (alerts: WeatherAlert[]) => void,
  onOpenDetail: (id: DetailMetricId) => void,
  onOpenDaily?: () => void,
): TemplateResult {
  const available = SMART_CHIP_ORDER.filter((id) => chipHasValue(id, ctx));
  const resolved = resolveDetailChips(
    ctx.config.smart_chips,
    available,
    smartValues(ctx),
  );
  const { primary, overflow } = ctx.config.smart_chips
    ? demotePrimaryChips(resolved, ctx.morePackDemotions ?? 0)
    : resolved;

  return html`
    <div class="section section-current">
      <div class="main action-target">
        <div class="main-text">
          ${ctx.showNameInCurrent
            ? html`<div class="location">${ctx.snap.name}</div>`
            : nothing}
          <div class="temp-row">
            <div class="temp">
              ${formatTemp(ctx.snap.temperature, ctx.snap.temperatureUnit)}
            </div>
            ${ctx.feelsLikeText
              ? html`<div class="feels-like">
                  ${localize("feels_like", ctx.language)} ${ctx.feelsLikeText}
                </div>`
              : nothing}
          </div>
          <div class="condition">${ctx.conditionText}</div>
        </div>
        <div class="main-icon" .innerHTML=${icon(ctx.iconName)}></div>
      </div>

      ${ctx.showAlertsStrip
        ? renderAlertsStrip(ctx.alerts, icon, ctx.language, onOpenAlerts)
        : nothing}

      ${ctx.showDetails
        ? html`
            <div
              class="details ${ctx.config.smart_chips
                ? "details-smart"
                : "details-grid"}"
            >
              ${primary.map((id) => renderChip(id, ctx, icon, onOpenDetail))}
              ${overflow.length
                ? renderMoreMenu(overflow, ctx, icon, onOpenDetail)
                : nothing}
            </div>
          `
        : nothing}

      ${ctx.showDailyLink && onOpenDaily
        ? html`<div class="daily-link-row">
            ${renderDailyLink(ctx.language, onOpenDaily)}
          </div>`
        : nothing}
    </div>
  `;
}

export function renderAlertsOnlySection(
  alerts: WeatherAlert[],
  icon: IconRenderer,
  language: string | undefined,
  onOpenAlerts: (alerts: WeatherAlert[]) => void,
): TemplateResult {
  return html`
    <div class="section section-alerts">
      ${renderAlertsStrip(alerts, icon, language, onOpenAlerts)}
    </div>
  `;
}

export function renderNameHeader(name: string): TemplateResult {
  return html`
    <div class="section section-header">
      <div class="location">${name}</div>
    </div>
  `;
}
