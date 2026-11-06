// @vitest-environment jsdom
import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import type { ForecastItem, HomeAssistant } from "../types";

vi.mock("../icons/meteocons", () => ({
  getMeteoconSvg: (name: string) => `<i data-icon="${name}"></i>`,
}));

import { lunarAgeDays, moonPhaseIcon, phaseFromAge } from "../details/moon-phase";
import { renderForecastRow } from "./forecast-row";

const moonAt = (iso: string) =>
  moonPhaseIcon(phaseFromAge(lunarAgeDays(new Date(iso))));

const NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
/** Local-time ISO string (no offset) for a given lunar age at 23:00 local. */
function nightIso(ageDays: number): string {
  const d = new Date(NEW_MOON_MS + ageDays * 86_400_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T23:00:00`;
}

const hass = {
  states: { "weather.home": { entity_id: "weather.home", state: "sunny", attributes: {} } },
} as unknown as HomeAssistant;

function iconsFor(items: ForecastItem[], mode: "hourly" | "daily" = "hourly"): string[] {
  const host = document.createElement("div");
  const tpl = renderForecastRow(hass, items, {
    showIcons: true,
    showWindSpeed: false,
    showWindDirection: false,
    iconStyle: "fill",
    animated: false,
    windSpeedUnit: "km/h",
    mode,
    weatherEntityId: "weather.home",
  });
  render(tpl, host);
  return [...host.querySelectorAll<HTMLElement>("[data-icon]")]
    .map((el) => el.dataset.icon!)
    .filter((n) => !n.startsWith("wind") && !n.startsWith("beaufort"));
}

describe("renderForecastRow moon phase", () => {
  it("shows the moon phase for clear-night hours, per hour's date", () => {
    const a = nightIso(7);
    const b = nightIso(21);
    const out = iconsFor([
      { datetime: a, condition: "clear-night" },
      { datetime: b, condition: "clear-night" },
    ]);
    expect(out).toEqual([moonAt(a), moonAt(b)]);
    expect(out[0]).not.toBe(out[1]);
    expect(out.every((n) => n.startsWith("moon-"))).toBe(true);
  });

  it("treats sunny at night as clear night", () => {
    const iso = nightIso(14.8);
    expect(iconsFor([{ datetime: iso, condition: "sunny" }])).toEqual([moonAt(iso)]);
  });

  it("keeps day icons and non-clear night icons", () => {
    const day = nightIso(14.8).replace("T23", "T12");
    const out = iconsFor([
      { datetime: day, condition: "sunny" },
      { datetime: nightIso(14.8), condition: "cloudy" },
    ]);
    expect(out).toEqual(["clear-day", "overcast-night"]);
  });

  it("does not use the moon in the daily forecast", () => {
    expect(
      iconsFor([{ datetime: nightIso(14.8), condition: "clear-night" }], "daily"),
    ).toEqual(["clear-night"]);
  });
});
