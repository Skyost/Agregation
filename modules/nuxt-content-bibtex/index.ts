import { createResolver, defineNuxtModule } from '@nuxt/kit'

/**
 * The name of the module.
 */
export const name = 'nuxt-content-bibtex'

/**
 * Options for the Nuxt content BibTeX module.
 *
 * @interface ModuleOptions
 */
export interface ModuleOptions {}

/**
 * Nuxt module for transforming .bib files in Nuxt content.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    configKey: 'nuxtContentBibtex',
    compatibility: { nuxt: '^3.0.0' }
  },
  defaults: {},
  setup (_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Set up Nitro externals for .bib content transformation.
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []
    nuxt.options.nitro.externals.inline.push(resolver.resolve('.'))

    // Register a hook to modify content context and add a transformer for .bib files.
    nuxt.hook('content:context', (contentContext) => {
      contentContext.transformers.push(resolver.resolve('transformer.ts'))
    })
  }
})
