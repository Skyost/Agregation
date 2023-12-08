import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'
// @ts-ignore
import { defineTransformer } from '@nuxt/content/transformers'
import { HTMLElement, parse } from 'node-html-parser'
import katex from 'katex'
import { createResolver, type Resolver } from '@nuxt/kit'
import { name } from './index'
import { normalizeString } from '~/utils/utils'
import * as latex from '~/utils/latex'
import * as logger from '~/utils/logger'
import { latexOptions, type LatexTransformOptions } from '~/site/latex'

/**
 * Nuxt content transformer for .tex files.
 */
export default defineTransformer({
  name: 'latex',
  extensions: ['.tex'],
  // @ts-ignore
  parse (_id: string, rawContent: string) {
    // Latex transformation options.
    const options = latexOptions.transform

    // Resolver for creating absolute paths.
    const resolver = createResolver(import.meta.url)

    // Absolute path to the source directory.
    const sourceDirectoryPath = path.resolve('./')

    // Absolute path to the content directory.
    const contentDirectoryPath = resolver.resolve(sourceDirectoryPath, 'content')

    // Absolute path to the .tex file.
    const filePath = resolver.resolve(sourceDirectoryPath, _id.replaceAll(':', '/'))

    // Relative path of the .tex file from the content directory.
    const texFileRelativePath = path.relative(contentDirectoryPath, filePath)

    logger.info(name, `Processing ${texFileRelativePath}...`)

    // Absolute path to the directory for storing assets.
    const assetsDestinationDirectoryPath = resolver.resolve(sourceDirectoryPath, options.assetsDestinationDirectory)

    // Extract images from the .tex file content and return the modified content.
    const content = extractImages(
      resolver,
      rawContent,
      assetsDestinationDirectoryPath,
      texFileRelativePath,
      sourceDirectoryPath,
      contentDirectoryPath,
      options
    )

    // Load the Pandoc redefinitions header content.
    const pandocHeader = fs.readFileSync(resolver.resolve(sourceDirectoryPath, options.pandocRedefinitions), { encoding: 'utf8' })

    // Run Pandoc to convert the .tex content to HTML.
    const pandocResult = spawnSync(
      'pandoc',
      [
        '-f',
        'latex-auto_identifiers',
        '-t',
        'html',
        '--gladtex',
        '--html-q-tags'
      ],
      {
        env: process.env,
        cwd: path.resolve(path.dirname(filePath)),
        encoding: 'utf-8',
        input: pandocHeader + content
      }
    )

    // Throw an error if the Pandoc transformation fails.
    if (pandocResult.status !== 0) {
      throw pandocResult.stderr
    }

    // Parse the Pandoc HTML output.
    const root = parse(pandocResult.stdout)

    // Replace images in the HTML content.
    replaceImages(
      resolver,
      root,
      texFileRelativePath,
      sourceDirectoryPath,
      contentDirectoryPath,
      assetsDestinationDirectoryPath,
      options
    )

    // Remove empty titles from the HTML content.
    removeEmptyTitles(root)

    // Replace vspace elements in the HTML content.
    replaceVspaceElements(root)

    // Handle proofs in the HTML content.
    handleProofs(root)

    // Handle references in the HTML content.
    handleReferences(root)

    // Render math elements in the HTML content.
    renderMath(root)

    logger.success(name, `Successfully processed ${texFileRelativePath} !`)

    // Return the parsed content object.
    return {
      _id,
      body: root.outerHTML,
      ...getHeader(path.parse(filePath).name, root)
    }
  }
})

/**
 * Extract images from LaTeX content and replace them with HTML-friendly references.
 *
 * @param {Resolver} resolver - The resolver for creating absolute paths.
 * @param {string} latexContent - The content of the LaTeX file.
 * @param {string} assetsDestinationDirectoryPath - The absolute path to the directory for storing assets.
 * @param {string} texFileRelativePath - The relative path of the LaTeX file from the content directory.
 * @param {string} sourceDirectoryPath - The absolute path to the source directory.
 * @param {string} contentDirectoryPath - The absolute path to the content directory.
 * @param {LatexTransformOptions} options - The options for LaTeX transformation.
 * @returns {string} - The modified LaTeX content with HTML-friendly image references.
 */
