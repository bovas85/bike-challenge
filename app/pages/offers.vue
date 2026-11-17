<script setup lang="ts">
import { useOffersContent } from "~/composables/useSiteContent";

defineOptions({ name: "OffersPage" });
const { data: offers } = await useOffersContent();
</script>

<template>
  <main class="offers-page">
    <SiteTopNav />
    <h1>{{ offers.brandHeader }}</h1>
  </main>
</template>
