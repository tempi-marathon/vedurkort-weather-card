# 1. Installation

## Requirements

- **Home Assistant 2023.9+** for live daily/hourly forecasts (`weather/subscribe_forecast`). Older cores may still work via the `weather.get_forecasts` service fallback when subscribe is unavailable.
- The config editor probes forecasts via subscribe and, as a last resort, legacy `attributes.forecast` on the weather entity (no service calls, to avoid HA error toasts).
- [HACS](https://hacs.xyz/) (recommended) or manual resource install — on **Home Assistant 2026.11+**, prefer **Settings → Marketplace**

## HACS / Marketplace (recommended)

Use HACS today, or Marketplace on Home Assistant 2026.11+. The button below opens HACS now and Marketplace after you upgrade.

[![Open Veðurkort Weather Card on Home Assistant Community Store (HACS).](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=tempi-marathon&repository=vedurkort-weather-card&category=plugin)

1. If you are on **Home Assistant ≤2026.10** and HACS is not installed yet, follow [HACS download](https://hacs.xyz/docs/use/download/download/) and [basic configuration](https://hacs.xyz/docs/configuration/basic)
2. Open **HACS** in the sidebar (or **Settings → Marketplace** on 2026.11+), or click the blue button above
3. Search for **Veðurkort Weather Card**
4. Click **Download** / install
5. Reload the browser (or refresh Lovelace resources) — usually no Home Assistant restart
6. Go to a dashboard → edit → **Add card** and search for **Veðurkort**

HACS and Marketplace register the dashboard resource automatically (Marketplace always does). If you pin the URL in YAML yourself:

- Legacy HACS path (keeps working): `/hacsfiles/vedurkort-weather-card/vedurkort-weather-card.js` (JavaScript Module)
- New community path: `/local/community/vedurkort-weather-card/vedurkort-weather-card.js` (JavaScript Module)

If the card does not appear, hard-refresh or clear your browser/app cache on each device. Restart Home Assistant only as a last resort.

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
