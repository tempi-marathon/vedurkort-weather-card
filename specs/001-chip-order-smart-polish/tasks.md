---
description: "Task list for Chip Ordering & Smart Chip Polish"
---

# Tasks: Chip Ordering & Smart Chip Polish

**Input**: Design documents from `specs/001-chip-order-smart-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/card-config.md, quickstart.md

**Tests**: Included. Constitution IV requires new logic and bug fixes to add colocated Vitest tests that fail without the change. Write each story's tests first and check that they fail.

**Organization**: Tasks are grouped by user story (spec order: US1 P1, US2 P1, US3 P2, US4 P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: The user story the task belongs to

## Path Conventions

Single project: `src/` with colocated `*.test.ts`, plus `docs/`, `README.md` and `dist/` at the repo root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm a green baseline before changing anything.

- [X] T001 Run `npm ci && npm test && npm run build` from the repo root. Record that the baseline passes and that `git diff --stat dist/` is empty after the build, so later diffs can be trusted.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type changes that US2, US3 and US4 all depend on. US1 does not depend on this phase.

- [X] T002 In `src/sections/smart-chips.ts`, extend `SmartChipValues` with `nowMs: number`, `sunNextEventMs: number | null`, `moonAgeDays: number`, and `order: readonly SmartChipId[]`. Replace `orderIndex(id)` with `orderIndex(id, order)`, which uses `order.indexOf(id)` (999 if not found). Thread `values.order` through `partitionSmartChips`, so the More menu sort and the severity tie-break use it. Keep behavior unchanged for now by passing `SMART_CHIP_ORDER` as `order` from callers.
- [X] T003 In `src/sections/current-weather.ts`, add an optional `nowMs?: number` to `CurrentWeatherContext`. Update `smartValues(ctx)` to fill `nowMs` (`ctx.nowMs ?? Date.now()`), `sunNextEventMs` (from `nextSunEvent(ctx.snap)?.at`, imported from `src/weather/adapter.ts`, as epoch ms, or null), `moonAgeDays` (`lunarAgeDays(new Date(nowMs))` from `src/details/moon-phase.ts`), and `order: SMART_CHIP_ORDER`.
- [X] T004 Update the existing fixtures in `src/sections/smart-chips.test.ts` to supply the new `SmartChipValues` fields (with `order: SMART_CHIP_ORDER`, `nowMs: 0`, `sunNextEventMs: null`, `moonAgeDays: 7`). Run `npm test` and confirm everything is still green (no behavior change yet).

**Checkpoint**: The types compile, all tests pass, and nothing visible has changed.

---

## Phase 3: User Story 1 - Editor keeps the animated background of older cards (Priority: P1) 🎯 MVP

**Goal**: The editor shows and saves `background: animated` for legacy `animated_background: true` configs.

**Independent Test**: Load `{ entity, animated_background: true }` into the editor. Background shows "Animated", and saving after an unrelated change writes `background: animated` (quickstart scenario 1).

### Tests for User Story 1

- [X] T005 [P] [US1] In `src/config.test.ts`, add failing tests for the editor merge path. `normalizeEditorConfig({ ...DEFAULT_CONFIG, animated_background: true })` currently yields "off", which reproduces the bug. Add a new exported helper `editorConfigFromRaw(raw)` (to be created in T006), and assert that:
  - `{ animated_background: true }` → `background: "animated"`, and `animated_background` is absent from the output
  - `{ animated_background: false }` → `"off"`
  - missing → `"off"`
  - `{ background: "static", animated_background: true }` → `"static"`
  - `{ background: "bogus", animated_background: true }` → `"animated"`

### Implementation for User Story 1

- [X] T006 [US1] In `src/config.ts`, add and export `editorConfigFromRaw(raw: Partial<VedurkortEditorConfig> & { animated_background?: boolean }): VedurkortEditorConfig`. It returns `normalizeEditorConfig(raw)` with **no** pre-spread of `DEFAULT_CONFIG` (`mergeConfigFields` already applies the defaults). Confirm that the T005 tests pass.
- [X] T007 [US1] In `src/editor.ts` `setConfig`, replace `normalizeEditorConfig({ ...DEFAULT_CONFIG, ...config })` with `editorConfigFromRaw(config)`. Search `src/editor.ts` for any other `...DEFAULT_CONFIG` spread placed before user config, and apply the same ordering fix. Leave `getStubConfig` in `src/card.ts` unchanged.

**Checkpoint**: US1 is shippable on its own. Run `npm test` and `npm run build`.

---

## Phase 4: User Story 2 - Smart chip row stops flipping (Priority: P1)

**Goal**: With smart chips on, the row settles on one layout. When the last chip and More don't both fit, the least important chip goes into More and More stays on line 1 (clarification Q1, FR-004, FR-005a).

**Independent Test**: Run the recording scenario (sun, moon, 1.4 mm, wind 4 Bft · S) at fixed widths from 280 to 800 px in 10 px steps. The row settles within 1 s with 0 changes over 30 s, wind sits in More, and More is on line 1 (quickstart scenario 2).

### Tests for User Story 2

- [X] T008 [P] [US2] In `src/sections/smart-chips.test.ts`, add failing tests for the new `nextMorePackDemotions(m): { demotions: number; latch: MorePackLatch | null }`:
  - (a) Wind-recording fixture: `current: 1`, `moreWrapped: false`, `sparePx: 125`, `nextReturnWidthPx: 118`, `columnGapPx: 16` stays at 1. With the current 120 px threshold this case undemotes.
  - (b) An undemote happens when `sparePx ≥ nextReturnWidthPx + columnGapPx + 8`.
  - (c) `nextReturnWidthPx: null` falls back to `MORE_PACK_UNDEMOTE_SPARE_PX` (120).
  - (d) `moreWrapped: true` demotes by one and sets `latch = { widthPx: containerWidthPx, minStable: current + 1, key }`.
  - (e) With a latch at the same width (±2 px) and the same `key`, the result never goes below `latch.minStable`, even with a large `sparePx`.
  - (f) Changing `containerWidthPx` by more than 2 px, or changing `key`, clears the latch.
  - (g) A simulated loop that alternates the measurements from the 13:17:35 and 13:17:43 stills over 20 iterations converges to `demotions: 1` and stays there.
  - (h) The existing clamps hold: `!smartChips` or `!hasMore` → 0, and the result never exceeds `primaryCount - 1`.
  - (i) With a latch, a measurement where `key` is unchanged and `current` is one higher (the result of a demotion) keeps the latch. A different `key` (a chip became or stopped being noteworthy) clears it.

### Implementation for User Story 2

- [X] T009 [US2] In `src/sections/smart-chips.ts`:
  - Add `MorePackLatch = { widthPx: number; minStable: number; key: string }`.
  - Extend `MorePackMeasure` with `nextReturnWidthPx: number | null`, `columnGapPx: number`, `containerWidthPx: number`, `key: string` and `latch: MorePackLatch | null`.
  - Rewrite `nextMorePackDemotions` to return `{ demotions, latch }` using the transition table in `specs/001-chip-order-smart-polish/data-model.md` § "State transitions":
    - wrapped & demotions < max → +1, and set the latch
    - not wrapped & spare ≥ returnWidth + gap + 8 & (no latch or demotions − 1 ≥ latch.minStable) → −1
    - otherwise unchanged
    - clear the latch when `|width − latch.width| > 2` or `key` changes
  - Keep `MORE_PACK_UNDEMOTE_SPARE_PX = 120` as the fallback return width.
  - Confirm that the T008 tests pass.
- [X] T010 [US2] In `src/sections/smart-chips.ts`, export the pure function `computeChipLayout(smartChips, available, values, demotions): { pre: SmartChipPartition; final: SmartChipPartition; returning: SmartChipId | null }`:
  - `pre` = `resolveDetailChips(...)`.
  - `final` = `demotePrimaryChips(pre, demotions)`, or `pre` when smart chips are off.
  - `returning` = `demotions > 0 ? final.overflow[0] : null`.

  Test it in `src/sections/smart-chips.test.ts`. Change `renderCurrentWeatherSection` in `src/sections/current-weather.ts` to call it, and export a `currentChipLayout(ctx)` wrapper from that file so `src/card.ts` uses the same result.
- [X] T011 [US2] In `src/sections/current-weather.ts`, add `data-chip=${id}` to the root element of each primary chip rendered by `renderChip`, so the card can measure each chip's width.
- [X] T012 [US2] In `src/card.ts`:
  - Add a private `_chipWidths = new Map<SmartChipId, number>()` and a private `_morePackLatch: MorePackLatch | null = null`.
  - In `_syncMorePackDemotions`, record `offsetWidth` for every `[data-chip]` primary element into `_chipWidths`.
  - Call `currentChipLayout(ctx)` (from T010) with the same context used for rendering. Look up the width of `layout.returning` in `_chipWidths`, or use null if it is not there or `returning` is null.
  - Read `columnGapPx` from `getComputedStyle(details).columnGap` and `containerWidthPx` from `details.clientWidth`. Set `key` to `layout.pre.primary.join(",")`, the ids **before** demotion. Do not build `key` from DOM elements.
  - Call `nextMorePackDemotions` and store both `demotions` and `latch`.
  - Reset `_morePackLatch` and `_chipWidths` wherever `_morePackDemotions` is reset in `setConfig`.
- [X] T013 [US2] Check by hand (quickstart scenario 2) in a dev HA instance with `npm run dev` that the flip no longer happens. If it still oscillates, add a fixture that reproduces it to `src/sections/smart-chips.test.ts` before changing the logic again.

**Checkpoint**: US1 and US2 are both shippable.

---

## Phase 5: User Story 3 - Sun and moon chips appear only near a change (Priority: P2)

**Goal**: In smart mode, the sun chip is in the main row only within 60 minutes before sunrise or sunset, and ranks first. The moon chip is in the main row only within 24 hours of a major phase, and ranks last. Otherwise both go into More. This status updates every minute (FR-006 to FR-010).

**Independent Test**: In smart mode, the sun leads the row 30 minutes before sunset and is in More 2 hours before. The moon is in the row 12 hours before a full moon and in More 3 days after. Smart mode off is unchanged (quickstart scenario 3).

### Tests for User Story 3

- [X] T014 [P] [US3] In `src/details/moon-phase.test.ts`, add failing tests for `nearMajorMoonPhase(ageDays, windowDays = 1)`, with `S = SYNODIC_MONTH_DAYS`:
  - It is true at ages `0`, `S/4`, `S/2`, `3S/4`, and at each of those ±23/24 day.
  - It is false at ±25/24 day from each.
  - Wrap-around: it is true at `S − 0.5` and false at `S − 1.1`.
  - Inputs outside `[0, S)` are normalized.
- [X] T015 [P] [US3] In `src/sections/smart-chips.test.ts`, add failing tests:
  - Sun:
    - `isChipNoteworthy("sun")` is true when `sunNextEventMs − nowMs` is 30 min.
    - It is true when the difference is exactly 60 min.
    - It is false at 61 min.
    - It is false when `sunNextEventMs` is null (so the chip ends up in overflow, not hidden), and false when the difference is ≤ 0.
  - `isChipNoteworthy("moon")` follows `nearMajorMoonPhase(moonAgeDays)`.
  - Severity: `chipSeverity("sun") === 10000` and `chipSeverity("moon") === 1` when noteworthy.
  - `partitionSmartChips` ranking:
    - The sun comes before a fog visibility chip (severity 910), and the moon comes after a pressure chip (150).
    - The non-noteworthy sun and moon go into overflow.
  - `demotePrimaryChips(…, 1)`, with the moon noteworthy, demotes the moon first. The sun is no longer skipped by the demotion loop.
  - `resolveDetailChips(false, …)` still returns every available chip, including sun and moon, in `primary`.

### Implementation for User Story 3

- [X] T016 [US3] In `src/details/moon-phase.ts`, add and export `nearMajorMoonPhase(ageDays: number, windowDays = 1): boolean`. Normalize the age to `[0, S)`, then return `min(|a − p|)` over `p ∈ {0, S/4, S/2, 3S/4, S}` ≤ `windowDays`. Confirm that the T014 tests pass.
- [X] T017 [US3] In `src/sections/smart-chips.ts`:
  - In `isChipNoteworthy`, replace the `case "sun": case "moon": return true` branch:
    - sun → `sunNextEventMs != null && 0 < sunNextEventMs − nowMs ≤ 3_600_000`
    - moon → `nearMajorMoonPhase(moonAgeDays, 1)`
  - In `chipSeverity`: sun → 10000, moon → 1.
  - Remove the `pinned` logic from the `partitionSmartChips` sort (sort purely by severity, then by `orderIndex(id, values.order)`).
  - Remove the sun/moon skip from `demotePrimaryChips`.
  - Update the doc comments (they say "sun first" or "never sun/moon").
  - Confirm that the T015 tests pass.
- [X] T018 [US3] In `src/card.ts`, add a minute clock:
  - Add a `@state() private _nowMs = Date.now()` and a private `_clockTimer: number | undefined`.
  - Add `_syncClock()`. When `isConnected && this._config?.smart_chips && (this._config.show_sun || this._config.show_moon)`, schedule a `setTimeout` to the next whole minute. That timeout sets `_nowMs = Date.now()` and reschedules. Otherwise clear the timer.
  - Call `_syncClock()` from `connectedCallback`, from `setConfig`, and from `updated` when `_config` changes. Clear the timer in `disconnectedCallback`.
  - Pass `nowMs: this._nowMs` in the `renderCurrentWeatherSection` context object.
- [X] T019 [US3] Make sure the moon chip's displayed phase uses the same instant as the noteworthy check. In `src/sections/current-weather.ts` `moonChipParts`, call `getMoonSnapshot(new Date(ctx.nowMs ?? Date.now()))`.

**Checkpoint**: US1, US2 and US3 are all shippable.

---

## Phase 6: User Story 4 - User sets the order of detail chips in the editor (Priority: P3)

**Goal**: There is an optional `chip_order` config. The editor shows one reorderable chip list (switch + drag handle + ▲/▼ per row) with "Reset order" (FR-011 to FR-017, clarification Q3).

**Independent Test**: In the editor, move Wind to the top. With smart chips off, the card shows Wind first. Toggling Wind off and on keeps its place, and "Reset order" removes `chip_order` (quickstart scenario 4).

### Tests for User Story 4

- [X] T020 [P] [US4] In `src/sections/smart-chips.test.ts`, add failing tests:
  - `resolveChipOrder(raw)`:
    - A non-array returns `SMART_CHIP_ORDER`.
    - `["wind","bogus","wind","sun"]` returns `["wind","sun", …rest in SMART_CHIP_ORDER order]`.
    - The result is always a permutation of all 12 ids.
  - `moveChip(order, from, to)`:
    - Moving down, moving up, and moving to the same index (no-op) all work.
    - Out-of-range indexes are clamped.
    - The input array is not mutated.
  - `partitionSmartChips`: a custom order breaks severity ties, and it sorts the overflow list.
- [X] T021 [P] [US4] In `src/config.test.ts`, add failing tests:
  - A missing `chip_order` stays `undefined` after `normalizeConfig`.
  - `chip_order: ["wind", "x", "wind"]` normalizes through `resolveChipOrder` to a full permutation that starts with `"wind"`.
  - `editorConfigFromRaw` keeps `chip_order` the same way.

### Implementation for User Story 4

- [X] T022 [US4] In `src/sections/smart-chips.ts`, add and export:
  - `resolveChipOrder(raw: unknown): SmartChipId[]`. It returns `SMART_CHIP_ORDER` if `raw` is not an array. It keeps known ids in order, first occurrence only, then appends the missing ids in `SMART_CHIP_ORDER` order.
  - `moveChip(order: readonly SmartChipId[], from: number, to: number): SmartChipId[]`. It clamps the indexes and returns a new array.

  Confirm that the T020 `resolveChipOrder` and `moveChip` tests pass.
- [X] T023 [US4] In `src/config.ts`:
  - Add `chip_order?: SmartChipId[]` to `VedurkortCardConfig`, with a doc comment saying "Optional user chip order; omitted = default order. Normalized on load."
  - Do NOT add the field to `DEFAULT_CONFIG`.
  - In `mergeConfigFields`, set `chip_order: input.chip_order === undefined ? undefined : resolveChipOrder(input.chip_order)`, and drop the key when it is undefined so YAML stays clean.

  Confirm that the T021 tests pass.
- [X] T024 [US4] In `src/sections/current-weather.ts` `renderCurrentWeatherSection`:
  - Compute `const order = resolveChipOrder(ctx.config.chip_order)`.
  - Build `available` from `order.filter((id) => chipHasValue(id, ctx))` in place of `SMART_CHIP_ORDER.filter(…)`.
  - In `smartValues`, set `order` (replacing the T003 placeholder).
- [X] T025 [US4] In `src/localize.ts`, add these keys to all three locales (`en`, `is`, `nl`), next to `smart_chips_hint`:
  - `chip_move_up` (en "Move {name} up")
  - `chip_move_down` (en "Move {name} down")
  - `chip_drag_handle` (en "Drag to reorder {name}")
  - `chip_reset_order` (en "Reset order")
  - `chip_order_hint` (en "Drag or use the arrows to change the order of the chips.")
  - `chip_pollen_set_in_section` (en "Turn on in the Pollen section")

  Add natural Icelandic and Dutch translations. Update `src/localize.test.ts` if it checks that every locale has the same set of keys.
- [X] T026 [US4] In `src/editor.ts`, replace the sequence of individual `_detailToggle(…)` calls for chip ids with one ordered list:
  - Add a `CHIP_TOGGLE_KEY: Record<SmartChipId, DetailToggleKey | null>` map: sun→show_sun, moon→show_moon, humidity→show_humidity, wind→show_wind, uv_index→show_uv_index, pressure→show_pressure, cloud_coverage→show_cloud_coverage, dew_point→show_dew_point, visibility→show_visibility, precipitation→show_precipitation, precipitation_probability→show_precipitation_probability, pollen→null.
  - Render `resolveChipOrder(c.chip_order)` as a list with role `list`. Each row (role `listitem`, `data-chip`) contains:
    - a drag handle button with an `aria-label` from `chip_drag_handle`
    - the existing checkbox and label (reuse the `_detailToggle` markup and the missing-attribute asterisk), or, for pollen, the label plus the `chip_pollen_set_in_section` hint and no checkbox. Render the pollen row only when `c.show_pollen` is true; its position in `chip_order` is kept either way
    - ▲ and ▼ icon buttons with `aria-label`s from `chip_move_up` and `chip_move_down`, disabled at the ends
  - Keep the wind-speed-unit `<select>` directly under the Wind row when `show_wind` is on.
  - Render the `show_feels_like` toggle as a plain toggle after the list.
  - Add `chip_order_hint` above the list and a `chip_reset_order` button in the existing `.preset-row`.
- [X] T027 [US4] In `src/editor.ts`, add `_moveChip(from, to)`. It does `structuredClone(this._config)`, sets `next.chip_order = moveChip(resolveChipOrder(next.chip_order), from, to)`, and fires through the same `normalizeConfig`/`normalizeEditorConfig` path as `_value`. After the update, it moves focus back to the moved row's matching ▲/▼ button (`updateComplete.then(...)`). Wire up the ▲/▼ buttons. Add `_resetChipOrder()`, which deletes `chip_order` and fires.
- [X] T028 [US4] In `src/editor.ts`, add pointer-based drag on the handle with no new dependency:
  - On `pointerdown`, call `setPointerCapture` and record the source index.
  - On `pointermove`, find the target row under `clientY` from the row rects and show a CSS drop indicator (`.chip-row.drop-before` / `.drop-after`).
  - On `pointerup`, call `_moveChip(from, to)`. `pointercancel` and Escape cancel the drag.
  - Add `touch-action: none` on the handle.
  - Add styles for `.chip-list`, `.chip-row`, `.chip-handle`, `.chip-move`, and the drop indicators in the editor's `static styles`, matching the existing `.preset-btn` look.
- [X] T029 [US4] In `src/editor.ts`, make sure `_applyDetailPreset` ("available", "full", "clear") leaves `chip_order` unchanged.

**Checkpoint**: All four stories work on their own.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T030 [P] In `docs/02-configuration.md`:
  - Add a `chip_order` row to the options table (type, default "omitted (built-in order)", allowed ids, behavior with `smart_chips` on and off), using `specs/001-chip-order-smart-polish/contracts/card-config.md`.
  - Update the `smart_chips` and `show_moon`/`show_sun` descriptions to describe the 60-minute sun window and the ±24-hour moon window.
  - Add a "Behavior change" note for the smart sun/moon rules to the release notes / CHANGELOG section of the docs.
- [X] T031 [P] In `README.md`, add a line to the feature list about reorderable detail chips in the visual editor.
- [X] T032 Take an editor screenshot showing the reorderable chip list and add it to `images/`. Reference it from `docs/02-configuration.md`.
- [X] T033 Run `npm test` and `npm run build`. Commit the rebuilt `dist/vedurkort-weather-card.js`, and check that `git diff --exit-code dist/` is clean after a second build.
- [X] T034 Run all quickstart scenarios 1 to 5 from `specs/001-chip-order-smart-polish/quickstart.md`, including `nl` and `is` labels and keyboard-only reordering. Record the results in the PR description.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (T001)**: no dependencies
- **Foundational (T002–T004)**: after Setup. Blocks US2, US3 and US4.
- **US1 (T005–T007)**: needs only Setup, so it can start right away and run alongside Foundational
- **US2 (T008–T013)**: after Foundational
- **US3 (T014–T019)**: after Foundational. Do it after US2, because both edit `nextMorePackDemotions` and `demotePrimaryChips` in `src/sections/smart-chips.ts`, and US3's unpinning should be tested against US2's logic.
- **US4 (T020–T029)**: after Foundational. It doesn't depend on US2 or US3 logically, but shares `smart-chips.ts` and `current-weather.ts`, so run it after US3 to avoid conflicts.
- **Polish (T030–T034)**: after all the stories you are shipping are done

### Within each story

Write the tests and confirm they fail, then do the pure module, then the card/editor wiring, then the manual check.

### Parallel opportunities

- T005 (US1, `config.test.ts`) can run alongside T002–T004 (Foundational, `smart-chips.ts`/`current-weather.ts`)
- T014 (`moon-phase.test.ts`) ∥ T015 (`smart-chips.test.ts`), and T016 (`moon-phase.ts`) can start alongside T015
- T020 (`smart-chips.test.ts`) ∥ T021 (`config.test.ts`), and T025 (`localize.ts`) ∥ T022–T024
- T030 ∥ T031

### Parallel example: User Story 3

```text
Task: "T014 [US3] nearMajorMoonPhase tests in src/details/moon-phase.test.ts"
Task: "T015 [US3] sun/moon noteworthy + ranking tests in src/sections/smart-chips.test.ts"
then
Task: "T016 [US3] nearMajorMoonPhase in src/details/moon-phase.ts"
```

### Parallel example: User Story 4

```text
Task: "T020 [US4] resolveChipOrder/moveChip tests in src/sections/smart-chips.test.ts"
Task: "T021 [US4] chip_order config tests in src/config.test.ts"
Task: "T025 [US4] localize keys in src/localize.ts"
```

---

## Implementation Strategy

### MVP first

1. T001 → T005–T007 (US1). Ship as a patch release: it fixes silent dashboard regressions for legacy users.

### Incremental delivery

2. Foundational + US2 → patch release (the flip fix).
3. US3 → minor release (smart sun and moon behavior change, documented).
4. US4 + Polish → minor release (new `chip_order` option).

Each increment must include rebuilt `dist/` and updated docs, as the constitution requires.
