# Research: Chip Ordering & Smart Chip Polish

All Technical Context unknowns are resolved below. Each entry lists the decision, the reason for it, and the alternatives considered.

## R1. Why the editor shows "Off" for legacy animated backgrounds

**Finding**: `src/editor.ts` `setConfig` calls `normalizeEditorConfig({ ...DEFAULT_CONFIG, ...config })`.
Spreading `DEFAULT_CONFIG` first adds `background: "off"` to the input. `normalizeBackgroundMode` then
sees a valid explicit mode and never checks the legacy `animated_background: true`. The card
itself calls `normalizeConfig(config)` with the raw config, which is why the dashboard renders correctly.

**Decision**: Normalize the raw config in the editor, with no `DEFAULT_CONFIG` pre-spread.
`mergeConfigFields` already fills every default. Any other editor entry point that builds a config from
`DEFAULT_CONFIG` plus user input must merge in the same order. Add a regression test that runs the
editor's normalization path on `{ animated_background: true }` and expects `background: "animated"`.

**Rationale**: This is the smallest fix that follows Constitution I (the migration runs on every load path).
The output from `mergeConfigFields` already drops the legacy key and writes the migrated `background`,
so the next `config-changed` saves the migrated value (FR-002).

**Alternatives considered**: Removing `background` from `DEFAULT_CONFIG` would affect stub configs
and every reader of the default. Rejected.

## R2. Root cause of the smart-row flip

**Finding** (`src/card.ts` `_syncMorePackDemotions` + `nextMorePackDemotions`): undemote happens when
`sparePx > MORE_PACK_UNDEMOTE_SPARE_PX` (a fixed 120 px). It does not compare against the width of the chip that
would return. In the recording, the wind chip ("4 Bft · S" plus the 16 px column gap) is wider than 120 px.
When there is 120 px or more of spare space but less than the wind chip's width, the row undemotes and More wraps.
It then demotes again, and the cycle repeats (13:17:35 ↔ 13:17:43). Each change resizes `.details`, which re-triggers the
ResizeObserver, so the loop runs on its own. Chips use `flex: 0 1 auto; min-width: 0`, so their widths
can also shift a little between states, which narrows the margin further.

**Decision**:
1. **Fit-aware undemote**: while a chip is in the row, record its rendered width in a per-chip
   map (`data-chip` attribute on each `.tip`). Undemote only if
   `sparePx ≥ width(nextChipToReturn) + columnGap + 8 px margin`. If the width is unknown, fall back to 120 px.
2. **Oscillation latch**: `nextMorePackDemotions` gets a small history: the last container
   width and the highest demotion count that kept More on the first line. If an undemote at the
   same container width (±2 px) would return to a count that previously made More wrap, keep the
   higher count. The latch resets when the container width changes by more than 2 px, or when
   the input partition (set of primary chip ids) changes.
3. Following the clarification (single line preferred), the stable state is always the higher
   demotion count. More is never left alone on a new line.

**Rationale**: Fix (1) removes the cause seen in the recording. Fix (2) guarantees the row converges even
if sub-pixel or font-loading effects make measurements slightly unstable. Both keep the decision logic in
pure, unit-tested code (Constitution IV), and the card only measures.

**Alternatives considered**: CSS-only (`flex-wrap: nowrap` with overflow) would truncate chips instead of
demoting them, which loses the smart behavior. A time-based debounce only slows the flip and does not
remove it. Both rejected.

## R3. Sun "near change" rule

**Decision**: Use `nextSunEvent(snap)` from `src/weather/adapter.ts`. The sun chip is noteworthy when
`0 < nextEvent.at − now ≤ 60 min`. If there is no next event (polar day or night, or missing data),
it is not noteworthy. Pass `nowMs` and `sunNextEventMs` into `SmartChipValues` so
`isChipNoteworthy` stays pure.

**Rationale**: This matches the user's "an hour before sunset/rise" request and reuses the existing adapter.

## R4. Moon "near change" rule

**Decision**: Lunar age comes from `lunarAgeDays(now)` in `src/details/moon-phase.ts`. The moon chip
is noteworthy when the distance from the age to the nearest of {0, S/4, S/2, 3S/4, S} is 1 day or
less (S = `SYNODIC_MONTH_DAYS`). Add a pure helper `nearMajorMoonPhase(ageDays, windowDays = 1)` in
`moon-phase.ts`.

**Rationale**: This is the user's clarification (within 24 hours of a major phase). It reuses the existing
on-device model, and no entity is needed (Constitution III).

## R5. Ranking of sun and moon in smart mode

**Decision**: Remove the pinning of sun and moon to the front in `partitionSmartChips` and
`demotePrimaryChips`. `chipSeverity`: noteworthy sun = 10 000 (above every weather chip, max ≈ 970).
Noteworthy moon = 1 (below every other noteworthy chip). Demotion still takes the lowest-severity
chip first, so the moon goes first and the sun goes last. The existing `maxDemote = primaryCount − 1`
always keeps at least one chip in the row.

## R6. Keeping time-based status up to date (FR-009)

**Finding**: The card re-renders only on `hass`, config or forecast changes. `hass` updates usually arrive
often, but not reliably every minute when weather entities are quiet.

**Decision**: Add a minute clock in `src/card.ts`: a `@state() _nowMs`, updated by a timer aligned
to the minute. The timer runs only while the card is connected, `smart_chips` is on, and `show_sun` or
`show_moon` is on. It is cleared in `disconnectedCallback` and when those conditions turn false. Pass
`_nowMs` into the current-weather context.

**Alternatives considered**: Using `hass.last_updated` was rejected because it is not guaranteed to change every minute.

## R7. Chip order config shape

**Decision**: Add an optional `chip_order?: SmartChipId[]`. It is omitted by default. A pure `resolveChipOrder(raw)`
in `src/sections/smart-chips.ts` drops unknown ids and duplicates (the first occurrence wins), then
adds missing ids at the end in `SMART_CHIP_ORDER` order. Rendering, the More menu order and severity
tie-breaks all use the resolved order in place of `SMART_CHIP_ORDER`. "Reset to default" deletes
the key.

**Rationale**: An optional key means no migration is needed and old configs render the same as before
(Constitution I, SC-005). The ids match the existing `SmartChipId` type, so YAML stays readable.

**Alternatives considered**: A per-chip `order:` number was rejected as harder to edit and validate.

## R8. Editor reorder interaction

**Decision**: Turn the existing detail-toggle block into one ordered list (clarification Q3). Each row
has a drag handle, the existing checkbox, the label, and ▲/▼ icon buttons with accessible names
("Move Wind up"). Dragging uses Pointer Events on the handle, which works for mouse and touch with
no dependency. The reorder maths is a pure `moveChip(order, from, to)`. The ▲/▼ buttons are the
keyboard path. After a move, focus stays on the moved row's button.

- **Feels like** is not a row chip (it renders in the temperature line), so it stays a plain toggle below the list.
- **Pollen** appears in the list so it can be ordered. Its on/off switch and device picker stay in the
  Pollen section, and the row shows the reorder controls with a short "Set in Pollen" hint.
- The wind speed unit selector stays directly under the Wind row.

**Rationale**: This needs no new runtime dependency (Distribution constraint) and works on HA 2023.9+.
`ha-sortable` is not available on the baseline. Keyboard access meets Constitution V.

**Alternatives considered**: HTML5 drag-and-drop does not work on touch in the HA companion app. SortableJS
would be a new dependency. Both rejected.
