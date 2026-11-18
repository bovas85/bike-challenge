<script setup lang="ts">
import type { HomePageACF, SiteGlobalACF } from "~/types/acf";

defineOptions({ name: "HomeHeroSection" });

defineProps<{
  hero: HomePageACF["hero"];
  navLinks: SiteGlobalACF["heroNavLinks"];
  animate?: boolean;
}>();
</script>

<template>
  <header class="hero">
    <img
      class="hero__bg"
      :src="hero.backgroundImage.url"
      :alt="hero.backgroundImage.alt"
      fetchpriority="high"
    />
    <div class="hero__overlay" />

    <div class="hero__content">
      <h1 class="bc-display-title hero__title" :class="{ animated: animate }">
        {{ hero.title }}
      </h1>
      <p class="hero__subtitle" :class="{ animated: animate }">
        {{ hero.subtitle }}
      </p>

      <nav
        class="hero__nav"
        :class="{ animated: animate }"
        aria-label="Page sections"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="hero__nav-link"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>

    <NuxtLink
      to="/#content"
      class="hero__scroll"
      :aria-label="hero.scrollDownText.trim()"
    >
      <svg
        class="hero__scroll-svg"
        viewBox="0 0 100 100"
        overflow="visible"
        focusable="false"
        aria-hidden="true"
      >
        <path
          id="hero-scroll-curve"
          d="M 0 50 L 0 50 A 1 1 0 1 0 100 50 L 100 50 A 1 1 0 1 0 0 50 L 0 50"
          fill="transparent"
        />
        <text>
          <textPath
            href="#hero-scroll-curve"
            startOffset="0"
            dominant-baseline="hanging"
            textLength="305"
            lengthAdjust="spacing"
            class="hero__scroll-text"
          >
            {{ hero.scrollDownText }}
          </textPath>
        </text>
      </svg>
    </NuxtLink>
  </header>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  width: 100%;
  height: 570px;
  padding: 100px 20px 0;
  color: $white;
  overflow: hidden;
  background-color: $ink;

  @include tablet-up {
    padding-top: 131px;
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: rgb(0 0 0 / 35%);
  }

  &__content {
    position: relative;
    z-index: 1;
    max-width: 898px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    text-align: center;
  }

  &__title {
    color: $white;
    line-height: 0.9;

    @include fadeInUp(40px, 0.5s, 0.15s);

    @include desktop-up {
      line-height: 48px;
    }
  }

  &__subtitle {
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    white-space: pre-line;
    color: $white;

    @include fadeInUp(60px, 0.55s, 0.3s);
  }

  &__nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 28px;

    @include fadeInUp(80px, 0.65s, 0.5s);
  }

  &__nav-link {
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 900;
    line-height: 19.2px;
    color: $white;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.75;
    }
  }

  &__scroll {
    position: absolute;
    z-index: 1;
    bottom: 32px;
    left: 50%;
    width: 100px;
    height: 100px;
    margin-left: -50px;
    display: block;
  }

  &__scroll-svg {
    width: 100%;
    height: 100%;
    transform-origin: center;
    animation: hero-scroll-spin 14s linear infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &__scroll-text {
    font-family: $font-primary;
    font-size: 14px;
    font-weight: 400;
    fill: $white;
  }
}

@keyframes hero-scroll-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
