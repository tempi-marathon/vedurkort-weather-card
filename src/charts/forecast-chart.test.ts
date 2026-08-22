import { describe, expect, it } from "vitest";
import type { ForecastItem } from "../types";
import {
  buildDailySeries,
  buildHourlySeries,
  forecastHasPrecipProbability,
  seriesFingerprint,
} from "./forecast-chart";
import {
  findHourlyNowPosition,
  sliceHourlyForecast,
} from "./hourly-window";

describe("forecast-chart", () => {
  it("buildDailySeries slices and labels", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-08-22T12:00:00", temperature: 20, templow: 12 },
      { datetime: "2026-08-23T12:00:00", temperature: 22, templow: 14 },
      { datetime: "2026-08-24T12:00:00", temperature: 21, templow: 13 },
    ];
    const series = buildDailySeries(items, 2, "rainfall", "en");
    expect(series.labels).toHaveLength(2);
    expect(series.high).toEqual([20, 22]);
    expect(series.low).toEqual([12, 14]);
  });

  it("buildHourlySeries includes datetimes from the current hour", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-08-22T14:00:00", temperature: 10 },
      { datetime: "2026-08-22T15:00:00", temperature: 12 },
      { datetime: "2026-08-22T16:00:00", temperature: 14 },
      { datetime: "2026-08-22T17:00:00", temperature: 16 },
    ];
    const now = Date.parse("2026-08-22T15:45:00");
    const series = buildHourlySeries(items, 3, "rainfall", "en", now);
    expect(series.datetimes).toEqual([
      "2026-08-22T15:00:00",
      "2026-08-22T16:00:00",
      "2026-08-22T17:00:00",
    ]);
  });

  it("findHourlyNowPosition interpolates between hour columns", () => {
    const datetimes = [
      "2026-08-22T14:00:00",
      "2026-08-22T15:00:00",
      "2026-08-22T16:00:00",
    ];
    const now = new Date("2026-08-22T15:15:00").getTime();
    expect(findHourlyNowPosition(datetimes, now)).toBeCloseTo(1.25, 5);
  });

  it("findHourlyNowPosition at exact hour", () => {
    const datetimes = ["2026-08-22T15:00:00", "2026-08-22T16:00:00"];
    const now = new Date("2026-08-22T15:00:00").getTime();
    expect(findHourlyNowPosition(datetimes, now)).toBe(0);
  });

  it("sliceHourlyForecast starts at the current hour", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-08-22T12:00:00", temperature: 10 },
      { datetime: "2026-08-22T13:00:00", temperature: 11 },
      { datetime: "2026-08-22T14:00:00", temperature: 12 },
      { datetime: "2026-08-22T15:00:00", temperature: 13 },
      { datetime: "2026-08-22T16:00:00", temperature: 14 },
      { datetime: "2026-08-22T17:00:00", temperature: 15 },
    ];
    const now = new Date("2026-08-22T15:45:00").getTime();
    const slice = sliceHourlyForecast(items, 3, now);
    expect(slice.map((i) => i.datetime)).toEqual([
      "2026-08-22T15:00:00",
      "2026-08-22T16:00:00",
      "2026-08-22T17:00:00",
    ]);
  });

  it("seriesFingerprint is stable", () => {
    const a = buildDailySeries(
      [{ datetime: "2026-08-22", temperature: 1 }],
      1,
      "rainfall",
    );
    expect(seriesFingerprint(a)).toBe(seriesFingerprint({ ...a }));
  });

  it("forecastHasPrecipProbability detects probability", () => {
    expect(
      forecastHasPrecipProbability([
        { datetime: "x", precipitation_probability: 40 },
      ]),
    ).toBe(true);
    expect(forecastHasPrecipProbability([{ datetime: "x" }])).toBe(false);
  });
});
