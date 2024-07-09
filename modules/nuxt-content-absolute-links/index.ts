import { createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-content-absolute-links',
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
  },
  setup: (_, nuxt) => {
    const resolver = createResolver(import.meta.url)

    // Update Nitro config.
    nuxt.hook('nitro:config', (config) => {
      config.plugins = config.plugins || []
      config.plugins.push(resolver.resolve('plugin'))
    })
  },
})
