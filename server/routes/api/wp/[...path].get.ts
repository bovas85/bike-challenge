import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  setResponseHeader,
} from "h3";
import { useRuntimeConfig } from "nitropack/runtime";

const ALLOWED_WP_PATHS = new Set(["acf/v3/options/options", "wp/v2/pages"]);
const UPSTREAM_TIMEOUT_MS = 5000;

function readQueryString(
  query: Record<string, unknown>,
  key: string,
): string | undefined {
  const raw = query[key];
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.trim() : String(value).trim();
}

export default defineEventHandler(async (event) => {
  const rawPath = String(getRouterParam(event, "path") || "");
  const normalizedPath = rawPath.replace(/^\/+|\/+$/g, "");

  if (!ALLOWED_WP_PATHS.has(normalizedPath)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Unsupported WordPress API endpoint",
    });
  }

  const runtimeConfig = useRuntimeConfig(event);
  if (runtimeConfig?.public?.enableWpApiProxy === false) {
    throw createError({
      statusCode: 404,
      statusMessage: "WordPress API proxy is disabled",
    });
  }

  const cfEnv = (
    event.context as {
      cloudflare?: {
        env?: {
          WP_API_BASE?: string;
        };
      };
    }
  )?.cloudflare?.env;

  const wpBase = String(
    runtimeConfig?.public?.wpApiBase || cfEnv?.WP_API_BASE || "",
  )
    .trim()
    .replace(/\/+$/, "");

  if (!wpBase) {
    throw createError({
      statusCode: 503,
      statusMessage: "WordPress API base is not configured",
    });
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(`${wpBase}/${normalizedPath}`);
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Invalid WordPress API base URL",
    });
  }

  if (upstreamUrl.protocol !== "https:" && upstreamUrl.protocol !== "http:") {
    throw createError({
      statusCode: 500,
      statusMessage: "Invalid WordPress API protocol",
    });
  }

  const query = getQuery(event) as Record<string, unknown>;

  if (normalizedPath === "wp/v2/pages") {
    const slug = readQueryString(query, "slug");
    if (slug !== undefined) {
      if (!/^[a-z0-9-]+$/i.test(slug)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid page slug parameter",
        });
      }
      upstreamUrl.searchParams.set("slug", slug);
    }

    const fields = readQueryString(query, "_fields");
    if (fields !== undefined) {
      if (!/^[a-z0-9_,]+$/i.test(fields)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid _fields parameter",
        });
      }
      upstreamUrl.searchParams.set("_fields", fields);
    }

    const acfFormat = readQueryString(query, "acf_format");
    if (acfFormat !== undefined) {
      if (!/^[a-z0-9_-]+$/i.test(acfFormat)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid acf_format parameter",
        });
      }
      upstreamUrl.searchParams.set("acf_format", acfFormat);
    }
  } else {
    const fields = readQueryString(query, "_fields");
    if (fields !== undefined && !/^[a-z0-9_,]+$/i.test(fields)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid _fields parameter",
      });
    }
    // Keep a query parameter on options so Hostinger CDN serves DYNAMIC rather than cached HITs.
    upstreamUrl.searchParams.set("_fields", fields || "acf");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!upstreamResponse.ok) {
      throw createError({
        statusCode: upstreamResponse.status,
        statusMessage: "WordPress API upstream error",
      });
    }

    const payload = (await upstreamResponse.json()) as unknown;

    setResponseHeader(
      event,
      "cache-control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    setResponseHeader(event, "pragma", "no-cache");

    return payload;
  } catch (err) {
    if (err && typeof err === "object" && "statusCode" in err) {
      throw err;
    }
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to reach WordPress API",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
