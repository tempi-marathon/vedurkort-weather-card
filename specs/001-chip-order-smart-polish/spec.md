# Feature Specification: Chip Ordering & Smart Chip Polish

**Feature Branch**: `smart-chips-editor-polish`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "All chips normal should be sortable by the user in the editor. Smart sun and moon chips, only show when it's near change, eg hour before sunset/rise. Moon, not sure how. Right now they're taking up space on the smart bar. Line/row on smart chips flip (video `.bloom/attachments/pMsZdk/ScreenRecording_10-26-2026 17-25-42_1.mp4`). Editing existing card (from before last static background change) is set to value off, should be animated if the previous value was true."

## Clarifications

### Session 2026-10-30

- Q: When the row is too narrow for both the last noteworthy chip and "More" on one line, which layout should the row settle on? → A: Single line: the least important chip moves into More, and More stays on line 1.
- Q: When the sun or moon chip is in the main row because an event is near, where should it rank among the other noteworthy chips? → A: The sun leads the row while near. The moon ranks low and is the first to move into More.
- Q: In the editor, should the chip order be set in the existing list of chip on/off switches, or in a separate "Chip order" list? → A: One list. Each chip row has its on/off switch and drag/up/down controls, and turned-off chips keep their place.
- Q: (Post-implementation feedback) When the noteworthy chips are turned off, should the row stay empty apart from More? → A: No. The row fills spare room with the next chips in the user's order, and only what doesn't fit goes into More.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editor keeps the animated background of older cards (Priority: P1)

A user set up the card before background modes (off / static / animated) existed and turned on the
old "animated background" switch. The card still shows the animated background on the dashboard. When they
open the visual editor, the Background option shows **Off**. If they change any other setting and save, the card loses its
animated background without them asking for that.

**Why this priority**: This bug silently changes the look of existing dashboards. It breaks the
project's backward-compatibility rule, and every affected user hits it as soon as they edit the card.

**Independent Test**: Load a card config that has only the legacy animated-background flag set to
true, open the editor, and check that Background shows "Animated". Change an unrelated option and
check that the saved config keeps the animated background.

**Acceptance Scenarios**:

1. **Given** a saved card with the legacy animated-background flag set to true and no background mode, **When** the user opens the visual editor, **Then** the Background option shows "Animated".
2. **Given** the same card, **When** the user changes any unrelated option and saves, **Then** the card still shows the animated background, and the saved config stores the "animated" background mode.
3. **Given** a saved card with the legacy flag set to false or missing, **When** the user opens the editor, **Then** Background shows "Off".
4. **Given** a saved card with both an explicit background mode and the legacy flag, **When** the user opens the editor, **Then** the explicit background mode is shown and kept.

---

### User Story 2 - Smart chip row stops flipping (Priority: P1)

With smart chips on, the row of detail chips and the "More" control switch back and forth
between two layouts while nothing changes. In the recording (stills taken at 13:17:35 and 13:17:43),
the row shows sun 17:26, moon "Waning gibbous" and 1.4 mm. The wind chip (4 Bft · S) keeps
switching between two states. In one, it sits on a second line together with "More". In the
other, it is moved into More, and More fits on the first line. Each switch also changes the
card's height. The row should settle into one stable layout.

**Why this priority**: Visible flicker on an always-on wall display looks broken and distracts
users. It is a regression in an existing feature.

**Independent Test**: Show the card with smart chips on at the width shown in the recording,
and at widths near the point where More wraps. Watch it for at least 30 seconds without changing
the data. Check that the chip layout changes no more than once after the first render.

**Acceptance Scenarios**:

1. **Given** smart chips are on and the data does not change, **When** the card renders at any fixed width, **Then** the chip row settles within 1 second and then stays the same.
2. **Given** the layout in the recording (sun, moon, 1.4 mm and wind do not all fit on one line with More), **When** the row settles, **Then** wind is in the More menu and More is on the first line (as in the 13:17:43 still).
3. **Given** the row has settled, **When** the card width changes, **Then** the row reflows once to a new stable layout and does not keep switching between two layouts.
4. **Given** the row has settled, **When** a chip value changes enough to move it into or out of the main row, **Then** the row updates once and stays stable.

---

### User Story 3 - Sun and moon chips appear only near a change (Priority: P2)

With smart chips on, the sun and moon chips are always shown in the main row, so they take space
from chips that matter more right now. The user wants the sun chip in the main row only when
sunrise or sunset is coming soon (for example, within the hour before it). The moon chip should
work the same way. It goes in the main row only within a day of a major phase (new moon, first
quarter, full moon or last quarter). At other times both
are quiet chips: they only use spare room on the row, and go into More when the row is full.

