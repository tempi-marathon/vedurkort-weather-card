import { describe, expect, it } from "vitest";
import { buildInterpretationCopy } from "./copy";
import type { WeatherSnapshot } from "../weather/adapter";

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

describe("buildInterpretationCopy", () => {
  it("describes UV category", () => {
    const copy = buildInterpretationCopy({
      metricId: "uv_index",
      snap: snap({ uvIndex: 6 }),
      series: null,
      language: "en",
      bft: 3,
      gustBft: 5,
      high: null,
      low: null,
    });
    expect(copy).toContain("High");
  });

  it("describes humidity comfort from dew point", () => {
    const copy = buildInterpretationCopy({
      metricId: "humidity",
      snap: snap({ dewPoint: 14 }),
      series: null,
      language: "en",
      bft: 3,
      gustBft: 5,
      high: null,
      low: null,
    });
    expect(copy.length).toBeGreaterThan(0);
  });

  it("includes temperature unit on both high and low", () => {
    const copy = buildInterpretationCopy({
      metricId: "current",
      snap: snap(),
      series: null,
      language: "en",
      bft: 3,
      gustBft: 5,
      high: 22,
      low: 12,
    });
    expect(copy).toBe(
      "Partly cloudy. High 22°C, low 12°C in the next 24 hours.",
    );
  });

  it("mentions precip timing when series has rain", () => {
    const copy = buildInterpretationCopy({
      metricId: "precipitation",
      snap: snap(),
      series: {
        id: "precipitation",
        unit: "mm",
        source: "forecast",
        chartType: "bar",
        points: [
          { t: "2026-08-23T14:00:00+00:00", value: 2 },
        ],
      },
      language: "en",
      bft: 3,
      gustBft: 5,
      high: null,
      low: null,
    });
    expect(copy.length).toBeGreaterThan(0);
  });
});
