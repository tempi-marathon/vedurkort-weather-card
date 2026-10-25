# 2. Configuration

All options can be set in the visual editor. YAML details are below.

Enable any combination of `show_current`, `daily.display` (not `off`), and `hourly.enabled`. When both forecasts are on, daily is shown above hourly. If all three are off, the card shows a short configuration hint.

See also: [3. Usage](03-usage.md) · [4. Weather alerts](04-alerts.md) · [5. Pollen](05-pollen.md) · [6. Examples](06-examples.md)

## Card options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | string | **Required** | Must be `custom:vedurkort-weather-card`. |
| `entity` | string | **Required** | A `weather.*` entity. |
| `name` | string | none | Override the location/title. Falls back to the entity friendly name. |
| `show_name` | boolean | `true` | Show the location/title header at the top of the card. |
| `layout` | string | `default` | Visual density: `default`, `compact` (smaller hero), or `minimal` (smaller temp + icon; denser detail chips). |
| `icon_style` | string | `fill` | Meteocons style: `fill`, `flat`, `line`, or `monochrome`. |
| `animated_icons` | boolean | `true` | Use animated Meteocons (`true`) or static SVGs (`false`). |
| `animated_background` | boolean | `false` | Enable CSS weather background by condition. Cloud layer opacity is lightly scaled from `cloud_coverage` when available. Animations pause automatically when the card is off-screen, the browser tab is hidden, or the user prefers reduced motion (dialog scenes included). |
| `show_current` | boolean | `true` | Show the current weather section (condition, temperature, icon). Detail chips only appear when this is on. |
| `smart_chips` | boolean | `false` | Keep the chip row focused on what matters right now. Everything else you enabled stays one tap away under **More**. |
| `show_sun` | boolean | `false` | Show the next sunrise or sunset (sunset while the sun is up, sunrise while down). |
| `show_humidity` | boolean | `false` | Show humidity. |
| `show_wind` | boolean | `false` | Show a single current-wind chip (speed + direction, optional gust) with Beaufort icon. |
| `wind_speed_unit` | string | `native` | Display unit for the current wind chip and wind detail sheet/chart: `native` (Home Assistant), `km/h`, `beaufort`, `m/s`, or `mph`. |
| `show_uv_index` | boolean | `false` | Show UV index. |
| `show_pressure` | boolean | `false` | Show pressure. |
| `show_cloud_coverage` | boolean | `false` | Show cloud coverage (%). |
| `show_feels_like` | boolean | `false` | Show feels-like / apparent temperature beside the main temperature. |
| `show_dew_point` | boolean | `false` | Show dew point. |
| `show_visibility` | boolean | `false` | Show visibility. |
| `show_precipitation` | boolean | `false` | Show current precipitation amount. |
| `show_precipitation_probability` | boolean | `false` | Show current precipitation probability (%). |
| `daily` | object | see below | Daily forecast section options. |
| `hourly` | object | see below | Hourly forecast section options. |
| `show_alerts` | boolean | `false` | Show a weather-alert summary when an alert source is configured and at least one **active** warning exists. Hidden when idle. Requires `show_current: true` for strip placement on the current-weather section. |
| `alerts_device` | string | none | [CAP Alerts](https://github.com/seevee/cap_alerts) **device id** — discovers all per-alert sensors under that device. Recommended for CAP Alerts usage. Auto-detected when you have exactly one CAP device. |
| `alerts_entities` | list | none | One or more alert entities (e.g. `binary_sensor.meteoalarm`). Active warnings from all entities are merged. |
| `show_pollen` | boolean | `false` | Show a pollen chip when a [Pollen](https://github.com/tempi-marathon/ha-pollen) device is available. Tap opens a detail sheet with species and the full hourly forecast. Europe (CAMS) only. |
| `pollen_device` | string | none | [Pollen](https://github.com/tempi-marathon/ha-pollen) **device id**. Auto-detected when exactly one Pollen device exists. |
| `tap_action` | object | detail | Lovelace action on tap of the current-weather block. Default opens the current-conditions detail sheet. Use `{ action: more-info }` for Home Assistant’s entity dialog. |
| `hold_action` | object | none | Lovelace action on hold. |
| `double_tap_action` | object | none | Lovelace action on double-tap. |
| `condition_entity` | string | none | Optional override for the **current** condition (background scene, main icon, condition label). Forecast sections still use `entity`. Handy for testing scenes via an `input_select` of HA condition strings. |
| `temperature_entity` | string | none | Optional sensor override for current temperature. |
| `humidity_entity` | string | none | Optional sensor override for humidity. |
| `wind_speed_entity` | string | none | Optional sensor override for wind speed. |
| `wind_bearing_entity` | string | none | Optional sensor override for wind bearing (degrees). |
| `wind_gust_entity` | string | none | Optional sensor override for wind gust. |
| `uv_index_entity` | string | none | Optional sensor override for UV index. |
| `pressure_entity` | string | none | Optional sensor override for pressure. |
| `cloud_coverage_entity` | string | none | Optional sensor override for cloud coverage. |
| `feels_like_entity` | string | none | Optional sensor override for feels-like temperature. |
| `dew_point_entity` | string | none | Optional sensor override for dew point. |
| `visibility_entity` | string | none | Optional sensor override for visibility. |
| `precipitation_entity` | string | none | Optional sensor override for precipitation amount. |
| `precipitation_probability_entity` | string | none | Optional sensor override for precipitation probability. |
| `sun_entity` | string | `sun.sun` | Entity used for sunrise/sunset times and hourly day/night icon picking. |

## Daily options (`daily`)

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `display` | string | `off` | How daily appears: `off`, `inline` (section on the card), or `modal` (text link under current chips opens a dialog with the same chart). |
| `enabled` | boolean | `false` | Legacy. If `display` is omitted, `true` maps to `inline` and `false` to `off`. After normalize, `enabled` is `true` whenever `display !== "off"`. |
| `days` | number | `5` | Number of daily forecast points to show (2–7). |
| `show_condition_icons` | boolean | `true` | Show Meteocons condition icons under the chart. |
| `show_wind_speed` | boolean | `true` | Show Beaufort icon + speed under the chart. |
| `show_wind_direction` | boolean | `true` | Show compass label + wind-direction icon under the chart. |
| `precip_type` | string | `rainfall` | Precipitation series: `rainfall` or `probability`. |

The daily modal uses the same viewport dialog shell as alerts and detail sheets (weather background/scene when `animated_background` is on, title, Close, backdrop dismiss).

## Hourly options (`hourly`)

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | boolean | `false` | Show the hourly forecast chart and icons. |
| `hours` | number | `12` | Number of hourly forecast points to show (2–48). |
| `show_condition_icons` | boolean | `true` | Show Meteocons condition icons under the chart. |
| `show_wind_speed` | boolean | `true` | Show Beaufort icon + speed under the chart. |
| `show_wind_direction` | boolean | `true` | Show compass label + wind-direction icon under the chart. |
| `precip_type` | string | `rainfall` | Precipitation series: `rainfall` or `probability`. |
