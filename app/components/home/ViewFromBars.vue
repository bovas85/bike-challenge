<script setup lang="ts">
import { computed, ref } from "vue";
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeViewFromBars" });

const props = defineProps<{
  section: HomePageACF["viewFromBars"];
}>();

const activeIndex = ref(0);
const slideCount = computed(() => props.section.carouselImages.length);

function showNext() {
  if (slideCount.value === 0) return;
  activeIndex.value = (activeIndex.value + 1) % slideCount.value;
}

function showPrevious() {
  if (slideCount.value === 0) return;
  activeIndex.value =
    (activeIndex.value - 1 + slideCount.value) % slideCount.value;
}
</script>

<template>
  <section class="view-bars">
    <div class="view-bars__copy">
      <div class="view-bars__copy-inner">
        <h2 class="view-bars__heading">{{ section.heading }}</h2>
        <p class="view-bars__body">{{ section.body }}</p>
        <a
          :href="section.ctaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="bc-btn bc-btn--white view-bars__cta"
        >
          {{ section.ctaLabel }}
        </a>
      </div>
    </div>

    <div
      class="view-bars__carousel"
      role="region"
      aria-roledescription="carousel"
      :aria-label="section.heading.replace(/\s+/g, ' ').trim()"
    >
      <div
        class="view-bars__track"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <img
          v-for="(image, index) in section.carouselImages"
          :key="image.url"
          :src="image.url"
          :alt="image.alt"
          class="view-bars__slide"
          :aria-hidden="index === activeIndex ? undefined : 'true'"
          loading="eager"
        />
      </div>

      <button
        type="button"
        class="view-bars__arrow view-bars__arrow--prev"
        aria-label="Previous image"
        @click="showPrevious"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M15 5l-7 7 7 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        class="view-bars__arrow view-bars__arrow--next"
        aria-label="Next image"
        @click="showNext"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M9 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.view-bars {
  width: 100%;
  background-color: $amber;
  display: flex;
  flex-direction: column;

  @include tablet-up {
    flex-direction: row;
    min-height: 600px;
  }

  &__copy {
    display: flex;
    align-items: center;
    padding: 56px 20px;

    @include tablet-up {
      flex: 0 0 50%;
      justify-content: flex-end;
      padding: 0 40px 0 140px;
    }
  }

  &__copy-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    width: 100%;
    max-width: 400px;
  }

  &__heading {
    font-family: $font-primary;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.04em;
    white-space: pre-line;
    color: $white;

    @include tablet-up {
      font-size: 46px;
      letter-spacing: -2.1px;
    }
  }

  &__body {
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
    color: $white;
  }

  &__cta {
    color: $charcoal;
    min-height: 50px;
  }

  &__carousel {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;

    @include tablet-up {
      flex: 0 0 50%;
      width: 50%;
      height: 600px;
    }
  }

  &__track {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.4s ease;
  }

  &__slide {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
  }

  &__arrow {
    position: absolute;
    top: 50%;
    width: 40px;
    height: 40px;
    margin-top: -20px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(0 0 0 / 20%);
    color: $white;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgb(0 0 0 / 40%);
    }

    svg {
      width: 20px;
      height: 20px;
    }

    &--prev {
      left: 20px;
    }

    &--next {
      right: 20px;
    }
  }
}
</style>
