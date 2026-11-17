<script setup lang="ts">
import { useGlobalContent } from "~/composables/useSiteContent";

defineOptions({ name: "SiteTopNav" });

const { data: globalContent } = await useGlobalContent();
</script>

<template>
  <nav class="site-top-nav" aria-label="Primary navigation">
    <div class="site-top-nav__inner">
      <NuxtLink to="/" class="site-top-nav__logo" aria-label="Home">
        <img
          :src="globalContent.logoUrl"
          :alt="globalContent.brandTitle"
          width="26"
          height="24"
        />
      </NuxtLink>
      <NuxtLink to="/" class="site-top-nav__link">Home</NuxtLink>
    </div>
    <div class="site-top-nav__divider" />
  </nav>
</template>

<style lang="scss" scoped>
.site-top-nav {
  position: relative;
  width: 100%;
  height: 64px;
  background-color: $white;
  display: flex;
  align-items: center;

  &__inner {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 16px;
    height: 100%;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 24px;

    img {
      width: 26px;
      height: 24px;
      object-fit: contain;
    }
  }

  &__link {
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 900;
    line-height: 32px;
    color: $ink;
  }

  &__divider {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: rgb(0 0 0 / 8%);
  }
}
</style>
