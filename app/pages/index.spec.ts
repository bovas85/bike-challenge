import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import fallbackContent from "~/data/site-content.json";
import HomePage from "./index.vue";

const { home } = fallbackContent;
const globalContent = fallbackContent.global;
const collapse = (value: string) => value.replace(/\s+/g, " ").trim();

describe("HomePage (/)", () => {
  it("renders all ten sections in production order", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const main = wrapper.find("main.home-page");
    expect(main.exists()).toBe(true);

    const order = Array.from(main.element.children).map(
      (el) => el.id || el.className.split(" ")[0],
    );
    expect(order).toEqual([
      "hero",
      "content",
      "quote",
      "view-bars",
      "strava",
      "videos",
      "shapes-band",
      "blog",
      "map",
      "partners",
    ]);
  });

  it("renders the hero with background, display title, subtitle and nav links", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const hero = wrapper.find("header.hero");
    const bg = hero.find("img.hero__bg");
    expect(bg.attributes("src")).toBe(home.hero.backgroundImage.url);
    expect(bg.attributes("alt")).toBe(home.hero.backgroundImage.alt);
    expect(hero.find(".hero__overlay").exists()).toBe(true);

    const title = hero.find("h1.bc-display-title");
    expect(title.text()).toBe(home.hero.title);
    expect(collapse(hero.find(".hero__subtitle").text())).toBe(
      collapse(home.hero.subtitle),
    );

    const links = hero.findAll("a.hero__nav-link");
    expect(links.map((link) => link.text())).toEqual(
      globalContent.heroNavLinks.map((link) => link.label),
    );
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/#strava",
      "/#videos",
      "/#blog",
      "/offers",
    ]);
  });

  it("renders the rotating SCROLL DOWN badge linking to #content", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const badge = wrapper.find("a.hero__scroll");
    expect(badge.attributes("href")).toBe("/#content");
    expect(badge.attributes("aria-label")).toBe(
      home.hero.scrollDownText.trim(),
    );
    expect(badge.find("svg textPath").text()).toBe(
      home.hero.scrollDownText.trim(),
    );
    expect(wrapper.find("#content").exists()).toBe(true);
  });

  it("renders Join the Journey on amber", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section#content");
    expect(section.classes()).toContain("join-journey");
    expect(section.find("h2").text()).toBe(home.joinJourney.heading);
    expect(section.find("p").text()).toBe(home.joinJourney.body);
  });

  it("renders the Lael Wilcox quote with the Join Our Club button", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section.quote");
    expect(collapse(section.find("h2").text())).toBe(collapse(home.quote.text));
    expect(section.find("h3").text()).toBe(home.quote.author);

    const cta = section.find("a.bc-btn--amber");
    expect(cta.text()).toBe(home.quote.ctaLabel);
    expect(cta.attributes("href")).toBe(home.quote.ctaUrl);
    expect(cta.attributes("target")).toBe("_blank");
    expect(cta.attributes("rel")).toBe("noopener noreferrer");
  });

  it("renders The View From the Bars copy, Instagram button and 4-photo carousel", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section.view-bars");
    expect(collapse(section.find("h2").text())).toBe(
      collapse(home.viewFromBars.heading),
    );
    expect(section.find("p.view-bars__body").text()).toBe(
      home.viewFromBars.body,
    );

    const cta = section.find("a.bc-btn--white");
    expect(cta.text()).toBe(home.viewFromBars.ctaLabel);
    expect(cta.attributes("href")).toBe(home.viewFromBars.ctaUrl);

    const slides = section.findAll("img.view-bars__slide");
    expect(slides).toHaveLength(4);
    home.viewFromBars.carouselImages.forEach((image, index) => {
      expect(slides[index]!.attributes("src")).toBe(image.url);
      expect(slides[index]!.attributes("alt")).toBe(image.alt);
    });
  });

  it("advances and rewinds the carousel with the prev/next buttons", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const track = wrapper.find(".view-bars__track");
    const next = wrapper.find("button.view-bars__arrow--next");
    const prev = wrapper.find("button.view-bars__arrow--prev");

    expect(track.attributes("style")).toContain("translateX(-0%)");

    await next.trigger("click");
    expect(track.attributes("style")).toContain("translateX(-100%)");

    await next.trigger("click");
    await next.trigger("click");
    expect(track.attributes("style")).toContain("translateX(-300%)");

    // wraps around at the end
    await next.trigger("click");
    expect(track.attributes("style")).toContain("translateX(-0%)");

    // and backwards from the start
    await prev.trigger("click");
    expect(track.attributes("style")).toContain("translateX(-300%)");
  });

  it("renders the Komoot and Strava adventure cards with doodles", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section#strava");
    const cards = section.findAll("a.adventures__card");
    expect(cards).toHaveLength(2);

    home.adventures.forEach((adventure, index) => {
      const card = cards[index]!;
      expect(card.attributes("href")).toBe(adventure.url);
      expect(card.attributes("target")).toBe("_blank");
      expect(card.attributes("rel")).toBe("noopener noreferrer");
      expect(card.attributes("data-platform")).toBe(adventure.platform);
      expect(card.find("p").text()).toBe(adventure.title);
      expect(card.findAll("svg path")).toHaveLength(2);
    });
  });

  it("swaps the YouTube thumbnail for an autoplay iframe on click", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section#videos");
    expect(collapse(section.find("h2").text())).toBe(
      collapse(home.videoSpotlight.heading),
    );
    expect(section.find("p.video-spotlight__body").text()).toBe(
      home.videoSpotlight.body,
    );

    const cta = section.find("a.bc-btn--white");
    expect(cta.text()).toBe(home.videoSpotlight.ctaLabel);
    expect(cta.attributes("href")).toBe(home.videoSpotlight.ctaUrl);

    const thumbnail = section.find("img.video-spotlight__thumbnail");
    expect(thumbnail.attributes("src")).toBe(home.videoSpotlight.thumbnailUrl);
    expect(section.find("iframe").exists()).toBe(false);

    await section.find("button.video-spotlight__play").trigger("click");

    const iframe = section.find("iframe.video-spotlight__iframe");
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes("src")).toBe(
      `https://www.youtube.com/embed/${home.videoSpotlight.youtubeId}?autoplay=1`,
    );
    expect(iframe.attributes("allowfullscreen")).toBeDefined();
    expect(section.find("img.video-spotlight__thumbnail").exists()).toBe(false);
    expect(section.find("button.video-spotlight__play").exists()).toBe(false);
  });

  it("renders the decorative Shapes band with three rotated doodles", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const shapes = wrapper.findAll(".shapes-band__shape");
    expect(shapes).toHaveLength(3);
    expect(shapes.map((shape) => shape.attributes("style"))).toEqual([
      expect.stringContaining("rotate(10deg)"),
      expect.stringContaining("rotate(-20deg)"),
      expect.stringContaining("rotate(25deg)"),
    ]);
    shapes.forEach((shape) => {
      expect(shape.find("svg").attributes("viewBox")).toBe("0 0 200 200");
    });
  });

  it("renders only the featured blog articles with Gravel Union CTAs and a /blog link", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section#blog");
    expect(section.find("h2.blog-preview__heading").text()).toBe(
      home.blogPreview.heading,
    );
    expect(section.find("p.blog-preview__subtitle").text()).toBe(
      home.blogPreview.subtitle,
    );

    const featured = fallbackContent.blog.articles.filter(
      (article) => article.featuredOnHome === true,
    );
    expect(featured).toHaveLength(2);

    const cards = section.findAll("article.blog-preview__card");
    expect(cards).toHaveLength(2);

    featured.forEach((article, index) => {
      const card = cards[index]!;
      const imageLink = card.find("a.blog-preview__image-link");
      expect(imageLink.attributes("href")).toBe(article.url);
      expect(imageLink.attributes("target")).toBe("_blank");

      const img = card.find("img.blog-preview__image");
      expect(img.attributes("src")).toBe(article.image.url);
      expect(img.attributes("alt")).toBe(article.image.alt);

      expect(card.find("h3").text()).toBe(article.title.trim());
      expect(card.find("p.blog-preview__excerpt").text()).toBe(article.excerpt);

      const cta = card.find("a.blog-preview__cta");
      expect(cta.attributes("href")).toBe(article.url);
      expect(cta.attributes("rel")).toBe("noopener noreferrer");
      expect(collapse(cta.text())).toBe("Read on Gravel Union");
    });

    const goToBlog = section.find("a.blog-preview__all-cta");
    expect(goToBlog.text()).toBe(home.blogPreview.ctaLabel);
    expect(goToBlog.attributes("href")).toBe("/blog");
  });

  it("renders the Campsites Map heading and Google MyMaps iframe", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section#map");
    expect(section.find("h2").text()).toBe(home.campsitesMap.heading);

    const iframe = section.find("iframe");
    expect(iframe.attributes("src")).toBe(home.campsitesMap.embedUrl);
    expect(iframe.attributes("title")).toBe(home.campsitesMap.heading);
  });

  it("renders the Partners logo grid and See More link to /offers", async () => {
    const wrapper = await mountSuspended(HomePage, { route: "/" });

    const section = wrapper.find("section.partners");
    expect(section.find("h2").text()).toBe(home.partnersSection.heading);

    const logos = section.findAll("a.partners__logo-link");
    expect(logos).toHaveLength(6);
    home.partnersSection.logos.forEach((partner, index) => {
      const link = logos[index]!;
      expect(link.attributes("href")).toBe(partner.url);
      expect(link.attributes("target")).toBe("_blank");
      expect(link.attributes("rel")).toBe("noopener noreferrer");
      expect(link.attributes("aria-label")).toBe(partner.name);
      const img = link.find("img");
      expect(img.attributes("src")).toBe(partner.logoUrl);
      expect(img.attributes("alt")).toBe(partner.name);
    });

    const seeMore = section.find("a.partners__cta");
    expect(seeMore.text()).toBe(home.partnersSection.ctaLabel);
    expect(seeMore.attributes("href")).toBe("/offers");
  });
});