const extractImages = (
  resolver: Resolver,
  latexContent: string,
  assetsDestinationDirectoryPath: string,
  texFileRelativePath: string,
  sourceDirectoryPath: string,
  contentDirectoryPath: string,
  options: LatexTransformOptions
): string => {
  // Clone the original LaTeX content.
  let result = latexContent

  // Get the destination path for extracted images.
  const destinationInAssetsDirectory = options.getExtractedImagesDestination(texFileRelativePath)

  // Process each block type specified in the pictures template.
  for (const blockType of Object.keys(options.picturesTemplate)) {
    // Regular expression to match the block type content in LaTeX.
    const regex = new RegExp(`\\\\begin{${blockType}}([\\s\\S]*?)\\\\end{${blockType}}`, 'sg')

    // Initial match.
    let match = regex.exec(result)

    // Counter for naming extracted images.
    let i = 0

    // Process all matches for the current block type.
    while (match != null) {
      // Generate a unique filename for the extracted image.
      const fileName = `${blockType}-${(i + 1)}`

      // Destination path for the extracted image LaTeX file.
      const destination = options.getAssetDestination(`${destinationInAssetsDirectory}/${fileName}.tex`)
      const extractedImageTexFilePath = resolver.resolve(assetsDestinationDirectoryPath, destination)

      // Read the template for the current block type.
      const template = fs.readFileSync(resolver.resolve(sourceDirectoryPath, options.picturesTemplate[blockType]), { encoding: 'utf8' })

      // Create directories if they don't exist.
      fs.mkdirSync(path.dirname(extractedImageTexFilePath), { recursive: true })

      // Write the template content with the matched block content to the extracted image LaTeX file.
      fs.writeFileSync(extractedImageTexFilePath, template.replace('%s', match[0]))

      // Generate SVG from the extracted image LaTeX file.
      const { builtFilePath } = latex.generateSvg(
        extractedImageTexFilePath,
        options.getIncludeGraphicsDirectories(texFileRelativePath).map(includedGraphicDirectory => resolver.resolve(contentDirectoryPath, includedGraphicDirectory)),
        { cacheDirectory: resolver.resolve(sourceDirectoryPath, options.cacheDirectory, destination) }
      )

      // If SVG is generated successfully, replace the LaTeX block with an HTML-friendly image reference.
      if (builtFilePath) {
        logger.success(name, `${blockType}[${(i + 1)}] -> ${builtFilePath} from ${texFileRelativePath}.`)
        result = result.replace(match[0], `\\includegraphics{${path.parse(builtFilePath).base}}`)
      }

      // Move to the next match.
      match = regex.exec(result)

      // Increment the counter.
      i++
    }

    // Log the number of extracted images for the current block type.
    if (i > 0) {
      logger.success(name, `Extracted ${i} images of type ${blockType} from ${texFileRelativePath}.`)
    }
  }

  // Return the modified LaTeX content.
  return result
}

/**
 * Replace LaTeX image references in the HTML tree with resolved image sources.
 *
 * @param {Resolver} resolver - The resolver for creating absolute paths.
 * @param {HTMLElement} root - The root of the HTML tree.
 * @param {string} texFileRelativePath - The relative path of the LaTeX file from the content directory.
 * @param {string} sourceDirectoryPath - The absolute path to the source directory.
 * @param {string} contentDirectoryPath - The absolute path to the content directory.
 * @param {string} assetsDestinationDirectoryPath - The absolute path to the directory for storing assets.
 * @param {LatexTransformOptions} options - The options for LaTeX transformation.
 */
