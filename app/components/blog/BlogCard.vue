<script setup lang="ts">
import type { BlogArticleACF } from "~/types/acf";

defineOptions({ name: "BlogCard" });

defineProps<{
  article: BlogArticleACF;
  animate?: boolean;
}>();
</script>

<template>
  <article class="blog-card" :class="{ animated: animate }">
    <a
      :href="article.url"
      target="_blank"
      rel="noopener noreferrer"
      class="blog-card__image-link"
      :aria-label="article.title"
    >
      <img
        :src="article.image.url"
        :alt="article.image.alt || article.title"
        class="blog-card__image"
        loading="lazy"
      />
    </a>

    <div class="blog-card__content">
      <p v-if="article.readTime" class="blog-card__read-time">
        {{ article.readTime }}
      </p>
      <h3 class="blog-card__title">{{ article.title }}</h3>
      <p class="blog-card__excerpt">{{ article.excerpt }}</p>
      <a
        :href="article.url"
        target="_blank"
        rel="noopener noreferrer"
        class="bc-btn bc-btn--white blog-card__cta"
      >
        {{ article.ctaLabel }}
      </a>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.blog-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  @include fadeInUp(36px, 0.55s, 0.08s);

  &__image-link {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  &__image-link:hover &__image {
    transform: scale(1.02);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding-top: 7px;
  }

  &__read-time {
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 400;
    line-height: 16.8px;
    color: $white;
    margin-bottom: 6px;
  }

  &__title {
    font-family: $font-primary;
    font-size: 20px;
    font-weight: 700;
    line-height: 30px;
    letter-spacing: -0.5px;
    color: $white;
    white-space: pre-line;
  }

  &__excerpt {
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: $white;
    max-width: 400px;
    margin-top: 22px;
  }

  &__cta {
    min-width: 140px;
    min-height: 60px;
    padding: 15px 18px;
    border-radius: 12px;
    background-color: $white;
    color: $black;
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 700;
    line-height: 19.2px;
    white-space: pre-line;
    margin-top: 22px;
  }
}
</style>
