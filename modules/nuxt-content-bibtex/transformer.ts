import { defineTransformer } from '@nuxt/content/transformers'
import { parseBib } from '~/utils/utils'

/**
 * Nuxt content transformer for .bib files.
 */
export default defineTransformer({
  name: 'bibtex',
  extensions: ['.bib'],
  // @ts-expect-error Custom transformer.
  parse(_id: string, rawContent: string) {
    return { _id, ...parseBib(rawContent) }
  },
})
