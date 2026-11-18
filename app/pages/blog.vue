<script setup lang="ts">
import { useHead } from "#imports";
import BlogCard from "~/components/blog/BlogCard.vue";
import { useBlogContent, useHomeContent } from "~/composables/useSiteContent";

defineOptions({ name: "BlogPage" });

const [{ data: blog }, { data: home }] = await Promise.all([
  useBlogContent(),
  useHomeContent(),
]);

useHead(() => ({
  title: `${blog.value.brandHeader} — ${blog.value.heading}`,
}));
</script>

<template>
  <main class="blog-page">
    <SiteTopNav />

    <header class="blog-hero">
      <h1 class="bc-display-title blog-hero__title">
        {{ blog.brandHeader }}
      </h1>
    </header>

    <section class="blog-feed" aria-labelledby="blog-heading">
      <div class="blog-feed__header">
        <h2 id="blog-heading" class="blog-feed__heading">
          {{ blog.heading }}
        </h2>
        <p class="blog-feed__subtitle">
          {{ blog.subtitle }}
        </p>
      </div>

      <div class="blog-feed__grid">
        <BlogCard
          v-for="article in blog.articles"
          :key="article.id"
          :article="article"
        />
      </div>
    </section>

    <section class="blog-partners" aria-labelledby="blog-partners-heading">
      <div class="blog-partners__inner">
        <h2 id="blog-partners-heading" class="blog-partners__heading">
          {{ home.partnersSection.heading }}
        </h2>

        <div class="blog-partners__grid">
          <a
            v-for="partner in home.partnersSection.logos"
            :key="partner.id"
            :href="partner.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="partner.name"
            class="blog-partners__logo-link"
          >
            <img
              :src="partner.logoUrl"
              :alt="partner.name"
              class="blog-partners__logo-img"
              loading="lazy"
            />
          </a>
        </div>

        <NuxtLink
          :to="home.partnersSection.ctaTo"
          class="bc-btn bc-btn--amber-dark blog-partners__cta"
        >
          {{ home.partnersSection.ctaLabel }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.blog-page {
  width: 100%;
  background-color: $cream;
}

.blog-hero {
  width: 100%;
  min-height: 140px;
  padding: 20px 24px;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  @include tablet-up {
    height: 180px;
  }

  &__title {
    color: $black;
    letter-spacing: -0.04em;
    max-width: 1240px;
    width: 100%;
  }
}

.blog-feed {
  width: 100%;
  background-color: $amber;
  padding: 60px 24px 100px;

  &__header {
    max-width: 1000px;
    margin: 0 auto 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    text-align: center;
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
    font-family: $font-primary;
    font-size: 18px;
    font-weight: 400;
    line-height: 27px;
    letter-spacing: -0.7px;
    color: $white;
    max-width: 500px;
  }

  &__grid {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px 20px;

    @include tablet-up {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.blog-partners {
  width: 100%;
  background-color: $white;
  padding: 80px 24px;

  &__inner {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 60px;
  }

  &__heading {
    font-family: $font-primary;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.04em;
    color: $navy;
    text-align: center;

    @include tablet-up {
      font-size: 46px;
      letter-spacing: -2.1px;
    }
  }

  &__grid {
    width: 100%;
    max-width: 650px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    justify-items: center;

    @include tablet-up {
      grid-template-columns: repeat(2, minmax(0, 295px));
      gap: 60px;
      justify-content: center;
    }
  }

  &__logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 295px;
    max-width: 100%;
    height: 100px;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__cta {
    min-width: 140px;
    min-height: 60px;
    padding: 15px 24px;
    border-radius: 12px;
    background-color: $amber;
    color: $black;
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 700;
    line-height: 19.2px;
  }
}
</style>
