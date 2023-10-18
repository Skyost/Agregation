import fs from 'fs'
import { ofetch } from 'ofetch'
import { createResolver, defineNuxtModule, Resolver } from '@nuxt/kit'
import YAML from 'yaml'
import * as logger from '../utils/logger'
import { getNested } from '../utils/utils'
import { Book } from '../types'

export interface ModuleOptions {
  booksDirectory: string,
  booksImagesURL: string
}

const name = 'fetch-books-covers'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    configKey: 'booksCover',
    compatibility: { nuxt: '^3.0.0' }
  },
  defaults: {
    booksDirectory: 'content/livres/',
    booksImagesURL: '/images/livres/'
  },
  setup: async (options, nuxt) => {
    logger.info(name, 'Fetching books covers...')
    const resolver = createResolver(import.meta.url)
    const destinationDirectory = resolver.resolve(nuxt.options.srcDir, 'node_modules/.cache/books-covers/')
    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory, { recursive: true })
    }
    const booksDirectory = resolver.resolve(nuxt.options.srcDir, options.booksDirectory)
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: options.booksImagesURL,
      dir: destinationDirectory
    })
    const books = fs.readdirSync(booksDirectory)
    const failed = []
    for (const bookFile of books) {
      const filePath = resolver.resolve(booksDirectory, bookFile)
      const book: Book = YAML.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
      if (!await fetchBookCover(resolver, book, destinationDirectory)) {
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

async function fetchBookCover (resolver: Resolver, book: Book, destinationDirectory: string) {
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

async function downloadImage (url: string, destinationFile: string) {
  const blob = await ofetch(url)
  const buffer = Buffer.from(await blob.arrayBuffer())
  fs.writeFileSync(destinationFile, buffer)
}
