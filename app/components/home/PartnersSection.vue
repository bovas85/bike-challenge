<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomePartners" });

defineProps<{
  section: HomePageACF["partnersSection"];
  animate?: boolean;
}>();
</script>

<template>
  <section class="partners step" aria-labelledby="home-partners-heading">
    <h2
      id="home-partners-heading"
      class="partners__heading"
      :class="{ animated: animate }"
    >
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
        :class="{ animated: animate }"
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
      :class="{ animated: animate }"
    >
      {{ section.ctaLabel }}
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.partners {
  width: 100%;
  background-color: $white;
  padding: 80px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 60px;

  @include tablet-up {
    padding: 80px 40px;
  }

  &__heading {
    font-family: $font-primary;
    font-size: 40px;
    font-weight: 700;
    line-height: 48px;
    letter-spacing: -1.6px;
    text-align: center;
    color: $navy;

    @include fadeInUp(36px, 0.55s, 0s);

    @include desktop-up {
      font-size: 46px;
      line-height: 55.2px;
      letter-spacing: -2.1px;
    }
  }

  &__grid {
    width: 100%;
    max-width: 650px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
    justify-items: center;

    @include tablet-up {
      grid-template-columns: repeat(2, minmax(0, 295px));
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

    @include fadeInUp(32px, 0.5s, 0.08s);

    &:hover {
      opacity: 0.8;
    }

    &:last-child .partners__logo-img {
      object-fit: contain;
    }
  }

  &__logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__cta {
    min-height: 50px;
    color: $black;

    @include fadeInUp(28px, 0.5s, 0.18s);
  }
}
</style>
