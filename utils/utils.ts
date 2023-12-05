import path from 'path'
import crypto from 'crypto'
import { parse } from '@retorquere/bibtex-parser'
import type { Book, Category } from '../types'

/**
 * Parses the content of a BibTeX file and extracts relevant information to create a Book object.
 *
 * @param {string} bibContent - Content of the BibTeX file.
 * @returns {Book} - Parsed Book object.
 */
export const parseBib = (bibContent: string): Book => {
  const data = parse(bibContent)
  const fields = data.entries[0].fields
  return {
    title: fields.title[0],
    subtitle: 'subtitle' in fields ? fields.subtitle[0] : undefined,
    edition: 'edition' in fields ? parseInt(fields.edition[0]) : undefined,
    short: fields.short[0],
    authors: fields.author,
    date: fields.date[0],
    publisher: fields.publisher[0],
    categories: fields.categories[0].split(', ') as Category[],
    isbn10: fields.isbn10[0],
    isbn13: fields.isbn13[0],
    buy: fields.buy[0],
    website: fields.url[0],
    comment: fields.comment[0]
  }
}

/**
 * Removes a trailing slash from a string if it exists.
 *
 * @param {string} string - Input string.
 * @returns {string} - String without the trailing slash.
 */
export const removeTrailingSlashIfPossible = (string: string): string => string.endsWith('/') ? string.substring(0, string.length - 1) : string

/**
 * Extracts the filename from a given file path.
 *
 * @param {string} file - File path.
 * @returns {string} - Filename.
 */
export const getFileName = (file: string): string => path.parse(file).name

/**
 * Normalizes a string by removing diacritics and converting to lowercase.
 *
 * @param {string} string - Input string.
 * @returns {string} - Normalized string.
 */
export const normalizeString = (string: string): string => string
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()

/**
 * Retrieves a nested property from an object using a variable number of keys.
 *
 * @param {Object} obj - Input object.
 * @param {...any} args - Keys to access the nested property.
 * @returns {any} - The nested property value or undefined if not found.
 */
export const getNested = (obj: Object, ...args: any[]): any => args.reduce((obj, level) => obj && obj[level], obj)

/**
 * Generates an MD5 checksum for a given string.
 *
 * @param {string} string - Input string.
 * @returns {string} - MD5 checksum.
 */
export const generateChecksum = (string: string): string => crypto
  .createHash('md5')
  .update(string, 'utf8')
  .digest('hex')
