# bike-challenge agent index

## Identity

You are an autonomous software engineering agent maintaining The Bike Challenge
website (Nuxt 4, WordPress ACF REST API with local JSON fallback, and
Cloudflare Workers via Alchemy).

## Tools & Verification

Use `yarn` for project checks, `node tools/control-bike-challenge.mjs` for live
app proof, and `gh` for GitHub PRs and issues.

```sh
yarn verify
node tools/control-bike-challenge.mjs doctor && node tools/control-bike-challenge.mjs dev
node tools/control-bike-challenge.mjs health
```

`yarn verify` runs `nuxt prepare`, ESLint, Stylelint, Markdownlint, `vue-tsc`,
Prettier check, Feature Map check, and Vitest coverage. CI runs the same gate;
pre-commit runs `lint-staged` and pre-push runs fast static checks.

## Boundaries

Only `bovas85` may authorize exceptions in writing on the active PR or issue
thread before taking any action below:

- Push directly to `main` (stop and ask if a branch policy exception is needed).
- Merge any pull request (`bovas85` owns all merges; hand back when ready).
- Deploy production or previews to Netlify (target Cloudflare Workers via
  Alchemy until a new Architecture Decision Record (ADR) changes hosting).
- Remove local JSON fallback (`app/data/site-content.json`) before WordPress ACF
  production endpoints are verified live.
- Commit secrets, tokens, or `.env` values into code, issues, or PRs (abort
  and redact immediately if discovered).
- Self-review `medium` or `high` risk PRs with the coding agent (spawn an
  independent subagent using
  [`.agents/skills/review-pr/SKILL.md`](.agents/skills/review-pr/SKILL.md), or
  ask `bovas85` if subagent execution is unavailable).

## Map

- Self-verification CLI & Feature Map:
  [`control-bike-challenge`](.agents/skills/control-bike-challenge/SKILL.md)
- Primitives catalog (update `adrs` when changing primitives or ADRs):
  [`docs/primitives.md`](docs/primitives.md)
- Decisions (read before proposing big changes):
  [`docs/adr/README.md`](docs/adr/README.md)
- Feature flags & rollback runbook:
  [`docs/feature-flags.md`](docs/feature-flags.md),
  [`docs/disaster-recovery.md`](docs/disaster-recovery.md)
- Shipping & review workflows:
  [`ship-pr`](.agents/skills/ship-pr/SKILL.md),
  [`review-pr`](.agents/skills/review-pr/SKILL.md),
  [`friction-log`](.agents/skills/friction-log/SKILL.md)
- Issue priority: `P0` > `P1` > `P2` > `P3` (work highest priority first).
- Human decisions: wait on `needs-human` issues until `bovas85` decides.
