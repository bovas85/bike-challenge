<script setup lang="ts">
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeCampsitesMap" });

defineProps<{
  section: HomePageACF["campsitesMap"];
  animate?: boolean;
}>();
</script>

<template>
  <section id="map" class="campsites-map step">
    <h2 class="campsites-map__heading" :class="{ animated: animate }">
      {{ section.heading }}
    </h2>
    <div class="campsites-map__frame" :class="{ animated: animate }">
      <iframe
        :src="section.embedUrl"
        :title="section.heading"
        class="campsites-map__iframe"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.campsites-map {
  width: 100%;
  background-color: $white;
  padding: 64px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;

  @include tablet-up {
    padding: 80px 20px;
    gap: 80px;
  }

  &__heading {
    width: 100%;
    max-width: 1240px;
    font-family: $font-ui;
    font-size: 28px;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    color: $black;

    @include fadeInUp(36px, 0.55s, 0s);

    @include tablet-up {
      font-size: 40px;
      line-height: 40px;
    }
  }

  &__frame {
    width: 100%;
    max-width: 640px;
    aspect-ratio: 640 / 400;

    @include fadeInUp(36px, 0.55s, 0.12s);
  }

  &__iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
  }
}
</style>
