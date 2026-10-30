# Quickstart: validating Chip Ordering & Smart Chip Polish

## Prerequisites

- `npm ci`
- A Home Assistant dev instance (2023.9+) with a `weather.*` entity, and the card loaded from `dist/`

## Automated checks

```bash
npm test          # Vitest: config, smart-chips, moon-phase unit tests
npm run build     # tsc --noEmit + bundle; commit the resulting dist/
```

Expected new or updated tests:

| Test file | Proves |
|---|---|
| `src/config.test.ts` | The editor normalization path migrates `animated_background: true` to `animated`. An explicit `background` wins. `chip_order` normalization works. |
| `src/sections/smart-chips.test.ts` | `resolveChipOrder` and `moveChip` edge cases. Sun is noteworthy at 30 min before an event and not at 61 min. Sun is first and moon is last. Fit-aware undemote. The latch stops oscillation (wind-chip scenario from the recording). |
| `src/details/moon-phase.test.ts` | `nearMajorMoonPhase` is true at ±23 h and false at ±25 h around each of the 4 phases, including wrap-around at new moon. |

## Manual scenarios (map to spec user stories)

1. **US1, legacy background**: Paste `animated_background: true` (no `background`) into a card's
   YAML, open the visual editor, and check that Background shows *Animated*. Toggle "Show name" and save. The
   YAML now has `background: animated`, and the scene still animates.
2. **US2, no flip**: Turn on smart chips, sun and moon (near a phase), precipitation > 0, and wind ≥ 4 Bft.
   Resize the dashboard column until wind and More just don't fit on line 1. Watch for 30 s. Wind stays in More,
   More stays on line 1, and the card height does not change. Repeat at 10 px steps from 280 to 800 px.
3. **US3, sun and moon**: With smart chips on, use the browser devtools time override (or wait) to be
   30 min before sunset. Sun is the first chip. At 2 h before sunset, sun is in More. Leave the card open across
   the 60-minute boundary. The chip moves within 1 min with no reload.
4. **US4, ordering**: In the editor, drag Wind to the top and use ▼ on Sun twice, using the keyboard only
   for the second move. The preview updates. Turn Wind off and on, and it keeps its place. Select "Reset order",
   and `chip_order` is removed from the YAML.
5. **Localization**: Switch HA language to `nl` and `is`. All new editor labels and button names are translated.

See [contracts/card-config.md](contracts/card-config.md) for the exact config contract and
[data-model.md](data-model.md) for the validation rules.
