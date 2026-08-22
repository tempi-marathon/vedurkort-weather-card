import type { ForecastItem } from "../types";

/** Index of the hour column at or before `now` (0 when all entries are in the future). */
export function hourlyForecastStartIndex(
  items: ForecastItem[],
  nowMs: number = Date.now(),
): number {
  if (!items.length) return 0;

  let start = 0;
  for (let i = 0; i < items.length; i++) {
    const t = new Date(items[i]!.datetime).getTime();
    if (Number.isNaN(t)) return 0;
    if (t <= nowMs) start = i;
    else break;
  }
  return start;
}

/** Hourly forecast window anchored at the current hour when possible. */
export function sliceHourlyForecast(
  items: ForecastItem[],
  hours: number,
  nowMs: number = Date.now(),
): ForecastItem[] {
  const start = hourlyForecastStartIndex(items, nowMs);
  return items.slice(start, start + hours);
}

/** Fractional x-axis position of “now” between hourly columns (-1 if hidden). */
export function findHourlyNowPosition(
  datetimes: string[],
  nowMs: number = Date.now(),
): number {
  if (!datetimes.length) return -1;

  const times = datetimes.map((d) => new Date(d).getTime());
  if (times.some(Number.isNaN)) return -1;

  const first = times[0]!;
  const last = times[times.length - 1]!;
  const maxGap = 90 * 60 * 1000;

  if (nowMs < first) {
    return first - nowMs <= maxGap ? 0 : -1;
  }

  for (let i = 0; i < times.length - 1; i++) {
    const t0 = times[i]!;
    const t1 = times[i + 1]!;
    if (nowMs >= t0 && nowMs <= t1) {
      const span = t1 - t0;
      return span > 0 ? i + (nowMs - t0) / span : i;
    }
  }

  if (nowMs > last && nowMs - last <= maxGap) {
    return times.length - 1;
  }

  return -1;
}
