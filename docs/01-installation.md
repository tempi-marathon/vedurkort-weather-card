# 1. Installation

## Requirements

- **Home Assistant 2023.9+** for live daily/hourly forecasts (`weather/subscribe_forecast`). Older cores may still work via the `weather.get_forecasts` service fallback when subscribe is unavailable.
- The config editor probes forecasts via subscribe and, as a last resort, legacy `attributes.forecast` on the weather entity (no service calls, to avoid HA error toasts).
- [HACS](https://hacs.xyz/) (recommended) or manual resource install

## HACS (recommended)

This method lets you get updates from the Home Assistant Community Store.

[![Open Veðurkort Weather Card on Home Assistant Community Store (HACS).](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tempi-marathon&repository=vedurkort-weather-card&category=plugin)

1. If HACS is not installed yet, follow [HACS download](https://hacs.xyz/docs/use/download/download/) and [basic configuration](https://hacs.xyz/docs/configuration/basic)
2. Open **HACS** in the sidebar
3. Search for **Veðurkort Weather Card**, or click the blue button above
4. Click **Download**
5. Go to a dashboard → edit → **Add card** and search for **Veðurkort**

If the card does not appear, clear your browser/app cache (on all devices if needed), or restart Home Assistant. HACS usually registers the resource automatically at:

`/hacsfiles/vedurkort-weather-card/vedurkort-weather-card.js` (JavaScript Module)

## Manual install

1. Copy [`dist/vedurkort-weather-card.js`](../dist/vedurkort-weather-card.js) to your Home Assistant `www/` folder
2. Edit a dashboard → three-dot menu → **Manage resources** → **Add resource**
3. URL: `/local/vedurkort-weather-card.js` (optionally add `?v=1` and bump it after updates)
4. Type: **JavaScript Module** → Create
5. Refresh the page, then **Add card** and search for **Veðurkort**

After updating the file manually, bump the `?v=` query string or hard-refresh so browsers pick up the new bundle.

## Next steps

- [2. Configuration](02-configuration.md) — all options
- [6. Examples](06-examples.md) — progressive YAML configs
