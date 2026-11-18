<script setup lang="ts">
import { useHead } from "#imports";
import OfferCard from "~/components/offers/OfferCard.vue";
import { useOffersContent } from "~/composables/useSiteContent";

defineOptions({ name: "OffersPage" });

const { data: offers } = await useOffersContent();

useHead({
  title: "The Bike Challenge Discounts",
});
</script>

<template>
  <main class="offers-page">
    <SiteTopNav />

    <header class="offers-hero">
      <h1 class="bc-display-title offers-hero__title">
        {{ offers.brandHeader }}
      </h1>
      <h2 class="offers-hero__subtitle">
        {{ offers.subtitle }}
      </h2>
    </header>

    <section class="offers-catalog" aria-label="Partner discounts">
      <div class="offers-catalog__grid">
        <OfferCard
          v-for="offer in offers.offers"
          :key="offer.id"
          :offer="offer"
        />
      </div>
    </section>

    <section class="offers-disclosure" aria-label="Affiliate disclosure">
      <p class="offers-disclosure__note">
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
  padding: 40px 20px 56px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include tablet-up {
    padding: 50px 24px 100px;
  }

  &__title {
    color: $black;
    letter-spacing: -0.04em;
    max-width: 1240px;
    width: 100%;
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
  }
}
</style>
