import { describe, expect, it } from "vitest";
import type { ForecastItem } from "../types";
import {
  buildDailySeries,
  buildHourlySeries,
  findHourlyNowIndex,
  forecastHasPrecipProbability,
  seriesFingerprint,
} from "./forecast-chart";

const hourlyItems: ForecastItem[] = [
  {
    datetime: new Date(Date.now() - 3600_000).toISOString(),
    temperature: 10,
  },
  {
    datetime: new Date().toISOString(),
    temperature: 12,
  },
  {
    datetime: new Date(Date.now() + 3600_000).toISOString(),
    temperature: 14,
  },
];

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

  it("buildHourlySeries sets nowIndex", () => {
    const series = buildHourlySeries(hourlyItems, 3, "rainfall", "en");
    expect(series.nowIndex).toBe(1);
  });

  it("findHourlyNowIndex picks closest hour", () => {
    expect(findHourlyNowIndex(hourlyItems, 3)).toBe(1);
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
