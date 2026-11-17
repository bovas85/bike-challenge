import { describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import handler from "./event-rsvp.post";

vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return {
    ...actual,
    readBody: vi.fn(),
    setResponseStatus: vi.fn(),
  };
});

describe("POST /api/event-rsvp", () => {
  it("rejects missing or invalid email", async () => {
    const { readBody } = await import("h3");
    vi.mocked(readBody).mockResolvedValueOnce({ name: "Alex", email: "bad" });

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("persists RSVP to Cloudflare KV when EVENT_RSVPS binding is present", async () => {
    const { readBody } = await import("h3");
    vi.mocked(readBody).mockResolvedValueOnce({
      name: "Jane Smith",
      email: "jane.smith@gmail.com",
    });
    const put = vi.fn().mockResolvedValueOnce(undefined);

    const res = await handler({
      context: { cloudflare: { env: { EVENT_RSVPS: { put } } } },
    } as unknown as H3Event);

    expect(put).toHaveBeenCalledTimes(1);
    expect(res).toEqual({
      ok: true,
      message: "RSVP received",
      rsvp: { name: "Jane Smith", email: "jane.smith@gmail.com" },
    });
  });
});
