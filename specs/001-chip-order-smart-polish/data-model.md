# Data Model: Chip Ordering & Smart Chip Polish

## Card config (`VedurkortCardConfig`, `src/config.ts`)

| Field | Type | Default | Notes |
|---|---|---|---|
| `chip_order` | `SmartChipId[]` (optional) | omitted, which means `SMART_CHIP_ORDER` | New. Normalized on load with `resolveChipOrder`. Written only after the user reorders. Removed on reset. |
| `background` | `"off" \| "static" \| "animated"` | `"off"` | Unchanged. The legacy `animated_background: true` migrates to `"animated"` on **every** load path, including the editor. |
| `animated_background` | boolean (deprecated) | — | Read only for migration and never written back. |

**`SmartChipId`** (unchanged set): `sun, moon, humidity, wind, uv_index, pressure, cloud_coverage,
dew_point, visibility, precipitation, precipitation_probability, pollen`.

### Validation: `resolveChipOrder(raw: unknown): SmartChipId[]`

- If `raw` is not an array, return `SMART_CHIP_ORDER`.
- Keep entries that are known `SmartChipId`s, in order, and only the first copy of each.
- Add any missing ids at the end in `SMART_CHIP_ORDER` order.
- The result is always a full permutation of the 12 ids.

## Smart chip inputs (`SmartChipValues`, `src/sections/smart-chips.ts`)

New fields:

| Field | Type | Meaning |
|---|---|---|
| `nowMs` | number | Current time from the card's minute clock |
| `sunNextEventMs` | number \| null | Next sunrise or sunset, or null if none |
| `moonAgeDays` | number | Lunar age from `lunarAgeDays(now)` |
| `order` | `readonly SmartChipId[]` | Resolved user order, used for tie-breaks and the More menu |

### Noteworthy and severity rules (changed rows only)

| Chip | Noteworthy when | Severity |
|---|---|---|
| sun | `0 < sunNextEventMs − nowMs ≤ 3 600 000` | 10 000 (leads the row) |
| moon | `nearMajorMoonPhase(moonAgeDays, 1)` | 1 (lowest, demoted first) |

Sun and moon are no longer pinned. They sort by severity like the other chips, and the user order breaks ties.

## More-pack state (`MorePackMeasure` → `nextMorePackDemotions`)

| Field | Type | Meaning |
|---|---|---|
| `smartChips`, `hasMore`, `moreWrapped`, `sparePx`, `primaryCount`, `current` | existing | — |
| `nextReturnWidthPx` | number \| null | Last measured width of the chip that would come back on undemote. If null, the 120 px fallback is used. |
| `columnGapPx` | number | Gap between chips in the row |
| `containerWidthPx` | number | Width of `.details` |
| `latch` | `{ widthPx: number; minStable: number; key: string } \| null` | Lowest demotion count proven not to wrap at this width. `key` = the noteworthy primary ids **before demotion** (`resolveDetailChips(...).primary.join(",")`), so a demotion never changes the key. |

Return value: `{ demotions: number; latch }`. The latch resets when `|containerWidthPx − latch.widthPx| > 2`
or when `key` changes.

### State transitions

```text
wrapped  & demotions < max                    → demotions + 1; latch = { width, minStable: demotions + 1, key }
!wrapped & spare ≥ returnWidth + gap + 8
         & (no latch | demotions − 1 ≥ latch.minStable) → demotions − 1
!wrapped otherwise                              → unchanged (stable)
|width − latch.width| > 2 px or key changed     → latch cleared, then the rules above
```
