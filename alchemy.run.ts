import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

// 1. Declare Cloudflare Resources (KV namespace for event RSVP submissions)
export const EventRsvpKV = Cloudflare.KV.Namespace("EventRsvps");

// 2. Declare the Nuxt Site using native Cloudflare.Website.Nuxt
export const Website = Cloudflare.Website.Nuxt("BikeChallengeSite", {
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
});

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

// 3. Define the Alchemy Stack
export default Alchemy.Stack(
  "bike-challenge",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return {
      url: site.url,
    };
  }),
);
