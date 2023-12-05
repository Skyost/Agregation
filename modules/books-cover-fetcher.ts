import fs from 'fs'
import { ofetch } from 'ofetch'
import { createResolver, defineNuxtModule, type Resolver } from '@nuxt/kit'
import * as logger from '../utils/logger'
import { getNested, parseBib } from '../utils/utils'
import type { Book } from '../types'

/**
 * Options for the books cover fetcher module.
 *
 * @interface
 */
export interface ModuleOptions {
  /** The directory where the book BibTeX files are located. */
  booksDirectory: string;
  /** The URL path where book cover images will be served. */
  booksImagesUrl: string;
}

/**
 * The name of the books cover fetcher module.
 */
const name = 'books-cover-fetcher'

/**
 * Nuxt module to fetch book covers and store them in a cache directory.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    configKey: 'booksCover',
    compatibility: { nuxt: '^3.0.0' }
  },
  defaults: {
    booksDirectory: 'content/latex/bibliographie/',
    booksImagesUrl: '/images/livres/'
  },
  setup: async (options, nuxt) => {
    logger.info(name, 'Fetching books covers...')

    const resolver = createResolver(import.meta.url)
    const destinationDirectory = resolver.resolve(nuxt.options.srcDir, 'node_modules/.cache/books-covers/')

    // Create directory if it doesn't exist.
    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory, { recursive: true })
    }

    const booksDirectory = resolver.resolve(nuxt.options.srcDir, options.booksDirectory)

    // Add public asset configuration.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: options.booksImagesUrl,
      dir: destinationDirectory
    })

    const books = fs.readdirSync(booksDirectory)
    const failed = []
    for (const bookFile of books) {
      const filePath = resolver.resolve(booksDirectory, bookFile)
      const book = parseBib(fs.readFileSync(filePath, { encoding: 'utf-8' }))
      if (!(await fetchBookCover(resolver, book, destinationDirectory))) {
        failed.push(book.short)
      }
    }

    if (failed.length === 0) {
      logger.success(name, 'Fetched books covers.')
    } else {
      logger.warn(name, `Fetched books covers. An error occurred with the following books : ${failed.join(', ')}.`)
    }
  }
})

/**
 * Fetches a book cover from various sources and saves it to a cache directory.
 *
 * @param {Resolver} resolver - The resolver for resolving paths.
 * @param {Book} book - The book for which to fetch the cover.
 * @param {string} destinationDirectory - The directory to store the fetched covers.
 * @returns {Promise<boolean>} - A promise resolving to `true` if the cover was fetched successfully, `false` otherwise.
 */
async function fetchBookCover (resolver: Resolver, book: Book, destinationDirectory: string): Promise<boolean> {
  const destinationFile = resolver.resolve(destinationDirectory, `${book.isbn10}.jpg`)
  if (fs.existsSync(destinationFile)) {
    return true
  }
  if ('cover' in book) {
    try {
      await downloadImage(book.cover!.toString(), destinationFile)
      return true
    } catch (ex) {
      logger.warn(name, `[${book.short}] has a cover URL specified, but it could not be downloaded.`)
    }
  }
  try {
    const response = await ofetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13.replace('-', '')}`)
    if (response.items && response.items.length > 0) {
      const thumbnailUrl = getNested(response.items[0], 'volumeInfo', 'imageLinks', 'smallThumbnail')
      if (thumbnailUrl) {
        await downloadImage(thumbnailUrl, destinationFile)
        return true
      }
      logger.warn(name, `[${book.short}] has been found on Google servers, but there is no cover in it.`)
    } else {
      logger.warn(name, `[${book.short}] has not been found on Google servers.`)
    }
  } catch (ex) {
    logger.warn(name, `Failed to fetch [${book.short}] data from Google.`)
  }
  try {
    logger.info(name, 'Trying with Amazon...')
    await downloadImage(`https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${book.isbn10}&Format=_SL250_&ID=AsinImage&MarketPlace=FR&ServiceVersion=20070822&WS=1&tag=skyost-21&language=fr_FR`, destinationFile)
    return true
  } catch (ex) {
    logger.warn(name, `Failed to fetch [${book.short}] data from Amazon.`)
  }
  return false
}

/**
 * Downloads an image from a URL and saves it to a file.
 *
 * @param {string} url - The URL of the image to download.
 * @param {string} destinationFile - The path to save the downloaded image.
 * @returns {Promise<void>} - A promise indicating the completion of the download process.
 */
async function downloadImage (url: string, destinationFile: string): Promise<void> {
  const blob = await ofetch(url)
  const buffer = Buffer.from(await blob.arrayBuffer())
  fs.writeFileSync(destinationFile, buffer)
}
