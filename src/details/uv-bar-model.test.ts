import { describe, expect, it } from "vitest";
import { buildUvBarModel, uvBarPosition, uvCategory } from "./uv-bar-model";
import type { WeatherSnapshot } from "../weather/adapter";

function snap(uvIndex: number | null): WeatherSnapshot {
  return {
    name: "Home",
    condition: "sunny",
    conditionLabel: "Sunny",
    temperature: 20,
    humidity: 50,
    windSpeed: 10,
    windBearing: 180,
    windGust: null,
    uvIndex,
    pressure: 1015,
    cloudCoverage: 10,
    feelsLike: 20,
    dewPoint: 12,
    visibility: 10,
    precipitation: 0,
    precipitationProbability: 0,
    temperatureUnit: "°C",
    windSpeedUnit: "km/h",
    pressureUnit: "hPa",
    visibilityUnit: "km",
    precipitationUnit: "mm",
    isDay: true,
    sunrise: null,
    sunset: null,
    dawn: null,
    dusk: null,
    todaySunrise: null,
    todaySunset: null,
    entity: { entity_id: "weather.home", state: "sunny", attributes: {} },
  };
}

describe("uv bar model", () => {
  it("classifies WHO UV bands", () => {
    expect(uvCategory(2)).toBe("low");
    expect(uvCategory(3)).toBe("moderate");
    expect(uvCategory(6)).toBe("high");
    expect(uvCategory(9)).toBe("very_high");
    expect(uvCategory(11)).toBe("extreme");
  });

  it("maps index to bar position", () => {
    expect(uvBarPosition(0)).toBe(0);
    expect(uvBarPosition(11)).toBe(100);
    expect(uvBarPosition(3)).toBeCloseTo(27.27, 1);
  });

  it("builds localized hero model", () => {
    const model = buildUvBarModel(snap(3), "nl");
    expect(model?.category).toBe("moderate");
    expect(model?.categoryLabel).toBe("Matig");
    expect(model?.barPosition).toBeCloseTo(27.27, 1);
    expect(model?.advice).toContain("schaduw");
  });
});
