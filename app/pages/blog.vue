<script setup lang="ts">
import { useBlogContent } from "~/composables/useSiteContent";

defineOptions({ name: "BlogPage" });
const { data: blog } = await useBlogContent();
</script>

<template>
  <main class="blog-page">
    <SiteTopNav />
    <h1>{{ blog.brandHeader }}</h1>
  </main>
</template>
