<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomePartners" });

defineProps<{
  section: HomePageACF["partnersSection"];
}>();
</script>

<template>
  <section class="partners" aria-labelledby="home-partners-heading">
    <h2 id="home-partners-heading" class="partners__heading">
      {{ section.heading }}
    </h2>

    <div class="partners__grid">
      <a
        v-for="partner in section.logos"
        :key="partner.id"
        :href="partner.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="partner.name"
        class="partners__logo-link"
      >
        <img
          :src="partner.logoUrl"
          :alt="partner.name"
          class="partners__logo-img"
          loading="lazy"
        />
      </a>
    </div>

    <NuxtLink
      :to="section.ctaTo"
      class="bc-btn bc-btn--amber-dark partners__cta"
    >
      {{ section.ctaLabel }}
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.partners {
  width: 100%;
  background-color: $white;
  padding: 64px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;

  @include tablet-up {
    padding: 80px 40px;
    gap: 60px;
  }

  &__heading {
    font-family: $font-primary;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.04em;
    text-align: center;
    color: $navy;

    @include tablet-up {
      font-size: 46px;
      letter-spacing: -2.1px;
    }
  }

  &__grid {
    width: 100%;
    max-width: 650px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 20px;
    justify-items: center;

    @include tablet-up {
      grid-template-columns: repeat(2, minmax(0, 295px));
      gap: 60px;
      justify-content: center;
    }
  }

  &__logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 295px;
    max-width: 100%;
    height: 100px;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__cta {
    min-height: 50px;
    color: $black;
  }
}
</style>
