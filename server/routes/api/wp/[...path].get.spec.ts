import { afterEach, describe, expect, it, vi } from "vitest";
import type { H3Event } from "h3";
import handler from "./[...path].get";

vi.mock("h3", async () => {
  const actual = await vi.importActual<typeof import("h3")>("h3");
  return {
    ...actual,
    getQuery: vi.fn(() => ({})),
    getRouterParam: vi.fn(),
    setResponseHeader: vi.fn(),
  };
});

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      wpApiBase: "https://bike.moustachedesign.fyi/wp-json",
    },
  })),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GET /api/wp/[...path]", () => {
  it("rejects non-allowlisted WordPress endpoints with 404", async () => {
    const { getRouterParam } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("wp/v2/users");

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects traversal paths with 404", async () => {
    const { getRouterParam } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("../wp-config.php");

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("returns 503 when WordPress API base is unconfigured", async () => {
    const { getRouterParam } = await import("h3");
    const { useRuntimeConfig } = await import("nitropack/runtime");
    vi.mocked(getRouterParam).mockReturnValueOnce("acf/v3/options/options");
    vi.mocked(useRuntimeConfig).mockReturnValueOnce({
      public: { wpApiBase: "" },
    } as never);

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 503 });
  });

  it("proxies acf/v3/options/options with default _fields=acf and no-store cache headers", async () => {
    const { getRouterParam, getQuery, setResponseHeader } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("/acf/v3/options/options/");
    vi.mocked(getQuery).mockReturnValueOnce({});

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ acf: { brandTitle: "The Bike Challenge" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handler({ context: {} } as unknown as H3Event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "https://bike.moustachedesign.fyi/wp-json/acf/v3/options/options?_fields=acf",
    );
    expect(setResponseHeader).toHaveBeenCalledWith(
      expect.anything(),
      "cache-control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    expect(result).toEqual({ acf: { brandTitle: "The Bike Challenge" } });
  });

  it("proxies wp/v2/pages with sanitized query params and cloudflare env fallback", async () => {
    const { getRouterParam, getQuery } = await import("h3");
    const { useRuntimeConfig } = await import("nitropack/runtime");
    vi.mocked(getRouterParam).mockReturnValueOnce("wp/v2/pages");
    vi.mocked(getQuery).mockReturnValueOnce({
      slug: "offers",
      _fields: "id,slug,title,acf",
      acf_format: "standard",
      extra: "ignored",
    });
    vi.mocked(useRuntimeConfig).mockReturnValueOnce({
      public: { wpApiBase: "" },
    } as never);

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 33, slug: "offers", acf: {} }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await handler({
      context: {
        cloudflare: {
          env: { WP_API_BASE: "https://cms.example.com/wp-json/" },
        },
      },
    } as unknown as H3Event);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "https://cms.example.com/wp-json/wp/v2/pages?slug=offers&_fields=id%2Cslug%2Ctitle%2Cacf&acf_format=standard",
    );
    expect(result).toEqual([{ id: 33, slug: "offers", acf: {} }]);
  });

  it("rejects invalid slug query parameter with 400", async () => {
    const { getRouterParam, getQuery } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("wp/v2/pages");
    vi.mocked(getQuery).mockReturnValueOnce({ slug: "bad/slug?x=1" });

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("surfaces upstream HTTP error status codes cleanly", async () => {
    const { getRouterParam, getQuery } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("wp/v2/pages");
    vi.mocked(getQuery).mockReturnValueOnce({ slug: "home" });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 504,
      }),
    );

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 504 });
  });

  it("returns 404 when enableWpApiProxy is explicitly disabled", async () => {
    const { getRouterParam } = await import("h3");
    const { useRuntimeConfig } = await import("nitropack/runtime");
    vi.mocked(getRouterParam).mockReturnValueOnce("acf/v3/options/options");
    vi.mocked(useRuntimeConfig).mockReturnValueOnce({
      public: {
        wpApiBase: "https://bike.moustachedesign.fyi/wp-json",
        enableWpApiProxy: false,
      },
    } as never);

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("rejects invalid _fields query parameter with 400", async () => {
    const { getRouterParam, getQuery } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("wp/v2/pages");
    vi.mocked(getQuery).mockReturnValueOnce({ _fields: "id;drop" });

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("maps network fetch failures to 502", async () => {
    const { getRouterParam, getQuery } = await import("h3");
    vi.mocked(getRouterParam).mockReturnValueOnce("acf/v3/options/options");
    vi.mocked(getQuery).mockReturnValueOnce({});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("connect ECONNREFUSED")),
    );

    await expect(
      handler({ context: {} } as unknown as H3Event),
    ).rejects.toMatchObject({ statusCode: 502 });
  });
});
