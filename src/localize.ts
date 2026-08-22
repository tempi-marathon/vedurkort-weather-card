const STRINGS = {
  en: {
    weather_alerts: "Weather alerts",
    close: "Close",
    onset: "Onset",
    expires: "Expires",
    instructions: "Instructions",
    feels_like: "Feels like",
    humidity: "Humidity",
    wind_direction: "Wind direction",
    uv_index: "UV index",
    pressure: "Pressure",
    cloud_coverage: "Cloud coverage",
    dew_point: "Dew point",
    visibility: "Visibility",
    precipitation: "Precipitation",
    precipitation_probability: "Precipitation probability",
    wind_gust: "Wind gust",
    sunset: "Sunset",
    sunrise: "Sunrise",
    waiting: "Waiting for Home Assistant…",
    configure_entity: "Configure a weather entity for this card.",
    entity_not_found: "Entity not found",
    enable_section: "Enable a section in the card configuration to show weather content.",
    no_forecast: "No {mode} forecast data available on",
    wind: "Wind",
    configure_weather: "Configure a weather entity for this card.",
  },
  is: {
    weather_alerts: "Veðurviðvaranir",
    close: "Loka",
    onset: "Byrjun",
    expires: "Rennur út",
    instructions: "Leiðbeiningar",
    feels_like: "Skynjanlegt",
    humidity: "Raki",
    wind_direction: "Vindstefna",
    uv_index: "UV vísitala",
    pressure: "Loftþyngd",
    cloud_coverage: "Skýjahula",
    dew_point: "Daggpunktur",
    visibility: "Skyggni",
    precipitation: "Úrkoma",
    precipitation_probability: "Líkur á úrkomu",
    wind_gust: "Vindhviður",
    sunset: "Sólsetur",
    sunrise: "Sólarupprás",
    waiting: "Bíð eftir Home Assistant…",
    configure_entity: "Stilltu veður einingu fyrir þetta spjald.",
    entity_not_found: "Eining fannst ekki",
    enable_section: "Virkjaðu hluta í stillingum spjaldsins til að sýna veður.",
    no_forecast: "Engin {mode} spá tiltæk á",
    wind: "Vindur",
    configure_weather: "Stilltu veður einingu fyrir þetta spjald.",
  },
  nl: {
    weather_alerts: "Weerswaarschuwingen",
    close: "Sluiten",
    onset: "Begin",
    expires: "Verloopt",
    instructions: "Instructies",
    feels_like: "Gevoelstemperatuur",
    humidity: "Vochtigheid",
    wind_direction: "Windrichting",
    uv_index: "UV-index",
    pressure: "Luchtdruk",
    cloud_coverage: "Bewolking",
    dew_point: "Dauwpunt",
    visibility: "Zicht",
    precipitation: "Neerslag",
    precipitation_probability: "Neerslagkans",
    wind_gust: "Windstoot",
    sunset: "Zonsondergang",
    sunrise: "Zonsopgang",
    waiting: "Wachten op Home Assistant…",
    configure_entity: "Configureer een weerentiteit voor deze kaart.",
    entity_not_found: "Entiteit niet gevonden",
    enable_section: "Schakel een sectie in via de kaartconfiguratie om weer te tonen.",
    no_forecast: "Geen {mode} prognose beschikbaar op",
    wind: "Wind",
    configure_weather: "Configureer een weerentiteit voor deze kaart.",
  },
} as const;

export type LocalizeKey = keyof typeof STRINGS.en;

function localeBase(language?: string): keyof typeof STRINGS {
  if (!language) return "en";
  const base = language.split("-")[0]?.toLowerCase();
  if (base === "is" || base === "nl") return base;
  return "en";
}

export function localize(
  key: LocalizeKey,
  language?: string,
  vars?: Record<string, string>,
): string {
  const lang = localeBase(language);
  let text: string = STRINGS[lang][key] ?? STRINGS.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
