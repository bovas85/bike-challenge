---
name: control-bike-challenge
description:
  Use the control-bike-challenge CLI for every check of the running Nuxt
  application before claiming work is ready.
---

# control-bike-challenge

Use the CLI for every check of the running app. Verify locally first.

## Commands

```sh
node tools/control-bike-challenge.mjs doctor
node tools/control-bike-challenge.mjs dev
node tools/control-bike-challenge.mjs request GET /health.json --contains '"healthy"'
node tools/control-bike-challenge.mjs browse --path / --record
node tools/control-bike-challenge.mjs map --check
node tools/control-bike-challenge.mjs health --origin https://thebikechallenge.cc --sha HEAD
```

Add `--json` to any command for machine-readable output.

## Feature Map

[`references/features.json`](references/features.json) tracks all `app/pages/`
and `server/routes/` endpoints. Run `map --check` whenever routes change.

## Proof

Before opening or finishing a PR:

1. Run `yarn verify` (`nuxt prepare`, lint, typecheck, `map --check`, coverage).
2. Run `doctor`, then `dev`.
3. Exercise changed API/HTML routes with `request --contains`.
4. For UI changes, run `yarn test:visual` (ADR 0001 desktop/mobile visual
   checks) and cite the exact commands and artifacts under **Testing** in the PR
   description.
5. After merge, verify production with `health --sha <merge-sha>`.
