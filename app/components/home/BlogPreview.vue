<script setup lang="ts">
import type { BlogArticleACF, HomePageACF } from "~/types/acf";

defineOptions({ name: "HomeBlogPreview" });

defineProps<{
  section: HomePageACF["blogPreview"];
  articles: BlogArticleACF[];
  animate?: boolean;
}>();
</script>

<template>
  <section id="blog" class="blog-preview step">
    <div class="blog-preview__header" :class="{ animated: animate }">
      <h2 class="blog-preview__heading">{{ section.heading }}</h2>
      <p class="blog-preview__subtitle">{{ section.subtitle }}</p>
    </div>

    <div class="blog-preview__grid">
      <article
        v-for="article in articles"
        :key="article.id"
        class="blog-preview__card"
        :class="{ animated: animate }"
      >
        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="blog-preview__image-link"
          :aria-label="article.title.trim()"
        >
          <img
            :src="article.image.url"
            :alt="article.image.alt"
            class="blog-preview__image"
            loading="lazy"
          />
        </a>

        <h3 class="blog-preview__title">{{ article.title.trim() }}</h3>
        <p class="blog-preview__excerpt">{{ article.excerpt }}</p>

        <a
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="bc-btn bc-btn--white blog-preview__cta"
        >
          {{ article.ctaLabel }}
        </a>
      </article>
    </div>

    <NuxtLink
      :to="section.ctaTo"
      class="bc-btn bc-btn--white blog-preview__all-cta"
      :class="{ animated: animate }"
    >
      {{ section.ctaLabel }}
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.blog-preview {
  width: 100%;
  background-color: $amber;
  padding: 60px 20px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include tablet-up {
    padding: 100px 20px 50px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    margin-bottom: 48px;
    text-align: center;

    @include fadeInUp(40px, 0.55s, 0s);

    @include tablet-up {
      margin-bottom: 100px;
    }
  }

  &__heading {
    font-family: $font-primary;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.04em;
    color: $white;

    @include tablet-up {
      font-size: 46px;
      letter-spacing: -2.1px;
    }
  }

  &__subtitle {
    max-width: 500px;
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
    color: $white;
  }

  &__grid {
    width: 100%;
    max-width: 1000px;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 56px 20px;

    @include tablet-up {
      grid-template-columns: repeat(2, minmax(0, 490px));
      justify-content: space-between;
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    @include fadeInUp(40px, 0.55s, 0.1s);

    &:nth-child(2) {
      transition-delay: 0.22s;
    }
  }

  &__image-link {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 30px;
    border-radius: 20px;
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    .blog-preview__image-link:hover & {
      transform: scale(1.03);
    }
  }

  &__title {
    margin-bottom: 12px;
    font-family: $font-primary;
    font-size: 20px;
    font-weight: 700;
    line-height: 30px;
    color: $white;
  }

  &__excerpt {
    max-width: 400px;
    margin-bottom: 33px;
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: $white;
  }

  &__cta {
    min-width: 140px;
    color: $black;
    white-space: pre-line;
  }

  &__all-cta {
    margin-top: 56px;
    min-height: 50px;
    color: $black;

    @include tablet-up {
      margin-top: 91px;
    }
  }
}
</style>
