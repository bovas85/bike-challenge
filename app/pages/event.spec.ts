import { afterEach, describe, expect, it, vi } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { createError, readBody } from "h3";
import fallbackContent from "~/data/site-content.json";
import EventPage from "./event.vue";

describe("EventPage (/event)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the amber header without SiteTopNav and links brand title to home", async () => {
    const wrapper = await mountSuspended(EventPage);

    expect(wrapper.find(".site-top-nav").exists()).toBe(false);
    expect(wrapper.find("nav").exists()).toBe(false);

    const brandLink = wrapper.find(".event-header__brand-link");
    expect(brandLink.exists()).toBe(true);
    expect(brandLink.text()).toBe(fallbackContent.event.brandHeader);
    expect(brandLink.attributes("href")).toBe("/");

    expect(wrapper.find(".event-header__title").text()).toBe(
      fallbackContent.event.title,
    );
  });

  it("renders all event paragraphs, 5 details items, closing note, and poster image", async () => {
    const wrapper = await mountSuspended(EventPage);

    const paragraphs = wrapper.findAll(".event-details__paragraph");
    expect(paragraphs).toHaveLength(fallbackContent.event.paragraphs.length);
    fallbackContent.event.paragraphs.forEach((text, index) => {
      expect(paragraphs[index]?.text()).toBe(text);
    });

    const detailItems = wrapper.findAll(".event-details__item");
    expect(detailItems).toHaveLength(5);
    fallbackContent.event.details.forEach((detail, index) => {
      expect(detailItems[index]?.text()).toBe(
        `${detail.icon} ${detail.label}: ${detail.value}`,
      );
    });

    expect(wrapper.find(".event-details__closing").text()).toBe(
      fallbackContent.event.closingNote,
    );

    const posterImg = wrapper.find(".event-poster__image");
    expect(posterImg.exists()).toBe(true);
    expect(posterImg.attributes("src")).toBe(
      fallbackContent.event.posterImage.url,
    );
    expect(posterImg.attributes("alt")).toBe(
      fallbackContent.event.posterImage.alt,
    );
  });

  it("shows validation errors for missing name or invalid email without calling /api/event-rsvp", async () => {
    const endpointSpy = vi.fn(() => ({ ok: true }));
    registerEndpoint("/api/event-rsvp", {
      method: "POST",
      handler: endpointSpy,
    });

    const wrapper = await mountSuspended(EventPage);

    // Submit with empty name
    await wrapper.find("form.event-form").trigger("submit.prevent");
    expect(endpointSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".event-form__banner--error").text()).toBe(
      "Please enter your name.",
    );

    // Fill name, provide invalid email
    await wrapper.find("#rsvp-name").setValue("Jane Smith");
    await wrapper.find("#rsvp-email").setValue("not-an-email");
    await wrapper.find("form.event-form").trigger("submit.prevent");

    expect(endpointSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".event-form__banner--error").text()).toBe(
      "Please enter a valid email address.",
    );
  });

  it("submits valid RSVP to /api/event-rsvp, shows loading state, and renders success message", async () => {
    let resolveRequest!: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });
    let receivedBody: unknown = null;

    registerEndpoint("/api/event-rsvp", {
      method: "POST",
      handler: async (event) => {
        receivedBody = await readBody(event);
        await pendingPromise;
        return {
          ok: true,
          message: "RSVP received",
          rsvp: receivedBody,
        };
      },
    });

    const wrapper = await mountSuspended(EventPage);

    await wrapper.find("#rsvp-name").setValue("  Jane Smith  ");
    await wrapper.find("#rsvp-email").setValue("  jane.smith@gmail.com  ");

    await wrapper.find("form.event-form").trigger("submit.prevent");
    await flushPromises();

    const submitBtn = wrapper.find(".event-form__submit");
    expect(submitBtn.attributes("disabled")).toBeDefined();
    expect(submitBtn.text()).toBe("Submitting...");

    expect(receivedBody).toEqual({
      name: "Jane Smith",
      email: "jane.smith@gmail.com",
    });

    resolveRequest();
    await flushPromises();
    await flushPromises();

    expect(submitBtn.attributes("disabled")).toBeUndefined();
    expect(submitBtn.text()).toBe(fallbackContent.event.form.submitLabel);
    expect(wrapper.find(".event-form__banner--error").exists()).toBe(false);
    expect(wrapper.find(".event-form__banner--success").text()).toBe(
      fallbackContent.event.form.successMessage,
    );
    expect((wrapper.find("#rsvp-name").element as HTMLInputElement).value).toBe(
      "",
    );
    expect(
      (wrapper.find("#rsvp-email").element as HTMLInputElement).value,
    ).toBe("");
  });

  it("displays an error banner if /api/event-rsvp rejects", async () => {
    registerEndpoint("/api/event-rsvp", {
      method: "POST",
      handler: () => {
        throw createError({
          statusCode: 400,
          statusMessage: "Valid name and email are required",
        });
      },
    });

    const wrapper = await mountSuspended(EventPage);

    await wrapper.find("#rsvp-name").setValue("Jane Smith");
    await wrapper.find("#rsvp-email").setValue("jane.smith@gmail.com");
    await wrapper.find("form.event-form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.find(".event-form__banner--success").exists()).toBe(false);
    expect(wrapper.find(".event-form__banner--error").text()).toBe(
      "Valid name and email are required",
    );
    expect(
      wrapper.find(".event-form__submit").attributes("disabled"),
    ).toBeUndefined();
  });
});
