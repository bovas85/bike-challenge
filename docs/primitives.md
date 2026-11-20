# Primitives Catalog

Core building blocks, code roots, and active ADRs. Any PR that adds or reshapes
a primitive, or writes or supersedes an ADR, must update the matching `adrs`
list in the same PR.

## 1. Nuxt Pages & UI

- **Roots:** `app/pages/`, `app/components/`, `app/layouts/`, `app/assets/`, `app/utils/`
- **Role:** Rebuilds `bike-challenge.framer.ai` routes (`/`, `/offers`, `/blog`,
  `/event`) with matching typography, palette, and responsive layouts.
- **adrs:**
  - [`docs/adr/0001-mandatory-ui-visual-testing-and-evidence.md`](adr/0001-mandatory-ui-visual-testing-and-evidence.md)

## 2. WordPress ACF Client & Local JSON Fallback

- **Roots:** `app/assets/config.ts`, `app/composables/useSiteContent.ts`,
  `app/data/site-content.json`, `app/types/acf.ts`, `server/routes/api/wp/`
- **Role:** Fetches WordPress REST ACF payloads (directly during SSR and via
  the same-origin `/api/wp/...` Nitro proxy on client navigations when
  `WP_API_BASE` is set), with deterministic local JSON fallback
  (`site-content.json`) while CMS setup is pending.
- **adrs:**
  - [`docs/adr/0003-hosting-and-branch-boundaries.md`](adr/0003-hosting-and-branch-boundaries.md)

## 3. Event RSVP API & Cloudflare KV Storage (Alchemy)

- **Roots:** `alchemy.run.ts`, `server/routes/api/event-rsvp.post.ts`,
  `.github/workflows/deploy-cloudflare.yml`,
  `tools/cleanup-cloudflare-previews.mjs`
- **Role:** Deploys `BikeChallengeSite` and `EventRsvps` KV namespace to
  Cloudflare Workers (production + PR deploy previews).
- **adrs:**
  - [`docs/adr/0003-hosting-and-branch-boundaries.md`](adr/0003-hosting-and-branch-boundaries.md)

## 4. Health, Verification & Control CLI

- **Roots:** `server/routes/health.get.ts`, `server/routes/health.json.get.ts`,
  `server/utils/health.ts`, `tools/control-bike-challenge.mjs`,
  `tools/verify-deploy-health.mjs`, `tools/verify-visual-parity.mjs`
- **Role:** Exposes `/health` and `/health.json`, runs local verification,
  multi-viewport visual parity checks, and deployed SHA verification.
- **adrs:**
  - [`docs/adr/0001-mandatory-ui-visual-testing-and-evidence.md`](adr/0001-mandatory-ui-visual-testing-and-evidence.md)

## 5. Autonomous Issue Triage & PR Lifecycle

- **Roots:** `.github/workflows/issue-triage.yml`,
  `.github/workflows/errors-to-issues.yml`, `.github/scripts/issue-triage.cjs`,
  `.github/ship-pr.json`, `.github/ISSUE_TEMPLATE/`, `.agents/skills/`
- **Role:** Classifies issues (`P0`–`P3`, door, complexity, `needs-human`),
  tracks friction/cleanup, and enforces subagent review + human merge.
- **adrs:**
  - [`docs/adr/0002-autonomous-monitoring-and-triage-for-agent-ready-pull-requests.md`](adr/0002-autonomous-monitoring-and-triage-for-agent-ready-pull-requests.md)
  - [`docs/adr/0003-hosting-and-branch-boundaries.md`](adr/0003-hosting-and-branch-boundaries.md)
