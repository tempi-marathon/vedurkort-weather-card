import { describe, expect, it } from "vitest";
import {
  insertSunEvents,
  insertSunEventsIntoHourly,
  type SunTimesForWindow,
} from "./sun-events";
import type { MetricSeries } from "./types";
import type { ForecastItem } from "../types";

function sunTimes(
  partial: Partial<SunTimesForWindow> & {
    sunrise?: string | null;
    sunset?: string | null;
  },
): SunTimesForWindow {
  return {
    sunrise: partial.sunrise ?? null,
    sunset: partial.sunset ?? null,
    todaySunrise: partial.todaySunrise ?? partial.sunrise ?? null,
    todaySunset: partial.todaySunset ?? partial.sunset ?? null,
  };
}

function makeSeries(
  hours: string[],
  temps: number[],
): { series: MetricSeries; rows: ForecastItem[] } {
  const points = hours.map((t, i) => ({ t, value: temps[i]! }));
  const rows = hours.map((datetime) => ({
    datetime,
    temperature: temps[hours.indexOf(datetime)],
  }));
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
    const slots = insertSunEventsIntoHourly(
      items,
      sunTimes({ sunset }),
    );
    expect(slots).toHaveLength(5);
    expect(slots[2]?.sunEvent).toBe("sunset");
    expect(new Date(slots[2]!.datetime).getTime()).toBe(
      new Date(sunset).getTime(),
    );
    expect(slots[2]?.temperature).toBeCloseTo(19 + (18 - 19) * 0.8, 5);
  });

  it("inserts sunset in the last hourly bucket of the slice", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T18:00:00+02:00", temperature: 20 },
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
      { datetime: "2026-09-19T20:00:00+02:00", temperature: 18 },
    ];
    const sunset = "2026-09-19T19:55:00+02:00";
    const slots = insertSunEventsIntoHourly(items, sunTimes({ sunset }));
    expect(slots.some((s) => s.sunEvent === "sunset")).toBe(true);
  });

  it("skips events outside the window", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T18:00:00+02:00", temperature: 20 },
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
    ];
    const slots = insertSunEventsIntoHourly(
      items,
      sunTimes({
        sunrise: "2026-09-19T07:25:00+02:00",
        sunset: "2026-09-19T21:00:00+02:00",
      }),
    );
    expect(slots).toHaveLength(2);
  });

  it("inserts sunset after the hour tick without replacing that hour column", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
      { datetime: "2026-09-19T20:00:00+02:00", temperature: 18 },
    ];
    const sunset = "2026-09-19T19:00:17+02:00";
    const slots = insertSunEventsIntoHourly(items, sunTimes({ sunset }));
    expect(slots).toHaveLength(3);
    expect(slots[0]?.sunEvent).toBeUndefined();
    expect(slots[0]?.temperature).toBe(19);
    expect(slots[1]?.sunEvent).toBe("sunset");
    expect(new Date(slots[1]!.datetime).getTime()).toBe(
      new Date(sunset).getTime(),
    );
    expect(slots[2]?.temperature).toBe(18);
  });

  it("tags the hour column for HA-style sunset on the hour (user sun.sun)", () => {
    const items: ForecastItem[] = [];
    const start = Date.parse("2026-10-10T08:00:00.000Z");
    for (let i = 0; i < 24; i++) {
      items.push({
        datetime: new Date(start + i * 3_600_000).toISOString(),
        temperature: 15,
      });
    }
    const sunset = "2026-10-10T17:00:17.703176+00:00";
    const slots = insertSunEventsIntoHourly(
      items,
      sunTimes({
        sunset,
        todaySunset: sunset,
        sunrise: "2026-10-11T06:01:07.900254+00:00",
        todaySunrise: "2026-10-10T06:01:07.900254+00:00",
      }),
    );
    const sunsetIdx = slots.findIndex((s) => s.sunEvent === "sunset");
    expect(sunsetIdx).toBeGreaterThan(0);
    expect(slots[sunsetIdx - 1]?.sunEvent).toBeUndefined();
    expect(slots[sunsetIdx - 1]?.temperature).toBe(15);
    expect(slots.length).toBeGreaterThan(24);
  });

  it("leaves items unchanged when sun times are missing", () => {
    const items: ForecastItem[] = [
      { datetime: "2026-09-19T18:00:00+02:00", temperature: 20 },
      { datetime: "2026-09-19T19:00:00+02:00", temperature: 19 },
    ];
    const slots = insertSunEventsIntoHourly(items, null);
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
    const out = insertSunEvents(series, rows, sunTimes({ sunset }));
    expect(out.series.points).toHaveLength(5);
    expect(out.hourlyRowItems).toHaveLength(5);
    const slot = out.series.points[2]!;
    expect(slot.sunEvent).toBe("sunset");
    expect(new Date(slot.t).getTime()).toBe(new Date(sunset).getTime());
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
      sunTimes({
        sunrise: "2026-09-19T07:25:00+02:00",
        sunset: "2026-09-19T19:48:00+02:00",
      }),
    );
    expect(out.series.points).toHaveLength(8);
    const kinds = out.series.points
      .map((p) => p.sunEvent)
      .filter(Boolean);
    expect(kinds).toEqual(["sunrise", "sunset"]);
  });
});
