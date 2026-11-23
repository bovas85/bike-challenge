import { afterEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { injectHead } from "#imports";
import { resolveTags } from "unhead/utils";
import { flushPromises } from "@vue/test-utils";
import { createError, readBody } from "h3";
import fallbackContent from "~/data/site-content.json";
import XmasLotteryPage from "./xmas-lottery.vue";

const lotteryContent = fallbackContent.xmasLottery;

describe("XmasLotteryPage (/xmas-lottery)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = "";
  });

  it("renders private page content without exposing /xmas-lottery in navigation menus", async () => {
    const wrapper = await mountSuspended(XmasLotteryPage, {
      route: "/xmas-lottery",
    });

    const nav = wrapper.find("nav.site-top-nav");
    expect(nav.exists()).toBe(true);
    expect(nav.html()).not.toContain("xmas-lottery");

    expect(
      fallbackContent.global.heroNavLinks.some(
        (item) => item.to === "/xmas-lottery",
      ),
    ).toBe(false);

    const head = injectHead();
    const headTags = head ? resolveTags(head) : [];
    const robotsTag = headTags.find(
      (tag) => tag.tag === "meta" && tag.props?.name === "robots",
    );
    expect(robotsTag?.props?.content).toBe("noindex, nofollow");
    expect(wrapper.find("p.xmas-hero__brand").text()).toBe(
      lotteryContent.brandHeader,
    );
    expect(wrapper.find("h1.xmas-feed__heading").text()).toBe(
      lotteryContent.title,
    );
    expect(wrapper.find("p.xmas-feed__subtitle").text()).toBe(
      lotteryContent.subtitle,
    );
    expect(wrapper.find("button.xmas-feed__join-btn").text()).toBe(
      lotteryContent.joinButtonLabel,
    );
    const prizeCards = wrapper.findAll("article.xmas-prize-card");
    expect(prizeCards).toHaveLength(lotteryContent.prizes.length);
    for (const [idx, card] of prizeCards.entries()) {
      const prize = lotteryContent.prizes[idx]!;
      expect(card.find("img.xmas-prize-card__image").attributes("src")).toBe(
        prize.image.url,
      );
      expect(card.find("h2.xmas-prize-card__title").text()).toBe(prize.title);
      expect(card.find("button").exists()).toBe(false);
    }
    expect(wrapper.findAll("article.xmas-step-card")).toHaveLength(
      lotteryContent.steps.length,
    );
    expect(wrapper.find("section.partners").exists()).toBe(true);
    expect(wrapper.find(".xmas-modal-backdrop").exists()).toBe(false);
  });

  it("opens the email capture modal on Join click and closes via Escape or close button", async () => {
    const wrapper = await mountSuspended(XmasLotteryPage, {
      route: "/xmas-lottery",
    });

    await wrapper.find("button.xmas-feed__join-btn").trigger("click");
    await flushPromises();

    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.text()).toContain(lotteryContent.modal.title);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    await wrapper.find("button.xmas-how__join-btn").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.find("button.xmas-modal__close").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("validates email client-side and submits valid email to /api/xmas-lottery", async () => {
    let receivedBody: unknown = null;
    registerEndpoint("/api/xmas-lottery", {
      method: "POST",
      handler: async (event) => {
        receivedBody = await readBody(event);
        return {
          ok: true,
          message: "You're in the Xmas Lottery!",
          entry: receivedBody,
        };
      },
    });

    const wrapper = await mountSuspended(XmasLotteryPage, {
      route: "/xmas-lottery",
    });

    await wrapper.find("button.xmas-feed__join-btn").trigger("click");
    await flushPromises();

    await wrapper.find("#xmas-lottery-email").setValue("bad-email");
    await wrapper.find("form.xmas-modal__form").trigger("submit.prevent");
    await flushPromises();

    expect(receivedBody).toBeNull();
    expect(wrapper.find(".xmas-modal__banner--error").text()).toBe(
      "Please enter a valid email address.",
    );

    await wrapper
      .find("#xmas-lottery-email")
      .setValue("  Rider@BikeClub.CO.UK  ");
    await wrapper.find("form.xmas-modal__form").trigger("submit.prevent");
    await flushPromises();
    await flushPromises();

    expect(receivedBody).toEqual({ email: "rider@bikeclub.co.uk" });
    expect(wrapper.find(".xmas-modal__success").exists()).toBe(true);
    expect(wrapper.find(".xmas-modal__success").text()).toContain(
      lotteryContent.modal.successTitle,
    );

    await wrapper.find("button.xmas-modal__done").trigger("click");
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it("shows friendly duplicate banner when /api/xmas-lottery returns 409", async () => {
    registerEndpoint("/api/xmas-lottery", {
      method: "POST",
      handler: () => {
        throw createError({
          statusCode: 409,
          statusMessage: "This email is already entered in the Xmas Lottery.",
        });
      },
    });

    const wrapper = await mountSuspended(XmasLotteryPage, {
      route: "/xmas-lottery",
    });

    await wrapper.find("button.xmas-feed__join-btn").trigger("click");
    await flushPromises();

    await wrapper.find("#xmas-lottery-email").setValue("repeat@example.com");
    await wrapper.find("form.xmas-modal__form").trigger("submit.prevent");
    await flushPromises();
    await flushPromises();

    const banner = wrapper.find(".xmas-modal__banner--info");
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toBe(lotteryContent.modal.alreadyEnteredMessage);
  });

  it("shows error banner when /api/xmas-lottery fails with a non-409 error", async () => {
    registerEndpoint("/api/xmas-lottery", {
      method: "POST",
      handler: () => {
        throw createError({
          statusCode: 500,
          statusMessage: "Storage temporarily unavailable",
        });
      },
    });

    const wrapper = await mountSuspended(XmasLotteryPage, {
      route: "/xmas-lottery",
    });

    await wrapper.find("button.xmas-feed__join-btn").trigger("click");
    await flushPromises();

    await wrapper.find("#xmas-lottery-email").setValue("rider@example.com");
    await wrapper.find("form.xmas-modal__form").trigger("submit.prevent");
    await flushPromises();
    await flushPromises();

    const banner = wrapper.find(".xmas-modal__banner--error");
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toBe("Storage temporarily unavailable");
  });
});
