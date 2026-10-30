# Contract: Card configuration (user-facing YAML / editor)

The card's public interface is its Lovelace config. This feature adds one optional key and changes
how one legacy key behaves in the editor.

## New key: `chip_order`

```yaml
type: custom:vedurkort-weather-card
entity: weather.home
chip_order:
  - wind
  - precipitation
  - sun
  # Any ids left out are added at the end in the default order.
```

| Property | Contract |
|---|---|
| Type | List of chip ids. Allowed values: `sun`, `moon`, `humidity`, `wind`, `uv_index`, `pressure`, `cloud_coverage`, `dew_point`, `visibility`, `precipitation`, `precipitation_probability`, `pollen` |
| Default | Omitted, so the order is the same as before this feature |
| Unknown ids | Ignored silently |
| Duplicates | The first occurrence counts |
| Missing ids | Added at the end in the default order |
| Effect (smart chips off) | Enabled chips are shown in this order |
| Effect (smart chips on) | The More menu lists chips in this order, and it breaks ties between chips of equal importance in the main row |
| Visibility | Does not turn chips on. The `show_*` keys still control which chips are shown |
| Editor | Written when the user reorders. Removed by "Reset order" |

Documented in `docs/02-configuration.md` (Constitution II).

## Changed behavior: `animated_background` (deprecated)

| Input | Editor shows | Saved on next edit |
|---|---|---|
| `animated_background: true`, no `background` | Animated | `background: animated` (legacy key dropped) |
| `animated_background: false` or missing | Off | `background: off` |
| `background: static` plus `animated_background: true` | Static | `background: static` |

## Changed behavior: `smart_chips: true` with sun and moon

| Chip | In the main row when | Rank |
|---|---|---|
| Sun | The next sunrise or sunset is 60 minutes away or less | First |
| Moon | Within 24 hours of a new moon, first quarter, full moon or last quarter | Last (first to move into More) |

At other times both chips are listed under **More**. With `smart_chips: false` nothing changes.

## Pure module API (internal contract, unit-tested)

| Function | Module | Signature |
|---|---|---|
| `resolveChipOrder` | `src/sections/smart-chips.ts` | `(raw: unknown) => SmartChipId[]` |
| `moveChip` | `src/sections/smart-chips.ts` | `(order: readonly SmartChipId[], from: number, to: number) => SmartChipId[]` |
| `nearMajorMoonPhase` | `src/details/moon-phase.ts` | `(ageDays: number, windowDays?: number) => boolean` |
| `isChipNoteworthy` / `chipSeverity` | `src/sections/smart-chips.ts` | Existing signatures. `SmartChipValues` gains `nowMs`, `sunNextEventMs`, `moonAgeDays`, `order` |
| `partitionSmartChips` / `resolveDetailChips` | `src/sections/smart-chips.ts` | Existing. Order comes from `values.order`, and sun/moon are no longer pinned |
| `nextMorePackDemotions` | `src/sections/smart-chips.ts` | `(m: MorePackMeasure) => { demotions: number; latch: MorePackLatch \| null }` |
