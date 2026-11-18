<script setup lang="ts">
import type { OfferCardACF } from "~/types/acf";

defineOptions({ name: "OfferCard" });

defineProps<{
  offer: OfferCardACF;
  animate?: boolean;
}>();
</script>

<template>
  <article
    class="offer-card"
    :class="{ animated: animate }"
    :data-offer-id="offer.id"
  >
    <a
      :href="offer.url"
      target="_blank"
      rel="noopener noreferrer"
      class="offer-card__media"
      :aria-label="`${offer.brand} — ${offer.discountBadge} discount`"
    >
      <img
        :src="offer.image.url"
        :alt="offer.image.alt || offer.brand"
        class="offer-card__image"
        :class="{ 'offer-card__image--contain': offer.id === 'ogt' }"
        loading="lazy"
      />
      <img
        v-if="offer.overlayLogoUrl"
        :src="offer.overlayLogoUrl"
        :alt="`${offer.brand} logo`"
        class="offer-card__overlay-logo"
        width="100"
        height="100"
        loading="lazy"
      />
      <span v-if="offer.discountBadge" class="offer-card__badge">
        {{ offer.discountBadge }}
      </span>
    </a>

    <div class="offer-card__body">
      <h3 class="offer-card__title">
        <a
          :href="offer.url"
          target="_blank"
          rel="noopener noreferrer"
          class="offer-card__title-link"
        >
          {{ offer.brand }}
        </a>
      </h3>

      <p v-if="offer.description" class="offer-card__description">
        {{ offer.description }}
      </p>

      <p v-if="offer.code" class="offer-card__code">
        Code:
        <a
          :href="offer.codeUrl || offer.url"
          target="_blank"
          rel="noopener noreferrer"
          class="offer-card__code-link"
        >
          {{ offer.code }}
        </a>
      </p>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.offer-card {
  display: flex;
  flex-direction: column;
  width: 100%;

  @include fadeInUp(32px, 0.5s, 0.05s);

  &__media {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 20px;
    overflow: hidden;
    background-color: transparent;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
    display: block;
    transition: transform 0.35s ease;

    &--contain {
      object-fit: contain;
    }
  }

  &__media:hover &__image {
    transform: scale(1.03);
  }

  &__overlay-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    object-fit: contain;
    pointer-events: none;
  }

  &__badge {
    position: absolute;
    top: 24px;
    right: 24px;
    min-width: 56px;
    height: 56px;
    padding: 0 8px;
    border-radius: 999px;
    background-color: $white;
    color: $black;
    font-family: $font-ui;
    font-size: 16px;
    font-weight: 700;
    line-height: 19.2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgb(0 0 0 / 10%);
    border: 1px solid rgb(0 0 0 / 6%);
  }

  &__body {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__title {
    font-family: $font-primary;
    font-size: 22px;
    font-weight: 700;
    line-height: 22px;
    letter-spacing: -0.02em;
    color: $black;
  }

  &__title-link {
    color: inherit;
    text-decoration: none;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }
  }

  &__description {
    margin-top: 10px;
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 21.6px;
    letter-spacing: -0.01em;
    color: $muted;
  }

  &__code {
    margin-top: 10px;
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 21.6px;
    letter-spacing: -0.01em;
    color: $muted;
  }

  &__description + &__code {
    margin-top: 18px;
  }

  &__code-link {
    color: $black;
    text-decoration: none;
    transition: opacity 0.2s ease;

    &:hover {
      text-decoration: underline;
      opacity: 0.8;
    }
  }
}
</style>
