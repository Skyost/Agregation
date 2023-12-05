import * as bootstrapCollapse from 'bootstrap/js/dist/collapse'

/**
 * Bootstrap plugin for Nuxt.
 *
 * @param {NuxtApp} nuxtApp - The Nuxt app instance.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('bootstrap', {
    ...bootstrapCollapse
  })
})
