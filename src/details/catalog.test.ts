import { describe, expect, it } from "vitest";
import type { ForecastItem } from "../types";
import type { WeatherSnapshot } from "../weather/adapter";
import { buildDetailModel, type BuildDetailContext } from "./catalog";

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

function hourly(
  partial: Partial<ForecastItem>[] = [
    { wind_speed: 12, wind_bearing: 180 },
    { wind_speed: 15, wind_bearing: 200 },
  ],
): ForecastItem[] {
  return partial.map((item, index) => ({
    datetime:
      item.datetime ??
      `2026-08-23T${String(10 + index).padStart(2, "0")}:00:00+00:00`,
    ...item,
  }));
}

function ctx(
  metricId: BuildDetailContext["metricId"],
  partial: Partial<BuildDetailContext> = {},
): BuildDetailContext {
  return {
    metricId,
    snap: snap(),
    iconName: "partly-cloudy-day",
    hourlyForecast: hourly(),
    language: "en",
    bft: 3,
    gustBft: 5,
    hourlyPrecipType: "rainfall",
    ...partial,
  };
}

describe("buildDetailModel wind layouts", () => {
  it("uses compass hero and direction copy for wind_direction", () => {
    const model = buildDetailModel(ctx("wind_direction"));
    expect(model.heroValue).toBe("S");
    expect(model.heroIcon).toBe("wind-direction-s");
    expect(model.copy).toBe("Wind from the S at Beaufort 3.");
    expect(model.series?.id).toBe("wind_speed");
  });

  it("uses Beaufort hero and speed copy for wind_speed", () => {
    const model = buildDetailModel(ctx("wind_speed"));
    expect(model.heroValue).toBe("15 km/h");
    expect(model.heroIcon).toBe("wind-beaufort-3");
    expect(model.copy).toBe("Beaufort 3 from the S.");
    expect(model.series?.id).toBe("wind_speed");
  });
});
