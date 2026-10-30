# Implementation Plan: Chip Ordering & Smart Chip Polish

**Branch**: `smart-chips-editor-polish` (spec dir `001-chip-order-smart-polish`) | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-chip-order-smart-polish/spec.md`

## Summary

This plan covers four changes to the current-weather detail chips:

1. **Legacy background bug (P1)**: the editor pre-spreads `DEFAULT_CONFIG`, so `background: "off"` hides
   the legacy `animated_background: true`. Fix: normalize the raw config ([research R1](research.md#r1-why-the-editor-shows-off-for-legacy-animated-backgrounds)).
2. **Smart row flip (P1)**: undemote uses a fixed 120 px threshold that is smaller than the wind chip's width.
   Fix: undemote only when the chip being returned fits, plus a latch that stops oscillation at a fixed width
   ([R2](research.md#r2-root-cause-of-the-smart-row-flip)).
3. **Sun and moon only near a change (P2)**: time-based noteworthy rules. The sun leads and the moon ranks last. A minute clock keeps
   them current ([R3–R6](research.md)).
4. **User chip order (P3)**: optional `chip_order` config, and the editor's chip toggles become one reorderable list
   with drag and ▲/▼ controls ([R7–R8](research.md)).

## Technical Context

**Language/Version**: TypeScript 5 (`strict`), ES2022 output

**Primary Dependencies**: Lit (components), Chart.js (unchanged), Vite. **No new runtime dependencies.**

**Storage**: Lovelace card config (YAML/JSON stored by Home Assistant)

**Testing**: Vitest with jsdom (`npm test`), and `tsc --noEmit` through `npm run build`

**Target Platform**: Home Assistant 2023.9+ frontend (desktop browsers, HA companion apps, wall tablets)

**Project Type**: Single-package Lovelace custom card, shipped as one bundled ES module

**Performance Goals**: The chip row settles within 1 s and has 0 layout changes afterwards at fixed width. The minute clock costs at most 1 re-render per minute.

**Constraints**: Bundle size: no new dependencies. Respect `prefers-reduced-motion`. Keyboard-operable editor. Translations for en, nl and is.

**Scale/Scope**: 12 chip ids, about 6 source files touched, 3 test files extended

## Constitution Check

*GATE: checked before Phase 0 and again after Phase 1 design.*

| Principle | Status | How this plan complies |
|---|---|---|
| I. Config backward compatibility | ✅ | `chip_order` is optional, and when it is missing the order is the same as today. The legacy `animated_background` migration now also runs in the editor, with a unit test (R1). No key changes meaning. Sun and moon behavior in smart mode changes as the spec requires, but only for `smart_chips: true`, and the config stays valid and renders. The new US3 rules change which chips smart mode shows, not what `smart_chips`, `show_sun` or `show_moon` mean. Those keys keep their meaning ("enable", and "focus the row on what matters now"), and every existing config stays valid. So this is a MINOR release and not breaking. The change is called out in the changelog and in `docs/02-configuration.md`. |
| II. Visual editor parity | ✅ | Chip order can be edited in the editor. The default is omitted. `docs/02-configuration.md` documents `chip_order` and the new sun/moon smart behavior. |
| III. Graceful degradation | ✅ | No sun data or polar day/night means the sun is not noteworthy, and the chip falls back to More or stays hidden as today. Moon is computed on-device. No new integrations. |
| IV. Testable pure logic | ✅ | `resolveChipOrder`, `moveChip`, `nearMajorMoonPhase`, the severity/noteworthy rules and `nextMorePackDemotions` (latch) are pure and covered by colocated tests. The card and editor only measure and wire. |
| V. Localized & accessible | ✅ | New strings (move up/down, reset order, drag handle, "Set in Pollen") go into `en`, `nl` and `is`. ▲/▼ buttons have accessible names that include the chip name, and focus is kept after a move. No new animation. |
| Distribution & security | ✅ | No new dependency, no network, no `innerHTML` beyond existing icons. `dist/` is rebuilt in the PR. |
| Workflow | ✅ | Docs and README feature list are updated. Screenshot of the editor list goes in `images/` (the appearance changes). |

**Post-design re-check (after Phase 1)**: still ✅ for every principle. No deviations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-chip-order-smart-polish/
├── spec.md
├── plan.md              # this file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── card-config.md   # Phase 1
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
src/
├── config.ts                    # chip_order field + normalize via resolveChipOrder
├── config.test.ts               # legacy bg via editor path; chip_order normalization
├── editor.ts                    # setConfig fix (R1); reorderable chip list, reset order (R8)
├── localize.ts                  # new strings in en / nl / is
├── card.ts                      # minute clock (_nowMs); per-chip width map; latch state; data-chip measuring
├── card-styles.ts               # (only if the row needs data-chip-independent tweaks; expect none)
├── sections/
│   ├── smart-chips.ts           # resolveChipOrder, moveChip, sun/moon rules & severity, unpin,
│   │                            #   order-aware sort, fit-aware + latched nextMorePackDemotions
│   ├── smart-chips.test.ts
│   └── current-weather.ts       # use resolved order; pass nowMs/sun/moon values; data-chip attr
├── details/
│   ├── moon-phase.ts            # nearMajorMoonPhase
│   └── moon-phase.test.ts
docs/02-configuration.md         # chip_order; smart sun/moon behavior
README.md                        # feature list line for chip ordering
dist/vedurkort-weather-card.js   # rebuilt
```

**Structure Decision**: This is the existing single-project layout. All decision logic goes into the existing pure modules
`src/sections/smart-chips.ts` and `src/details/moon-phase.ts`. `card.ts` and `editor.ts` only measure, keep timers and wire the UI.

## Implementation Order (for /speckit-tasks)

1. **US1** (smallest change, ships alone): editor `setConfig` fix and test.
2. **US2**: `nextMorePackDemotions` with fit and latch, plus tests (the recording scenario as a fixture). Then the card measures chip widths and keeps the latch.
3. **US3**: `nearMajorMoonPhase` and tests. Then the `SmartChipValues` time fields, the new rules, unpinning and tests. Then the minute clock in the card.
4. **US4**: `resolveChipOrder` and `moveChip` with tests. Then thread `order` through partition and render. Then the editor list, localization, docs and screenshot.
5. Rebuild `dist/`, run `npm test` and `npm run build`.

US2 and US3 both touch `smart-chips.ts`. Do US2 first so the unpinning in US3 is tested against the new demotion logic.

## Complexity Tracking

No constitution violations, so nothing to record here.
