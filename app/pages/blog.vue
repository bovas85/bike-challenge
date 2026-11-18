<script setup lang="ts">
import { useHead } from "#imports";
import BlogCard from "~/components/blog/BlogCard.vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import { useBlogContent, useHomeContent } from "~/composables/useSiteContent";

defineOptions({ name: "BlogPage" });

const [{ data: blog }, { data: home }] = await Promise.all([
  useBlogContent(),
  useHomeContent(),
]);

const { headerAnimated, stepAnimated } = useScrollReveal(2, {
  stepSelector: ".blog-page .step",
});

useHead(() => ({
  title: `${blog.value.brandHeader} — ${blog.value.heading}`,
}));
</script>

<template>
  <main class="blog-page">
    <SiteTopNav />

    <header class="blog-hero">
      <h1
        class="bc-display-title blog-hero__title"
        :class="{ animated: headerAnimated }"
      >
        {{ blog.brandHeader }}
      </h1>
    </header>

    <section class="blog-feed step" aria-labelledby="blog-heading">
      <div class="blog-feed__header" :class="{ animated: stepAnimated[0] }">
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
          :animate="stepAnimated[0]"
        />
      </div>
    </section>

    <section class="blog-partners step" aria-labelledby="blog-partners-heading">
      <div class="blog-partners__inner">
        <h2
          id="blog-partners-heading"
          class="blog-partners__heading"
          :class="{ animated: stepAnimated[1] }"
        >
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
            :class="{ animated: stepAnimated[1] }"
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
          :class="{ animated: stepAnimated[1] }"
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
  height: 180px;
  padding: 20px;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &__title {
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

.blog-feed {
  width: 100%;
  background-color: $amber;
  padding: 60px 24px 100px;

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
    font-size: 46px;
    font-weight: 700;
    line-height: 55.2px;
    letter-spacing: -2.1px;
    color: $white;
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
  padding: 80px 40px;

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
    font-size: 40px;
    font-weight: 700;
    line-height: 48px;
    letter-spacing: -1.6px;
    color: $navy;
    text-align: center;

    @include fadeInUp(36px, 0.55s, 0s);

    @include desktop-up {
      font-size: 46px;
      line-height: 55.2px;
      letter-spacing: -2.1px;
    }
  }

  &__grid {
    width: 100%;
    max-width: 650px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 60px;
    justify-items: center;

    @include tablet-up {
      grid-template-columns: repeat(2, minmax(0, 295px));
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

    @include fadeInUp(32px, 0.5s, 0.08s);

    &:hover {
      opacity: 0.8;
    }

    &:last-child .blog-partners__logo-img {
      object-fit: contain;
    }
  }

  &__logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

    @include fadeInUp(28px, 0.5s, 0.16s);
  }
}
</style>