**Why this priority**: This frees space in the smart row so it shows what is relevant now. It
builds on the existing smart-chip behavior and has no data risk.

**Independent Test**: With smart chips on and both chips enabled, set the time to 30 minutes
before sunset and check that the sun chip is in the main row. Then set it to 4 hours before
sunset and check that the sun chip is in More. For the moon, check that the chip is in the main row
12 hours before a full moon and in More 3 days after it.

**Acceptance Scenarios**:

1. **Given** smart chips are on and the sun chip is enabled, **When** the next sunrise or sunset is 60 minutes away or less, **Then** the sun chip is shown in the main row.
2. **Given** smart chips are on and the sun chip is enabled, **When** the next sunrise or sunset is more than 60 minutes away, **Then** the sun chip is a quiet chip: it only appears on the row if there is spare room after the noteworthy chips, and is otherwise in the More menu.
3. **Given** smart chips are on and the moon chip is enabled, **When** the current time is within 24 hours of a new moon, first quarter, full moon or last quarter, **Then** the moon chip is noteworthy. Otherwise it is a quiet chip that only uses spare room.
4. **Given** smart chips are off, **When** the card renders, **Then** the sun and moon chips appear exactly as they do today, wherever they are enabled.
5. **Given** the sun chip is noteworthy, **When** the row renders, **Then** the sun chip is the first chip in the row.
6. **Given** the moon chip is noteworthy and the row is short on space, **When** the row settles, **Then** the moon chip is the first to move into More.

---

### User Story 4 - User sets the order of detail chips in the editor (Priority: P3)

A user wants the detail chips (sun, moon, wind, humidity, UV, pressure, and so on) to appear in an
order they choose, such as wind first, then precipitation, then sun. In the visual editor they can
reorder the chips, and the card shows them in that order.

**Why this priority**: This is a nice-to-have personalization. The card works well without it,
and it is the largest change in this feature.

