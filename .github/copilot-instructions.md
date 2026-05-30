# Copilot instructions — ha-vertical-blinds-card

> Canonical standards live in the `dev-standards` repo on SOUNDWAVE/Gitea.
> Read by Copilot chat **and** inline suggestions.

## What this repo is

A **Home Assistant Lovelace card** (HACS frontend/plugin type) — a vertical
blinds control card. **TypeScript**, rollup-built from `src/` into `dist/`. Not a
`custom_components/` integration.

## Repo shape

- `src/` — `vertical-blinds-card.ts` (card), `editor.ts` (visual config editor),
  `types.ts`.
- `dist/` — rollup **build output** (`vertical-blinds-card.js` + `.map` + `types/`).
- `rollup.config.js`, `tsconfig.json`, `package.json` (+ lock), `hacs.json`.
- `.github/workflows/` — `build.yml` + `validate.yml` (HACS validation).

## Conventions

- HACS **plugin** (frontend), so **no `manifest.json`/`hassfest`/pytest** — the HA
  component pipeline does NOT apply.
- **Edit `src/*.ts`, then rebuild — never hand-edit `dist/`** (it's generated; the
  `.js` + `.d.ts` + maps all come from rollup + tsc).
- JS deps via npm; commit `package-lock.json`. CI builds on push.
- Bump `version` in `package.json` + `hacs.json` for releases (HACS consumes the
  release/tag).

## Never

- Don't hand-edit `dist/`. Don't commit secrets.
