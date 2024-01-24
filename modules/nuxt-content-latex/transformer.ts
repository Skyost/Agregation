import path from 'path'
import fs from 'fs'
// @ts-ignore
import { defineTransformer } from '@nuxt/content/transformers'
import { HTMLElement } from 'node-html-parser'
import * as latex from 'that-latex-lib'
import { name } from './common'
import { normalizeString, getFileName } from '~/utils/utils'
import * as logger from '~/utils/logger'
import { latexOptions } from '~/site/latex'
import { debug } from '~/site/debug'
import { execSync } from 'child_process'

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

    // Absolute path to the source directory.
    const sourceDirectoryPath = path.resolve('./')

    // Absolute path to the content directory.
    const contentDirectoryPath = path.resolve(sourceDirectoryPath, 'content')

    // Absolute path to the .tex file.
    const filePath = path.resolve(sourceDirectoryPath, _id.replaceAll(':', '/'))

    // Relative path of the .tex file from the content directory.
    const texFileRelativePath = path.relative(contentDirectoryPath, filePath).replace(/\\/g, '/')

    logger.info(name, `Processing ${texFileRelativePath}...`)

    // Load the Pandoc redefinitions header content.
    const pandocHeader = fs.readFileSync(path.resolve(sourceDirectoryPath, options.pandocRedefinitions), { encoding: 'utf8' })

    // Parse the Pandoc HTML output.
    const assetsRootDirectoryPath = path.resolve(sourceDirectoryPath, options.assetsDestinationDirectory)
    const templates: {[key: string]: string} = {}
    for (const image in options.picturesTemplate) {
      templates[image] = fs.readFileSync(path.resolve(sourceDirectoryPath, options.picturesTemplate.tikzpicture), { encoding: 'utf8' })
    }
    const root = // Transforms the raw content into HTML.
      latex.transformToHtml(
        filePath,
        {
          pandocHeader,
          getExtractedImageCacheDirectoryPath: (_extractedFrom, extractedImageTexFilePath) => path.resolve(sourceDirectoryPath, options.cacheDirectory, path.relative(assetsRootDirectoryPath, path.dirname(extractedImageTexFilePath))),
          getExtractedImageTargetDirectory: (_extractedFrom, assetName) => path.dirname(options.getAssetDestination(path.relative(contentDirectoryPath, path.resolve(path.dirname(filePath), assetName)))).replace(/\\/g, '/') + '/' + getFileName(filePath),
          assetsRootDirectoryPath,
          getResolvedImageCacheDirectoryPath: resolvedImageTexFilePath => path.resolve(sourceDirectoryPath, options.cacheDirectory, path.relative(assetsRootDirectoryPath, path.dirname(resolvedImageTexFilePath))),
          imagePathToSrc: resolvedImageFilePath => '/' + path.relative(assetsRootDirectoryPath, resolvedImageFilePath).replace(/\\/g, '/'),
          renderMathElement,
          imagesTemplate: templates,
          generateIfExists: !debug
        },
        true,
        rawContent
      )

    // Remove empty titles from the HTML content.
    removeEmptyTitles(root)

    // Replace vspace elements in the HTML content.
    replaceVspaceElements(root)

    // Handle proofs in the HTML content.
    handleProofs(root)

    // Handle references in the HTML content.
    handleReferences(root)

    logger.success(name, `Successfully processed ${texFileRelativePath} !`)

    // Return the parsed content object.
    return {
      _id,
      body: root.outerHTML,
      ...getHeader(path.parse(filePath).name, root, texFileRelativePath)
    }
  }
})

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
 * Renders a given math element.
 * @param {HTMLElement} element The element.
 * @returns {string} The result.
 */
const renderMathElement = (element: HTMLElement): string => latex.renderMathElement(
  element,
  {
    '\\parallelslant': '\\mathbin{\\!/\\mkern-5mu/\\!}',
    '\\ensuremath': '#1'
  },
  math => math
    .replace(/(\\left *|\\right *)*\\VERT/g, '$1 | $1 | $1 |')
    .replace(/\\overset{(.*)}&{(.*)}/g, '&\\overset{$1}{$2}')
)

/**
 * Extract header information from the HTML structure of a LaTeX document.
 *
 * @param {string} slug - The slug of the document.
 * @param {HTMLElement} root - The root HTML element of the document.
 * @param {HTMLElement} texFileRelativePath - The relative path to the Latex file.
 * @returns {{ [key: string]: any }} Header information.
 */
const getHeader = (slug: string, root: HTMLElement, texFileRelativePath: string): { [key: string]: any } => {
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

  // Get and set document modification time.
  const gitDate = execSync(`git log -1 --pretty="format:%ci" content/${texFileRelativePath}`).toString().trim()
  header['page-last-modification-time'] = (gitDate.length === 0 ? new Date() : new Date(gitDate)).toISOString()

  return header
}
