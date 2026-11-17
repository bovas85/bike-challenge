# The Bike Challenge

Nuxt 4 rebuild of [bike-challenge.framer.ai](https://bike-challenge.framer.ai/),
modeled on the `nunziellasalluce.com` architecture: WordPress ACF REST API
integration with local JSON fallback, Cloudflare Workers deployment via
Alchemy, and full autopilot CI/verification workflows.

## Architecture

- **Frontend:** Nuxt 4, Vue 3, TypeScript, SCSS (`app/pages/`,
  `app/components/`).
- **CMS & Fallback:** WordPress ACF REST API client
  ([`app/composables/useSiteContent.ts`](app/composables/useSiteContent.ts))
  with local JSON fallback
  ([`app/data/site-content.json`](app/data/site-content.json)). Set
  `WP_API_BASE` in `.env` or Cloudflare vars when WordPress ACF endpoints are
  ready.
- **Hosting:** Cloudflare Workers + `EventRsvps` KV namespace via
  [`alchemy.run.ts`](alchemy.run.ts).
- **Verification & Autopilot:** `yarn verify`, `tools/control-bike-challenge.mjs`,
  and `yarn test:visual`.

## Quick Start

```sh
yarn install --ignore-engines
yarn dev
```

## Verification Gate

```sh
yarn verify
node tools/control-bike-challenge.mjs doctor
node tools/control-bike-challenge.mjs dev
yarn test:visual
```
