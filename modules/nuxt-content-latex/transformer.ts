import path from 'path'
import fs from 'fs'
import { defineTransformer } from '@nuxt/content/transformers'
import { consola } from 'consola'
import type { HTMLElement } from 'node-html-parser'
import { KatexRenderer, LatexImageExtractor, PandocCommand, PandocTransformer, SvgGenerator } from 'that-latex-lib'
import { name } from './common'
import { normalizeString, getFileName } from '~/utils/utils'
import { latexOptions, type LatexTransformOptions } from '~/site/latex'
import { debug } from '~/site/debug'

/**
 * The logger instance.
 */
const logger = consola.withTag(name)

/**
 * Nuxt content transformer for .tex files.
 */
export default defineTransformer({
  name: 'latex',
  extensions: ['.tex'],
  // @ts-expect-error Custom transformer.
  parse(_id: string, rawContent: string) {
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

    logger.info(`Processing ${texFileRelativePath}...`)

    // Load the Pandoc redefinitions header content.
    const pandocHeader = fs.readFileSync(path.resolve(sourceDirectoryPath, options.pandocRedefinitions), { encoding: 'utf8' })

    // Parse the Pandoc HTML output.
    const assetsRootDirectoryPath = path.resolve(sourceDirectoryPath, options.assetsDestinationDirectory)
    const pandocTransformer = new PandocTransformer({
      imageSrcResolver: PandocTransformer.resolveFromAssetsRoot(
        assetsRootDirectoryPath,
        {
          getImageCacheDirectoryPath: resolvedImageTexFilePath => path.resolve(sourceDirectoryPath, options.cacheDirectory, path.relative(assetsRootDirectoryPath, path.dirname(resolvedImageTexFilePath))),
          imagePathToSrc: resolvedImageFilePath => '/' + path.relative(assetsRootDirectoryPath, resolvedImageFilePath).replace(/\\/g, '/'),
        },
      ),
      imageExtractors: [
        new TikzPictureImageExtractor(
          options,
          sourceDirectoryPath,
          contentDirectoryPath,
        ),
      ],
      mathRenderer: new MathRendererWithMacros(),
      pandoc: new PandocCommand({
        header: pandocHeader,
      }),
    })
    // Transforms the raw content into HTML.
    const { htmlResult: root } = pandocTransformer.transform(filePath, rawContent)

    if (root) {
      // Remove empty titles from the HTML content.
      removeEmptyTitles(root)

      // Replace vspace elements in the HTML content.
      replaceVspaceElements(root)

      // Handle proofs in the HTML content.
      handleProofs(root)

      // Handle references in the HTML content.
      handleReferences(root)

      logger.success(`Successfully processed ${texFileRelativePath} !`)

      // Return the parsed content object.
      return {
        _id,
        body: root.outerHTML,
        ...getHeader(path.parse(filePath).name, root),
      }
    }
    console.error(`Failed to parse ${_id}.`)
    return {
      _id,
      body: `Unable to parse ${_id}.`,
    }
  },
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
  const bookReferences = root.querySelectorAll('.bookref')
  let previousReference
  for (const bookReference of bookReferences) {
    const short = bookReference.querySelector('.bookrefshort')!.text.trim()
    let html = bookReference.querySelector('.bookrefpage')!.text.trim()
    // If 'short' is not empty, format the HTML with the short reference.
    if (short.length > 0) {
      previousReference = short
      html = `<strong>[${short}]</strong><br>${html}`
    }
    // If there's a previous reference, link to the bibliography.
    if (previousReference) {
      bookReference.innerHTML = `<a href="/bibliographie/#${previousReference}">${html}</a>`
    }
  }
  const references = root.querySelectorAll('a[data-reference-type="ref+label"]')
  for (const reference of references) {
    const href = reference.getAttribute('href')
    if (!href) {
      continue
    }
    const target = root.getElementById(href.substring(1))
    if (!target) {
      continue
    }
    const name = findRefName(target)
    if (name) {
      reference.innerHTML = name
    }
  }
  const citations = root.querySelectorAll('.citation')
  for (const citation of citations) {
    const cite = citation.getAttribute('data-cites')
    if (cite) {
      let short = cite
      if (short.startsWith('[')) {
        short = short.substring(1)
      }
      if (short.endsWith(']')) {
        short = short.substring(0, short.length - 1)
      }
      citation.innerHTML = `<a href="/bibliographie/#${short}">${cite}</a>`
    }
  }
}

/**
 * Finds the ref name of an element.
 *
 * @param element The element.
 */
const findRefName = (element: HTMLElement | null): string | null => {
  if (element == null) {
    return null
  }
  if (element.tagName === 'DIV') {
    for (const tag of ['strong', 'em']) {
      const text = element.querySelector(`> p > ${tag}:first-child`)?.text
      if (text) {
        return text
      }
    }
    return null
  }
  if (element.tagName === 'LI') {
    const listItems = []
    for (const child of element.parentNode.childNodes) {
      if (child.rawTagName.toUpperCase() === 'LI') {
        listItems.push(child)
      }
    }
    const index = listItems.indexOf(element)
    return `Point ${(index + 1)}`
  }
  if (element.tagName === 'SPAN' || element.tagName === 'P') {
    return findRefName(element.parentNode)
  }
  if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4') {
    return `Section ${element.text}`
  }
  return null
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

/**
 * Extracts Tikz pictures from a file.
 */
class TikzPictureImageExtractor extends LatexImageExtractor {
  /**
   * The Latex transform options.
   */
  options: LatexTransformOptions
  /**
   * The source directory path.
   */
  sourceDirectoryPath: string
  /**
   * The content directory path.
   */
  contentDirectoryPath: string

  /**
   * Creates a new `TikzPictureImageExtractor` instance.
   *
   * @param {LatexTransformOptions} options The Latex transform options.
   * @param {string} sourceDirectoryPath The source directory path.
   * @param {string} contentDirectoryPath The content directory path.
   */
  constructor(options: LatexTransformOptions, sourceDirectoryPath: string, contentDirectoryPath: string) {
    super(
      'tikzpicture',
      {
        svgGenerator: new SvgGenerator({
          generateIfExists: !debug,
        }),
      },
    )
    this.options = options
    this.sourceDirectoryPath = sourceDirectoryPath
    this.contentDirectoryPath = contentDirectoryPath
  }

  override getExtractedImageDirectoryPath(extractedFrom: string, extractedFileName: string): string | null {
    return path.resolve(
      this.sourceDirectoryPath,
      this.options.assetsDestinationDirectory,
      path.dirname(
        this.options.getAssetDestination(
          path.relative(
            this.contentDirectoryPath,
            path.resolve(path.dirname(extractedFrom), extractedFileName),
          ),
        ),
      ).replace(/\\/g, '/') + '/' + getFileName(extractedFrom),
    )
  }

  override renderContent(extractedImageTexFilePath: string, latexContent: string): string {
    const content = fs.readFileSync(path.resolve(this.sourceDirectoryPath, this.options.tikzPictureTemplate), { encoding: 'utf8' })
    return content
      .replace('{graphicsPath}', '')
      // .replace('{grahicsPath}', '\\graphicspath{' + includeGraphicsDirectories
      //   .map(directory => `{${directory.replaceAll('\\', '\\\\')}}`)
      //   .join('\n') + '}')
      .replace('{content}', latexContent)
  }
}

/**
 * A math renderer with some custom macros.
 */
class MathRendererWithMacros extends KatexRenderer {
  override renderMathElement(element: HTMLElement): string {
    return super.renderMathElement(
      element,
      {
        '\\parallelslant': '\\mathbin{\\!/\\mkern-5mu/\\!}',
        '\\ensuremath': '#1',
      },
      math => math
        .replace(/(\\left *|\\right *)*\\VERT/g, '$1 | $1 | $1 |')
        .replace(/\\overset{(.*)}&{(.*)}/g, '&\\overset{$1}{$2}'),
    )
  }
}
