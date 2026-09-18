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
    windSpeedUnit: "native",
    ...partial,
  };
}

describe("buildDetailModel wind layouts", () => {
  it("uses Beaufort icon and speed+direction heading for wind", () => {
    const model = buildDetailModel(ctx("wind_speed"));
    expect(model.heroValue).toBe("15 km/h · S");
    expect(model.heroIcon).toBe("wind-beaufort-3");
    expect(model.series?.id).toBe("wind_speed");
    expect(model.related.map((r) => r.label)).toEqual([
      "Wind speed",
      "Wind gust",
      "Wind direction",
    ]);
    expect(model.related[0]?.subline).toBe("3 Bft");
    expect(model.related[1]?.subline).toBe("4 Bft");
  });

  it("unifies direction and gust chips onto the same hero shape", () => {
    const fromDir = buildDetailModel(ctx("wind_direction"));
    expect(fromDir.heroValue).toBe("15 km/h · S");
    expect(fromDir.heroIcon).toBe("wind-beaufort-3");
  });

  it("converts chart series to Beaufort when requested", () => {
    const model = buildDetailModel(
      ctx("wind_speed", { windSpeedUnit: "beaufort" }),
    );
    expect(model.heroValue).toBe("3 Bft · S");
    expect(model.series?.unit).toBe("Bft");
    expect(model.series?.points[0]?.value).toBe(3);
    expect(model.related.map((r) => r.label)).toEqual([
      "Wind speed",
      "Wind gust",
      "Wind direction",
    ]);
    expect(model.related[0]?.value).toBe("3 Bft");
    expect(model.related[0]?.subline).toBe("15 km/h · 4.2 m/s");
    expect(model.related[1]?.value).toBe("4 Bft");
    expect(model.related[1]?.subline).toMatch(/km\/h/);
  });

  it("includes hourly gust series when forecast provides wind_gust", () => {
    const now = Date.now();
    const hour = 3_600_000;
    const model = buildDetailModel(
      ctx("wind_speed", {
        hourlyForecast: hourly([
          {
            datetime: new Date(now + hour).toISOString(),
            wind_speed: 12,
            wind_bearing: 180,
            wind_gust: 20,
          },
          {
            datetime: new Date(now + 2 * hour).toISOString(),
            wind_speed: 15,
            wind_bearing: 200,
            wind_gust: 28,
          },
        ]),
      }),
    );
    expect(model.series?.gust).toEqual([20, 28]);
  });

  it("adds Beaufort subline when display is m/s", () => {
    const model = buildDetailModel(
      ctx("wind_speed", { windSpeedUnit: "m/s" }),
    );
    const speed = model.related.find((r) => r.label === "Wind speed");
    expect(speed?.subline).toBe("3 Bft");
  });
});
