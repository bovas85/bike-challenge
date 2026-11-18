<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeJoinJourney" });

defineProps<{
  section: HomePageACF["joinJourney"];
  animate?: boolean;
}>();
const loopPath =
  "M 94.922 75.769 C 89.519 71.031 91.511 93.705 91.511 97.265 C 91.511 106.855 88.556 121.195 102.598 121.195 C 113.389 121.195 114.352 118.474 116.246 108.389 C 118.067 98.696 119.426 82.636 111.982 74.836 C 104.242 66.724 94.055 71.804 86.962 78.573 C 80.3 84.933 74.559 92.343 67.631 98.389 C 63.08 102.357 56.353 107.621 54.174 113.531 C 52.043 119.308 75.335 114.374 77.297 113.342 C 90.374 106.476 102.355 98.168 106.012 83.34 C 106.237 82.421 109.665 59.895 107.433 61.095 C 100.47 64.841 95.912 76.505 92.271 82.685 C 85.522 94.136 77.643 104.909 70.854 116.332 C 69.564 118.507 60.199 137.845 64.597 138.019 C 78.157 138.554 82.581 131.822 85.352 118.764 C 88.761 102.694 84.554 87.414 72.844 75.864 C 64.685 67.815 62.077 73.095 70.096 79.509 C 93.511 98.231 126.767 117.831 158.036 117.831";
const arrowPath =
  "M 21.315 99.618 C 44.533 89.027 105.309 75.676 162.682 107.011 M 153.343 119.746 C 157.643 119.41 162.188 119.364 166.499 119.518 C 167.533 119.555 178.436 120.304 178.314 119.61 C 177.732 116.283 175.701 112.966 174.542 109.81 C 172.172 103.358 170.203 97.019 169.525 90.161 C 169.187 86.729 169.212 83.309 169.017 79.904";
</script>

<template>
  <section id="content" class="join-journey step">
    <div class="join-journey__inner" :class="{ animated: animate }">
      <h2 class="join-journey__heading">{{ section.heading }}</h2>
      <p class="join-journey__body">{{ section.body }}</p>
    </div>

    <span
      class="join-journey__doodle join-journey__doodle--arrow"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" focusable="false">
        <path
          :d="arrowPath"
          stroke-width="5"
          stroke="rgb(255, 255, 255)"
          stroke-linecap="round"
          fill="none"
          stroke-miterlimit="10"
        />
      </svg>
    </span>

    <span
      class="join-journey__doodle join-journey__doodle--loop"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" focusable="false">
        <path
          :d="loopPath"
          stroke-width="5"
          stroke="rgb(255, 255, 255)"
          stroke-linecap="round"
          fill="none"
          stroke-miterlimit="10"
        />
      </svg>
    </span>
  </section>
</template>

<style lang="scss" scoped>
.join-journey {
  position: relative;
  width: 100%;
  background-color: $amber;
  padding: 60px 32px;
  scroll-margin-top: 0;
  overflow: hidden;

  @include tablet-up {
    padding: 60px 40px;
  }

  @include desktop-up {
    padding: 60px 50px;
  }

  &__inner {
    position: relative;
    z-index: 2;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    text-align: center;

    @include fadeInUp(40px, 0.55s, 0s);
  }

  &__heading {
    width: 100%;
    max-width: 600px;
    font-family: $font-primary;
    font-size: 46px;
    font-weight: 800;
    line-height: 55.2px;
    letter-spacing: normal;
    color: $white;
  }

  &__body {
    width: 100%;
    max-width: 600px;
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
    color: $white;
  }

  &__doodle {
    position: absolute;
    z-index: 1;
    pointer-events: none;

    svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    &--loop {
      width: 128px;
      height: 128px;
      bottom: -26px;
      right: -28px;
      transform: rotate(20deg);

      @include tablet-up {
        width: 192px;
        height: 192px;
        bottom: -40px;
        right: -42px;
      }

      @include desktop-up {
        width: 256px;
        height: 256px;
        bottom: -53px;
        right: -56px;
      }
    }

    &--arrow {
      display: none;

      @include tablet-up {
        display: block;
        width: 192px;
        height: 192px;
        right: 30px;
        top: 50%;
        transform: translateY(-50%) rotate(-20deg);
      }

      @include desktop-up {
        width: 256px;
        height: 256px;
        right: 200px;
      }
    }
  }
}
</style>
