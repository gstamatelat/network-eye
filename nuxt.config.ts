export default defineNuxtConfig({
  typescript: {
      strict: true
  },

  modules: [
      '@nuxtjs/tailwindcss'
  ],

  vite: {
      base: '/_nuxt/' // TODO: this shouldn't be required but web worker has __NUXT_BASE__ in its URL otherwise
  },

  build: {
      transpile: ['chart.js'] // TODO: This is probably a bug and we need to remove this
  },

  compatibilityDate: '2025-04-18'
})
