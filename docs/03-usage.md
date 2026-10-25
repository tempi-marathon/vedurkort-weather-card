# 3. Usage

## Sections

Compose the card from independent sections:

- **Current weather** — `show_current` (condition, temperature, icon, optional detail chips)
- **Daily forecast** — `daily.display`: `off` | `inline` | `modal`
- **Hourly forecast** — `hourly.enabled`

When daily is `inline`, the chart sits on the card (above hourly when hourly is on). When `modal`, a text link under the current detail chips opens a dialog with the same daily chart and config. Subtle section dividers appear when more than one section is shown. If current, daily, and hourly are all off, the card shows a short configuration hint.

Hourly charts scroll horizontally when showing more than 12 hours.

Full option reference: [2. Configuration](02-configuration.md)

## Detail sheets

Tap the **current-weather block** (temperature + condition) or any **detail chip** to open a centered detail sheet. When `animated_background` is enabled, the sheet reuses the same CSS weather scene as the card. Scene animations pause per card when that card is scrolled off-screen, when the tab is in the background, or when `prefers-reduced-motion` is set — so phones and dashboards with many cards do not keep animating invisible rain/clouds. An open detail/alerts/daily dialog on a card keeps that card’s scene running even if the host is reported off-screen.

Each sheet shows a large hero value, a short interpretation line, optional **24-hour forecast chart** (from hourly forecast data), and related stats. The current-conditions sheet also shows hourly condition icons under the chart. Charts are available for temperature, humidity, wind speed, precipitation, precipitation probability, and cloud coverage. UV, pressure, visibility, dew point, and gust show current values and copy without a chart when hourly forecast lacks that field.

**Tap action default:** opens the current-conditions sheet. Restore Home Assistant’s entity dialog with:

```yaml
tap_action:
  action: more-info
```

Hourly forecast is subscribed automatically when `show_current` is on (even if the hourly forecast section is disabled), so chip charts have data on first tap.

Hold and double-tap actions on the current-weather block are optional (`hold_action`, `double_tap_action`).

## Weather attributes & sensor overrides

Not every weather integration exposes every attribute. Veðurkort reads values from the `weather.*` entity when present, and otherwise from optional override sensors.

| Attribute | Typical weather attr | Notes |
| --- | --- | --- |
| Temperature | `temperature` | Usually available |
| Humidity | `humidity` | Usually available |
| Wind speed / bearing | `wind_speed`, `wind_bearing` | Usually available |
| Pressure | `pressure` | Often available |
| Cloud coverage | `cloud_coverage` | Often available |
| UV index | `uv_index` | Integration-dependent |
| Feels like | `apparent_temperature` | Missing on some (e.g. Meteorologisk institutt) |
| Dew point | `dew_point` | Integration-dependent |
| Visibility | `visibility` | Missing on some (e.g. Meteorologisk institutt) |
| Sunrise / sunset | via `sun.sun` | Not from the weather entity |

On the card, detail chips are **hidden when there is no value**. In the visual editor, toggles stay available and show a small hint whether the selected weather entity currently has that attribute — use an override sensor when it does not.

**Smart chips** keeps the row to what’s useful right now and puts the rest under **More**. Your chip toggles still decide what’s allowed.

Example with overrides: [6. Examples](06-examples.md#sensor-overrides)

## Icons & backgrounds

- Meteocons styles: `fill` / `flat` / `line` / `monochrome`, animated or static
- Day/night condition icons (hourly icons follow sun rising/setting; daily uses daytime variants where available)
- Cloudy / precip / storm icons follow `cloud_coverage` (sunless when ≥65% or unavailable)
- Optional CSS animated backgrounds; cloud opacity lightly follows `cloud_coverage`
- CSS tooltips on detail and forecast icons (shadow-DOM friendly)

## Related

- [4. Weather alerts](04-alerts.md)
- [5. Pollen](05-pollen.md)
- [6. Examples](06-examples.md)
