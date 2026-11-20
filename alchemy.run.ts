import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const PROD_STAGE = "prod";
// Existing Cloudflare Worker serving thebikechallenge.cc & www.thebikechallenge.cc.
// Pinning this name and zone routes on the `prod` stage updates production in-place.
const PROD_WORKER_NAME =
  "bike-challenge-bikechallengesite-prod-7r5ar6ulzvxpbjdn";
const PROD_ZONE_NAME = "thebikechallenge.cc";
const PROD_ROUTES = [
  { pattern: "thebikechallenge.cc/*", zoneName: PROD_ZONE_NAME },
  { pattern: "www.thebikechallenge.cc/*", zoneName: PROD_ZONE_NAME },
] as const;
const PROD_KV_TITLE = "bike-challenge-EventRsvps-prod";

function sanitizePreviewStage(stage: string): string {
  const normalized = stage
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 38);
  return normalized || "preview";
}

// 1. Declare Cloudflare Resources (pinned by title on every stage so CI adopts and
// updates the same namespace in-place instead of leaking per-run resources)
export const EventRsvpKV = Cloudflare.KV.Namespace(
  "EventRsvps",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    return {
      title:
        stage === PROD_STAGE
          ? PROD_KV_TITLE
          : `bike-challenge-EventRsvps-${sanitizePreviewStage(stage)}`,
    };
  }),
);

// 2. Declare the Nuxt Site using native Cloudflare.Website.Nuxt with Effect.gen
export const Website = Cloudflare.Website.Nuxt(
  "BikeChallengeSite",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const isProd = stage === PROD_STAGE;
    const workerName = isProd
      ? PROD_WORKER_NAME
      : `bike-challenge-${sanitizePreviewStage(stage)}`;

    return {
      name: workerName,
      ...(isProd ? { routes: [...PROD_ROUTES] } : {}),
      env: {
        EVENT_RSVPS: EventRsvpKV,
        WP_API_BASE: Config.String("WP_API_BASE").pipe(Config.withDefault("")),
        WP_USE_LOCAL_FALLBACK: Config.String("WP_USE_LOCAL_FALLBACK").pipe(
          Config.withDefault("true"),
        ),
        NUXT_PUBLIC_ENABLE_WP_API_PROXY: Config.String(
          "ENABLE_WP_API_PROXY",
        ).pipe(Config.withDefault("true")),
        WP_API_SECRET: Config.Redacted("WP_API_SECRET").pipe(
          Config.withDefault(Redacted.make("")),
        ),
      },
    };
  }),
);

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

// 3. Define the Alchemy Stack
export default Alchemy.Stack(
  "bike-challenge",
  {
    providers: Cloudflare.providers(),
    // Note: Cloudflare.state() requires `Secrets Store: Edit` on CLOUDFLARE_API_TOKEN.
    // Local state + pinned stage Worker name / KV title + `--adopt` updates in-place.
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return {
      url: site.url,
    };
  }),
);
