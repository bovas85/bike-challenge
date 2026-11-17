# Disaster Recovery Runbook: bike-challenge

This runbook outlines standard operating procedures for diagnosing production
incidents, rolling back faulty releases, and verifying service restoration.

## 1. System Architecture

- **Hosting Platform:** Cloudflare Workers via Alchemy (`BikeChallengeSite`)
- **State & Data:** Cloudflare KV Namespace (`EventRsvps`) + WordPress ACF REST
  API with local `app/data/site-content.json` fallback
- **CI/CD:** GitHub Actions (`.github/workflows/deploy-cloudflare.yml`)
- **Health Verification:** `/health` and `/health.json`

## 2. Verification & Rollback

1. Inspect live health:

   ```sh
   node tools/verify-deploy-health.mjs --url "https://thebikechallenge.cc"
   ```

2. Roll back via Cloudflare Workers Deployments tab or revert commit on `main`:

   ```sh
   git revert <BROKEN_COMMIT_SHA> -m 1 && git push origin main
   ```

3. Verify visual parity after recovery:

   ```sh
   yarn test:visual --url "https://thebikechallenge.cc"
   ```
