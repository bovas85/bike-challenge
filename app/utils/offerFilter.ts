import type { OfferCardACF, OfferFilterCriteria } from "~/types/acf";

export function parseDiscountPercentage(discountBadge?: string): number | null {
  if (!discountBadge) return null;
  const match = discountBadge.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractDiscountOptions(
  offers: readonly OfferCardACF[],
): number[] {
  const unique = new Set<number>();
  for (const offer of offers) {
    const pct = parseDiscountPercentage(offer.discountBadge);
    if (pct !== null) {
      unique.add(pct);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

export function filterOffers(
  offers: readonly OfferCardACF[],
  criteria: OfferFilterCriteria,
): OfferCardACF[] {
  const normalizedQuery = criteria.brandQuery.trim().toLowerCase();
  const targetDiscount = criteria.discountPercent;

  return offers.filter((offer) => {
    if (
      normalizedQuery &&
      !offer.brand.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }

    if (targetDiscount !== null) {
      const pct = parseDiscountPercentage(offer.discountBadge);
      if (pct !== targetDiscount) {
        return false;
      }
    }

    return true;
  });
}
