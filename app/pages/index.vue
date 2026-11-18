<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "#imports";
import AdventuresSection from "~/components/home/Adventures.vue";
import BlogPreview from "~/components/home/BlogPreview.vue";
import CampsitesMap from "~/components/home/CampsitesMap.vue";
import HeroSection from "~/components/home/HeroSection.vue";
import JoinJourney from "~/components/home/JoinJourney.vue";
import PartnersSection from "~/components/home/PartnersSection.vue";
import QuoteSection from "~/components/home/QuoteSection.vue";
import ShapesBand from "~/components/home/ShapesBand.vue";
import VideoSpotlight from "~/components/home/VideoSpotlight.vue";
import ViewFromBars from "~/components/home/ViewFromBars.vue";
import {
  useBlogContent,
  useGlobalContent,
  useHomeContent,
} from "~/composables/useSiteContent";

defineOptions({ name: "HomePage" });

const [{ data: home }, { data: blog }, { data: globalContent }] =
  await Promise.all([useHomeContent(), useBlogContent(), useGlobalContent()]);

const featuredArticles = computed(() =>
  blog.value.articles.filter((article) => article.featuredOnHome === true),
);

useHead(() => ({
  title: globalContent.value.brandTitle,
}));
</script>

<template>
  <main class="home-page">
    <HeroSection :hero="home.hero" :nav-links="globalContent.heroNavLinks" />
    <JoinJourney :section="home.joinJourney" />
    <QuoteSection :section="home.quote" />
    <ViewFromBars :section="home.viewFromBars" />
    <AdventuresSection :adventures="home.adventures" />
    <VideoSpotlight :section="home.videoSpotlight" />
    <ShapesBand />
    <BlogPreview :section="home.blogPreview" :articles="featuredArticles" />
    <CampsitesMap :section="home.campsitesMap" />
    <PartnersSection :section="home.partnersSection" />
  </main>
</template>

<style lang="scss" scoped>
.home-page {
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  background-color: $cream;
}
</style>
