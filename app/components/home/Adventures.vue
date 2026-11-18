<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeAdventures" });

defineProps<{
  adventures: HomePageACF["adventures"];
}>();

// Doodle strokes extracted from production (200x200 viewBox, 10px black stroke).
const arrowPath =
  "M 21.315 99.618 C 44.533 89.027 105.309 75.676 162.682 107.011 M 153.343 119.746 C 157.643 119.41 162.188 119.364 166.499 119.518 C 167.533 119.555 178.436 120.304 178.314 119.61 C 177.732 116.283 175.701 112.966 174.542 109.81 C 172.172 103.358 170.203 97.019 169.525 90.161 C 169.187 86.729 169.212 83.309 169.017 79.904";
const stravaPath =
  "M 111.499 135.487 C 107.724 135.487 107.069 133.3 104.389 131.449 C 96.149 125.755 89.128 117.881 83.444 110.448 C 75.664 100.276 68.32 89.065 65.02 77.333 C 63.681 72.565 63.719 64.849 64.791 60.058 C 66.357 53.063 71.931 60.755 74.345 62.297 C 83.955 68.433 90.442 82.017 93.688 91.249 C 94.899 94.698 97.739 97.037 97.739 91.623 C 97.739 82.248 100.405 75.537 105.689 67.266 C 108.483 62.893 124.561 38.208 131.834 49.371 C 135.891 55.604 134.891 62.684 134.891 70.063 C 134.891 85.59 126.758 100.178 121.056 114.859 C 117.506 123.994 113.777 133.538 108.746 142.198 C 107.355 144.592 105.494 153.584 103.243 154.5";

const doodles = {
  komoot: { rotate: 15, d: arrowPath },
  strava: { rotate: -15, d: stravaPath },
} as const;
</script>

<template>
  <section id="strava" class="adventures">
    <div class="adventures__inner">
      <a
        v-for="card in adventures"
        :key="card.id"
        :href="card.url"
        target="_blank"
        rel="noopener noreferrer"
        class="adventures__card"
        :data-platform="card.platform"
      >
        <span
          class="adventures__doodle adventures__doodle--platform"
          :style="{ transform: `rotate(${doodles[card.platform].rotate}deg)` }"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" focusable="false">
            <path
              :d="doodles[card.platform].d"
              stroke-width="10"
              stroke="rgb(0, 0, 0)"
              stroke-linecap="round"
              fill="none"
              stroke-miterlimit="10"
            />
          </svg>
        </span>

        <p class="adventures__title">{{ card.title }}</p>

        <span
          class="adventures__doodle adventures__doodle--arrow"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" focusable="false">
            <path
              :d="arrowPath"
              stroke-width="10"
              stroke="rgb(0, 0, 0)"
              stroke-linecap="round"
              fill="none"
              stroke-miterlimit="10"
            />
          </svg>
        </span>
      </a>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.adventures {
  width: 100%;
  background-color: $white;
  padding: 60px 20px;

  @include tablet-up {
    padding: 100px 50px;
  }

  &__inner {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 123px;
    padding: 24px;
    border-radius: 20px;
    background-color: $amber-tint;
    overflow: hidden;
    transition: transform 0.2s ease;

    @include tablet-up {
      padding: 24px 200px;
    }

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__title {
    position: relative;
    z-index: 1;
    max-width: 689px;
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
    letter-spacing: -0.025em;
    text-align: center;
    color: $black;
  }

  &__doodle {
    position: absolute;
    top: 50%;
    width: 100px;
    height: 100px;
    margin-top: -50px;
    pointer-events: none;

    @include tablet-up {
      width: 200px;
      height: 200px;
      margin-top: -100px;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    &--platform {
      display: none;
      left: -20px;

      @include tablet-up {
        display: block;
      }
    }

    &--arrow {
      right: -30px;
      opacity: 0.5;

      @include tablet-up {
        right: -20px;
        opacity: 1;
      }
    }
  }
}
</style>
