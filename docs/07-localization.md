# 7. Localization

The card uses your Home Assistant language (`Settings → System → General → Language`), via `hass.locale.language` with fallbacks to `hass.language` and `hass.config.language`.

## Supported UI languages

| Code | Language |
| --- | --- |
| `nl` | Dutch |
| `en` | English |
| `is` | Icelandic |

Regional variants (e.g. `nl-BE`, `en-GB`) map to the base code above when it is supported.

If your language is missing, open a pull request to add it — see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Fallback

If your language is not supported, the card uses **English**. The same English fallback applies to any individual string that is missing from a supported locale.

## Not translated by the card

- Weather condition names (from Home Assistant entity states)
- Alert event/headline text from CAP or MeteoAlarm
- Raw API error messages from forecast services
