// noinspection ES6PreferShortImport

import fs from 'fs'
import { ofetch } from 'ofetch'
import { createResolver, defineNuxtModule, type Resolver, useLogger } from '@nuxt/kit'
import { parse, type HTMLElement } from 'node-html-parser'
import sharp from 'sharp'
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
 * The logger instance.
 */
const logger = useLogger(name)

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
    logger.info('Fetching books covers...')

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
    const downloadSources: DownloadSource[] = [
      new AltCoverDownloadSource(),
      new GoogleServersDownloadSource(),
      new OpenGraphImageDownloadSource(),
      new PreviousBuildDownloadSource(options.siteUrl, options.booksImagesUrl)
    ]
    for (const bookFile of books) {
      const filePath = resolver.resolve(booksDirectory, bookFile)
      const book = parseBib(fs.readFileSync(filePath, { encoding: 'utf-8' }))
      if (!(await fetchBookCover(resolver, book, destinationDirectory, downloadSources))) {
        failed.push(book.short)
      }
    }

    if (failed.length === 0) {
      logger.success('Fetched books covers.')
    } else {
      logger.warn(`Fetched books covers. An error occurred with the following books : ${failed.join(', ')}.`)
    }
  }
})

/**
 * Fetches a book cover from various sources and saves it to a cache directory.
 *
 * @param {Resolver} resolver - The resolver for resolving paths.
 * @param {Book} book - The book for which to fetch the cover.
 * @param {string} destinationDirectory - The directory to store the fetched covers.
 * @param {DownloadSource[]} downloadSources - The download sources.
 * @returns {Promise<boolean>} - A promise resolving to `true` if the cover was fetched successfully, `false` otherwise.
 */
async function fetchBookCover (resolver: Resolver, book: Book, destinationDirectory: string, downloadSources: DownloadSource[]): Promise<boolean> {
  const destinationFile = resolver.resolve(destinationDirectory, `${book.isbn10}.jpg`)
  if (fs.existsSync(destinationFile)) {
    return true
  }
  for (const downloadSource of downloadSources) {
    if (await downloadSource.download(book, destinationFile)) {
      return true
    }
  }
  return false
}

/**
 * Represents a download source.
 */
abstract class DownloadSource {
  /**
   * Creates a new download source instance.
   *
   * @param {string} name The download source name.
   * @param {boolean} dontLogNoBookCover Whether not to log if getBookCoverUrl returns null.
   */
  protected constructor (private readonly name: string, private readonly dontLogNoBookCover: boolean = true) {
    this.name = name
    this.dontLogNoBookCover = dontLogNoBookCover
  }

  /**
   * Downloads the book to the given directory.
   *
   * @param {Book} book The book.
   * @param {string} destinationFile The destination file.
   * @returns {Promise<boolean>} Whether the operation is a success.
   */
  async download (book: Book, destinationFile: string): Promise<boolean> {
    logger.info(`Trying to download the book cover of [${book.short}] from source "${this.name}"...`)
    const coverUrl = await this.getBookCoverUrl(book)
    if (!coverUrl) {
      if (!this.dontLogNoBookCover) {
        logger.warn(`Failed to resolve the cover URL of [${book.short}] from source "${this.name}".`)
      }
      return false
    }
    const result = await this.downloadImage(coverUrl, destinationFile)
    if (!result) {
      logger.warn(`The downloading of the book [${book.short}] cover url "${coverUrl}" from "${this.name}" source failed.`)
      return true
    }
    logger.success(`Successfully downloaded the book cover of [${book.short}] from source "${this.name}" !`)
    return true
  }

  /**
   * Downloads an image from a URL and saves it to a file.
   *
   * @param {string} url - The URL of the image to download.
   * @param {string} destinationFile - The path to save the downloaded image.
   * @returns {Promise<boolean>} - A promise indicating the completion of the download process.
   */
  async downloadImage (url: string, destinationFile: string): Promise<boolean> {
    try {
      const blob = await ofetch(url, { responseType: 'blob' })
      if (blob.type.startsWith('image/') && blob.size > 0) {
        const buffer = Buffer.from(await blob.arrayBuffer())
        await sharp(buffer)
          .resize(null, 250)
          .jpeg()
          .toFile(destinationFile)
        return true
      }
    } catch (ex) {
      logger.warn(ex)
    }
    return false
  }

  /**
   * Should return the book cover URL.
   * @param {Book} book The book.
   * @returns {Promise<string | null>} The book cover URL.
   */
  abstract getBookCoverUrl (book: Book): Promise<string | null>
}

/**
 * Download source representing the specified URL in the BIB file.
 */
class AltCoverDownloadSource extends DownloadSource {
  /**
   * Creates a new alt cover download source instance.
   */
  constructor () {
    super('Book alt cover', false)
  }

  override getBookCoverUrl (book: Book): Promise<string | null> {
    return Promise.resolve('altcover' in book && book.altcover ? book.altcover!.toString() : null)
  }
}

/**
 * Download from Google servers.
 */
class GoogleServersDownloadSource extends DownloadSource {
  /**
   * Creates a new Google Servers download source instance.
   */
  constructor () {
    super('Google Servers')
  }

  override async getBookCoverUrl (book: Book): Promise<string | null> {
    const response = await ofetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13.replace('-', '')}`)
    if (response.items && response.items.length > 0) {
      let thumbnailUrl = getNested(response.items[0], 'volumeInfo', 'imageLinks', 'smallThumbnail')
      if (thumbnailUrl) {
        return thumbnailUrl
      }
      thumbnailUrl = getNested(response.items[0], 'volumeInfo', 'imageLinks', 'thumbnail')
      if (thumbnailUrl) {
        return thumbnailUrl
      }
      logger.warn(`[${book.short}] has been found on Google servers, but there is no cover in it.`)
    }
    return null
  }
}

/**
 * Downloads a book cover thanks to the website's Open Graph image.
 */
class OpenGraphImageDownloadSource extends DownloadSource {
  /**
   * Creates a new OpenGraph download source instance.
   */
  constructor () {
    super('OpenGraph')
  }

  override async getBookCoverUrl (book: Book): Promise<string | null> {
    const root: HTMLElement = await ofetch(book.website, { parseResponse: parse })
    const image = root.querySelector('meta[property="og:image"]')?.getAttribute('content')
    return image ?? null
  }
}

/**
 * Download from the previous build.
 */
class PreviousBuildDownloadSource extends DownloadSource {
  /**
   * Creates a new previous build download source instance.
   */
  constructor (private siteUrl: string, private booksImagesUrl: string) {
    super('agreg.skyost.eu')
  }

  override getBookCoverUrl (book: Book): Promise<string | null> {
    return Promise.resolve(`${this.siteUrl}${this.booksImagesUrl}${book.isbn10}.jpg`)
  }
}
