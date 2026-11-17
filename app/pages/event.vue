<script setup lang="ts">
import { useEventContent } from "~/composables/useSiteContent";

defineOptions({ name: "EventPage" });
const { data: eventData } = await useEventContent();
</script>

<template>
  <main class="event-page">
    <h1>{{ eventData.title }}</h1>
  </main>
</template>