const replaceImages = (
  resolver: Resolver,
  root: HTMLElement,
  texFileRelativePath: string,
  sourceDirectoryPath: string,
  contentDirectoryPath: string,
  assetsDestinationDirectoryPath: string,
  options: LatexTransformOptions
) => {
  // Possible image file extensions.
  const extensions = ['', '.pdf', '.svg', '.png', '.jpeg', '.jpg', '.gif']

  // Select all image elements in the HTML tree.
  const images = root.querySelectorAll('img')

  // Process each image element.
  for (const image of images) {
    // Get the source attribute of the image.
    const src = image.getAttribute('src')

    // Skip if the source attribute is missing.
    if (!src) {
      continue
    }

    // Directories to search for the image.
    const directories = [
      options.getExtractedImagesDestination(texFileRelativePath),
      ...options.getIncludeGraphicsDirectories(texFileRelativePath)
    ]

    // Try resolving the image from various directories and extensions.
    for (const directory of directories) {
      let resolved = false

      // Try different file extensions.
      for (const extension of extensions) {
        // Get the destination path of the image in the assets directory.
        const destinationInAssetsDirectory = options.getAssetDestination(
          path.relative(contentDirectoryPath, resolver.resolve(contentDirectoryPath, directory, src + extension))
        )
        const filePath = resolver.resolve(assetsDestinationDirectoryPath, destinationInAssetsDirectory)

        // Check if the file exists.
        if (fs.existsSync(filePath)) {
          // Resolve the image source.
          let resolvedSrc = resolveImageSrc(
            filePath,
            directories.map(includedGraphicDirectory => resolver.resolve(contentDirectoryPath, includedGraphicDirectory)),
            assetsDestinationDirectoryPath,
            resolver.resolve(sourceDirectoryPath, options.cacheDirectory, destinationInAssetsDirectory)
          )

          // Format the resolved source as an absolute path.
          if (resolvedSrc) {
            resolvedSrc = '/' + resolvedSrc.replace(/\\/g, '/')
            logger.success(name, `Resolved image ${src} to ${resolvedSrc} in ${texFileRelativePath}.`)

            // Update the image source and alt attribute.
            image.setAttribute('src', resolvedSrc)
            image.setAttribute('alt', src)
            resolved = true
            break
          }
        }
      }

      // Break the outer loop if the image is resolved.
      if (resolved) {
        break
      }
    }
  }
}

/**
 * Resolve the source of an image file.
 *
 * @param {string} imagePath - The path to the image file.
 * @param {string[]} includeGraphicsDirectories - Directories for including graphics.
 * @param {string} assetsDestinationDirectoryPath - The destination directory for assets.
 * @param {string} cacheDirectoryPath - The path to the cache directory.
 * @returns {string | null} - The resolved source of the image or null if not resolved.
 */
const resolveImageSrc = (
  imagePath: string,
  includeGraphicsDirectories: string[],
  assetsDestinationDirectoryPath: string,
  cacheDirectoryPath: string
): string | null => {
  // Check if the image has a PDF extension.
  if (path.extname(imagePath) === '.pdf') {
    // Generate an SVG from the PDF.
    const { builtFilePath } = latex.generateSvg(
      imagePath,
      includeGraphicsDirectories,
      { cacheDirectory: cacheDirectoryPath }
    )

    // If the PDF couldn't be converted to SVG, return null.
    if (!builtFilePath) {
      return null
    }

    // Update the image path to the generated SVG.
    imagePath = builtFilePath
  }

  // Return the relative path from the assets destination directory.
  return path.relative(assetsDestinationDirectoryPath, imagePath)
}

/**
 * Remove empty titles (h2, h3, h4) from the HTML root element.
 *
 * @param {HTMLElement} root - The root HTML element.
 */
const removeEmptyTitles = (root: HTMLElement) => {
  const bubbleTitles = root.querySelectorAll('h2, h3, h4')
  for (const bubbleTitle of bubbleTitles) {
    // Check if the text content of the title is empty and remove it.
    if (bubbleTitle.text.trim().length === 0) {
      bubbleTitle.remove()
    }
  }
}

/**
 * Replace vertical space elements with corresponding styles.
 *
 * @param {HTMLElement} root - The root HTML element.
 */
const replaceVspaceElements = (root: HTMLElement) => {
  const vspaces = root.querySelectorAll('.vertical-space')
  for (const vspace of vspaces) {
    // Get the trimmed text content.
    const text = vspace.text.trim()

    // Check if the text starts with '-' and remove the element.
    if (text.startsWith('-')) {
      vspace.remove()
      continue
    }

    // Set the 'style' attribute to control the height.
    vspace.setAttribute('style', `height: ${text};`)
    vspace.innerHTML = ''
  }
}

