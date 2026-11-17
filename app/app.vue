<template>
  <div class="site-root">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="#ea9922" :height="4" :throttle="0" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
.site-root {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
}
</style>
