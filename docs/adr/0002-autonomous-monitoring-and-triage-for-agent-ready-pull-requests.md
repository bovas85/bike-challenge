# ADR 0002: Autonomous Monitoring and Triage for Agent-Ready Pull Requests

- **Status:** Accepted
- **Date:** 2026-11-17
- **Deciders:** Repository Maintainers

## Decision

Agents assigned to `agent-ready` PRs remain accountable through CI checks,
deploy preview verification, and independent `review-pr` subagent review for
`medium`/`high` risk changes, handing back to `bovas85` for final approval and
merge.

## Revisit If

`bovas85` enables `autoMergeFor` for `low`-risk PRs in `.github/ship-pr.json`.
