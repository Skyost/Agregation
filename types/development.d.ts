import { ParsedContent } from '@nuxt/content/dist/runtime/types'
import type { LatexContentObject } from '~/types/latex.d'

export interface Development extends LatexContentObject {
  summary: string,
  'page-description': string
}

export interface DevelopmentContent extends Development, ParsedContent {}
