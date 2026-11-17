<template>
  <div class="app-shell">
    <slot />
    <SiteFooter />
  </div>
</template>

<style lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: clip;

  > footer {
    margin-top: auto;
  }
}
</style>
