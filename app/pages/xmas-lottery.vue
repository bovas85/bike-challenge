<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "#imports";
import JoinModal from "~/components/xmas-lottery/JoinModal.vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import { useXmasLotteryContent } from "~/composables/useSiteContent";

defineOptions({ name: "XmasLotteryPage" });

const { data: lottery } = await useXmasLotteryContent();

const { headerAnimated, stepAnimated } = useScrollReveal(2, {
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
  title: `${lottery.value.title} | ${lottery.value.brandHeader}`,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
}));
</script>

<template>
  <main class="xmas-lottery-page">
    <SiteTopNav />

    <header class="xmas-hero">
      <div class="xmas-hero__inner" :class="{ animated: headerAnimated }">
        <p class="bc-display-title xmas-hero__brand">
          {{ lottery.brandHeader }}
        </p>
        <h1 class="xmas-hero__title">{{ lottery.title }}</h1>
        <p class="xmas-hero__subtitle">{{ lottery.subtitle }}</p>
        <p class="xmas-hero__intro">{{ lottery.intro }}</p>
        <button
          type="button"
          class="bc-btn bc-btn--white xmas-hero__join-btn"
          @click="openJoinModal"
        >
          {{ lottery.joinButtonLabel }}
        </button>
      </div>
    </header>

    <section class="xmas-prizes step" aria-labelledby="xmas-prizes-heading">
      <div class="xmas-prizes__inner" :class="{ animated: stepAnimated[0] }">
        <div class="xmas-prizes__header">
          <h2 id="xmas-prizes-heading" class="xmas-prizes__heading">
            {{ lottery.prizesHeading }}
          </h2>
          <p class="xmas-prizes__subtitle">{{ lottery.prizesSubtitle }}</p>
        </div>

        <div class="xmas-prizes__grid">
          <article
            v-for="prize in lottery.prizes"
            :key="prize.id"
            :data-prize-id="prize.id"
            class="xmas-prize-card"
          >
            <div class="xmas-prize-card__meta">
              <span class="xmas-prize-card__week">{{ prize.weekLabel }}</span>
              <span class="xmas-prize-card__date">{{ prize.drawDate }}</span>
            </div>
            <h3 class="xmas-prize-card__title">{{ prize.title }}</h3>
            <p class="xmas-prize-card__description">{{ prize.description }}</p>
          </article>
        </div>
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
  background-color: $amber;
  padding: 56px 24px 68px;
  text-align: center;

  @include tablet-up {
    padding: 72px 40px 84px;
  }

  &__inner {
    max-width: 780px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;

    @include fadeInUp(32px, 0.5s, 0.08s);
  }

  &__brand {
    color: $black;
    font-size: 42px;
    line-height: 1;
    letter-spacing: -0.04em;

    @include tablet-up {
      font-size: 72px;
    }
  }

  &__title {
    font-family: $font-primary;
    font-size: 32px;
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: $white;

    @include tablet-up {
      font-size: 46px;
    }
  }

  &__subtitle {
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 700;
    line-height: 26px;
    color: $ink;

    @include tablet-up {
      font-size: 20px;
    }
  }

  &__intro {
    max-width: 580px;
    font-family: $font-ui;
    font-size: 16px;
    font-weight: 400;
    line-height: 25px;
    color: $white;

    @include tablet-up {
      font-size: 18px;
      line-height: 27px;
    }
  }

  &__join-btn {
    margin-top: 8px;
    min-width: 180px;
    border: 0;

    &:focus-visible {
      outline: 2px solid $black;
      outline-offset: 3px;
    }
  }
}

.xmas-prizes {
  width: 100%;
  background-color: $cream;
  padding: 64px 20px;

  @include tablet-up {
    padding: 80px 32px;
  }

  &__inner {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 40px;

    @include fadeInUp(36px, 0.55s, 0.05s);
  }

  &__header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__heading {
    font-family: $font-primary;
    font-size: 34px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: $ink;

    @include tablet-up {
      font-size: 44px;
    }
  }

  &__subtitle {
    max-width: 560px;
    font-family: $font-ui;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: $charcoal;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    @include tablet-up {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px;
    }
  }
}

.xmas-prize-card {
  background-color: $white;
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgb(0 0 0 / 6%);

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__week {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 999px;
    background-color: $amber;
    color: $black;
    font-family: $font-ui;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__date {
    font-family: $font-ui;
    font-size: 13px;
    font-weight: 600;
    color: $muted-dark;
  }

  &__title {
    font-family: $font-primary;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: $black;
  }

  &__description {
    font-family: $font-ui;
    font-size: 15px;
    font-weight: 400;
    line-height: 23px;
    color: $charcoal;
  }
}

.xmas-how {
  width: 100%;
  background-color: $white;
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
    border: 0;

    &:focus-visible {
      outline: 2px solid $black;
      outline-offset: 3px;
    }
  }
}

.xmas-step-card {
  background-color: $cream;
  border-radius: 18px;
  padding: 28px 22px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;

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
