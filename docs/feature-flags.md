# Feature Flags Inventory

All runtime feature flags live in [`nuxt.config.ts`](../nuxt.config.ts) under
`runtimeConfig.public` and default to enabled unless explicitly overridden via
environment variables.

## Metrics Policy

No automated telemetry SDK is active (`metrics: none`). Changes are evaluated via
`/health.json` and Playwright visual/CI checks.

## Active Flags

| Flag                  | Env Override            | Owner     | Metric | Removal Condition                                                      |
| :-------------------- | :---------------------- | :-------- | :----- | :--------------------------------------------------------------------- |
| `wpUseLocalFallback`  | `WP_USE_LOCAL_FALLBACK` | `bovas85` | `none` | Keep until WordPress ACF endpoints are live and verified in prod.      |
| `enableWpApiProxy`    | `ENABLE_WP_API_PROXY`   | `bovas85` | `none` | Keep until WordPress enforces explicit CORS & bypasses `/wp-json` CDN. |
| `enableYoutubeFacade` | `ENABLE_YOUTUBE_FACADE` | `bovas85` | `none` | Permanent performance optimization for YouTube video spotlight facade. |
| `enableScrollReveal`  | `ENABLE_SCROLL_REVEAL`  | `bovas85` | `none` | Remove or keep permanent after Scrollama desktop/mobile QA.            |

## Cleanup Protocol

When a temporary rollout flag meets its removal condition, file a
`chore(cleanup):` issue using
[`.github/ISSUE_TEMPLATE/cleanup.yml`](../.github/ISSUE_TEMPLATE/cleanup.yml)
so `legacy-reaper` can remove the flag and fallback branch.
