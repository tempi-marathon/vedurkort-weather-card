// @vitest-environment jsdom
import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import type { ForecastItem, HomeAssistant } from "../types";

const scopes = new Set<string>();
vi.mock("../icons/meteocons", () => ({
  getMeteoconSvg: (_n: string, _s: string, _a: boolean, scope = "main") => {
    scopes.add(scope);
    return `<i></i>`;
  },
}));

import { renderForecastRow } from "./forecast-row";

const hass = {
  states: { "weather.home": { entity_id: "weather.home", state: "sunny", attributes: {} } },
} as unknown as HomeAssistant;

const items: ForecastItem[] = [
  { datetime: "2026-11-20T12:00:00", condition: "partlycloudy", wind_speed: 10, wind_bearing: 90 },
];

function scopesFor(iconScope?: string): string[] {
  scopes.clear();
  render(
    renderForecastRow(hass, items, {
      showIcons: true,
      showWindSpeed: true,
      showWindDirection: true,
      iconStyle: "fill",
      animated: true,
      windSpeedUnit: "km/h",
      mode: "hourly",
      weatherEntityId: "weather.home",
      iconScope,
    }),
    document.createElement("div"),
  );
  return [...scopes];
}

describe("renderForecastRow icon scope", () => {
  it("defaults to the main scope", () => {
    expect(scopesFor()).toEqual(["main"]);
  });

  it("uses the given scope for condition and wind icons", () => {
    expect(scopesFor("tab-hourly")).toEqual(["tab-hourly"]);
  });
});
