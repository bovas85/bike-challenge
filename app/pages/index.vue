<script setup lang="ts">
import { useHomeContent } from "~/composables/useSiteContent";

defineOptions({ name: "HomePage" });
const { data: home } = await useHomeContent();
</script>

<template>
  <main class="home-page">
    <h1>{{ home.hero.title }}</h1>
  </main>
</template>
