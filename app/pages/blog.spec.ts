import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import BlogCard from "~/components/blog/BlogCard.vue";
import fallbackContent from "~/data/site-content.json";
import BlogPage from "./blog.vue";

describe("BlogPage (/blog)", () => {
  it("renders the top navigation and white hero header band", async () => {
    const wrapper = await mountSuspended(BlogPage, { route: "/blog" });

    const nav = wrapper.find("nav.site-top-nav");
    expect(nav.exists()).toBe(true);
    expect(nav.text()).toContain("Home");

    const heroTitle = wrapper.find("header.blog-hero h1");
    expect(heroTitle.exists()).toBe(true);
    expect(heroTitle.text()).toBe(fallbackContent.blog.brandHeader);
  });

  it("renders the Blog section heading, subtitle, and all 6 Gravel Union articles", async () => {
    const wrapper = await mountSuspended(BlogPage, { route: "/blog" });

    const heading = wrapper.find("#blog-heading");
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe(fallbackContent.blog.heading);

    const subtitle = wrapper.find(".blog-feed__subtitle");
    expect(subtitle.text()).toBe(fallbackContent.blog.subtitle);

    const cards = wrapper.findAll("article.blog-card");
    expect(cards).toHaveLength(6);

    fallbackContent.blog.articles.forEach((expectedArticle, index) => {
      const card = cards[index];
      expect(card).toBeDefined();

      const imageLink = card!.find("a.blog-card__image-link");
      expect(imageLink.attributes("href")).toBe(expectedArticle.url);
      expect(imageLink.attributes("target")).toBe("_blank");
      expect(imageLink.attributes("rel")).toBe("noopener noreferrer");

      const img = card!.find("img.blog-card__image");
      expect(img.attributes("src")).toBe(expectedArticle.image.url);
      expect(img.attributes("alt")).toBe(expectedArticle.image.alt);

      const readTime = card!.find(".blog-card__read-time");
      expect(readTime.exists()).toBe(true);
      expect(readTime.text()).toBe(expectedArticle.readTime);

      const title = card!.find("h3.blog-card__title");
      expect(title.text()).toBe(expectedArticle.title.trim());

      const excerpt = card!.find("p.blog-card__excerpt");
      expect(excerpt.text()).toBe(expectedArticle.excerpt);

      const cta = card!.find("a.blog-card__cta");
      expect(cta.attributes("href")).toBe(expectedArticle.url);
      expect(cta.attributes("target")).toBe("_blank");
      expect(cta.attributes("rel")).toBe("noopener noreferrer");
      expect(cta.text().replace(/\s+/g, " ").trim()).toBe(
        "Read on Gravel Union",
      );
    });
  });

  it("renders the Partners preview section with 6 partner logos and See More link to /offers", async () => {
    const wrapper = await mountSuspended(BlogPage, { route: "/blog" });

    const partnersHeading = wrapper.find("#blog-partners-heading");
    expect(partnersHeading.exists()).toBe(true);
    expect(partnersHeading.text()).toBe(
      fallbackContent.home.partnersSection.heading,
    );

    const logoLinks = wrapper.findAll("a.blog-partners__logo-link");
    expect(logoLinks).toHaveLength(6);

    fallbackContent.home.partnersSection.logos.forEach((partner, index) => {
      const link = logoLinks[index];
      expect(link).toBeDefined();
      expect(link!.attributes("href")).toBe(partner.url);
      expect(link!.attributes("target")).toBe("_blank");
      expect(link!.attributes("rel")).toBe("noopener noreferrer");
      expect(link!.attributes("aria-label")).toBe(partner.name);

      const img = link!.find("img.blog-partners__logo-img");
      expect(img.attributes("src")).toBe(partner.logoUrl);
      expect(img.attributes("alt")).toBe(partner.name);
    });

    const seeMoreLink = wrapper.find("a.blog-partners__cta");
    expect(seeMoreLink.exists()).toBe(true);
    expect(seeMoreLink.text().trim()).toBe(
      fallbackContent.home.partnersSection.ctaLabel,
    );
    expect(seeMoreLink.attributes("href")).toBe("/offers");
  });

  it("handles BlogCard optional readTime and fallback image alt gracefully", async () => {
    const wrapper = await mountSuspended(BlogCard, {
      props: {
        article: {
          id: "test-article",
          title: "Test Gravel Story",
          excerpt: "Short test excerpt.",
          image: {
            url: "/images/blog/isle-of-wight.jpg",
            alt: "",
          },
          url: "https://www.gravelunion.cc/article/test",
          ctaLabel: "Read on Gravel Union",
        },
      },
    });

    expect(wrapper.find(".blog-card__read-time").exists()).toBe(false);
    expect(wrapper.find("img.blog-card__image").attributes("alt")).toBe(
      "Test Gravel Story",
    );
  });
});
