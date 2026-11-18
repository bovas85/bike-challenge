<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeJoinJourney" });

defineProps<{
  section: HomePageACF["joinJourney"];
  animate?: boolean;
}>();
</script>

<template>
  <section id="content" class="join-journey step">
    <div class="join-journey__inner" :class="{ animated: animate }">
      <h2 class="join-journey__heading">{{ section.heading }}</h2>
      <p class="join-journey__body">{{ section.body }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.join-journey {
  width: 100%;
  background-color: $amber;
  padding: 48px 20px 64px;
  scroll-margin-top: 0;

  @include tablet-up {
    padding: 60px 50px;
  }

  &__inner {
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
    font-size: 36px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.04em;
    color: $white;

    @include tablet-up {
      font-size: 46px;
      letter-spacing: -2.1px;
    }
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
}
</style>
