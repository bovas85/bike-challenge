// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "intro", mode: "out-in" },
    head: {
      htmlAttrs: { lang: "en" },
      title: "The Bike Challenge Club",
      meta: [
        {
          name: "description",
          content:
            "A cycling channel with videos about cycling, travel, and cycling-related content. Follow us for bikepacking adventures, gravel and more!",
        },
        { name: "theme-color", content: "#ea9922" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/icon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;700;800;900&display=swap",
        },
      ],
    },
  },
  css: ["~/assets/css/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/variables.scss" as *;',
          silenceDeprecations: ["import", "global-builtin", "legacy-js-api"],
        },
      },
    },
    optimizeDeps: {
      include: ["scrollama", "swiper/modules", "swiper/vue"],
    },
  },
  modules: ["@vueuse/nuxt", "@nuxt/eslint"],
  eslint: {
    checker: false,
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      failOnError: false,
      routes: ["/health", "/health.json"],
    },
  },
  runtimeConfig: {
    wpApiSecret: process.env.WP_API_SECRET || "",
    public: {
      wpApiBase: process.env.WP_API_BASE || "",
      wpUseLocalFallback: process.env.WP_USE_LOCAL_FALLBACK !== "false",
      enableWpApiProxy: process.env.ENABLE_WP_API_PROXY !== "false",
      enableYoutubeFacade: process.env.ENABLE_YOUTUBE_FACADE !== "false",
      enableScrollReveal: process.env.ENABLE_SCROLL_REVEAL !== "false",
    },
  },
});
