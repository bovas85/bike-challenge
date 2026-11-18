import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import OfferCard from "~/components/offers/OfferCard.vue";
import fallbackContent from "~/data/site-content.json";
import OffersPage from "./offers.vue";

const offersContent = fallbackContent.offers;

describe("OffersPage (/offers)", () => {
  it("renders the top navigation and centered header with title and subtitle", async () => {
    const wrapper = await mountSuspended(OffersPage, { route: "/offers" });

    const nav = wrapper.find("nav.site-top-nav");
    expect(nav.exists()).toBe(true);
    expect(nav.text()).toContain("Home");

    expect(wrapper.find("header.offers-hero h1").text()).toBe(
      offersContent.brandHeader,
    );
    expect(wrapper.find("header.offers-hero h2").text()).toBe(
      offersContent.subtitle,
    );
  });

  it("renders all 15 offer cards in order with brand, description and badge", async () => {
    const wrapper = await mountSuspended(OffersPage, { route: "/offers" });

    const cards = wrapper.findAll("article.offer-card");
    expect(offersContent.offers).toHaveLength(15);
    expect(cards).toHaveLength(15);

    offersContent.offers.forEach((offer, index) => {
      const card = cards[index];
      expect(card).toBeDefined();
      expect(card!.attributes("data-offer-id")).toBe(offer.id);
      expect(card!.find("h3.offer-card__title").text()).toBe(offer.brand);

      const description = card!.find("p.offer-card__description");
      if (offer.description) {
        expect(description.text()).toBe(offer.description);
      } else {
        expect(description.exists()).toBe(false);
      }

      const badge = card!.find(".offer-card__badge");
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe(offer.discountBadge);

      const img = card!.find("img.offer-card__image");
      expect(img.attributes("src")).toBe(offer.image.url);
      expect(img.attributes("alt")).toBe(offer.image.alt || offer.brand);
    });
  });

  it("links the image and brand to the offer URL as external links", async () => {
    const wrapper = await mountSuspended(OffersPage, { route: "/offers" });
    const cards = wrapper.findAll("article.offer-card");

    offersContent.offers.forEach((offer, index) => {
      const card = cards[index]!;
      const mediaLink = card.find("a.offer-card__media");
      const titleLink = card.find("a.offer-card__title-link");

      [mediaLink, titleLink].forEach((link) => {
        expect(link.attributes("href")).toBe(offer.url);
        expect(link.attributes("target")).toBe("_blank");
        expect(link.attributes("rel")).toBe("noopener noreferrer");
      });
    });
  });

  it("renders overlay logos only for offers that define one", async () => {
    const wrapper = await mountSuspended(OffersPage, { route: "/offers" });
    const cards = wrapper.findAll("article.offer-card");

    offersContent.offers.forEach((offer, index) => {
      const logo = cards[index]!.find("img.offer-card__overlay-logo");
      const overlayLogoUrl = (offer as { overlayLogoUrl?: string })
        .overlayLogoUrl;
      if (overlayLogoUrl) {
        expect(logo.exists()).toBe(true);
        expect(logo.attributes("src")).toBe(overlayLogoUrl);
        expect(logo.attributes("width")).toBe("100");
        expect(logo.attributes("height")).toBe("100");
      } else {
        expect(logo.exists()).toBe(false);
      }
    });
    expect(wrapper.findAll("img.offer-card__overlay-logo")).toHaveLength(
      offersContent.offers.filter(
        (offer) => (offer as { overlayLogoUrl?: string }).overlayLogoUrl,
      ).length,
    );
  });

  it("renders discount codes linking to codeUrl, falling back to offer url", async () => {
    const wrapper = await mountSuspended(OffersPage, { route: "/offers" });
    const cards = wrapper.findAll("article.offer-card");

    let codeCount = 0;
    offersContent.offers.forEach((offer, index) => {
      const card = cards[index]!;
      const code = card.find("p.offer-card__code");
      const expectedCode = (offer as { code?: string }).code;

      if (!expectedCode) {
        expect(code.exists()).toBe(false);
        return;
      }

      codeCount += 1;
      expect(code.text().replace(/\s+/g, " ")).toBe(`Code: ${expectedCode}`);

      const link = code.find("a.offer-card__code-link");
      expect(link.text()).toBe(expectedCode);
      expect(link.attributes("href")).toBe(
        (offer as { codeUrl?: string }).codeUrl || offer.url,
      );
      expect(link.attributes("target")).toBe("_blank");
      expect(link.attributes("rel")).toBe("noopener noreferrer");
    });

    expect(codeCount).toBe(14);
    expect(wrapper.findAll("p.offer-card__code")).toHaveLength(14);

    const magicshine = wrapper.find('[data-offer-id="magicshine"]');
    expect(magicshine.find("a.offer-card__code-link").attributes("href")).toBe(
      "https://bit.ly/411bqd7",
    );
  });

  it("renders the affiliate disclosure note after the grid", async () => {
    const wrapper = await mountSuspended(OffersPage, { route: "/offers" });

    const note = wrapper.find(".offers-disclosure__note");
    expect(note.exists()).toBe(true);
    expect(note.text()).toBe(offersContent.disclosureNote);

    const html = wrapper.html();
    expect(html.indexOf("offers-catalog__grid")).toBeLessThan(
      html.indexOf("offers-disclosure__note"),
    );
  });

  it("OfferCard omits optional badge, description, code and logo gracefully", async () => {
    const wrapper = await mountSuspended(OfferCard, {
      props: {
        offer: {
          id: "bare",
          brand: "Bare Brand",
          discountBadge: "",
          description: "",
          url: "https://example.com/bare",
          image: { url: "/images/offers/bare.png", alt: "" },
        },
      },
    });

    expect(wrapper.find(".offer-card__badge").exists()).toBe(false);
    expect(wrapper.find(".offer-card__description").exists()).toBe(false);
    expect(wrapper.find(".offer-card__code").exists()).toBe(false);
    expect(wrapper.find(".offer-card__overlay-logo").exists()).toBe(false);
    expect(wrapper.find("img.offer-card__image").attributes("alt")).toBe(
      "Bare Brand",
    );
  });
});
