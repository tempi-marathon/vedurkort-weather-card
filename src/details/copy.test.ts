import { describe, expect, it } from "vitest";
import type { ForecastItem } from "../types";
import {
  buildCurrentConditionsCopy,
  buildInterpretationCopy,
} from "./copy";
import { formatTime, type WeatherSnapshot } from "../weather/adapter";

function snap(partial: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  return {
    name: "Home",
    condition: "partlycloudy",
    conditionLabel: "Partly cloudy",
    temperature: 20,
    humidity: 65,
    windSpeed: 15,
    windBearing: 180,
    windGust: 25,
    uvIndex: 6,
    pressure: 1015,
    cloudCoverage: 40,
    feelsLike: 19,
    dewPoint: 14,
    visibility: 10,
    precipitation: 0,
    precipitationProbability: 20,
    temperatureUnit: "°C",
    windSpeedUnit: "km/h",
    pressureUnit: "hPa",
    visibilityUnit: "km",
    precipitationUnit: "mm",
    isDay: true,
    sunrise: "2026-08-23T06:00:00+00:00",
    sunset: "2026-08-23T20:00:00+00:00",
    dawn: "2026-08-23T05:30:00+00:00",
    dusk: "2026-08-23T21:30:00+00:00",
    todaySunrise: "2026-08-23T06:00:00+00:00",
    todaySunset: "2026-08-23T20:00:00+00:00",
    entity: { entity_id: "weather.home", state: "partlycloudy", attributes: {} },
    ...partial,
  };
}

function hourly(partial: Partial<ForecastItem>[] = []): ForecastItem[] {
  return partial.map((item, index) => ({
    datetime: item.datetime ?? `2026-08-23T${String(10 + index).padStart(2, "0")}:00:00+00:00`,
    ...item,
  }));
}

function copyCtx(
  metricId: Parameters<typeof buildInterpretationCopy>[0]["metricId"],
  partial: Partial<Parameters<typeof buildInterpretationCopy>[0]> = {},
) {
  return {
    metricId,
    snap: snap(),
    series: null,
    language: "en",
    bft: 3,
    gustBft: 5,
    high: null,
    low: null,
    hourly: [] as ForecastItem[],
    ...partial,
  };
}

describe("buildInterpretationCopy", () => {
  it("describes UV category", () => {
    const copy = buildInterpretationCopy(copyCtx("uv_index"));
    expect(copy).toContain("High");
  });

  it("describes humidity comfort from dew point", () => {
    const copy = buildInterpretationCopy(
      copyCtx("humidity", { snap: snap({ dewPoint: 14 }) }),
    );
    expect(copy.length).toBeGreaterThan(0);
  });

  it("mentions precip timing when series has rain", () => {
    const at = "2026-08-23T14:00:00+00:00";
    const copy = buildInterpretationCopy(
      copyCtx("precipitation", {
        series: {
          id: "precipitation",
          unit: "mm",
          source: "forecast",
          chartType: "bar",
          points: [{ t: at, value: 2 }],
        },
      }),
    );
    expect(copy).toBe(
      `Precipitation expected around ${formatTime(at, "en")}.`,
    );
  });
});

describe("buildCurrentConditionsCopy", () => {
  it("falls back when no hourly forecast is available", () => {
    expect(buildCurrentConditionsCopy(snap(), [], "en")).toBe(
      "Partly cloudy right now",
    );
  });

  it("joins condition and outlook with a dash", () => {
    const copy = buildCurrentConditionsCopy(
      snap({ condition: "cloudy", conditionLabel: "Cloudy" }),
      hourly([
        { condition: "cloudy" },
        { condition: "cloudy" },
      ]),
      "en",
    );
    expect(copy).toBe(
      "Cloudy - No precipitation expected in the next 24 hours",
    );
  });

  it("describes rain expected later", () => {
    const rainAt = "2026-08-23T15:00:00+00:00";
    const copy = buildCurrentConditionsCopy(
      snap({ condition: "cloudy", conditionLabel: "Cloudy" }),
      hourly([
        { datetime: "2026-08-23T10:00:00+00:00", condition: "cloudy" },
        { datetime: rainAt, condition: "rainy" },
      ]),
      "en",
    );
    expect(copy).toBe(
      `Cloudy - Rain expected around ${formatTime(rainAt, "en")}`,
    );
  });

  it("describes snow when the wet hour is snowy", () => {
    const snowAt = "2026-08-23T11:00:00+00:00";
    const copy = buildCurrentConditionsCopy(
      snap(),
      hourly([{ condition: "partlycloudy" }, { condition: "snowy" }]),
      "en",
    );
    expect(copy).toBe(
      `Partly cloudy - Snow expected around ${formatTime(snowAt, "en")}`,
    );
  });

  it("describes clearing when currently rainy", () => {
    const clearAt = "2026-08-23T18:00:00+00:00";
    const copy = buildCurrentConditionsCopy(
      snap({ condition: "rainy", conditionLabel: "Rainy" }),
      hourly([
        { datetime: "2026-08-23T10:00:00+00:00", condition: "rainy" },
        { datetime: clearAt, condition: "partlycloudy" },
      ]),
      "en",
    );
    expect(copy).toBe(
      `Rainy - Clearing around ${formatTime(clearAt, "en")}`,
    );
  });

  it("describes continuing rain when it stays wet", () => {
    const copy = buildCurrentConditionsCopy(
      snap({ condition: "rainy", conditionLabel: "Rainy" }),
      hourly([
        { condition: "rainy" },
        { condition: "rainy" },
        { condition: "pouring" },
      ]),
      "en",
    );
    expect(copy).toBe(
      "Rainy - Rain continuing through the next 24 hours",
    );
  });

  it("uses peak probability when no wet hours are forecast", () => {
    const copy = buildCurrentConditionsCopy(
      snap(),
      hourly([
        { condition: "partlycloudy", precipitation_probability: 30 },
        { condition: "cloudy", precipitation_probability: 65 },
      ]),
      "en",
    );
    expect(copy).toBe("Partly cloudy - Rain likely later - peak chance 65%");
  });

  it("delegates current metric copy through buildInterpretationCopy", () => {
    const copy = buildInterpretationCopy(
      copyCtx("current", {
        snap: snap({ condition: "cloudy", conditionLabel: "Cloudy" }),
        hourly: hourly([{ condition: "cloudy" }]),
      }),
    );
    expect(copy).toContain("Cloudy -");
  });
});
