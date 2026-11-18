<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useGlobalContent } from "~/composables/useSiteContent";

defineOptions({ name: "SiteFooter" });

const route = useRoute();
const { data: globalContent } = await useGlobalContent();

const displayEmail = computed(() =>
  route.path.startsWith("/blog")
    ? globalContent.value.blogEmail
    : globalContent.value.email,
);
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__icons">
        <a
          v-for="social in globalContent.socialLinks"
          :key="social.name"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="social.label"
          class="site-footer__icon-link"
        >
          <svg
            v-if="social.name === 'instagram'"
            viewBox="0 0 32 32"
            width="32"
            height="32"
            aria-hidden="true"
          >
            <path
              d="M 12 16 C 12 13.791 13.791 12 16 12 C 18.209 12 20 13.791 20 16 C 20 18.209 18.209 20 16 20 C 13.791 20 12 18.209 12 16 Z"
              fill="none"
              stroke="#000"
              stroke-width="2"
            />
            <rect
              x="6"
              y="6"
              width="20"
              height="20"
              rx="6"
              fill="none"
              stroke="#000"
              stroke-width="2"
            />
            <circle cx="21.5" cy="10.5" r="1.5" fill="#000" />
          </svg>
          <img
            v-else-if="social.iconUrl"
            :src="social.iconUrl"
            :alt="social.label"
            width="32"
            height="32"
          />
        </a>
      </div>

      <p class="site-footer__email">
        <a :href="`mailto:${displayEmail}`">{{ displayEmail }}</a>
      </p>
      <p class="site-footer__copy">{{ globalContent.copyright }}</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.site-footer {
  width: 100%;
  min-height: 200px;
  background-color: $gold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  @include tablet-up {
    min-height: 220px;
    padding: 50px;
  }

  @include desktop-up {
    min-height: 320px;
    padding: 100px;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 1080px;
    width: 100%;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 12px;
  }

  &__icon-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.75;
    }

    img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }

  &__email,
  &__copy {
    font-family: $font-primary;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: $white;
  }
}
</style>
