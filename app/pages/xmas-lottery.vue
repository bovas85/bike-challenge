<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "#imports";
import HomePartners from "~/components/home/PartnersSection.vue";
import JoinModal from "~/components/xmas-lottery/JoinModal.vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import {
  useHomeContent,
  useXmasLotteryContent,
} from "~/composables/useSiteContent";

defineOptions({ name: "XmasLotteryPage" });

// Lightning doodle extracted from Framer's Scribbles component on /lottery.
const SCRIBBLE_PATH =
  "M 103.972 45.671 C 103.69 46.902 102.341 47.647 101.524 48.614 C 99.35 51.182 97.507 54.141 95.651 56.891 C 90.145 65.038 84.134 72.906 78.542 81.02 C 73.249 88.702 70.117 96.634 65.786 104.598 C 65.412 105.281 63.73 107.807 65.575 106.915 C 68.846 105.332 75.965 106.583 79.598 106.583 C 80.845 106.583 96.27 105.769 96.369 107.246 C 96.866 114.621 93.509 123.032 92.567 130.419 C 91.881 135.79 90.549 141.154 89.356 146.455 C 88.637 149.661 88.88 153.209 87.413 156.239 C 86.482 158.168 87.848 156.028 88.048 155.247 C 88.949 151.715 91.035 147.957 92.609 144.616 C 98.632 131.832 107.931 120.695 115.336 108.606 C 120.958 99.427 127.672 90.492 133.245 81.756 C 133.701 81.04 135.63 78.968 134.217 79.953 C 132.797 80.942 128.847 81.338 127.12 81.424 C 118.001 81.878 108.673 85.628 99.789 87.346 C 98.261 87.643 91.76 90.976 93.496 87.382 C 96.044 82.114 96.197 75.986 97.889 70.463 C 99.7 64.553 100.154 58.205 102.281 52.44 C 102.873 50.843 104.372 43.512 105.496 43.023";

const [{ data: lottery }, { data: home }] = await Promise.all([
  useXmasLotteryContent(),
  useHomeContent(),
]);

const { headerAnimated, stepAnimated } = useScrollReveal(3, {
  stepSelector: ".xmas-lottery-page .step",
});

const isJoinModalOpen = ref(false);

function openJoinModal() {
  isJoinModalOpen.value = true;
}

function closeJoinModal() {
  isJoinModalOpen.value = false;
}

useHead(() => ({
  title: `${lottery.value.brandHeader} — ${lottery.value.title}`,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
}));
</script>

