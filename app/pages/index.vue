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
import { useScrollReveal } from "~/composables/useScrollReveal";

defineOptions({ name: "HomePage" });

const [{ data: home }, { data: blog }, { data: globalContent }] =
  await Promise.all([useHomeContent(), useBlogContent(), useGlobalContent()]);

const featuredArticles = computed(() =>
  blog.value.articles.filter((article) => article.featuredOnHome === true),
);

const { headerAnimated, stepAnimated } = useScrollReveal(8, {
  stepSelector: ".home-page .step",
});

useHead(() => ({
  title: globalContent.value.brandTitle,
}));
</script>

<template>
  <main class="home-page">
    <HeroSection
      :hero="home.hero"
      :nav-links="globalContent.heroNavLinks"
      :animate="headerAnimated"
    />
    <JoinJourney :section="home.joinJourney" :animate="stepAnimated[0]" />
    <QuoteSection :section="home.quote" :animate="stepAnimated[1]" />
    <ViewFromBars :section="home.viewFromBars" :animate="stepAnimated[2]" />
    <AdventuresSection
      :adventures="home.adventures"
      :animate="stepAnimated[3]"
    />
    <VideoSpotlight :section="home.videoSpotlight" :animate="stepAnimated[4]" />
    <ShapesBand />
    <BlogPreview
      :section="home.blogPreview"
      :articles="featuredArticles"
      :animate="stepAnimated[5]"
    />
    <CampsitesMap :section="home.campsitesMap" :animate="stepAnimated[6]" />
    <PartnersSection
      :section="home.partnersSection"
      :animate="stepAnimated[7]"
    />
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
