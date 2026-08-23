import { describe, expect, it } from "vitest";
import type { ForecastItem } from "../types";
import { currentConditionsSeries, seriesFromHourly, mergeSeries } from "./series";

const hourly: ForecastItem[] = [
  {
    datetime: "2026-08-23T10:00:00+00:00",
    temperature: 18,
    humidity: 55,
    wind_speed: 12,
    precipitation: 0,
    precipitation_probability: 10,
    cloud_coverage: 30,
  },
  {
    datetime: "2026-08-23T11:00:00+00:00",
    temperature: 20,
    humidity: 60,
    wind_speed: 15,
    precipitation: 1.2,
    precipitation_probability: 40,
    cloud_coverage: 50,
  },
  {
    datetime: "2026-08-23T12:00:00+00:00",
    temperature: 22,
    humidity: undefined,
    wind_speed: undefined,
    precipitation: undefined,
    precipitation_probability: undefined,
    cloud_coverage: undefined,
  },
];

describe("seriesFromHourly", () => {
  it("extracts temperature series", () => {
    const s = seriesFromHourly(hourly, "current", "°C", 24, Date.parse("2026-08-23T10:30:00+00:00"));
    expect(s).not.toBeNull();
    expect(s!.source).toBe("forecast");
    expect(s!.chartType).toBe("line");
    expect(s!.points.length).toBeGreaterThanOrEqual(2);
    expect(s!.points[0]!.value).toBe(18);
  });

  it("returns null for metrics without forecast field", () => {
    expect(seriesFromHourly(hourly, "uv_index", "", 24)).toBeNull();
    expect(seriesFromHourly(hourly, "pressure", "hPa", 24)).toBeNull();
  });

  it("uses bar chart for precipitation", () => {
    const s = seriesFromHourly(hourly, "precipitation", "mm", 24, Date.parse("2026-08-23T10:30:00+00:00"));
    expect(s?.chartType).toBe("bar");
  });

  it("builds current conditions chart with temp and precip", () => {
    const s = currentConditionsSeries(
      hourly,
      "rainfall",
      "mm",
      "°C",
      24,
      Date.parse("2026-08-23T10:30:00+00:00"),
    );
    expect(s?.id).toBe("current");
    expect(s?.precip?.length).toBeGreaterThan(0);
    expect(s?.precipType).toBe("rainfall");
  });

  it("adds feels-like line when hourly apparent_temperature exists", () => {
    const withFeels: ForecastItem[] = hourly.map((item, i) => ({
      ...item,
      apparent_temperature: item.temperature != null ? item.temperature - 1 : undefined,
    }));
    const s = currentConditionsSeries(withFeels, "rainfall", "mm", "°C", 24);
    expect(s?.feelsLike?.some((v) => v != null)).toBe(true);
  });

  it("returns null when all values missing", () => {
    const empty = [{ datetime: "2026-08-23T10:00:00+00:00" }];
    expect(seriesFromHourly(empty, "humidity", "%", 24)).toBeNull();
  });
});

describe("mergeSeries", () => {
  it("returns forecast unchanged in v1", () => {
    const forecast = seriesFromHourly(hourly, "humidity", "%", 24)!;
    expect(mergeSeries(forecast, null)).toBe(forecast);
  });
});
