import { describe, expect, it } from "vitest";
import {
  insertSunEvents,
  insertSunEventsIntoHourly,
} from "./sun-events";
import type { MetricSeries } from "./types";
import type { ForecastItem } from "../types";

function makeSeries(
  hours: string[],
  temps: number[],
): { series: MetricSeries; rows: ForecastItem[] } {
  const points = hours.map((t, i) => ({ t, value: temps[i]! }));
  const rows = hours.map((datetime) => ({ datetime, temperature: temps[hours.indexOf(datetime)] }));
  return {
    series: {
      id: "current",
      unit: "°C",
      points,
      source: "forecast",
      chartType: "line",
      precip: hours.map(() => 0),
      precipType: "rainfall",
      precipUnit: "mm",
      feelsLike: temps.map((t) => t - 1),
    },
    rows: hours.map((datetime, i) => ({
      datetime,
      temperature: temps[i],
      apparent_temperature: temps[i]! - 1,
    })),
  };
}

describe("insertSunEventsIntoHourly", () => {
  it("inserts sunset between 19:00 and 20:00", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T18:00:00+02:00", temperature: 20 },
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
      { datetime: "2026-09-19T20:00:00+02:00", temperature: 18 },
      { datetime: "2026-09-19T21:00:00+02:00", temperature: 17 },
    ];
    const sunset = "2026-09-19T19:48:00+02:00";
    const slots = insertSunEventsIntoHourly(items, null, sunset);
    expect(slots).toHaveLength(5);
    expect(slots[2]?.sunEvent).toBe("sunset");
    expect(slots[2]?.datetime).toBe(sunset);
    expect(slots[2]?.temperature).toBeCloseTo(19 + (18 - 19) * 0.8, 5);
  });

  it("skips events outside the window", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T18:00:00+02:00", temperature: 20 },
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
    ];
    const slots = insertSunEventsIntoHourly(
      items,
      "2026-09-19T07:25:00+02:00",
      "2026-09-19T21:00:00+02:00",
    );
    expect(slots).toHaveLength(2);
  });

  it("skips events near an hour tick", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
      { datetime: "2026-09-19T20:00:00+02:00", temperature: 18 },
    ];
    const slots = insertSunEventsIntoHourly(
      items,
      null,
      "2026-09-19T19:01:00+02:00",
    );
    expect(slots).toHaveLength(2);
  });

  it("leaves items unchanged when sun times are missing", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T18:00:00+02:00", temperature: 20 },
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
    ];
    const slots = insertSunEventsIntoHourly(items, null, null);
    expect(slots).toHaveLength(2);
    expect(slots.every((s) => !s.sunEvent)).toBe(true);
  });
});

describe("insertSunEvents", () => {
  it("inserts sunset into series and rows", () => {
    const { series, rows } = makeSeries(
      [
        "2026-09-19T18:00:00+02:00",
        "2026-09-19T19:00:00+02:00",
        "2026-09-19T20:00:00+02:00",
        "2026-09-19T21:00:00+02:00",
      ],
      [20, 19, 18, 17],
    );
    const sunset = "2026-09-19T19:48:00+02:00";
    const out = insertSunEvents(series, rows, null, sunset);
    expect(out.series.points).toHaveLength(5);
    expect(out.hourlyRowItems).toHaveLength(5);
    const slot = out.series.points[2]!;
    expect(slot.sunEvent).toBe("sunset");
    expect(slot.t).toBe(sunset);
    expect(slot.value).toBeCloseTo(19 + (18 - 19) * 0.8, 5);
    expect(out.series.precip?.[2]).toBeNull();
    expect(out.series.feelsLike?.[2]).toBeCloseTo(18 + (17 - 18) * 0.8, 5);
  });

  it("inserts both sunrise and sunset in order", () => {
    const { series, rows } = makeSeries(
      [
        "2026-09-19T06:00:00+02:00",
        "2026-09-19T07:00:00+02:00",
        "2026-09-19T08:00:00+02:00",
        "2026-09-19T18:00:00+02:00",
        "2026-09-19T19:00:00+02:00",
        "2026-09-19T20:00:00+02:00",
      ],
      [10, 11, 12, 18, 17, 16],
    );
    const out = insertSunEvents(
      series,
      rows,
      "2026-09-19T07:25:00+02:00",
      "2026-09-19T19:48:00+02:00",
    );
    expect(out.series.points).toHaveLength(8);
    const kinds = out.series.points
      .map((p) => p.sunEvent)
      .filter(Boolean);
    expect(kinds).toEqual(["sunrise", "sunset"]);
  });
});
