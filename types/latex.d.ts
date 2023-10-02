import { HasCategories } from '~/types/category'

export interface LatexContentObject extends HasCategories {
  name: string,
  slug: string,
  'page-title': string,
  'page-title-search': string
}
