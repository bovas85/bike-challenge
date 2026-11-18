# The Bike Challenge

Nuxt 4 rebuild of [bike-challenge.framer.ai](https://bike-challenge.framer.ai/),
modeled on the `nunziellasalluce.com` architecture: WordPress ACF REST API
integration with local JSON fallback, Cloudflare Workers deployment via
Alchemy & Effect (`thebikechallenge.cc`), and full autopilot CI/verification
workflows.

## Architecture

- **Frontend:** Nuxt 4, Vue 3, TypeScript, SCSS (`app/pages/`,
  `app/components/`).
- **CMS & Fallback:** WordPress ACF REST API client
  ([`app/composables/useSiteContent.ts`](app/composables/useSiteContent.ts))
  with local JSON fallback
  ([`app/data/site-content.json`](app/data/site-content.json)). Set
  `WP_API_BASE` in `.env` or Cloudflare vars when WordPress ACF endpoints are
  ready.
- **Infrastructure-as-Effects (Alchemy + Effect):** Cloudflare Workers +
  `EventRsvps` KV namespace + custom domains (`thebikechallenge.cc` and
  `www.thebikechallenge.cc`) declared via `Effect.gen` in
  [`alchemy.run.ts`](alchemy.run.ts).
- **Verification & Autopilot:** `yarn verify`,
  `tools/control-bike-challenge.mjs`, and `yarn test:visual`.

## Quick Start

```sh
yarn install --ignore-engines
yarn dev
```

## Cloudflare Deployment (Alchemy + Effect)

Production (`thebikechallenge.cc`) and PR previews are deployed to Cloudflare
Workers via Alchemy (`.github/workflows/deploy-cloudflare.yml`):

```sh
# deploy an isolated preview stage via Alchemy
yarn alchemy deploy --yes

# deploy production to thebikechallenge.cc & www.thebikechallenge.cc
yarn alchemy deploy --stage prod --adopt --yes
```

## Verification Gate

```sh
yarn verify
node tools/control-bike-challenge.mjs doctor
node tools/control-bike-challenge.mjs dev
yarn test:visual
```
