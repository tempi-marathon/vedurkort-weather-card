# 6. Examples

Progressive YAML configs — start simple and add sections as you need them.

```text
minimal (daily only)
└── current weather
    ├── + detail chips
    ├── + daily forecast
    │   └── + hourly forecast
    ├── + weather alerts (CAP or MeteoAlarm)
    ├── + pollen chip
    ├── + sensor overrides
    └── scene test (condition_entity)
```

Option reference: [2. Configuration](02-configuration.md)

---

## Daily forecast only

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: false
daily:
  enabled: true
  days: 5
```

## Current weather only

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: true
icon_style: fill
animated_icons: true
animated_background: true
show_sun: true
show_humidity: true
show_wind: true
wind_speed_unit: km/h
show_uv_index: true
show_pressure: true
show_cloud_coverage: true
```

## Current + daily forecast

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: true
daily:
  enabled: true
  days: 7
  show_condition_icons: true
  show_wind_speed: true
  show_wind_direction: true
  precip_type: rainfall
```

## Current + daily + hourly

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: true
daily:
  enabled: true
  days: 5
hourly:
  enabled: true
  hours: 12
  precip_type: probability
```

## With weather alerts (CAP Alerts device)

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: true
show_alerts: true
alerts_device: REPLACE_WITH_CAP_DEVICE_ID
```

Full alerts guide: [4. Weather alerts](04-alerts.md)

## With weather alerts (Europe MeteoAlarm)

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: true
show_alerts: true
alerts_entities:
  - binary_sensor.meteoalarm
```

## With pollen

```yaml
type: custom:vedurkort-weather-card
entity: weather.home
show_current: true
show_pollen: true
pollen_device: REPLACE_WITH_POLLEN_DEVICE_ID
```

Full pollen guide: [5. Pollen](05-pollen.md)

## Sensor overrides

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
show_current: true
temperature_entity: sensor.outdoor_temperature
humidity_entity: sensor.outdoor_humidity
uv_index_entity: sensor.uv_index
pressure_entity: sensor.pressure
```

When attributes are missing from your weather integration, see [3. Usage — attributes & overrides](03-usage.md#weather-attributes--sensor-overrides).

## Test backgrounds without changing your weather entity

Create an `input_select` whose options are HA condition strings (`sunny`, `rainy`, `pouring`, `hail`, …), then:

```yaml
type: custom:vedurkort-weather-card
entity: weather.forecast_thuis
animated_background: true
condition_entity: input_select.weather_scene_test
```
