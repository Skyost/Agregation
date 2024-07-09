import type { HasCategories } from '../types'

/**
 * Represents a book with detailed information.
 *
 * @interface
 * @extends HasCategories
 */
export interface Book extends HasCategories {
  /**
   * The title of the book.
   *
   * @type {string}
   */
  title: string

  /**
   * An optional subtitle of the book.
   *
   * @type {string | undefined}
   */
  subtitle?: string

  /**
   * The edition number of the book.
   *
   * @type {number | undefined}
   */
  edition?: number

  /**
   * A short identifier or code for the book.
   *
   * @type {string}
   */
  short: string

  /**
   * An array of authors contributing to the book.
   *
   * @type {string[]}
   */
  authors: string[]

  /**
   * The publication date of the book.
   *
   * @type {string}
   */
  date: string

  /**
   * The publisher of the book.
   *
   * @type {string}
   */
  publisher: string

  /**
   * The ISBN-10 number of the book.
   *
   * @type {string}
   */
  isbn10: string

  /**
   * The ISBN-13 number of the book.
   *
   * @type {string}
   */
  isbn13: string

  /**
   * A link or reference to where the book can be purchased.
   *
   * @type {string}
   */
  buy: string

  /**
   * The website associated with the book.
   *
   * @type {string}
   */
  website: string

  /**
   * Additional comments or notes about the book.
   *
   * @type {string}
   */
  comment: string

  /**
   * The book alternate cover.
   *
   * @type {string | undefined}
   */
  altcover?: string
}
