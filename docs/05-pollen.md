# 5. Pollen

Veðurkort can show a pollen chip next to the other detail chips. Like alerts, the card **does not fetch pollen itself** — it reads entities from the companion [Pollen](https://github.com/tempi-marathon/ha-pollen) integration (Open-Meteo / CAMS Europe, no API key).

Config keys: [`show_pollen`](02-configuration.md), [`pollen_device`](02-configuration.md)

## Setup

1. Install **Pollen** via HACS (custom repository, category Integration) and add it for your location.
2. Enable **Show pollen** in the card editor (or set `show_pollen: true`).
3. Pick the Pollen device (`pollen_device`), or leave blank if you have exactly one — the card auto-detects it.
4. Tap the chip for species levels and the full hourly forecast chart (~4 days).

```yaml
type: custom:vedurkort-weather-card
entity: weather.home
show_current: true
show_pollen: true
pollen_device: REPLACE_WITH_POLLEN_DEVICE_ID
```

Coverage is **Europe only** (CAMS). Outside that domain the Pollen integration will not set up, and the chip stays hidden.

See also: [6. Examples](06-examples.md) · [2. Configuration](02-configuration.md)
