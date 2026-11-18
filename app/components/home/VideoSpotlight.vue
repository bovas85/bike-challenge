<script setup lang="ts">
import { computed, ref } from "vue";
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeVideoSpotlight" });

const props = defineProps<{
  section: HomePageACF["videoSpotlight"];
  animate?: boolean;
}>();

const isPlaying = ref(false);

const embedUrl = computed(
  () => `https://www.youtube.com/embed/${props.section.youtubeId}?autoplay=1`,
);
const plainHeading = computed(() =>
  props.section.heading.replace(/\s+/g, " ").trim(),
);

function play() {
  isPlaying.value = true;
}
</script>

<template>
  <section id="videos" class="video-spotlight step">
    <div class="video-spotlight__media">
      <div class="video-spotlight__frame">
        <iframe
          v-if="isPlaying"
          class="video-spotlight__iframe"
          :src="embedUrl"
          :title="plainHeading"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share;
          "
          allowfullscreen
        />
        <template v-else>
          <img
            class="video-spotlight__thumbnail"
            :src="section.thumbnailUrl"
            :alt="plainHeading"
            loading="lazy"
          />
          <button
            type="button"
            class="video-spotlight__play"
            aria-label="Play video"
            @click="play"
          >
            <svg viewBox="0 0 68 48" aria-hidden="true" focusable="false">
              <path
                d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                fill="#f00"
              />
              <path d="M45 24 27 14v20" fill="#fff" />
            </svg>
          </button>
        </template>
      </div>
    </div>

    <div class="video-spotlight__copy">
      <div class="video-spotlight__copy-inner" :class="{ animated: animate }">
        <h2 class="video-spotlight__heading">{{ section.heading }}</h2>
        <p class="video-spotlight__body">{{ section.body }}</p>
        <a
          :href="section.ctaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="bc-btn bc-btn--white video-spotlight__cta"
        >
          {{ section.ctaLabel }}
        </a>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.video-spotlight {
  width: 100%;
  background-color: $amber;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 20px 40px 100px;
  min-height: 563px;

  @include tablet-up {
    padding: 100px 20px;
    min-height: 799px;
  }

  @include desktop-up {
    flex-direction: row;
    padding: 100px 20px;
    min-height: 539px;
  }

  &__media {
    width: 100%;
    max-width: 310px;
    padding: 0;

    @include tablet-up {
      width: auto;
      max-width: none;
      flex: 0 0 auto;
    }
  }

  &__frame {
    position: relative;
    width: 100%;
    height: 199px;
    border-radius: 0;
    overflow: hidden;
    background-color: $black;

    @include tablet-up {
      width: 603px;
      height: 339px;
    }
  }

  &__thumbnail,
  &__iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    border: 0;
    object-fit: cover;
  }

  &__play {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 68px;
    height: 48px;
    margin: -24px 0 0 -34px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.08);
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__copy {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 310px;
    padding: 0;

    @include tablet-up {
      max-width: 609px;
    }

    @include desktop-up {
      flex: 0 0 auto;
      width: 320px;
      max-width: 320px;
    }
  }

  &__copy-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    width: 100%;

    @include fadeInUp(40px, 0.55s, 0s);
  }

  &__heading {
    font-family: $font-primary;
    font-size: 40px;
    font-weight: 700;
    line-height: 48px;
    letter-spacing: -1.6px;
    white-space: pre-line;
    color: $white;

    @include desktop-up {
      font-size: 46px;
      line-height: 55.2px;
      letter-spacing: -2.1px;
    }
  }

  &__body {
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    color: $white;
  }

  &__cta {
    min-height: 50px;
    color: $black;
  }
}
</style>
