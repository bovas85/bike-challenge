import { useAsyncData, useRuntimeConfig } from "#app";
import Config from "~/assets/config";
import fallbackContent from "~/data/site-content.json";
import type {
  BlogPageACF,
  EventPageACF,
  HomePageACF,
  OffersPageACF,
  SiteContentBundle,
  SiteGlobalACF,
  WpPageResponse,
} from "~/types/acf";

const bundle = fallbackContent as SiteContentBundle;

async function fetchWpOrFallback<T>(
  wpPath: string,
  fallbackValue: T,
  extract: (payload: unknown) => T | undefined,
): Promise<T> {
  const runtimeConfig = useRuntimeConfig();
  const wpBase = String(runtimeConfig.public.wpApiBase || "").replace(
    /\/$/,
    "",
  );
  const allowFallback = runtimeConfig.public.wpUseLocalFallback !== false;

  if (!wpBase) {
    return fallbackValue;
  }

  try {
    const fetchFn =
      (typeof globalThis !== "undefined" &&
        (globalThis as Record<string, unknown>).$fetch) ||
      $fetch;
    const response = await (fetchFn as typeof $fetch)<unknown>(
      `${wpBase}${wpPath}`,
      { timeout: 5000 },
    );
    const extracted = extract(response);
    if (extracted !== undefined) {
      return extracted;
    }
  } catch (err) {
    if (!allowFallback) {
      throw err;
    }
  }

  return fallbackValue;
}

function extractAcfFromPageList<T>(payload: unknown): T | undefined {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0] as Partial<WpPageResponse<T>>;
    if (first && typeof first === "object" && first.acf) {
      return first.acf;
    }
  }
  if (payload && typeof payload === "object" && "acf" in payload) {
    return (payload as WpPageResponse<T>).acf;
  }
  return undefined;
}

export function useGlobalContent() {
  return useAsyncData<SiteGlobalACF>(
    "siteGlobal",
    () =>
      fetchWpOrFallback<SiteGlobalACF>(
        Config.api.globalOptions,
        bundle.global,
        (payload) =>
          payload && typeof payload === "object" && "acf" in payload
            ? ((payload as { acf: SiteGlobalACF }).acf ?? undefined)
            : (payload as SiteGlobalACF | undefined),
      ),
    {
      default: () => bundle.global,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}

export function useHomeContent() {
  return useAsyncData<HomePageACF>(
    "homePage",
    () =>
      fetchWpOrFallback<HomePageACF>(
        Config.api.homePage,
        bundle.home,
        extractAcfFromPageList<HomePageACF>,
      ),
    {
      default: () => bundle.home,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}

export function useOffersContent() {
  return useAsyncData<OffersPageACF>(
    "offersPage",
    () =>
      fetchWpOrFallback<OffersPageACF>(
        Config.api.offersPage,
        bundle.offers,
        extractAcfFromPageList<OffersPageACF>,
      ),
    {
      default: () => bundle.offers,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}

export function useBlogContent() {
  return useAsyncData<BlogPageACF>(
    "blogPage",
    () =>
      fetchWpOrFallback<BlogPageACF>(
        Config.api.blogPage,
        bundle.blog,
        extractAcfFromPageList<BlogPageACF>,
      ),
    {
      default: () => bundle.blog,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}

export function useEventContent() {
  return useAsyncData<EventPageACF>(
    "eventPage",
    () =>
      fetchWpOrFallback<EventPageACF>(
        Config.api.eventPage,
        bundle.event,
        extractAcfFromPageList<EventPageACF>,
      ),
    {
      default: () => bundle.event,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}
