import type { ForecastItem } from "../types";
import { resolveSunTimeOnLocalDate } from "../weather/adapter";
import type { MetricSeries } from "./types";

const NEAR_TICK_MS = 3 * 60 * 1000;

export type SunEventKind = "sunrise" | "sunset";

/** Hourly column that may be a sunrise/sunset marker. */
export type HourlySlotItem = ForecastItem & {
  sunEvent?: SunEventKind;
};

/** Sun times used to place sunrise/sunset columns in an hourly window. */
export type SunTimesForWindow = {
  sunrise: string | null;
  sunset: string | null;
  todaySunrise: string | null;
  todaySunset: string | null;
};

function parseMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function interpolate(
  a: number | null | undefined,
  b: number | null | undefined,
  t: number,
): number | null {
  if (a == null && b == null) return null;
  if (a == null) return b ?? null;
  if (b == null) return a;
  return a + (b - a) * t;
}

function insertAtIndex<T>(arr: T[], index: number, value: T): T[] {
  return [...arr.slice(0, index), value, ...arr.slice(index)];
}

function localDayStartMs(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function eventKey(kind: SunEventKind, ms: number): string {
  return `${kind}:${ms}`;
}

/**
 * All sunrise/sunset instants that fall strictly inside the hourly window
 * (between first and last forecast tick).
 */
export function collectSunEventsInWindow(
  items: ForecastItem[],
  sun: SunTimesForWindow,
): { kind: SunEventKind; ms: number; iso: string }[] {
  if (items.length < 2) return [];

  const times = items.map((p) => new Date(p.datetime).getTime());
  if (times.some(Number.isNaN)) return [];

  const first = times[0]!;
  const last = times[times.length - 1]!;

  const dayStarts = new Set<number>();
  for (const t of times) {
    dayStarts.add(localDayStartMs(t));
  }
  dayStarts.add(localDayStartMs(first));
  dayStarts.add(localDayStartMs(last));

  const seen = new Set<string>();
  const events: { kind: SunEventKind; ms: number; iso: string }[] = [];

  const push = (kind: SunEventKind, iso: string | null) => {
    if (!iso) return;
    const ms = parseMs(iso);
    if (ms == null) return;
    if (ms <= first || ms >= last) return;
    const key = eventKey(kind, ms);
    if (seen.has(key)) return;
    seen.add(key);
    events.push({ kind, ms, iso });
  };

  for (const dayStart of dayStarts) {
    if (sun.sunrise) {
      push("sunrise", resolveSunTimeOnLocalDate(sun.sunrise, dayStart));
    }
    if (sun.sunset) {
      push("sunset", resolveSunTimeOnLocalDate(sun.sunset, dayStart));
    }
  }

  push("sunrise", sun.todaySunrise);
  push("sunset", sun.todaySunset);

  events.sort((a, b) => a.ms - b.ms);
  return events;
}

/**
 * Insert sunrise/sunset columns into an hourly slice when their times fall
 * strictly between ticks (and not within ~3 minutes of a tick).
 */
export function insertSunEventsIntoHourly(
  items: ForecastItem[],
  sun: SunTimesForWindow | null,
): HourlySlotItem[] {
  if (items.length < 2) return items.map((i) => ({ ...i }));

  const events = sun ? collectSunEventsInWindow(items, sun) : [];
  if (!events.length) return items.map((i) => ({ ...i }));

  let slots: HourlySlotItem[] = items.map((i) => ({ ...i }));

  for (const event of events) {
    const times = slots.map((p) => new Date(p.datetime).getTime());
    if (times.some(Number.isNaN)) continue;

    const first = times[0]!;
    const last = times[times.length - 1]!;
    if (event.ms <= first || event.ms >= last) continue;

    let insertAt = -1;
    let fraction = 0;
    for (let i = 0; i < times.length - 1; i++) {
      const t0 = times[i]!;
      const t1 = times[i + 1]!;
      if (event.ms <= t0 || event.ms >= t1) continue;
      if (
        Math.abs(event.ms - t0) < NEAR_TICK_MS ||
        Math.abs(event.ms - t1) < NEAR_TICK_MS
      ) {
        insertAt = -1;
        break;
      }
      insertAt = i + 1;
      fraction = t1 === t0 ? 0 : (event.ms - t0) / (t1 - t0);
      break;
    }
    if (insertAt < 0) continue;

    const left = slots[insertAt - 1]!;
    const right = slots[insertAt]!;
    const temperature = interpolate(
      left.temperature,
      right.temperature,
      fraction,
    );
    const apparent = interpolate(
      left.apparent_temperature,
      right.apparent_temperature,
      fraction,
    );
    const templow = interpolate(left.templow, right.templow, fraction);

    slots = insertAtIndex(slots, insertAt, {
      datetime: event.iso,
      temperature: temperature ?? undefined,
      apparent_temperature: apparent ?? undefined,
      templow: templow ?? undefined,
      sunEvent: event.kind,
    });
  }

  return slots;
}

/**
 * Insert sunrise/sunset into the current-conditions detail series + icon row.
 */
export function insertSunEvents(
  series: MetricSeries,
  hourlyRowItems: ForecastItem[],
  sun: SunTimesForWindow | null,
): { series: MetricSeries; hourlyRowItems: HourlySlotItem[] } {
  if (series.id !== "current" || series.points.length < 2) {
    return { series, hourlyRowItems };
  }
  if (hourlyRowItems.length !== series.points.length) {
    return { series, hourlyRowItems };
  }

  const slots = insertSunEventsIntoHourly(hourlyRowItems, sun);
  if (slots.length === hourlyRowItems.length) {
    return { series, hourlyRowItems: slots };
  }

  const byTime = new Map(
    series.points.map((p, i) => [
      p.t,
      {
        value: p.value,
        precip: series.precip?.[i] ?? null,
        feelsLike: series.feelsLike?.[i] ?? null,
      },
    ]),
  );

  const points = slots.map((slot) => {
    if (slot.sunEvent) {
      return {
        t: slot.datetime,
        value: slot.temperature ?? null,
        sunEvent: slot.sunEvent,
      };
    }
    const prev = byTime.get(slot.datetime);
    return {
      t: slot.datetime,
      value: prev?.value ?? slot.temperature ?? null,
    };
  });

  const precip = series.precip
    ? slots.map((slot) => {
        if (slot.sunEvent) return null;
        return byTime.get(slot.datetime)?.precip ?? null;
      })
    : undefined;

  const feelsLike = series.feelsLike
    ? slots.map((slot) => {
        if (slot.sunEvent) {
          return slot.apparent_temperature ?? null;
        }
        return byTime.get(slot.datetime)?.feelsLike ?? null;
      })
    : undefined;

  return {
    series: {
      ...series,
      points,
      precip,
      feelsLike,
    },
    hourlyRowItems: slots,
  };
}

export function sunTimesFromSnapshot(
  snap: SunTimesForWindow,
): SunTimesForWindow {
  return {
    sunrise: snap.sunrise,
    sunset: snap.sunset,
    todaySunrise: snap.todaySunrise,
    todaySunset: snap.todaySunset,
  };
}
