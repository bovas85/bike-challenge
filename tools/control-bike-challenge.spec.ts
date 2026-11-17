import { describe, expect, it } from "vitest";
import {
  discoverRoutes,
  parseCliArgs,
  validateFeatureMap,
  verifyHealthPayload,
} from "./control-bike-challenge.mjs";

describe("control-bike-challenge", () => {
  it("parses positional commands and boolean/value flags", () => {
    const parsed = parseCliArgs([
      "browse",
      "--path",
      "/offers",
      "--record",
      "--mobile",
      "--json",
    ]);
    expect(parsed.command).toBe("browse");
    expect(parsed.flags.path).toBe("/offers");
    expect(parsed.flags.record).toBe(true);
    expect(parsed.flags.mobile).toBe(true);
    expect(parsed.flags.json).toBe(true);
  });

  it("discovers app/pages and server/routes and validates features.json", () => {
    const routes = discoverRoutes();
    expect(routes).toContain("/");
    expect(routes).toContain("/offers");
    expect(routes).toContain("/blog");
    expect(routes).toContain("/event");
    expect(routes).toContain("/health");
    expect(routes).toContain("/health.json");
    expect(routes).toContain("/api/event-rsvp");

    const validation = validateFeatureMap();
    expect(validation.ok).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("verifies healthy payload and rejects unhealthy payload", () => {
    expect(
      verifyHealthPayload(
        { ok: true, status: "healthy", commitSha: "abc1234" },
        "abc1234",
      ).ok,
    ).toBe(true);
    expect(
      verifyHealthPayload({ ok: false, status: "unhealthy" }, "abc1234").ok,
    ).toBe(false);
  });
});
