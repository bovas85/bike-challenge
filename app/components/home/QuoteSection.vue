<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeQuoteSection" });

defineProps<{
  section: HomePageACF["quote"];
  animate?: boolean;
}>();
</script>

<template>
  <section class="quote step">
    <div class="quote__inner">
      <blockquote class="quote__block">
        <h2 class="quote__text" :class="{ animated: animate }">
          {{ section.text }}
        </h2>
        <h3 class="quote__author" :class="{ animated: animate }">
          {{ section.author }}
        </h3>
      </blockquote>

      <a
        :href="section.ctaUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="bc-btn bc-btn--amber quote__cta"
        :class="{ animated: animate }"
      >
        {{ section.ctaLabel }}
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.quote {
  width: 100%;
  background-color: $white;
  padding: 64px 20px;

  @include tablet-up {
    min-height: 584px;
    padding: 255px 40px 80px;
  }

  &__inner {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    text-align: center;
  }

  &__block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  &__text {
    max-width: 724px;
    font-family: $font-primary;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.04em;
    white-space: pre-line;
    color: $black;

    @include fadeInUp(40px, 0.55s, 0s);

    @include tablet-up {
      font-size: 46px;
      letter-spacing: -2.1px;
    }
  }

  &__author {
    font-family: $font-ui;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    color: $navy;

    @include fadeIn(0.5s, 0.15s);
  }

  &__cta {
    min-height: 50px;
    padding: 16px 24px;
    font-size: 14px;
    line-height: 16.8px;

    @include fadeInUp(30px, 0.5s, 0.25s);
  }
}
</style>
