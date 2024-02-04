// noinspection ES6PreferShortImport

import fs from 'fs'
import path from 'path'
import { createResolver, defineNuxtModule, type Resolver, useLogger } from '@nuxt/kit'
import { latexOptions, type LatexTransformOptions } from '../../site/latex'
import { name } from './common'

/**
 * The logger instance.
 */
const logger = useLogger(name)

/**
 * Nuxt module for transforming .tex files in Nuxt content.
 */
export default defineNuxtModule<LatexTransformOptions>({
  meta: {
    name,
    version: '0.0.1',
    configKey: 'nuxtContentLatex',
    compatibility: { nuxt: '^3.0.0' }
  },
  defaults: latexOptions.transform,
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Set up Nitro externals for .tex content transformation.
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []
    nuxt.options.nitro.externals.inline.push(resolver.resolve('.'))

    // Register a hook to modify content context and add a transformer for .tex files.
    // @ts-ignore
    nuxt.hook('content:context', (contentContext) => {
      contentContext.transformers.push(resolver.resolve('transformer.ts'))
    })

    // Process additional assets such as images.
    const contentDirectory = resolver.resolve(nuxt.options.srcDir, 'content')
    const assetsDestinationPath = resolver.resolve(nuxt.options.srcDir, options.assetsDestinationDirectory)
    processAssets(resolver, contentDirectory, assetsDestinationPath, options)

    // Register them in Nitro.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: '/',
      dir: assetsDestinationPath
    })
  }
})

/**
 * Process assets in a directory and copy them to a destination.
 *
 * @param {Resolver} resolver - The Nuxt resolver.
 * @param {string} directoryPath - The path to the source directory containing assets.
 * @param {string} assetsDestinationPath - The path to the destination directory for assets.
 * @param {LatexTransformOptions} options - Options for transforming LaTeX files.
 * @param {string} [contentDirectoryPath=directoryPath] - The path to the content directory.
 */
const processAssets = (
  resolver: Resolver,
  directoryPath: string,
  assetsDestinationPath: string,
  options: LatexTransformOptions,
  contentDirectoryPath: string = directoryPath
) => {
  // Get the list of files in the directory.
  const files = fs.readdirSync(directoryPath)

  // Iterate through each file in the directory.
  for (const file of files) {
    const filePath = resolver.resolve(directoryPath, file)

    // If the file is a directory, recursively process its assets.
    if (fs.lstatSync(filePath).isDirectory()) {
      processAssets(resolver, filePath, assetsDestinationPath, options, contentDirectoryPath)
      continue
    }

    // Check if the file extension is included in the allowed extensions.
    const extension = path.extname(file)
    if (options.assetsExtension.includes(extension)) {
      // Calculate relative and destination paths.
      const relativePath = path.relative(contentDirectoryPath, filePath)
      const destinationPath = resolver.resolve(assetsDestinationPath, options.getAssetDestination(relativePath))

      // Ensure destination directory exists.
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true })

      // Copy the asset file.
      fs.copyFileSync(filePath, destinationPath)

      // Log the successful copying of an asset file.
      logger.success(`${filePath} -> ${destinationPath}`)
    }
  }
}