<template>
  <main class="xmas-lottery-page">
    <SiteTopNav />

    <header class="xmas-hero">
      <p
        class="bc-display-title xmas-hero__brand"
        :class="{ animated: headerAnimated }"
      >
        {{ lottery.brandHeader }}
      </p>
    </header>

    <section class="xmas-feed step" aria-labelledby="xmas-lottery-heading">
      <div class="xmas-feed__header" :class="{ animated: stepAnimated[0] }">
        <h1 id="xmas-lottery-heading" class="xmas-feed__heading">
          {{ lottery.title }}
        </h1>
        <p class="xmas-feed__subtitle">
          {{ lottery.subtitle }}
        </p>
        <button
          type="button"
          class="bc-btn bc-btn--white xmas-feed__join-btn"
          @click="openJoinModal"
        >
          {{ lottery.joinButtonLabel }}
        </button>
      </div>

      <div class="xmas-feed__grid">
        <article
          v-for="prize in lottery.prizes"
          :key="prize.id"
          :data-prize-id="prize.id"
          class="xmas-prize-card"
          :class="{ animated: stepAnimated[0] }"
        >
          <div class="xmas-prize-card__media">
            <svg
              v-if="prize.scribble"
              viewBox="0 0 200 200"
              class="xmas-prize-card__scribble"
              aria-hidden="true"
              focusable="false"
            >
              <path
                :d="SCRIBBLE_PATH"
                stroke-width="5"
                stroke="rgb(241, 224, 206)"
                stroke-linecap="round"
                fill="none"
                stroke-miterlimit="10"
              />
            </svg>
            <img
              :src="prize.image.url"
              :alt="prize.image.alt || prize.title"
              class="xmas-prize-card__image"
              :class="{
                'xmas-prize-card__image--contain': prize.imageContain,
              }"
            />
          </div>

          <div class="xmas-prize-card__content">
            <h2 class="xmas-prize-card__title">{{ prize.title }}</h2>
            <p class="xmas-prize-card__description">{{ prize.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="xmas-how step" aria-labelledby="xmas-how-heading">
      <div class="xmas-how__inner" :class="{ animated: stepAnimated[1] }">
        <h2 id="xmas-how-heading" class="xmas-how__heading">
          {{ lottery.howItWorksHeading }}
        </h2>

        <div class="xmas-how__grid">
          <article
            v-for="stepItem in lottery.steps"
            :key="stepItem.number"
            class="xmas-step-card"
          >
            <span class="xmas-step-card__number">{{ stepItem.number }}</span>
            <h3 class="xmas-step-card__title">{{ stepItem.title }}</h3>
            <p class="xmas-step-card__description">
              {{ stepItem.description }}
            </p>
          </article>
        </div>

        <p class="xmas-how__rules">{{ lottery.rulesNote }}</p>

        <button
          type="button"
          class="bc-btn bc-btn--amber-dark xmas-how__join-btn"
          @click="openJoinModal"
        >
          {{ lottery.joinButtonLabel }}
        </button>
      </div>
    </section>

    <HomePartners :section="home.partnersSection" :animate="stepAnimated[2]" />

    <JoinModal
      :open="isJoinModalOpen"
      :modal="lottery.modal"
      @close="closeJoinModal"
    />
  </main>
</template>

<style lang="scss" scoped>
.xmas-lottery-page {
  width: 100%;
  background-color: $cream;
}

.xmas-hero {
  width: 100%;
  height: 180px;
  padding: 20px;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &__brand {
    color: $black;
    font-size: 40px;
    line-height: 40px;
    letter-spacing: -1.6px;
    max-width: 1240px;
    width: 100%;

    @include fadeInUp(36px, 0.5s, 0.1s);

    @include tablet-up {
      font-size: 80px;
      line-height: 80px;
      letter-spacing: -3.2px;
    }
  }
}

.xmas-feed {
  width: 100%;
  background-color: $amber;
  padding: 60px 24px 80px;

  @include desktop-up {
    padding: 60px 100px 100px;
  }

  &__header {
    max-width: 1000px;
    margin: 0 auto 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    text-align: center;

    @include fadeInUp(40px, 0.55s, 0s);
  }

  &__heading {
    font-family: $font-primary;
    font-size: 40px;
    font-weight: 700;
    line-height: 48px;
    letter-spacing: -1.6px;
    color: $white;

    @include tablet-up {
      font-size: 46px;
      line-height: 55.2px;
      letter-spacing: -2.1px;
    }
  }

  &__subtitle {
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
    letter-spacing: -0.7px;
    color: $white;
    max-width: 500px;
  }

  &__join-btn {
    min-width: 180px;
    min-height: 56px;
    padding: 15px 24px;
    border: 0;
    border-radius: 12px;
    background-color: $white;
    color: $black;
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 700;
    line-height: 19.2px;

    &:focus-visible {
      outline: 2px solid $black;
      outline-offset: 3px;
    }
  }

  &__grid {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px 20px;

    @include tablet-up {
      grid-template-columns: repeat(2, 1fr);
      gap: 72px 20px;
    }
  }
}

.xmas-prize-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;

  @include fadeInUp(36px, 0.55s, 0.08s);

  &__media {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
  }

  &__scribble {
    position: absolute;
    top: -66px;
    left: -55px;
    width: 150px;
    height: 150px;
    transform: rotate(-20deg);
    pointer-events: none;
    z-index: 2;

    @include tablet-up {
      top: -100px;
      left: -100px;
      width: 200px;
      height: 200px;
    }
  }

  &__image {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--contain {
      object-fit: contain;
      object-position: 100% 50%;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }

  &__title {
    font-family: $font-primary;
    font-size: 20px;
    font-weight: 700;
    line-height: 30px;
    letter-spacing: -0.5px;
    color: $white;
  }

  &__description {
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: $white;
    max-width: 440px;
  }
}

.xmas-how {
  width: 100%;
  background-color: $cream;
  padding: 64px 20px 80px;

  @include tablet-up {
    padding: 80px 32px 96px;
  }

  &__inner {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 36px;
    text-align: center;

    @include fadeInUp(36px, 0.55s, 0.05s);
  }

  &__heading {
    font-family: $font-primary;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: $ink;

    @include tablet-up {
      font-size: 40px;
    }
  }

  &__grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    @include tablet-up {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 24px;
    }
  }

  &__rules {
    max-width: 640px;
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    color: $muted-dark;
  }

  &__join-btn {
    min-width: 180px;
    min-height: 54px;
    border: 0;

    &:focus-visible {
      outline: 2px solid $black;
      outline-offset: 3px;
    }
  }
}

.xmas-step-card {
  background-color: $white;
  border-radius: 18px;
  padding: 28px 22px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgb(0 0 0 / 6%);

  &__number {
    font-family: $font-display;
    font-size: 32px;
    line-height: 1;
    color: $amber;
  }

  &__title {
    font-family: $font-primary;
    font-size: 20px;
    font-weight: 800;
    line-height: 26px;
    color: $black;
  }

  &__description {
    font-family: $font-ui;
    font-size: 15px;
    font-weight: 400;
    line-height: 22px;
    color: $charcoal;
  }
}
</style>
