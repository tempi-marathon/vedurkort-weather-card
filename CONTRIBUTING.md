# Contributing

## Pull requests

Open a pull request for changes to `main`. Do not push feature work directly to `main`.

## Rebuild `dist/` with source changes

HACS installs the prebuilt bundle at `dist/vedurkort-weather-card.js`. That file is committed in this repository and must stay in sync with `src/`.

**Any PR that changes `src/` must also include the rebuilt bundle:**

```bash
npm install
npm run build
git add dist/vedurkort-weather-card.js
```

CI runs `npm run build` and fails if `dist/vedurkort-weather-card.js` does not match the build output.

Docs-only or workflow-only changes that do not touch `src/` do not require a `dist/` update.

## Releases

Tag releases from `main` only after the merged commit includes an up-to-date `dist/`. If a release was tagged without a rebuilt bundle, publish a new patch version rather than moving an existing tag.
