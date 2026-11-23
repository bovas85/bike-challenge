import { beforeEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import handler, { resetDevLotteryEntries } from "./xmas-lottery.post";

vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return {
    ...actual,
    readBody: vi.fn(),
    setResponseStatus: vi.fn(),
  };
});

describe("POST /api/xmas-lottery", () => {
  beforeEach(() => {
    resetDevLotteryEntries();
    vi.clearAllMocks();
  });

  it("rejects missing or invalid email addresses", async () => {
    const { readBody } = await import("h3");
    vi.mocked(readBody).mockResolvedValueOnce({ email: "not-an-email" });

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("normalizes email, persists to Cloudflare KV XMAS_LOTTERY, and blocks duplicates", async () => {
    const { readBody } = await import("h3");
    const store = new Map<string, string>();
    const kv = {
      get: vi.fn(async (key: string) => store.get(key) ?? null),
      put: vi.fn(async (key: string, val: string) => {
        store.set(key, val);
      }),
    };
    const event = {
      context: { cloudflare: { env: { XMAS_LOTTERY: kv } } },
    } as unknown as H3Event;

    vi.mocked(readBody).mockResolvedValueOnce({
      email: "  Rider@Example.COM ",
    });
    const res = await handler(event);

    expect(kv.get).toHaveBeenCalledWith("entry:rider@example.com");
    expect(kv.put).toHaveBeenCalledTimes(1);
    expect(res).toMatchObject({
      ok: true,
      entry: { email: "rider@example.com" },
    });

    vi.mocked(readBody).mockResolvedValueOnce({
      email: "rider@example.com",
    });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 409 });
    expect(kv.put).toHaveBeenCalledTimes(1);
  });

  it("enforces one entry per email in local fallback mode when XMAS_LOTTERY is unbound", async () => {
    const { readBody } = await import("h3");
    const event = { context: {} } as unknown as H3Event;

    vi.mocked(readBody).mockResolvedValueOnce({ email: "Alex@Test.co.uk" });
    const first = await handler(event);
    expect(first.ok).toBe(true);
    expect(first.entry.email).toBe("alex@test.co.uk");

    vi.mocked(readBody).mockResolvedValueOnce({ email: "alex@test.co.uk" });
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 409 });
  });
});
