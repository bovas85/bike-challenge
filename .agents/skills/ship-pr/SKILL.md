---
name: ship-pr
description:
  Shepherd a pull request through verification, independent subagent review, and
  human handoff. Never merges without explicit bovas85 approval.
---

# Ship PR

1. Fill [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md)
   completely (Intent, Door, Cleanup, Why, Testing, System recap). If the PR
   changes primitives or ADRs, update [`docs/primitives.md`](../../../docs/primitives.md).
2. Run `yarn verify` and local `control-bike-challenge` proof (`doctor`, `dev`,
   `request --contains`, `browse --record` / `yarn test:visual` for UI). For any
   UI change (ADR 0001), commit desktop (`1280x800`) and mobile (`390x844`) PNG
   screenshots plus an H.264 `.mp4` walkthrough under `.github/assets/` and
   embed them in the PR description.
3. For `medium` and `high` risk PRs, spawn an **independent** review subagent
   following [`.agents/skills/review-pr/SKILL.md`](../review-pr/SKILL.md). Never
   let the agent that wrote the code review its own `medium`/`high` PR.
4. Run the deterministic ship-pr loop:

   ```sh
   npx kcd-skills@latest autopilot ship-pr <pr-number> --risk <low|medium|high> --json
   ```

5. Act on the single next step returned until `ship-pr` reports `parked` /
   `ready-for-human` / `done`. **Never** merge without explicit `bovas85`
   approval.
6. Once `bovas85` merges, confirm the live version:

   ```sh
   node tools/control-bike-challenge.mjs health --origin https://thebikechallenge.cc --sha <merge-sha>
   ```
