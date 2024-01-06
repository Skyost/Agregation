import fs from 'fs'
import { ofetch } from 'ofetch'
import { createResolver, defineNuxtModule, type Resolver } from '@nuxt/kit'
import * as logger from '../utils/logger'
import { getNested, parseBib } from '../utils/utils'
import type { Book } from '../types'
import { siteMeta } from '../site/meta'

/**
 * Options for the books cover fetcher module.
 *
 * @interface
 */
export interface ModuleOptions {
  /**
   * The site URL.
   */
  siteUrl: string
  /**
   * The directory where the book BibTeX files are located.
   */
  booksDirectory: string
  /**
   * The URL path where book cover images will be served.
   */
  booksImagesUrl: string
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
    siteUrl: siteMeta.url,
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
      if (!(await fetchBookCover(resolver, book, destinationDirectory, options))) {
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
 * Represents a download source.
 */
interface DownloadSource {
  /**
   * The download source name.
   */
  name: string,
  /**
   * Should return the book cover URL.
   * @param {Book} book The book.
   * @param {ModuleOptions} options The module options.
   * @returns {Promise<string | null>} The book cover URL.
   */
  getBookCoverUrl: (book: Book, options: ModuleOptions) => Promise<string | null>

  /**
   * Whether not to log if getBookCoverUrl returns null.
   */
  dontLogNoBookCover?: boolean
}

/**
 * Download source representing the specified URL in the BIB file.
 */
const altCoverDownloadSource: DownloadSource = {
  name: 'Book alt cover',
  // eslint-disable-next-line require-await
  getBookCoverUrl: async (book: Book) => 'altcover' in book && book.altcover ? book.altcover!.toString() : null,
  dontLogNoBookCover: false
}

/**
 * Download on Google servers.
 */
const googleDownloadSource: DownloadSource = {
  name: 'Google servers',
  getBookCoverUrl: async (book: Book) => {
    const response = await ofetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13.replace('-', '')}`)
    if (response.items && response.items.length > 0) {
      const thumbnailUrl = getNested(response.items[0], 'volumeInfo', 'imageLinks', 'smallThumbnail')
      if (thumbnailUrl) {
        return thumbnailUrl
      }
      logger.warn(name, `[${book.short}] has been found on Google servers, but there is no cover in it.`)
    }
    return null
  }
}

/**
 * Download on Amazon servers using the Amazon partners widget.
 */
const amazonWidgetsDownloadSource: DownloadSource = {
  name: 'Amazon widgets',
  // eslint-disable-next-line require-await
  getBookCoverUrl: async (book: Book) => `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${book.isbn10}&Format=_SL250_&ID=AsinImage&MarketPlace=FR&ServiceVersion=20070822&WS=1&tag=skyost-21&language=fr_FR`
}

/**
 * Download on Amazon servers using an Amazon link.
 */
const amazonServersDownloadSource: DownloadSource = {
  name: 'Amazon servers',
  // eslint-disable-next-line require-await
  getBookCoverUrl: async (book: Book) => `http://z2-ec2.images-amazon.com/images/P/${book.isbn10}.01.MAIN._SCRM_.jpg`
}

/**
 * Download the previous build.
 */
const previousBuildDownloadSource: DownloadSource = {
  name: 'agreg.skyost.eu',
  // eslint-disable-next-line require-await
  getBookCoverUrl: async (book: Book, options: ModuleOptions) => `${options.siteUrl}${options.booksImagesUrl}${book.isbn10}.jpg`
}

/**
 * Fetches a book cover from various sources and saves it to a cache directory.
 *
 * @param {Resolver} resolver - The resolver for resolving paths.
 * @param {Book} book - The book for which to fetch the cover.
 * @param {string} destinationDirectory - The directory to store the fetched covers.
 * @param {ModuleOptions} options - The module options.
 * @returns {Promise<boolean>} - A promise resolving to `true` if the cover was fetched successfully, `false` otherwise.
 */
async function fetchBookCover (resolver: Resolver, book: Book, destinationDirectory: string, options: ModuleOptions): Promise<boolean> {
  const destinationFile = resolver.resolve(destinationDirectory, `${book.isbn10}.jpg`)
  if (fs.existsSync(destinationFile)) {
    return true
  }
  for (const downloadSource of [altCoverDownloadSource, googleDownloadSource, amazonWidgetsDownloadSource, amazonServersDownloadSource, previousBuildDownloadSource]) {
    logger.info(name, `Trying to download the book cover of [${book.short}] from source "${downloadSource.name}"...`)
    const coverUrl = await downloadSource.getBookCoverUrl(book, options)
    if (!coverUrl) {
      if (!downloadSource.dontLogNoBookCover) {
        logger.warn(name, `Failed to resolve the cover URL of [${book.short}] from source "${downloadSource.name}".`)
      }
      continue
    }
    const result = await downloadImage(coverUrl, destinationFile)
    if (!result) {
      logger.warn(name, `The downloading of the book [${book.short}] cover url "${coverUrl}" from "${downloadSource.name}" source failed.`)
      continue
    }
    logger.success(name, `Successfully downloaded the book cover of [${book.short}] from source "${downloadSource.name}" !`)
    return true
  }
  return false
}

/**
 * Downloads an image from a URL and saves it to a file.
 *
 * @param {string} url - The URL of the image to download.
 * @param {string} destinationFile - The path to save the downloaded image.
 * @returns {Promise<boolean>} - A promise indicating the completion of the download process.
 */
async function downloadImage (url: string, destinationFile: string): Promise<boolean> {
  try {
    const blob = await ofetch(url, {responseType: 'blob'})
    if (blob.type === 'image/jpeg' && blob.size > 0) {
      const buffer = Buffer.from(await blob.arrayBuffer())
      fs.writeFileSync(destinationFile, buffer)
      return true
    }
  } catch (ex) {
    logger.warn(name, ex)
  }
  return false
}