**Independent Test**: In the editor, move the wind chip to the first position and save. Check
that the card shows wind as the first chip when smart chips are off.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the user moves a chip to a new position in the chip list (the same list that holds each chip's on/off switch), **Then** the preview and saved card show chips in the new order.
2. **Given** a card saved before this feature (with no custom order), **When** it loads, **Then** chips appear in the current default order, unchanged.
3. **Given** a custom order is saved, **When** the user turns a chip off and back on, **Then** the chip goes back to its saved position.
4. **Given** smart chips are on, **When** chips go to the More menu, **Then** the More menu lists them in the user's custom order. The main row is still sorted by importance first, and the custom order breaks ties.
5. **Given** the user uses only a keyboard, **When** they reorder chips in the editor, **Then** they can move each chip up or down without a mouse, and each reorder control has an accessible name.
6. **Given** a custom order is saved, **When** the user picks "reset to default order", **Then** the chips go back to the default order.

---

### Edge Cases

- A saved custom order lists chips that do not exist (from a future or older version) or leaves out some chips. Unknown entries are ignored. Missing chips are added at the end in default order.
- A saved custom order contains the same chip twice. Only the first occurrence counts.
- Sunrise or sunset does not happen today (polar day or polar night). The sun chip never meets the "near change" rule and stays in More.
- No sun data is available. With smart chips on, the sun chip is not noteworthy and goes into More. With smart chips off it shows "—" as it does today.
- The time is exactly at sunrise or sunset. The window ends at the event. Just after the event, the chip moves to More until the next event is within 60 minutes.
- The card is left open across the 60-minute boundary. The sun chip moves into or out of the main row on its own, within a minute of the boundary, with no reload needed.
- A legacy config sets the legacy flag to true and also has an invalid background value. The legacy flag wins, so the background is animated.
- The user turns on reduced motion and the card has an animated background from migration. The existing reduced-motion handling still applies.

## Requirements *(mandatory)*

### Functional Requirements

**Background migration in the editor**

- **FR-001**: The visual editor MUST show the background mode that the card actually uses. A config that has only the legacy animated-background flag set to true MUST show as "Animated".
- **FR-002**: When the editor saves a config that had the legacy flag, it MUST save the migrated background mode, so the card looks the same before and after the edit.
- **FR-003**: An explicit background mode MUST always take priority over the legacy flag, in both the card and the editor.

**Smart row stability**

- **FR-004**: With smart chips on, the chip row and the More control MUST settle on one layout within 1 second of first render, and again within 1 second of any width or data change. They MUST NOT then switch between layouts until the width or data changes again.
- **FR-005a**: When the last noteworthy chip and More do not both fit on the current line, the least important chip MUST move into More so More stays on that line. More MUST NOT be the only item on a new line. A chip moved into More MUST NOT come back to the row unless there is room for both it and More. The card height MUST stay the same once the row has settled.

**Sun and moon in smart mode**

- **FR-006**: With smart chips on, the sun chip MUST be noteworthy (shown in the main row) only when the next sunrise or sunset is 60 minutes away or less. At other times it MUST be treated as a quiet chip (FR-010a).
- **FR-007**: With smart chips on, the moon chip MUST be noteworthy only within 24 hours (before or after) of a major lunar phase: new moon, first quarter, full moon or last quarter. At other times it MUST be treated as a quiet chip (FR-010a).
- **FR-008**: A noteworthy sun chip MUST rank first in the main row, ahead of all weather chips. A noteworthy moon chip MUST rank below every other noteworthy chip, so it is the first to move into More when space runs out. Neither chip is shown in the row unless it is noteworthy. The sun chip is the last chip to be moved into More.
- **FR-009**: The noteworthy status of sun and moon chips MUST update as time passes while the card is open, within 1 minute of the threshold, with no reload or data update needed.
- **FR-010**: With smart chips off, sun and moon chip behavior MUST stay the same as today.
- **FR-010a**: With smart chips on, spare room on the single row MUST be filled with the remaining enabled chips (quiet chips, including sun and moon when not near a change) in the user's order, after all noteworthy chips. Quiet chips MUST NOT push out a noteworthy chip. If the user turns off the chips that were in the row, the next chips from More MUST move up into the row as far as space allows; the row MUST NOT show only "More" while chips are waiting in it.

**User chip order**

- **FR-011**: The visual editor MUST show the detail chips as one list, where each row has the chip's on/off switch and controls to reorder it by dragging or with move up and move down (keyboard operable). The list MUST include turned-off chips, which keep their position. There MUST NOT be a separate chip-order list. Exception: Pollen is turned on in its own section together with its device. Its row in the list has the reorder controls only, and appears only when pollen is turned on.
- **FR-012**: With smart chips off, the card MUST show enabled chips in the user's order.
- **FR-013**: With smart chips on, the More menu MUST list chips in the user's order, and the main row MUST use the user's order to break ties between chips of equal importance.
- **FR-014**: Cards without a saved custom order MUST show chips in the current default order.
- **FR-015**: The editor MUST offer a way to reset the order to the default.
- **FR-016**: A saved order MUST be cleaned on load. Unknown chips are dropped, duplicates are removed, and missing chips are added at the end in default order.
- **FR-017**: The new order option MUST be documented in the configuration docs, can be set in YAML, and any new editor text MUST be translated into all supported languages.

### Key Entities

- **Chip order**: An optional ordered list of detail-chip IDs saved in the card config. When it is missing, the default order is used.
- **Background mode**: The existing off / static / animated setting. It replaces the legacy animated-background flag.
- **Near-change window**: The time around an event when a chip counts as noteworthy in smart mode. For the sun, it is the 60 minutes before sunrise or sunset. For the moon, it is the 24 hours before and after a major phase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of legacy configs with the animated-background flag set to true show "Animated" in the editor and keep the animated background after any unrelated edit is saved.
- **SC-002**: At every tested width from 280 px to 800 px in 10 px steps, the smart chip row settles within 1 second and shows 0 layout changes over the next 30 seconds with fixed data.
- **SC-003**: With smart chips on, the sun chip never takes the place of a noteworthy chip for at least 22 of 24 hours on a normal day (outside the two 60-minute windows); it only uses spare room then. The moon chip takes no space in the main row on roughly 21 of 29.5 days per lunar month.
- **SC-004**: A user can move any chip to a new position in the editor in under 10 seconds, using pointer or keyboard only.
- **SC-005**: Existing cards with no custom order show the same chip order as before the update (0 visual changes when smart chips are off).

## Assumptions

- "All chips normal" means the detail chips in the current-weather row, and the custom order fully controls their order when smart chips are off.
- The sun's "near change" window is the 60 minutes before the next sunrise or sunset, which matches the user's example. This duration is fixed and not configurable for now.
- When sun or moon chips are not near a change, they are quiet chips: they fill spare room on the row in the user's order, or sit in More. They are never hidden completely.
- The "row flip" is the demote/undemote oscillation shown in the user's two stills from the recording. The user confirmed this.
- The moon's ±24-hour window around a major phase was chosen by the user. Near those dates, the moon chip appears in the main row about 4 times per lunar month.
- The background fix is limited to the editor showing and saving the migrated value. Dashboard rendering of legacy configs already migrates correctly.
- The chip order option is optional and has no effect when it is missing, so it is backward compatible under the project constitution.
