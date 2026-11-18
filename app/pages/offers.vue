<script setup lang="ts">
import { useHead } from "#imports";
import OfferCard from "~/components/offers/OfferCard.vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import { useOffersContent } from "~/composables/useSiteContent";

defineOptions({ name: "OffersPage" });

const { data: offers } = await useOffersContent();

const { headerAnimated, stepAnimated } = useScrollReveal(2, {
  stepSelector: ".offers-page .step",
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

    <section class="offers-catalog step" aria-label="Partner discounts">
      <div class="offers-catalog__grid">
        <OfferCard
          v-for="offer in offers.offers"
          :key="offer.id"
          :offer="offer"
          :animate="stepAnimated[0]"
        />
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
  min-height: 200px;
  padding: 50px 20px 64px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include tablet-up {
    min-height: 220px;
    padding: 50px 24px 80px;
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
