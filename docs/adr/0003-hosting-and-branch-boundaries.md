# ADR 0003: Hosting, Fallback CMS, and Branch Boundaries

- **Status:** Accepted
- **Date:** 2026-11-17
- **Deciders:** Repository Maintainers

## Decision

Agents and automated workflows must never:

1. **Push directly to `main`:** All changes land through feature branches and
   pull requests.
2. **Merge any PR autonomously:** Even `low`-risk PRs require `bovas85` approval.
3. **Deploy to Netlify:** Production and previews run on Cloudflare Workers via
   Alchemy.
4. **Drop local JSON fallback prematurely:** Keep `app/data/site-content.json`
   until WordPress ACF endpoints are live and verified.
5. **Self-review `medium` or `high` PRs:** Always spawn an independent
   `review-pr` subagent.

## Revisit If

WordPress ACF endpoints are live in production and `bovas85` approves removing
local fallback data or changing hosting.
