# 8. Credits & inspiration

| Project | Role |
| --- | --- |
| **[Meteocons](https://meteocons.com/)** by [Bas Milius](https://github.com/basmilius/meteocons) | **All weather icons** — animated (`@meteocons/svg`) and static (`@meteocons/svg-static`) SVGs in fill / flat / line / monochrome. Only a curated subset for [HA weather conditions](https://www.home-assistant.io/integrations/weather/#condition-mapping) (plus sun, humidity, UV, barometer, Beaufort, wind-direction, alert severity codes) is bundled. Homepage demos also inspired the current-weather presentation. MIT licensed. |
| [weather_alerts_card](https://github.com/seevee/weather_alerts_card) by seevee | Inspiration for CAP/MeteoAlarm adapter patterns and alert UX (relative timing, awareness levels). Veðurkort keeps alerts as an optional strip + dialog inside this weather card rather than a dedicated alerts dashboard. |
| [weather-chart-card](https://github.com/mlamberts78/weather-chart-card) by Marc Lamberts | Forecast UX: Chart.js temperature lines, precipitation bars, condition/wind forecast row. No longer maintained; this card reimplements similar patterns in TypeScript. |
| [HA-Animated-cards](https://github.com/Anashost/HA-Animated-cards) (climate / weather examples) | Inspiration for optional CSS/HTML weather backgrounds by condition. |
| [GlassHome weather scenes](https://github.com/glasshome/widgets/tree/main/src/weather/background/scenes) | Inspiration for animated background techniques — depth-layered rain, hail bounce, storm bolts, wind streaks, and richer night-sky treatment. |

## License notes

MIT — see [LICENSE](../LICENSE).

Meteocons icons are MIT licensed — copyright © Bas Milius. See [NOTICE](../NOTICE), [meteocons.com](https://meteocons.com/), and the [Meteocons LICENSE](https://github.com/basmilius/meteocons/blob/main/LICENSE).
