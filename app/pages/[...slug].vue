<template>
  <main class="not-found">
    <SiteTopNav />
    <section class="not-found__inner">
      <h1 class="bc-display-title">Page Not Found</h1>
      <p>The trail you are looking for has moved or does not exist.</p>
      <NuxtLink to="/" class="bc-btn bc-btn--amber">Back to Home</NuxtLink>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.not-found {
  background-color: $white;

  &__inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 80px 24px 120px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
}
</style>
