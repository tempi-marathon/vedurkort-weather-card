import type { HaWeatherCondition } from "../types";
import type { ForecastItem } from "../types";
import { localize, type LocalizeKey } from "../localize";
import { formatTime, type WeatherSnapshot } from "../weather/adapter";

const WET_CONDITIONS = new Set<HaWeatherCondition>([
  "rainy",
  "pouring",
  "lightning",
  "lightning-rainy",
  "snowy",
  "snowy-rainy",
  "hail",
]);

export type OutlookPrecipType =
  | "rain"
  | "storm"
  | "snow"
  | "sleet"
  | "hail"
  | "precip";

function isWetCondition(condition: HaWeatherCondition | undefined): boolean {
  return condition != null && WET_CONDITIONS.has(condition);
}

export function isWetHour(item: ForecastItem): boolean {
  if (isWetCondition(item.condition)) return true;
  const precip = item.precipitation;
  return precip != null && !Number.isNaN(precip) && precip > 0;
}

export function precipTypeFromCondition(
  condition: HaWeatherCondition | undefined,
): OutlookPrecipType {
  switch (condition) {
    case "lightning":
    case "lightning-rainy":
      return "storm";
    case "snowy":
      return "snow";
    case "snowy-rainy":
      return "sleet";
    case "hail":
      return "hail";
    case "rainy":
    case "pouring":
      return "rain";
    default:
      return "precip";
  }
}

function expectedKey(type: OutlookPrecipType): LocalizeKey {
  const map: Record<OutlookPrecipType, LocalizeKey> = {
    rain: "copy_outlook_rain_expected",
    storm: "copy_outlook_storm_expected",
    snow: "copy_outlook_snow_expected",
    sleet: "copy_outlook_sleet_expected",
    hail: "copy_outlook_hail_expected",
    precip: "copy_outlook_precip_expected",
  };
  return map[type];
}

function continuingKey(type: OutlookPrecipType): LocalizeKey {
  const map: Record<OutlookPrecipType, LocalizeKey> = {
    rain: "copy_outlook_rain_continuing",
    storm: "copy_outlook_storm_continuing",
    snow: "copy_outlook_snow_continuing",
    sleet: "copy_outlook_sleet_continuing",
    hail: "copy_outlook_hail_continuing",
    precip: "copy_outlook_precip_continuing",
  };
  return map[type];
}

function peakProbability(items: ForecastItem[]): number | null {
  const values = items
    .map((i) => i.precipitation_probability)
    .filter((v): v is number => v != null && !Number.isNaN(v));
  if (!values.length) return null;
  return Math.max(...values);
}

function isWetNow(snap: WeatherSnapshot): boolean {
  if (isWetCondition(snap.condition)) return true;
  const precip = snap.precipitation;
  return precip != null && !Number.isNaN(precip) && precip > 0;
}

/** Outlook phrase only (no condition prefix). */
export function buildOutlookPhrase(
  hourly: ForecastItem[],
  snap: WeatherSnapshot,
  language: string | undefined,
): string {
  if (!hourly.length) {
    return localize("copy_outlook_dry", language);
  }

  const wetNow = isWetNow(snap);
  const wetHours = hourly.filter(isWetHour);
  const firstWet = hourly.find(isWetHour);
  const firstDryAfterNow = hourly.slice(1).find((item) => !isWetHour(item));

  if (!wetNow) {
    if (firstWet) {
      const type = precipTypeFromCondition(firstWet.condition);
      return localize(expectedKey(type), language, {
        time: formatTime(firstWet.datetime, language),
      });
    }

    const peak = peakProbability(hourly);
    if (peak != null && peak >= 50) {
      return localize("copy_outlook_rain_likely", language, {
        pct: String(Math.round(peak)),
      });
    }

    return localize("copy_outlook_dry", language);
  }

  if (firstDryAfterNow) {
    return localize("copy_outlook_clearing", language, {
      time: formatTime(firstDryAfterNow.datetime, language),
    });
  }

  if (wetHours.length > 0) {
    const type = precipTypeFromCondition(
      snap.condition ?? wetHours[0]?.condition,
    );
    return localize(continuingKey(type), language);
  }

  const peak = peakProbability(hourly);
  if (peak != null && peak >= 50) {
    return localize("copy_outlook_rain_likely", language, {
      pct: String(Math.round(peak)),
    });
  }

  return localize("copy_outlook_dry", language);
}
