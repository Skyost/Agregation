// @ts-ignore
import { defineTransformer } from '@nuxt/content/transformers'
import { parseBib } from '~/utils/utils'

/**
 * Nuxt content transformer for .bib files.
 */
export default defineTransformer({
  name: 'bibtex',
  extensions: ['.bib'],
  // @ts-ignore
  parse (_id: string, rawContent: string) {
    return { _id, ...parseBib(rawContent) }
  }
})
