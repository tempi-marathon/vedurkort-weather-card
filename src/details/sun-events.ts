import type { ForecastItem } from "../types";
import { resolveSunTimeOnLocalDate } from "../weather/adapter";
import { alignMetricSeriesToHourlyRow } from "./series";
import type { MetricSeries } from "./types";

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

/** Typical spacing between hourly forecast ticks (median gap). */
function medianHourStepMs(times: number[]): number {
  if (times.length < 2) return 3_600_000;
  const gaps: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const g = times[i]! - times[i - 1]!;
    if (g > 0) gaps.push(g);
  }
  if (!gaps.length) return 3_600_000;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)]!;
}

/** Last tick is the start of an hour; events in that hour are still in-window. */
function windowEndExclusive(times: number[]): number {
  const last = times[times.length - 1]!;
  return last + medianHourStepMs(times);
}

function pushSunCandidate(
  events: { kind: SunEventKind; ms: number; iso: string }[],
  seen: Set<string>,
  kind: SunEventKind,
  iso: string | null,
  first: number,
  windowEnd: number,
): void {
  if (!iso) return;
  const ms = parseMs(iso);
  if (ms == null) return;
  if (ms <= first || ms >= windowEnd) return;
  const key = eventKey(kind, ms);
  if (seen.has(key)) return;
  seen.add(key);
  events.push({ kind, ms, iso });
}

/**
 * All sunrise/sunset instants that can be placed between hourly ticks in the
 * slice (first tick exclusive, through the hour that contains the last tick).
 */
export function collectSunEventsInWindow(
  items: ForecastItem[],
  sun: SunTimesForWindow,
): { kind: SunEventKind; ms: number; iso: string }[] {
  if (items.length < 2) return [];

  const times = items.map((p) => new Date(p.datetime).getTime());
  if (times.some(Number.isNaN)) return [];

  const first = times[0]!;
  const windowEnd = windowEndExclusive(times);

  const dayStarts = new Set<number>();
  for (const t of times) {
    dayStarts.add(localDayStartMs(t));
  }
  dayStarts.add(localDayStartMs(first));
  dayStarts.add(localDayStartMs(times[times.length - 1]!));

  const seen = new Set<string>();
  const events: { kind: SunEventKind; ms: number; iso: string }[] = [];

  pushSunCandidate(events, seen, "sunrise", sun.todaySunrise, first, windowEnd);
  pushSunCandidate(events, seen, "sunset", sun.todaySunset, first, windowEnd);
  pushSunCandidate(events, seen, "sunrise", sun.sunrise, first, windowEnd);
  pushSunCandidate(events, seen, "sunset", sun.sunset, first, windowEnd);

  for (const dayStart of dayStarts) {
    if (sun.sunrise) {
      pushSunCandidate(
        events,
        seen,
        "sunrise",
        resolveSunTimeOnLocalDate(sun.sunrise, dayStart),
        first,
        windowEnd,
      );
    }
    if (sun.sunset) {
      pushSunCandidate(
        events,
        seen,
        "sunset",
        resolveSunTimeOnLocalDate(sun.sunset, dayStart),
        first,
        windowEnd,
      );
    }
  }

  events.sort((a, b) => a.ms - b.ms);
  return events;
}

/**
 * Insert an extra sunrise/sunset column between hourly ticks (Apple-style:
 * the hour column keeps forecast data; sun gets its own narrow column).
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
    const windowEnd = windowEndExclusive(times);
    if (event.ms <= first || event.ms >= windowEnd) continue;

    let insertAt = -1;
    let fraction = 0;
    for (let i = 0; i < times.length - 1; i++) {
      const t0 = times[i]!;
      const t1 = times[i + 1]!;
      if (event.ms <= t0 || event.ms >= t1) continue;

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

  let alignedSeries = series;
  let row = hourlyRowItems;
  if (row.length !== alignedSeries.points.length) {
    alignedSeries = alignMetricSeriesToHourlyRow(alignedSeries, row);
  }
  if (row.length !== alignedSeries.points.length) {
    return { series, hourlyRowItems };
  }

  const slots = insertSunEventsIntoHourly(row, sun);
  if (slots.length === row.length) {
    return { series: alignedSeries, hourlyRowItems: slots };
  }

  const byTime = new Map(
    alignedSeries.points.map((p, i) => [
      p.t,
      {
        value: p.value,
        precip: alignedSeries.precip?.[i] ?? null,
        feelsLike: alignedSeries.feelsLike?.[i] ?? null,
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

  const precip = alignedSeries.precip
    ? slots.map((slot) => {
        if (slot.sunEvent) return null;
        return byTime.get(slot.datetime)?.precip ?? null;
      })
    : undefined;

  const feelsLike = alignedSeries.feelsLike
    ? slots.map((slot) => {
        if (slot.sunEvent) {
          return slot.apparent_temperature ?? null;
        }
        return byTime.get(slot.datetime)?.feelsLike ?? null;
      })
    : undefined;

  return {
    series: {
      ...alignedSeries,
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