/**
 * Handle the 'proof' elements in the HTML by replacing 'Proof.' with 'Démonstration.'.
 *
 * @param {HTMLElement} root - The root HTML element.
 */
const handleProofs = (root: HTMLElement) => {
  const proofs = root.querySelectorAll('.proof')
  for (const proof of proofs) {
    const firstEmphasis = proof.querySelector('em')
    // Replace 'Proof.' with 'Démonstration.' if found in the first emphasis element.
    if (firstEmphasis) {
      firstEmphasis.replaceWith(firstEmphasis.outerHTML.replace('Proof.', 'Démonstration.'))
    }
  }
}

/**
 * Handle references in the HTML by formatting and linking to the bibliography.
 *
 * @param {HTMLElement} root - The root HTML element.
 */
const handleReferences = (root: HTMLElement) => {
  const references = root.querySelectorAll('.bookref')
  let previousReference
  for (const reference of references) {
    const short = reference.querySelector('.bookrefshort')!.text.trim()
    let html = reference.querySelector('.bookrefpage')!.text.trim()
    // If 'short' is not empty, format the HTML with the short reference.
    if (short.length > 0) {
      previousReference = short
      html = `<strong>[${short}]</strong><br>${html}`
    }
    // If there's a previous reference, link to the bibliography.
    if (previousReference) {
      reference.innerHTML = `<a href="/bibliographie/#${previousReference}">${html}</a>`
    }
  }
}

/**
 * Render LaTeX math equations using KaTeX and replace corresponding HTML elements.
 *
 * @param {HTMLElement} root - The root HTML element.
 */
const renderMath = (root: HTMLElement) => {
  const mathElements = root.querySelectorAll('eq')
  for (const mathElement of mathElements) {
    // Get the trimmed text content.
    const text = mathElement.text.trim()

    // Replace the math element with the rendered KaTeX HTML.
    mathElement.replaceWith(
      katex.renderToString(filterUnknownSymbols(text), {
        displayMode: mathElement.getAttribute('env') === 'displaymath', // Determine if it's a display math environment.
        output: 'html',
        trust: true,
        strict: (errorCode: any) => errorCode === 'htmlExtension' ? 'ignore' : 'warn',
        macros: {
          '\\parallelslant': '\\mathbin{\\!/\\mkern-5mu/\\!}',
          '\\ensuremath': '#1'
        }
      })
    )
  }
}

/**
 * Filter and modify unknown LaTeX symbols in the provided text.
 *
 * @param {string} text - The input LaTeX text.
 * @returns {string} The filtered LaTeX text.
 */
const filterUnknownSymbols = (text: string): string => {
  return text
    .replace(/(\\left *|\\right *)*\\VERT/g, '$1 | $1 | $1 |')
    .replace(/\\overset{(.*)}&{(.*)}/g, '&\\overset{$1}{$2}')
}

/**
 * Extract header information from the HTML structure of a LaTeX document.
 *
 * @param {string} slug - The slug of the document.
 * @param {HTMLElement} root - The root HTML element of the document.
 * @returns {{ [key: string]: any }} Header information.
 */
const getHeader = (slug: string, root: HTMLElement): { [key: string]: any } => {
  // Initialize the header object with the slug.
  const header: { [key: string]: any } = { slug }

  // Get the document name and title elements.
  const name = root.querySelector('.docname h1')
  let title = root.querySelector('.doctitle')

  // Populate header with name and title if available.
  if (name) {
    header.name = name.innerHTML.trim()
    if (!title) {
      title = name
    }
    header['page-name-search'] = normalizeString(name.text.trim())
  }
  if (title) {
    header['page-title'] = title.text.trim()
  }

  // Get and parse categories.
  const categories = root.querySelector('.doccategories')
  if (categories) {
    header.categories = categories.text.trim().split(', ')
  }

  // Get and set document summary.
  const summary = root.querySelector('.docsummary p')
  if (summary) {
    header.summary = summary.innerHTML.trim()
    header['page-description'] = summary.text.trim()
  }

  return header
}
