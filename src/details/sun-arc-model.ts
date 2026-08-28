import type { MeteoconName } from "../icons/allowlist";
import { localize, type LocalizeKey } from "../localize";
import { formatTime, type WeatherSnapshot } from "../weather/adapter";

export interface SunArcDetailRow {
  label: string;
  value: string;
  /** Right-aligned summary row (e.g. total daylight). */
  summary?: boolean;
}

export interface SunArcModel {
  heroIcon: MeteoconName;
  heroLabel: string;
  heroTime: string;
  dayPath: string;
  nightPath: string;
  horizonY: number;
  viewWidth: number;
  viewHeight: number;
  dotX: number;
  dotY: number;
  showDot: boolean;
  details: SunArcDetailRow[];
}

export const SUN_ARC_WIDTH = 360;
export const SUN_ARC_HEIGHT = 110;
export const SUN_ARC_HORIZON = 56;
export const SUN_ARC_AMPLITUDE = 42;

function localHourOfDay(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function localHourFromIso(iso: string): number | null {
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return null;
  return localHourOfDay(d);
}

/** Stylized sun height for hour-of-day (0–24), scaled to rise/set. SVG y (smaller = higher). */
export function sunArcY(
  hour: number,
  riseHour: number,
  setHour: number,
): number {
  if (setHour <= riseHour) {
    return SUN_ARC_HORIZON;
  }

  if (hour >= riseHour && hour <= setHour) {
    const daySpan = setHour - riseHour;
    const phase = (hour - riseHour) / daySpan;
    return (
      SUN_ARC_HORIZON -
      SUN_ARC_AMPLITUDE * Math.sin(Math.PI * phase)
    );
  }

  const nightSpan = 24 - (setHour - riseHour);
  const nightPhase =
    hour >= setHour ? hour - setHour : 24 - setHour + hour;
  return (
    SUN_ARC_HORIZON +
    SUN_ARC_AMPLITUDE * Math.sin((Math.PI * nightPhase) / nightSpan)
  );
}

export function sunArcX(hour: number): number {
  return (hour / 24) * SUN_ARC_WIDTH;
}

export function buildSunArcPaths(
  samples = 96,
  riseHour: number,
  setHour: number,
): { dayPath: string; nightPath: string } {
  const dayParts: string[] = [];
  const nightParts: string[] = [];
  let dayOpen = false;
  let nightOpen = false;

  for (let i = 0; i <= samples; i++) {
    const hour = (i / samples) * 24;
    const x = sunArcX(hour);
    const y = sunArcY(hour, riseHour, setHour);
    const above = y <= SUN_ARC_HORIZON + 0.5;

    if (above) {
      dayParts.push(dayOpen ? `L ${x} ${y}` : `M ${x} ${y}`);
      dayOpen = true;
      nightOpen = false;
    } else {
      nightParts.push(nightOpen ? `L ${x} ${y}` : `M ${x} ${y}`);
      nightOpen = true;
      dayOpen = false;
    }
  }

  return {
    dayPath: dayParts.join(" "),
    nightPath: nightParts.join(" "),
  };
}

function formatDurationMs(ms: number, language: string | undefined): string {
  const hours = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) {
    return localize("duration_hours_mins", language, {
      hours: String(hours),
      mins: String(mins),
    });
  }
  return localize("duration_mins", language, { mins: String(mins) });
}

function totalDaylightMs(
  sunrise: string | null,
  sunset: string | null,
): number | null {
  if (!sunrise || !sunset) return null;
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  if (Number.isNaN(rise) || Number.isNaN(set) || set <= rise) return null;
  return set - rise;
}

function detailRow(
  labelKey: LocalizeKey,
  iso: string | null,
  language: string | undefined,
): SunArcDetailRow | null {
  const value = formatTime(iso, language);
  if (!value || value === "—") return null;
  return { label: localize(labelKey, language), value };
}

function isDaylightNow(
  sunrise: string,
  sunset: string,
  nowMs = Date.now(),
): boolean {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  if (Number.isNaN(rise) || Number.isNaN(set) || set <= rise) return false;
  return nowMs >= rise && nowMs < set;
}

export function buildSunArcModel(
  snap: WeatherSnapshot,
  language: string | undefined,
  now: Date = new Date(),
): SunArcModel | null {
  if (!snap.todaySunrise || !snap.todaySunset) return null;

  const riseHour = localHourFromIso(snap.todaySunrise);
  const setHour = localHourFromIso(snap.todaySunset);
  if (riseHour == null || setHour == null || setHour <= riseHour) return null;

  const { dayPath, nightPath } = buildSunArcPaths(96, riseHour, setHour);
  const hourOfDay = localHourOfDay(now);
  const dotX = sunArcX(hourOfDay);
  const dotY = sunArcY(hourOfDay, riseHour, setHour);

  const heroIcon: MeteoconName = snap.isDay ? "sunset" : "sunrise";
  const heroLabel = localize(snap.isDay ? "sunset" : "sunrise", language);
  const heroTime =
    formatTime(snap.isDay ? snap.sunset : snap.sunrise, language) ?? "—";

  const details: SunArcDetailRow[] = [];
  const dawn = detailRow("sun_dawn", snap.dawn, language);
  const sunrise = detailRow("sun_sunrise_today", snap.todaySunrise, language);
  const sunset = detailRow("sun_sunset_today", snap.todaySunset, language);
  const dusk = detailRow("sun_dusk", snap.dusk, language);
  if (dawn) details.push(dawn);
  if (sunrise) details.push(sunrise);
  if (sunset) details.push(sunset);
  if (dusk) details.push(dusk);

  const daylight = totalDaylightMs(snap.todaySunrise, snap.todaySunset);
  if (daylight != null) {
    details.push({
      label: localize("sun_total_daylight", language),
      value: formatDurationMs(daylight, language),
      summary: true,
    });
  }

  const inDaylight = isDaylightNow(
    snap.todaySunrise,
    snap.todaySunset,
    now.getTime(),
  );
  // Prefer clock-window daylight; fall back to sun.sun state if times are edge-case.
  const showDot = inDaylight || (snap.isDay && hourOfDay > 0 && hourOfDay < 24);

  return {
    heroIcon,
    heroLabel,
    heroTime,
    dayPath,
    nightPath,
    horizonY: SUN_ARC_HORIZON,
    viewWidth: SUN_ARC_WIDTH,
    viewHeight: SUN_ARC_HEIGHT,
    dotX,
    dotY,
    showDot,
    details,
  };
}
