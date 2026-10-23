# 4. Weather alerts

Veðurkort can show official weather warnings alongside current conditions. The card **does not fetch alerts itself** — it reads Home Assistant entities from an alerts integration you install separately.

Alerts are optional and **off by default** (`show_alerts: false`). Existing cards are unchanged until you enable them.

Config keys: [`show_alerts`](02-configuration.md), [`alerts_device`](02-configuration.md), [`alerts_entities`](02-configuration.md)

## How it works

1. **Enable** `show_alerts` in the visual editor (or YAML).
2. **Connect** a CAP Alerts device or a MeteoAlarm binary sensor (see [Setup](#setup) below).
3. When at least one **active** warning exists, a tappable strip appears **below the temperature/condition block** and above the detail chips — current weather stays the hero.
4. **Tap** the strip to open a dialog listing all active warnings. Each row expands in place for description, instructions, onset/expires, and location.

| Multiple warnings | Single warning | Detail dialog |
| --- | --- | --- |
| ![Multiple active warnings](https://raw.githubusercontent.com/tempi-marathon/vedurkort-weather-card/main/images/vedurkort-alerts-multi.png) | ![Single warning with timing](https://raw.githubusercontent.com/tempi-marathon/vedurkort-weather-card/main/images/vedurkort-alerts-single.png) | ![Weather alerts dialog](https://raw.githubusercontent.com/tempi-marathon/vedurkort-weather-card/main/images/vedurkort-alerts-modal.png) |

**Strip labels**

- **One alert:** event title + relative timing.
- **Several alerts:** lead warning title + relative timing and overflow.

**What counts as “active”**

- Yellow, orange, and red MeteoAlarm / CAP warnings are shown.
- **Green (level 1)** is filtered out — in Europe that means “no particular awareness needed”, not a real warning.
- Cancelled / expired CAP phases are hidden.

When a **red / extreme** warning is **currently active**, the card switches to the exceptional animated background and shows the Meteocons extreme variant of the current weather condition icon. Yellow and orange alerts, and red alerts before their onset time, do not change the scene or main icon.

## What you need

| Source | Best for | Install |
| --- | --- | --- |
| **[CAP Alerts](https://github.com/seevee/cap_alerts)** (recommended) | Multiple concurrent alerts across **EU/Europe**, North America, and other regions | HACS custom integration |
| **[MeteoAlarm](https://www.home-assistant.io/integrations/meteoalarm/)** (built-in) | Simple **EU/Europe** setup when you only need **one alert at a time** | Settings → Integrations |

CAP Alerts creates one Home Assistant sensor per active alert under a device. Point Veðurkort at that **device** (`alerts_device`) so all current warnings are picked up automatically.

The card never calls alert APIs directly — only Home Assistant entity state (and the device registry for CAP discovery).

## Setup

### Visual editor

1. Open the card editor → **Weather alerts** section.
2. Turn on **Show weather alerts**.
3. Choose **Alert source**:
   - **CAP Alerts device** — pick the device created by [CAP Alerts](https://github.com/seevee/cap_alerts) (or leave blank if exactly one CAP device exists; the card auto-detects it).
   - **Alert entities** — pick one or more MeteoAlarm or CAP binary/sensor entities.

**Important:** Do **not** select dozens of individual CAP “Minor … warning” sensors in entity mode. CAP Alerts creates one sensor per active alert under a device — point the card at the **device**, not each sensor.

### CAP Alerts YAML example (Europe / multi-alert)

Install CAP Alerts with the MeteoAlarm provider for your country/region, then:

```yaml
type: custom:vedurkort-weather-card
entity: weather.home
show_current: true
show_alerts: true
alerts_device: REPLACE_WITH_CAP_DEVICE_ID
```

Find the device id in **Settings → Devices → CAP Alerts** (or let the editor list it).

### Europe MeteoAlarm YAML example

```yaml
type: custom:vedurkort-weather-card
entity: weather.home
show_current: true
show_alerts: true
alerts_entities:
  - binary_sensor.meteoalarm
```

### Alerts-only card

If current weather is hidden but alerts are enabled, the strip still renders in its own section:

```yaml
type: custom:vedurkort-weather-card
entity: weather.home
show_current: false
show_alerts: true
alerts_device: REPLACE_WITH_CAP_DEVICE_ID
```

More progressive configs: [6. Examples](06-examples.md)
