import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

const PROD_STAGE = "prod";
const PROD_DOMAIN = {
  name: "thebikechallenge.cc",
  aliases: ["www.thebikechallenge.cc"],
} as const;
const PROD_KV_TITLE = "bike-challenge-EventRsvps-prod";

// 1. Declare Cloudflare Resources (pinned by title on `prod` so CI adopts the same
// namespace across runs even with local state; stage-scoped on PR previews)
export const EventRsvpKV = Cloudflare.KV.Namespace(
  "EventRsvps",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    return stage === PROD_STAGE ? { title: PROD_KV_TITLE } : {};
  }),
);

// 2. Declare the Nuxt Site using native Cloudflare.Website.Nuxt with Effect.gen
export const Website = Cloudflare.Website.Nuxt(
  "BikeChallengeSite",
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const isProd = stage === PROD_STAGE;

    return {
      ...(isProd
        ? {
            domain: {
              name: PROD_DOMAIN.name,
              aliases: [...PROD_DOMAIN.aliases],
            },
          }
        : {}),
      env: {
        EVENT_RSVPS: EventRsvpKV,
        WP_API_BASE: Config.String("WP_API_BASE").pipe(Config.withDefault("")),
        WP_USE_LOCAL_FALLBACK: Config.String("WP_USE_LOCAL_FALLBACK").pipe(
          Config.withDefault("true"),
        ),
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
    // Local state + pinned `prod` KV title + `--adopt` updates prod in-place.
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return {
      url: site.url,
    };
  }),
);
