# ADR 0001: Mandatory Visual Testing and Media Evidence for User Interface Changes

- **Status:** Accepted
- **Date:** 2026-11-17
- **Deciders:** Repository Maintainers

## Decision

Any PR introducing or modifying user-facing UI, templates, or SCSS styles must
validate rendering across desktop (`1280x800`) and mobile (`390x844`) viewports
using Playwright (`yarn test:visual` or `control-bike-challenge.mjs browse
--record`) and attach/cite visual evidence (PNG screenshots and H.264 `.mp4`
walkthroughs).

## Revisit If

Visual regression SaaS replaces local Playwright walkthrough verification.
