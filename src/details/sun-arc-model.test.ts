import { describe, expect, it } from "vitest";
import type { WeatherSnapshot } from "../weather/adapter";
import {
  buildSunArcModel,
  buildSunArcPaths,
  sunArcX,
  sunArcY,
  SUN_ARC_HORIZON,
} from "./sun-arc-model";

/** Screenshot case: sunset 20:47, sunrise 6:44, now ~19:00 with daylight left. */
const RISE_H = 6 + 44 / 60;
const SET_H = 20 + 47 / 60;

function snap(partial: Partial<WeatherSnapshot> = {}): WeatherSnapshot {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const sunrise = new Date(base);
  sunrise.setHours(6, 44, 0, 0);
  const sunset = new Date(base);
  sunset.setHours(20, 47, 0, 0);
  const now = new Date(base);
  now.setHours(19, 0, 0, 0);

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
    sunrise: sunset.toISOString(),
    sunset: sunset.toISOString(),
    dawn: null,
    dusk: null,
    todaySunrise: sunrise.toISOString(),
    todaySunset: sunset.toISOString(),
    entity: { entity_id: "weather.home", state: "partlycloudy", attributes: {} },
    ...partial,
  };
}

describe("sun arc model", () => {
  it("peaks at solar noon and crosses horizon at rise/set", () => {
    const noon = (RISE_H + SET_H) / 2;
    expect(sunArcY(noon, RISE_H, SET_H)).toBeLessThan(SUN_ARC_HORIZON);
    expect(sunArcY(RISE_H, RISE_H, SET_H)).toBeCloseTo(SUN_ARC_HORIZON, 0);
    expect(sunArcY(SET_H, RISE_H, SET_H)).toBeCloseTo(SUN_ARC_HORIZON, 0);
  });

  it("keeps sun above horizon before late sunset (screenshot regression)", () => {
    expect(sunArcY(19, RISE_H, SET_H)).toBeLessThan(SUN_ARC_HORIZON);
  });

  it("places sun below horizon after sunset", () => {
    expect(sunArcY(21, RISE_H, SET_H)).toBeGreaterThan(SUN_ARC_HORIZON);
  });

  it("maps hours to full chart width", () => {
    expect(sunArcX(0)).toBe(0);
    expect(sunArcX(24)).toBe(360);
    expect(sunArcX(12)).toBe(180);
  });

  it("builds separate day and night path segments", () => {
    const { dayPath, nightPath } = buildSunArcPaths(48, RISE_H, SET_H);
    expect(dayPath).toMatch(/^M /);
    expect(nightPath).toMatch(/^M /);
    expect(dayPath).not.toEqual(nightPath);
  });

  it("buildSunArcModel places orb above horizon during remaining daylight", () => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const now = new Date(base);
    now.setHours(19, 0, 0, 0);
    const sunrise = new Date(base);
    sunrise.setHours(6, 44, 0, 0);
    const sunset = new Date(base);
    sunset.setHours(20, 47, 0, 0);

    const model = buildSunArcModel(
      snap({
        todaySunrise: sunrise.toISOString(),
        todaySunset: sunset.toISOString(),
      }),
      "en",
      now,
    );

    expect(model).not.toBeNull();
    expect(model!.showDot).toBe(true);
    expect(model!.dotY).toBeLessThan(model!.horizonY);
  });
});
