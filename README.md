# Veðurkort Weather Card

[![HACS](https://img.shields.io/badge/HACS-41BDF5?style=for-the-badge&logo=homeassistantcommunitystore&logoColor=white)](https://hacs.xyz/)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Lovelace-18BCF2?style=for-the-badge&logo=homeassistant&logoColor=white)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Veðurkort** is Icelandic for “weather card” / “weather map”. Pronounced roughly *VEH-thur-kort* (ð like the *th* in *weather*).

Home Assistant Lovelace weather card with **[Meteocons](https://meteocons.com/)** icons, optional CSS weather backgrounds, and Chart.js daily/hourly forecasts.

**Custom type:** `custom:vedurkort-weather-card`

| Full | Current | Icon styles | Daily only |
| --- | --- | --- | --- |
| ![Full card](images/vedurkort-full.png) | ![Current](images/vedurkort-current.png) | ![Icon styles](images/vedurkort-styles.png) | ![Daily only](images/vedurkort-daily-only.png) |

## Features

- Compose sections independently: current weather, daily forecast, hourly forecast (any combination)
- **Meteocons** — styles `fill` / `flat` / `line` / `monochrome`, animated or static
- Day/night condition icons; cloudy / precip / storm icons follow `cloud_coverage`
- Optional CSS animated backgrounds
- Detail chips (sun, humidity, wind, UV, pressure, and more) with tap-to-open detail sheets
- Layout presets: `default`, `compact`, or `minimal`
- Full visual editor — configure everything in the UI, no YAML required
- Optional **weather alerts** via [CAP Alerts](https://github.com/seevee/cap_alerts) or core [MeteoAlarm](https://www.home-assistant.io/integrations/meteoalarm/)
- Optional **pollen** chip via companion [Pollen](https://github.com/tempi-marathon/ha-pollen) (Europe / CAMS)
- Localized UI (`en`, `nl`, `is`) — see [7. Localization](docs/07-localization.md)

## Ecosystem

Veðurkort reads Home Assistant entities — it does not call weather/alert/pollen APIs itself.

```mermaid
flowchart TD
  Weather["weather.* entity"] --> Card[Vedurkort]
  Overrides["Optional sensor overrides"] --> Card
  CAP["CAP Alerts device"] -.->|"optional alerts"| Card
  Meteo["MeteoAlarm binary_sensor"] -.->|"optional alerts"| Card
  Pollen["Pollen device"] -.->|"optional pollen chip"| Card
```

## Install

**Home Assistant 2023.9+** recommended for live forecasts (`weather/subscribe_forecast`).

[![Open Veðurkort Weather Card on Home Assistant Community Store (HACS).](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tempi-marathon&repository=vedurkort-weather-card&category=plugin)

1. Open HACS → search for **Veðurkort Weather Card**, or use the button above
2. Download / install the card
3. Reload the browser (or refresh Lovelace resources), then **Add card** and search for **Veðurkort**

On **Home Assistant 2026.11+**, install from **Settings → Marketplace**; the same button opens Marketplace after you upgrade.

Full guide (including resource paths): [1. Installation](docs/01-installation.md)

## Documentation

[1. Installation](docs/01-installation.md) ·
[2. Configuration](docs/02-configuration.md) ·
[3. Usage](docs/03-usage.md) ·
[4. Weather alerts](docs/04-alerts.md) ·
[5. Pollen](docs/05-pollen.md) ·
[6. Examples](docs/06-examples.md) ·
[7. Localization](docs/07-localization.md) ·
[8. Credits](docs/08-credits.md)

Development: [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT — see [LICENSE](LICENSE).

Meteocons icons are MIT licensed — copyright © Bas Milius. See [NOTICE](NOTICE), [meteocons.com](https://meteocons.com/), and the [Meteocons LICENSE](https://github.com/basmilius/meteocons/blob/main/LICENSE).
