import { HasCategories } from '~/types/category'

export interface Book extends HasCategories {
  title: string
  subtitle: string
  edition?: number
  short: string
  authors: string[]
  date: string
  publisher: string
  isbn10: string
  isbn13: string
  buy: string
  website: string
  comment: string
}
