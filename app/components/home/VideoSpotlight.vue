<script setup lang="ts">
import { computed, ref } from "vue";
import type { HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeVideoSpotlight" });

const props = defineProps<{
  section: HomePageACF["videoSpotlight"];
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
  <section id="videos" class="video-spotlight">
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
      <div class="video-spotlight__copy-inner">
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

  @include tablet-up {
    flex-direction: row;
    align-items: center;
    min-height: 539px;
  }

  &__media {
    padding: 40px 20px 0;

    @include tablet-up {
      flex: 0 0 50%;
      padding: 32px 20px 32px 0;
    }
  }

  &__frame {
    position: relative;
    width: 100%;
    max-width: 640px;
    margin-left: auto;
    aspect-ratio: 16 / 9;
    border-radius: 20px;
    overflow: hidden;
    background-color: $black;

    @include tablet-up {
      border-radius: 0 20px 20px 0;
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
    padding: 40px 20px 56px;

    @include tablet-up {
      flex: 0 0 50%;
      padding: 32px 140px 32px 20px;
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
