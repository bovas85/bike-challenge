import { afterEach, describe, expect, it, vi } from "vitest";
import { sendDiscordNotification } from "./verify-deploy-health.mjs";

const sampleData = {
  url: "https://thebikechallenge.cc",
  status: "healthy",
  commitSha: "59a17be000000000000000000000000000000000",
  commit: {
    message: "chore: test deploy",
    url: "https://github.com/bovas85/bike-challenge/commit/59a17be",
  },
  deploy: {
    deployedAt: "2026-11-24T09:00:00.000Z",
  },
};

describe("verify-deploy-health sendDiscordNotification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips dispatch when DISCORD_WEBHOOK_URL is empty or whitespace", async () => {
    const fetchMock = vi.fn();
    expect(
      await sendDiscordNotification(sampleData, true, fetchMock, "   \n "),
    ).toEqual({ ok: true, skipped: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("trims surrounding whitespace before posting and returns ok on 2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
    });

    const result = await sendDiscordNotification(
      sampleData,
      true,
      fetchMock,
      "  https://discord.com/api/webhooks/123/abc \n",
    );

    expect(result).toEqual({ ok: true, status: 204 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://discord.com/api/webhooks/123/abc",
    );
  });

  it("fails without calling fetch when DISCORD_WEBHOOK_URL is malformed or non-HTTP", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn();

    const invalidResult = await sendDiscordNotification(
      sampleData,
      true,
      fetchMock,
      "not-a-url",
    );
    expect(invalidResult.ok).toBe(false);
    expect(invalidResult.error).toMatch(/Invalid DISCORD_WEBHOOK_URL/);

    const badSchemeResult = await sendDiscordNotification(
      sampleData,
      true,
      fetchMock,
      "ftp://discord.com/api/webhooks/123/abc",
    );
    expect(badSchemeResult.ok).toBe(false);
    expect(badSchemeResult.error).toMatch(/protocol/);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it("checks res.ok and returns failure details on non-2xx responses", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: async () => '{"message":"Invalid Webhook Token"}',
    });

    const result = await sendDiscordNotification(
      sampleData,
      false,
      fetchMock,
      "https://discord.com/api/webhooks/123/bad",
    );

    expect(result).toEqual({
      ok: false,
      status: 400,
      error:
        'Discord webhook returned HTTP 400 Bad Request: {"message":"Invalid Webhook Token"}',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
