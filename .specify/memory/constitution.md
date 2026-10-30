# Veðurkort Weather Card Constitution

## Core Principles

### I. Configuration Backward Compatibility (NON-NEGOTIABLE)

- Any card configuration that was valid in a released version MUST keep loading and rendering
  equivalently in later versions.
- Renamed or replaced options MUST migrate on load in `src/config.ts` (as with
  `animated_background` → `background`, `alerts_entity` → `alerts_entities`). The legacy key is
  marked `@deprecated` and stays supported.
- Removing support for a legacy key, or changing the meaning of an existing key, is a breaking
  change. It requires a MAJOR release and a migration note in the docs.
- Every migration MUST have a unit test that covers the legacy input.

Rationale: users' dashboards are stored YAML/JSON we cannot edit. A silent break shows up as a
broken card on someone's wall display.

### II. Visual Editor Parity

- Every user-facing option MUST be configurable from the visual editor (`src/editor.ts`).
  YAML-only options are not allowed.
- New options MUST have a sensible default so a card added from the picker works without
  further configuration.
- Option names, defaults and allowed values MUST be documented in
  `docs/02-configuration.md` in the same PR that adds them.

Rationale: the README promises "configure everything in the UI, no YAML required".

### III. Graceful Degradation & Opt-In Integrations

- The card MUST render usefully with only a Home Assistant `weather.*` entity. Missing
  attributes, unsupported forecast types or failed forecast subscriptions MUST degrade to
  hidden or placeholder content, never to a thrown error or a blank card.
- Companion integrations (CAP Alerts, MeteoAlarm, Pollen, and any future ones) MUST be optional
  and off unless configured or discovered. They MUST NOT be required at install or build time.
- Integration-specific data MUST pass through an adapter or resolver module (for example
  `src/weather/adapter.ts`, `src/alerts/adapters`, `src/pollen/resolve.ts`) so that rendering
  code depends on the card's own types, not on upstream entity shapes.

Rationale: weather providers expose very different attribute sets, and upstream integrations
change independently of this card.

### IV. Testable Pure Logic

- Data shaping, calculations and models (scales, arcs, series, formatting, config parsing,
  discovery) MUST live in pure TypeScript modules separate from Lit rendering.
- Each such module MUST have a colocated `*.test.ts` Vitest file. New logic and bug fixes MUST
  add or update tests that would fail without the change.
- Rendering components SHOULD stay thin and delegate decisions to these tested modules.

Rationale: a Lovelace card is hard to test end-to-end. Keeping logic pure keeps it testable in
CI with jsdom.

### V. Localized & Accessible UI

- All user-visible strings produced by the card MUST go through `src/localize.ts`. New strings
  MUST be added to every supported locale (`en`, `nl`, `is`). English is the required fallback.
- Text supplied by Home Assistant or upstream sources (condition states, alert text, API error
  messages) is passed through, not translated.
- Animations (icons, backgrounds, charts) MUST respect `prefers-reduced-motion` and the card's
  own animation settings.
- Dialogs and detail sheets MUST be keyboard-operable, trap focus while open and restore focus
  on close. Interactive elements MUST have accessible names.

Rationale: the card ships in several languages and runs on shared household displays used by
everyone in the home.

## Distribution & Security Constraints

- **Stack**: TypeScript in `strict` mode, Lit for components, Chart.js for charts, Vite producing
  a single ES2022 module. New runtime dependencies MUST be justified in the PR and kept to a
  minimum, because everything is bundled into the file users download.
- **Bundle integrity**: `dist/vedurkort-weather-card.js` is the release artifact HACS installs.
  It is committed, and it MUST exactly match `npm run build` output for the committed `src/`.
- **Assets & licensing**: icons and other bundled assets MUST be under an MIT-compatible license
  and credited in `NOTICE` / `docs/08-credits.md`.
- **Security**: the card MUST NOT make network requests beyond the Home Assistant connection it
  is given. `.innerHTML` is allowed only for bundled icon SVGs and for upstream text that has
  passed through a sanitizer (for example `sanitizeAlertHtml`). CI workflows MUST use the
  least `permissions` they need, and third-party actions SHOULD be pinned.
- **Compatibility**: Home Assistant 2023.9+ is the supported baseline. Features that need a newer
  version MUST detect it and degrade (Principle III).

## Development Workflow & Quality Gates

- All changes reach `main` through pull requests. Direct pushes to `main` are not allowed.
- A PR that changes `src/` MUST include the rebuilt `dist/` bundle (see `CONTRIBUTING.md`).
- A PR is mergeable only when CI passes: `npm run build` (including `tsc --noEmit`), the
  `dist/` diff check, `npm test`, and HACS validation.
- User-facing changes MUST update the relevant `docs/` page and README feature list, and add
  screenshots in `images/` when the appearance changes noticeably.
- Releases are tagged from `main` only after the merged commit contains an up-to-date `dist/`.
  Existing tags are never moved; a bad release is fixed with a new patch version.
- Spec Kit artifacts (spec, plan, tasks) MUST include a constitution check, and any
  intentional deviation MUST be recorded with its justification in the plan.

## Governance

- This constitution takes precedence over other project conventions. Where `CONTRIBUTING.md`,
  `SECURITY.md` or docs conflict with it, the constitution wins until those files are updated.
- Amendments are made through a pull request that edits this file, explains the change, and
  updates any affected docs or templates in the same PR.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR
  for adding a principle or section or materially expanding guidance, PATCH for clarifications
  and wording.
- Reviewers MUST check PRs against these principles. Any exception MUST be justified in the PR
  description and kept as small as possible.

**Version**: 1.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
