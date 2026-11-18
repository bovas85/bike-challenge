import { describe, expect, it } from "vitest";
import fallbackContent from "~/data/site-content.json";
import {
  normalizeBlogAcf,
  normalizeEventAcf,
  normalizeGlobalAcf,
  normalizeHomeAcf,
  normalizeOffersAcf,
  useBlogContent,
  useEventContent,
  useGlobalContent,
  useHomeContent,
  useOffersContent,
} from "./useSiteContent";

describe("useSiteContent", () => {
  it("loads local fallback global content when WordPress API base is unset", async () => {
    const { data } = await useGlobalContent();
    expect(data.value.brandTitle).toBe(fallbackContent.global.brandTitle);
    expect(data.value.socialLinks).toHaveLength(4);
  });

  it("loads local fallback home content with hero, quote, video, and partners", async () => {
    const { data } = await useHomeContent();
    expect(data.value.hero.title).toBe("THE BIKE CHALLENGE");
    expect(data.value.videoSpotlight.youtubeId).toBe("bqWtHUoqeO0");
    expect(data.value.partnersSection.logos).toHaveLength(6);
  });

  it("loads local fallback offers content with all 15 partner discounts", async () => {
    const { data } = await useOffersContent();
    expect(data.value.subtitle).toBe("Gear we Trust");
    expect(data.value.offers).toHaveLength(15);
  });

  it("loads local fallback blog content with 6 Gravel Union articles", async () => {
    const { data } = await useBlogContent();
    expect(data.value.heading).toBe("Blog");
    expect(data.value.articles).toHaveLength(6);
  });

  it("loads local fallback event content for Culture Cycling Club Rideout", async () => {
    const { data } = await useEventContent();
    expect(data.value.title).toBe("Culture Cycling Club Rideout");
    expect(data.value.details).toHaveLength(5);
  });

  it("treats empty WP options acf array as unset and coerces false iconUrl to undefined", () => {
    expect(normalizeGlobalAcf({ acf: [] })).toBeUndefined();
    expect(normalizeGlobalAcf({ acf: {} })).toBeUndefined();
    const partial = normalizeGlobalAcf({
      acf: {
        brandTitle: "Custom Brand",
        socialLinks: [
          {
            name: "instagram",
            label: "Instagram",
            url: "https://instagram.com/bike.challenge",
            iconUrl: false,
          },
        ],
      },
    });
    expect(partial?.brandTitle).toBe("Custom Brand");
    expect(partial?.heroNavLinks).toEqual(fallbackContent.global.heroNavLinks);
    expect(partial?.socialLinks[0]?.iconUrl).toBeUndefined();
  });

  it("falls back hero image and subtitle when WP returns legacy hero fields", () => {
    const normalized = normalizeHomeAcf([
      {
        id: 32,
        slug: "home",
        acf: {
          hero: {
            desktop_bg: false,
            mobile_bg: false,
            title: "WP TITLE",
            description: "",
          },
          joinJourney: { heading: "Live Heading", body: "Live Body" },
        },
      },
    ]);
    expect(normalized?.hero.title).toBe("WP TITLE");
    expect(normalized?.hero.backgroundImage.url).toBe(
      fallbackContent.home.hero.backgroundImage.url,
    );
    expect(normalized?.joinJourney.heading).toBe("Live Heading");
  });

  it("normalizes ACF repeater paragraph objects into plain strings", () => {
    const normalized = normalizeEventAcf([
      {
        id: 35,
        slug: "event",
        acf: {
          title: "Rideout",
          paragraphs: [{ text: "First paragraph." }, { text: "Second." }],
        },
      },
    ]);
    expect(normalized?.paragraphs).toEqual(["First paragraph.", "Second."]);
  });

  it("normalizes false overlayLogoUrl and missing WP offer/blog images cleanly", () => {
    const offers = normalizeOffersAcf([
      {
        id: 33,
        slug: "offers",
        acf: {
          offers: [
            {
              id: "asssavers",
              brand: "AssSavers",
              discountBadge: "15%",
              description: "Desc",
              code: "TBC15",
              codeUrl: "",
              url: "https://example.com",
              image: false,
              overlayLogoUrl: false,
            },
          ],
        },
      },
    ]);
    expect(offers?.offers[0]?.image.url).toBe(
      fallbackContent.offers.offers[0]!.image.url,
    );
    expect(offers?.offers[0]?.overlayLogoUrl).toBeUndefined();
    expect(offers?.offers[0]?.codeUrl).toBeUndefined();

    const blog = normalizeBlogAcf([
      {
        id: 34,
        slug: "blog",
        acf: {
          articles: [
            {
              id: "isle-of-wight",
              title: "Island Hopping",
              excerpt: "Excerpt",
              image: { url: "https://cdn.example.com/iow.jpg", alt: "IOW" },
              url: "https://example.com",
              ctaLabel: "Read",
            },
          ],
        },
      },
    ]);
    expect(blog?.articles[0]?.image.url).toBe(
      "https://cdn.example.com/iow.jpg",
    );
  });
});
