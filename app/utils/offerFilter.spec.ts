import { describe, expect, it } from "vitest";
import fallbackContent from "~/data/site-content.json";
import {
  extractDiscountOptions,
  filterOffers,
  parseDiscountPercentage,
} from "./offerFilter";

const offers = fallbackContent.offers.offers;

describe("offerFilter utilities", () => {
  it("parses percentage values from discountBadge strings", () => {
    expect(parseDiscountPercentage("15%")).toBe(15);
    expect(parseDiscountPercentage(" 20% OFF ")).toBe(20);
    expect(parseDiscountPercentage("5%")).toBe(5);
    expect(parseDiscountPercentage("12.5%")).toBe(12.5);
    expect(parseDiscountPercentage("")).toBeNull();
    expect(parseDiscountPercentage(undefined)).toBeNull();
    expect(parseDiscountPercentage("Free shipping")).toBeNull();
  });

  it("extracts sorted unique discount percentage options", () => {
    expect(extractDiscountOptions(offers)).toEqual([5, 10, 15, 20]);
  });

  it("filters offers by case-insensitive brand name and discount percentage", () => {
    const byBrand = filterOffers(offers, {
      brandQuery: "  VELO ",
      discountPercent: null,
    });
    expect(byBrand.map((o) => o.id)).toEqual(["veloforte", "velotool"]);

    const byDiscount = filterOffers(offers, {
      brandQuery: "",
      discountPercent: 20,
    });
    expect(byDiscount.map((o) => o.id)).toEqual([
      "pelotan",
      "veloforte",
      "bumbutter",
    ]);

    const combined = filterOffers(offers, {
      brandQuery: "velo",
      discountPercent: 20,
    });
    expect(combined.map((o) => o.id)).toEqual(["veloforte"]);

    const empty = filterOffers(offers, {
      brandQuery: "nonexistent",
      discountPercent: 15,
    });
    expect(empty).toEqual([]);
  });
});
