// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  ignores: ["archive/**", "dist/**", ".nuxt/**", ".output/**", ".autopilot/**"],
  rules: {
    "vue/html-self-closing": "off",
  },
});
