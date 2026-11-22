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
          d="M 0 50 A 50 50 0 1 0 100 50 A 50 50 0 1 0 0 50"
          fill="transparent"
        />
        <text>
          <textPath
            href="#hero-scroll-curve"
            startOffset="0"
            dominant-baseline="hanging"
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
  height: min-content;
  max-height: 500px;
  padding: 70px 20px;
  color: $white;
  overflow: hidden;
  background-color: $ink;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
  text-align: center;

  @include tablet-up {
    height: auto;
    min-height: 441px;
    max-height: none;
    padding: 80px 40px;
  }

  @include desktop-up {
    height: 70vh;
    min-height: 570px;
    padding: 100px 50px;
  }

  &__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: 50% 0%;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background-color: transparent;
    pointer-events: none;
  }

  &__content {
    display: contents;
  }

  &__title {
    position: relative;
    z-index: 1;
    order: 0;
    width: auto;
    max-width: 100%;
    color: $white;
    font-size: 26px;
    line-height: 1;

    @include fadeInUp(40px, 0.5s, 0.15s);

    @include tablet-up {
      font-size: 53px;
      line-height: 1;
    }

    @include desktop-up {
      font-size: 80px;
      line-height: 1;
    }
  }

  &__subtitle {
    position: relative;
    z-index: 1;
    order: 4;
    max-width: 898px;
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    white-space: pre-line;
    color: $white;

    @include fadeInUp(60px, 0.55s, 0.3s);

    @include tablet-up {
      order: 0;
    }
  }

  &__nav {
    position: relative;
    z-index: 1;
    display: none;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 48px;

    @include fadeInUp(80px, 0.65s, 0.5s);

    @include tablet-up {
      display: flex;
      order: 0;
    }
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
    position: relative;
    z-index: 1;
    order: 3;
    width: 92px;
    height: 97px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    @include tablet-up {
      order: 0;
    }
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
    font-size: 13.8px;
    font-weight: 400;
    letter-spacing: 0.4px;
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
