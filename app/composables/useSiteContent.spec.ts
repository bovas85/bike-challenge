import { describe, expect, it } from "vitest";
import fallbackContent from "~/data/site-content.json";
import {
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
});
