<script setup lang="ts">
import { useHead, useRuntimeConfig } from "#imports";
import { computed, ref, watch } from "vue";
import OfferCard from "~/components/offers/OfferCard.vue";
import OfferFilters from "~/components/offers/OfferFilters.vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import { useOffersContent } from "~/composables/useSiteContent";
import { extractDiscountOptions, filterOffers } from "~/utils/offerFilter";

defineOptions({ name: "OffersPage" });

const runtimeConfig = useRuntimeConfig();
const { data: offers } = await useOffersContent();

const { headerAnimated, stepAnimated, refresh } = useScrollReveal(2, {
  stepSelector: ".offers-page .step",
});

const isFilterEnabled = computed(
  () => runtimeConfig.public.enableOffersFilter !== false,
);

const brandQuery = ref("");
const selectedDiscount = ref<number | null>(null);

const discountOptions = computed(() =>
  extractDiscountOptions(offers.value.offers),
);

const hasActiveFilters = computed(
  () =>
    isFilterEnabled.value &&
    (brandQuery.value.trim().length > 0 || selectedDiscount.value !== null),
);

const displayedOffers = computed(() => {
  if (!isFilterEnabled.value) {
    return offers.value.offers;
  }
  return filterOffers(offers.value.offers, {
    brandQuery: brandQuery.value,
    discountPercent: selectedDiscount.value,
  });
});

function resetFilters() {
  brandQuery.value = "";
  selectedDiscount.value = null;
}

watch([brandQuery, selectedDiscount, isFilterEnabled], () => {
  void refresh();
});

useHead({
  title: "The Bike Challenge Discounts",
});
</script>

<template>
  <main class="offers-page">
    <SiteTopNav />

    <header class="offers-hero">
      <h1
        class="bc-display-title offers-hero__title"
        :class="{ animated: headerAnimated }"
      >
        {{ offers.brandHeader }}
      </h1>
      <h2 class="offers-hero__subtitle" :class="{ animated: headerAnimated }">
        {{ offers.subtitle }}
      </h2>
    </header>

    <OfferFilters
      v-if="isFilterEnabled"
      v-model:brand-query="brandQuery"
      v-model:selected-discount="selectedDiscount"
      :discount-options="discountOptions"
      :total-count="offers.offers.length"
      :filtered-count="displayedOffers.length"
      @reset="resetFilters"
    />

    <section class="offers-catalog step" aria-label="Partner discounts">
      <div v-if="displayedOffers.length > 0" class="offers-catalog__grid">
        <OfferCard
          v-for="offer in displayedOffers"
          :key="offer.id"
          :offer="offer"
          :animate="stepAnimated[0] || hasActiveFilters"
        />
      </div>

      <div v-else-if="isFilterEnabled" class="offers-catalog__empty">
        <h3 class="offers-catalog__empty-title">No matching offers found</h3>
        <p class="offers-catalog__empty-text">
          Try a different brand name or clear the selected discount filter.
        </p>
        <button
          type="button"
          class="bc-btn bc-btn--amber-dark offers-catalog__reset"
          @click="resetFilters"
        >
          Reset filters
        </button>
      </div>
    </section>

    <section class="offers-disclosure step" aria-label="Affiliate disclosure">
      <p class="offers-disclosure__note" :class="{ animated: stepAnimated[1] }">
        {{ offers.disclosureNote }}
      </p>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.offers-page {
  width: 100%;
  background-color: $white;
}

.offers-hero {
  width: 100%;
  min-height: 180px;
  padding: 50px 20px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include tablet-up {
    min-height: 200px;
    padding: 50px 24px 48px;
  }

  &__title {
    color: $black;
    font-size: 32px;
    line-height: 32px;
    letter-spacing: -1.28px;
    max-width: 1240px;
    width: 100%;

    @include fadeInUp(36px, 0.5s, 0.1s);

    @include tablet-up {
      font-size: 80px;
      line-height: 80px;
      letter-spacing: -3.2px;
    }
  }

  &__subtitle {
    font-family: $font-primary;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.04em;
    color: $muted;
    max-width: 1240px;
    width: 100%;

    @include fadeInUp(36px, 0.55s, 0.2s);

    @include tablet-up {
      font-size: 40px;
      line-height: 40px;
    }
  }
}

.offers-catalog {
  width: 100%;
  padding: 0 20px 24px;

  &__grid {
    max-width: 960px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px 20px;

    @include tablet-up {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 60px 20px;
    }
  }

  &__empty {
    max-width: 560px;
    margin: 16px auto;
    padding: 40px 24px;
    border-radius: 20px;
    background-color: $cream;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  &__empty-title {
    font-family: $font-primary;
    font-size: 24px;
    font-weight: 700;
    line-height: 28px;
    letter-spacing: -0.02em;
    color: $black;
  }

  &__empty-text {
    font-family: $font-ui;
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    color: $charcoal;
  }

  &__reset {
    margin-top: 6px;
    border: 0;
  }
}

.offers-disclosure {
  width: 100%;
  padding: 46px 20px;
  text-align: center;

  &__note {
    max-width: 1240px;
    margin: 0 auto;
    font-family: $font-ui;
    font-size: 15px;
    font-weight: 500;
    line-height: 21px;
    letter-spacing: -0.01em;
    color: $muted;

    @include fadeIn(0.5s, 0.1s);
  }
}
</style>
