# Disaster Recovery Runbook: bike-challenge

This runbook outlines standard operating procedures for diagnosing production
incidents, rolling back faulty releases, and restoring service for
`thebikechallenge.cc`.

## 1. System Architecture

- **Hosting Platform:** Cloudflare Workers via Alchemy & Effect
  (`Cloudflare.Website.Nuxt` — `BikeChallengeSite`)
- **Custom Domains:** `thebikechallenge.cc` and `www.thebikechallenge.cc`
- **State & Data:** Cloudflare KV Namespace (`EventRsvps`, pinned as
  `bike-challenge-EventRsvps-prod` on `prod`) + WordPress ACF REST API with
  local `app/data/site-content.json` fallback
- **CI/CD:** GitHub Actions (`.github/workflows/deploy-cloudflare.yml`)
  triggered on push to `main` (or manual `workflow_dispatch`)
- **Deploy Previews:** Cloudflare Workers via Alchemy (automated on PRs to
  `main` with `--stage pr-<number>`, pinned to `bike-challenge-pr-<number>` and
  `bike-challenge-EventRsvps-pr-<number>` so pushes update in-place, and cleaned
  up automatically on PR close via `tools/cleanup-cloudflare-previews.mjs`)
- **Health Verification:** `/health` (HTML dashboard) and `/health.json`
  (JSON probe)

## 2. Verification & Rollback

### Option A: Instant Rollback via Cloudflare Dashboard

1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** ->
   **`bike-challenge-bikechallengesite-prod-7r5ar6ulzvxpbjdn`** (the Alchemy
   `BikeChallengeSite` `prod` stage Worker serving `thebikechallenge.cc`).
3. Select the **Deployments** tab.
4. Locate the last known-good deployment (verified commit SHA).
5. Click the three dots menu (**...**) next to the target deployment and select
   **Rollback to this deployment**.

### Option B: Manual CLI Redeploy via Alchemy

If GitHub Actions is unavailable or degraded:

1. Checkout the last known-good commit locally:

   ```sh
   git fetch origin
   git checkout <GOOD_COMMIT_SHA>
   yarn install --ignore-engines
   ```

2. Deploy directly via Alchemy to production:

   ```sh
   CLOUDFLARE_ACCOUNT_ID="<ID>" \
   CLOUDFLARE_API_TOKEN="<TOKEN>" \
   yarn alchemy deploy --stage prod --adopt --yes
   ```

3. Run the post-deploy health and visual parity verification:

   ```sh
   node tools/verify-deploy-health.mjs --url "https://thebikechallenge.cc"
   yarn test:visual --url "https://thebikechallenge.cc"
   ```
