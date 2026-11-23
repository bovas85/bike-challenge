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
  XmasLotteryPageACF,
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
  const useSameOriginProxy =
    import.meta.client && runtimeConfig.public.enableWpApiProxy !== false;

  if (!wpBase) {
    return fallbackValue;
  }

  const targetUrl = useSameOriginProxy
    ? `/api/wp${wpPath}`
    : `${wpBase}${wpPath}`;

  try {
    const fetchFn =
      (typeof globalThis !== "undefined" &&
        (globalThis as Record<string, unknown>).$fetch) ||
      $fetch;
    const response = await (fetchFn as typeof $fetch)<unknown>(targetUrl, {
      timeout: 6500,
    });
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

function isNonEmptyRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

function extractAcfFromPageList<T>(payload: unknown): T | undefined {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0] as Partial<WpPageResponse<T>>;
    if (first && typeof first === "object" && isNonEmptyRecord(first.acf)) {
      return first.acf;
    }
  }
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "acf" in payload
  ) {
    const candidate = (payload as WpPageResponse<T>).acf;
    if (isNonEmptyRecord(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

export function normalizeGlobalAcf(
  payload: unknown,
): SiteGlobalACF | undefined {
  const raw =
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "acf" in payload
      ? (payload as { acf: unknown }).acf
      : payload;

  if (!isNonEmptyRecord(raw)) {
    return undefined;
  }

  const candidate = raw as Partial<SiteGlobalACF>;
  return {
    brandTitle: candidate.brandTitle || bundle.global.brandTitle,
    logoUrl:
      typeof candidate.logoUrl === "string" && candidate.logoUrl
        ? candidate.logoUrl
        : bundle.global.logoUrl,
    email: candidate.email || bundle.global.email,
    blogEmail: candidate.blogEmail || bundle.global.blogEmail,
    copyright: candidate.copyright || bundle.global.copyright,
    heroNavLinks:
      Array.isArray(candidate.heroNavLinks) && candidate.heroNavLinks.length > 0
        ? candidate.heroNavLinks
        : bundle.global.heroNavLinks,
    socialLinks:
      Array.isArray(candidate.socialLinks) && candidate.socialLinks.length > 0
        ? candidate.socialLinks.map((item) => {
            const fallbackIconUrl = bundle.global.socialLinks.find(
              (fallback) => fallback.name === item.name,
            )?.iconUrl;
            return {
              ...item,
              iconUrl:
                typeof item.iconUrl === "string" && item.iconUrl
                  ? item.iconUrl
                  : fallbackIconUrl,
            };
          })
        : bundle.global.socialLinks,
  };
}

export function normalizeHomeAcf(payload: unknown): HomePageACF | undefined {
  const raw = extractAcfFromPageList<Partial<HomePageACF>>(payload);
  if (!raw) {
    return undefined;
  }

  const rawHero = isNonEmptyRecord(raw.hero) ? raw.hero : undefined;
  const hasValidHeroImage = Boolean(rawHero?.backgroundImage?.url);
  const rawCarousel = Array.isArray(raw.viewFromBars?.carouselImages)
    ? raw.viewFromBars.carouselImages
        .map((entry) => {
          const unwrapped =
            entry && typeof entry === "object" && "image" in entry
              ? (entry as { image?: { url?: string; alt?: string } }).image
              : entry;
          return unwrapped && typeof unwrapped.url === "string" && unwrapped.url
            ? {
                url: unwrapped.url,
                alt: typeof unwrapped.alt === "string" ? unwrapped.alt : "",
              }
            : null;
        })
        .filter((img): img is { url: string; alt: string } => img !== null)
    : [];

  return {
    hero: hasValidHeroImage
      ? {
          title: rawHero?.title || bundle.home.hero.title,
          subtitle: rawHero?.subtitle || bundle.home.hero.subtitle,
          backgroundImage: rawHero!.backgroundImage!,
          scrollDownText:
            rawHero?.scrollDownText || bundle.home.hero.scrollDownText,
        }
      : {
          ...bundle.home.hero,
          title: rawHero?.title || bundle.home.hero.title,
          subtitle: rawHero?.subtitle || bundle.home.hero.subtitle,
          scrollDownText:
            rawHero?.scrollDownText || bundle.home.hero.scrollDownText,
        },
    joinJourney: isNonEmptyRecord(raw.joinJourney)
      ? { ...bundle.home.joinJourney, ...raw.joinJourney }
      : bundle.home.joinJourney,
    quote: isNonEmptyRecord(raw.quote)
      ? { ...bundle.home.quote, ...raw.quote }
      : bundle.home.quote,
    viewFromBars: isNonEmptyRecord(raw.viewFromBars)
      ? {
          ...bundle.home.viewFromBars,
          ...raw.viewFromBars,
          carouselImages:
            rawCarousel.length > 0
              ? rawCarousel
              : bundle.home.viewFromBars.carouselImages,
        }
      : bundle.home.viewFromBars,
    adventures:
      Array.isArray(raw.adventures) && raw.adventures.length > 0
        ? raw.adventures
        : bundle.home.adventures,
    videoSpotlight: isNonEmptyRecord(raw.videoSpotlight)
      ? { ...bundle.home.videoSpotlight, ...raw.videoSpotlight }
      : bundle.home.videoSpotlight,
    blogPreview: isNonEmptyRecord(raw.blogPreview)
      ? { ...bundle.home.blogPreview, ...raw.blogPreview }
      : bundle.home.blogPreview,
    campsitesMap: isNonEmptyRecord(raw.campsitesMap)
      ? { ...bundle.home.campsitesMap, ...raw.campsitesMap }
      : bundle.home.campsitesMap,
    partnersSection: isNonEmptyRecord(raw.partnersSection)
      ? {
          ...bundle.home.partnersSection,
          ...raw.partnersSection,
          logos:
            Array.isArray(raw.partnersSection.logos) &&
            raw.partnersSection.logos.length > 0
              ? raw.partnersSection.logos
              : bundle.home.partnersSection.logos,
        }
      : bundle.home.partnersSection,
  };
}

export function normalizeOffersAcf(
  payload: unknown,
): OffersPageACF | undefined {
  const raw = extractAcfFromPageList<Partial<OffersPageACF>>(payload);
  if (!raw) {
    return undefined;
  }

  const offers = Array.isArray(raw.offers)
    ? raw.offers.map((offer, index) => {
        const fallbackOffer =
          bundle.offers.offers.find((item) => item.id === offer.id) ||
          bundle.offers.offers[index];
        return {
          ...offer,
          image: offer.image?.url
            ? offer.image
            : fallbackOffer?.image || { url: "", alt: offer.brand || "" },
          overlayLogoUrl:
            typeof offer.overlayLogoUrl === "string" && offer.overlayLogoUrl
              ? offer.overlayLogoUrl
              : undefined,
          codeUrl:
            typeof offer.codeUrl === "string" && offer.codeUrl
              ? offer.codeUrl
              : undefined,
        };
      })
    : [];

  return {
    brandHeader: raw.brandHeader || bundle.offers.brandHeader,
    subtitle: raw.subtitle || bundle.offers.subtitle,
    disclosureNote: raw.disclosureNote || bundle.offers.disclosureNote,
    offers: offers.length > 0 ? offers : bundle.offers.offers,
  };
}

export function normalizeBlogAcf(payload: unknown): BlogPageACF | undefined {
  const raw = extractAcfFromPageList<Partial<BlogPageACF>>(payload);
  if (!raw) {
    return undefined;
  }

  const articles = Array.isArray(raw.articles)
    ? raw.articles.map((article, index) => {
        const fallbackArticle =
          bundle.blog.articles.find((item) => item.id === article.id) ||
          bundle.blog.articles[index];
        return {
          ...article,
          image: article.image?.url
            ? article.image
            : fallbackArticle?.image || { url: "", alt: article.title || "" },
        };
      })
    : [];

  return {
    brandHeader: raw.brandHeader || bundle.blog.brandHeader,
    heading: raw.heading || bundle.blog.heading,
    subtitle: raw.subtitle || bundle.blog.subtitle,
    articles: articles.length > 0 ? articles : bundle.blog.articles,
  };
}

export function normalizeEventAcf(payload: unknown): EventPageACF | undefined {
  const raw = extractAcfFromPageList<
    Partial<Omit<EventPageACF, "paragraphs">> & {
      paragraphs?: Array<string | { text?: string }>;
    }
  >(payload);
  if (!raw) {
    return undefined;
  }

  const normalizedParagraphs = Array.isArray(raw.paragraphs)
    ? raw.paragraphs
        .map((item) =>
          typeof item === "string"
            ? item
            : item && typeof item === "object" && typeof item.text === "string"
              ? item.text
              : "",
        )
        .filter((text) => text.length > 0)
    : [];

  return {
    brandHeader: raw.brandHeader || bundle.event.brandHeader,
    title: raw.title || bundle.event.title,
    paragraphs:
      normalizedParagraphs.length > 0
        ? normalizedParagraphs
        : bundle.event.paragraphs,
    details:
      Array.isArray(raw.details) && raw.details.length > 0
        ? raw.details
        : bundle.event.details,
    closingNote: raw.closingNote || bundle.event.closingNote,
    posterImage: raw.posterImage?.url
      ? raw.posterImage
      : bundle.event.posterImage,
    form: isNonEmptyRecord(raw.form)
      ? { ...bundle.event.form, ...raw.form }
      : bundle.event.form,
  };
}

export function normalizeXmasLotteryAcf(
  payload: unknown,
): XmasLotteryPageACF | undefined {
  const raw = extractAcfFromPageList<Partial<XmasLotteryPageACF>>(payload);
  if (!raw) {
    return undefined;
  }

  return {
    brandHeader: raw.brandHeader || bundle.xmasLottery.brandHeader,
    title: raw.title || bundle.xmasLottery.title,
    subtitle: raw.subtitle || bundle.xmasLottery.subtitle,
    intro: raw.intro || bundle.xmasLottery.intro,
    joinButtonLabel: raw.joinButtonLabel || bundle.xmasLottery.joinButtonLabel,
    prizesHeading: raw.prizesHeading || bundle.xmasLottery.prizesHeading,
    prizesSubtitle: raw.prizesSubtitle || bundle.xmasLottery.prizesSubtitle,
    prizes:
      Array.isArray(raw.prizes) && raw.prizes.length > 0
        ? raw.prizes
        : bundle.xmasLottery.prizes,
    howItWorksHeading:
      raw.howItWorksHeading || bundle.xmasLottery.howItWorksHeading,
    steps:
      Array.isArray(raw.steps) && raw.steps.length > 0
        ? raw.steps
        : bundle.xmasLottery.steps,
    rulesNote: raw.rulesNote || bundle.xmasLottery.rulesNote,
    modal: isNonEmptyRecord(raw.modal)
      ? {
          ...bundle.xmasLottery.modal,
          ...Object.fromEntries(
            Object.entries(raw.modal).filter(
              ([, v]) => typeof v === "string" && v.length > 0,
            ),
          ),
        }
      : bundle.xmasLottery.modal,
  };
}

export function useGlobalContent() {
  return useAsyncData<SiteGlobalACF>(
    "siteGlobal",
    () =>
      fetchWpOrFallback<SiteGlobalACF>(
        Config.api.globalOptions,
        bundle.global,
        normalizeGlobalAcf,
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
        normalizeHomeAcf,
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
        normalizeOffersAcf,
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
        normalizeBlogAcf,
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
        normalizeEventAcf,
      ),
    {
      default: () => bundle.event,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}

export function useXmasLotteryContent() {
  return useAsyncData<XmasLotteryPageACF>(
    "xmasLotteryPage",
    () =>
      fetchWpOrFallback<XmasLotteryPageACF>(
        Config.api.xmasLotteryPage,
        bundle.xmasLottery,
        normalizeXmasLotteryAcf,
      ),
    {
      default: () => bundle.xmasLottery,
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      },
    },
  );
}
