import fs from 'fs'
import { execSync } from 'child_process'
import * as path from 'path'
import { HTMLElement, parse } from 'node-html-parser'
import AdmZip from 'adm-zip'
import { Octokit } from '@octokit/core'
import * as katex from 'katex'
import * as matter from 'gray-matter'
import { createResolver, defineNuxtModule, Resolver } from '@nuxt/kit'
import YAML from 'yaml'
import * as logger from '../utils/logger'
import { GithubRepository, siteMeta } from '../site/meta'
import { debug } from '../site/debug'
import { SiteDirectories, siteDirectories } from '../site/directories'
import { ContentGeneratorSettings, contentGeneratorSettings } from '../site/content-generator'
import { normalizeString, getFileName, generateChecksum } from '../utils/utils'

export interface ModuleOptions {
  github: GithubRepository,
  directories: SiteDirectories,
  contentGeneratorSettings: ContentGeneratorSettings
}

const includedImagesDirFileName = '.includedimages'
const name = 'generate-content'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
    configKey: 'contentGenerator'
  },
  defaults: {
    github: siteMeta.github,
    directories: siteDirectories,
    contentGeneratorSettings
  },
  setup: async (options, nuxt) => {
    const contentGenerator = options.contentGeneratorSettings
    const directories = options.directories
    const github = options.github

    const resolver = createResolver(import.meta.url)
    const srcDir = nuxt.options.srcDir

    const tempDirs = []
    let downloadPreviousBuildResult: any = null
    if (!debug) {
      downloadPreviousBuildResult = await downloadPreviousBuild(resolver, srcDir, github, contentGenerator)
    }
    let previousBuildDir = null
    let previousImagesBuildDir = null
    if (downloadPreviousBuildResult) {
      previousBuildDir = downloadPreviousBuildResult.previousBuildDir
      previousImagesBuildDir = downloadPreviousBuildResult.previousImagesBuildDir
      tempDirs.push(downloadPreviousBuildResult.tempDirectory)
    }

    const downloadDirectory = directories.downloadDirectory || nuxt.options.srcDir

    const latexDirectory = resolver.resolve(downloadDirectory, directories.latexDirectory)
    const pandocRedefinitions = resolver.resolve(latexDirectory, 'pandoc.tex')
    const extractedImagesDir = resolver.resolve(latexDirectory, '.extracted-images')
    tempDirs.push(extractedImagesDir)

    const imagesDestDir = resolver.resolve(srcDir, nuxt.options.dir.public, contentGenerator.imagesDestination)

    const imagesDirectories = Object.fromEntries(Object.entries(contentGenerator.imagesDirectories)
      .map(([imagesDir, destDir]) => [resolver.resolve(downloadDirectory, imagesDir), resolver.resolve(imagesDestDir, destDir)]))

    const ignored = contentGenerator.ignored
      .map(file => resolver.resolve(downloadDirectory, file))
      .concat(Object.keys(imagesDirectories))

    ignored.push(extractedImagesDir)
    ignored.push(pandocRedefinitions)

    for (const [directory, destination] of Object.entries(imagesDirectories)) {
      await handleImages(resolver, contentGenerator, directory, previousImagesBuildDir, destination)
    }

    generateBibliography(resolver, resolver.resolve(srcDir, options.directories.booksDirectory), latexDirectory)
    const generatedGatherings = generateGatherings(resolver, latexDirectory, contentGenerator)
    await processFiles(
      resolver,
      contentGenerator,
      latexDirectory,
      previousBuildDir,
      resolver.resolve(srcDir, 'content'),
      resolver.resolve(srcDir, nuxt.options.dir.public, contentGenerator.pdfDestination),
      contentGenerator.destinationUrl,
      contentGenerator.pdfDestination,
      extractedImagesDir,
      imagesDestDir,
      contentGenerator.imagesDestination,
      pandocRedefinitions,
      ignored,
      generatedGatherings
    )
    await handleImages(resolver, contentGenerator, extractedImagesDir, previousImagesBuildDir, imagesDestDir)
    cleanTempDirs(tempDirs)
  }
})

async function downloadPreviousBuild (resolver: Resolver, srcDir: string, github: GithubRepository, contentGenerator: ContentGeneratorSettings) {
  try {
    logger.info(name, `Downloading and unzipping the previous build at ${github.username}/${github.repository}@gh-pages...`)
    const octokit = new Octokit()
    const response = await octokit.request('GET /repos/{owner}/{repo}/zipball/{ref}', {
      owner: github.username,
      repo: github.repository,
      ref: 'gh-pages'
    })
    const zip = new AdmZip(Buffer.from(response.data as Buffer))
    const zipRootDir = zip.getEntries()[0].entryName
    const tempDirectory = resolver.resolve(srcDir, '.previous-build')
    if (!fs.existsSync(tempDirectory)) {
      fs.mkdirSync(tempDirectory, { recursive: true })
    }
    zip.extractEntryTo(`${zipRootDir}${contentGenerator.pdfDestination}/`, tempDirectory)
    zip.extractEntryTo(`${zipRootDir}${contentGenerator.imagesDestination}/`, tempDirectory)
    return {
      tempDirectory,
      previousBuildDir: resolver.resolve(tempDirectory, zipRootDir, contentGenerator.pdfDestination),
      previousImagesBuildDir: resolver.resolve(tempDirectory, zipRootDir, contentGenerator.imagesDestination)
    }
  } catch (exception) {
    logger.warn(name, exception)
  }
  return null
}

function cleanTempDirs (tempDirs: string[]) {
  logger.info(name, 'Removing temporary directories...')
  for (const tempDir of tempDirs) {
    fs.rmSync(tempDir, { force: true, recursive: true })
  }
  logger.success(name, 'Done.')
}

function generateBibliography (resolver: Resolver, booksDir: string, latexDir: string) {
  logger.info(name, 'Generating bibliography...')
  const files = fs.readdirSync(booksDir)
  let content = ''
  for (const file of files) {
    const book = YAML.parse(fs.readFileSync(resolver.resolve(booksDir, file), { encoding: 'utf8' }))
    const dateParts = book.date.split('/')
    const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
    const subtitle = book.subtitle ? `\tsubtitle = {${book.subtitle ?? ''}},` : ''
    content += `@book { [${book.short}],
\tauthor = {${book.authors.join(' and ')}},
\ttitle = {${book.title}},
${subtitle}
\tdate= {${date}},
\tpublisher={${book.publisher.replace(/&/g, '\\&')}},
\turl={${book.website}},
}
`
  }
  fs.writeFileSync(resolver.resolve(latexDir, 'bibliography.bib'), content)
  logger.success(name, 'Done.')
}

function generateGatherings (resolver: Resolver, latexDir: string, contentGenerator: ContentGeneratorSettings) {
  const generatedGatherings = []
  for (const gathering of contentGenerator.gatherings) {
    let fileName = ''
    for (const data of gathering.data) {
      fileName += (data.directory + '-')
      data.directory = resolver.resolve(latexDir, data.directory)
    }
    fileName = fileName.substring(0, fileName.length - 1)
    logger.info(name, `Generating gathering "${fileName}"...`)
    const gatheringFile = resolver.resolve(latexDir, `${fileName}.tex`)
    generatedGatherings.push(gatheringFile)
    fs.writeFileSync(gatheringFile, contentGenerator.generateGatheringContent(gathering))
    logger.success(name, 'Done.')
  }
  return generatedGatherings
}

async function processFiles (
  resolver: Resolver,
  contentGenerator: ContentGeneratorSettings,
  directory: string,
  previousBuildDir: string | null,
  mdDir: string,
  pdfDir: string,
  destUrl: string,
  pdfDestUrl: string,
  extractedImagesDir: string,
  imagesDestDir: string,
  imagesDestUrl: string,
  pandocRedefinitions: string,
  ignored: string[],
  generatedGatherings: string[]
) {
  const files = fs.readdirSync(directory)
  for (const file of files) {
    const filePath = resolver.resolve(directory, file)
    if (!fs.existsSync(filePath) || ignored.includes(filePath)) {
      continue
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      await processFiles(
        resolver,
        contentGenerator,
        filePath,
        previousBuildDir ? resolver.resolve(previousBuildDir, file) : null,
        resolver.resolve(mdDir, file),
        resolver.resolve(pdfDir, file),
          `${destUrl}/${file}`,
          `${pdfDestUrl}/${file}`,
          resolver.resolve(extractedImagesDir, file),
          resolver.resolve(imagesDestDir, file),
          `${imagesDestUrl}/${file}`,
          pandocRedefinitions,
          ignored,
          generatedGatherings
      )
    } else if (file.endsWith('.tex')) {
      logger.info(name, `Processing "${filePath}"...`)
      const fileName = getFileName(file)
      const filteredFileName = contentGenerator.fileNameFilter(fileName)
      fs.mkdirSync(mdDir, { recursive: true })
      const mdFile = resolver.resolve(mdDir, `${filteredFileName}.md`)
      const imagesDir = resolver.resolve(imagesDestDir, fileName)
      if (!generatedGatherings.includes(filePath) && contentGenerator.shouldGenerateMarkdown(fileName)) {
        if (!debug || !fs.existsSync(mdFile)) {
          extractImages(resolver, contentGenerator, filePath, extractedImagesDir)
          const htmlContent = execSync(`pandoc "${path.relative(directory, pandocRedefinitions)}" "${filePath}" -f latex-auto_identifiers -t html --gladtex --html-q-tags`, {
            cwd: directory,
            encoding: 'utf-8'
          })
          const root = parse(htmlContent)
          replaceImages(resolver, contentGenerator, root, imagesDir, imagesDestUrl + '/' + fileName)
          removeEmptyTitles(root)
          replaceVspaceElements(root)
          adjustColSize(root)
          handleProofs(root)
          handleReferences(root)
          renderMath(root)
          fs.writeFileSync(mdFile, toString(filteredFileName, root))
        }
      }
      if (contentGenerator.shouldGeneratePdf(fileName)) {
        const includedImagesDir = resolver.resolve(extractedImagesDir, contentGenerator.getLatexRelativeIncludedImagesDir(extractedImagesDir, filePath))
        const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
        const printVariant = contentGenerator.generatePrintVariant(fileName, content)
        if (printVariant) {
          fs.writeFileSync(filePath, printVariant)
          generatePdf(resolver, directory, file, previousBuildDir, includedImagesDir, pdfDir, `${filteredFileName}-impression.pdf`)
          fs.writeFileSync(filePath, content)
        }
        generatePdf(resolver, directory, file, previousBuildDir, includedImagesDir, pdfDir, `${filteredFileName}.pdf`)
      }
      logger.success(name, 'Done.')
    }
  }
}

function extractImages (resolver: Resolver, contentGenerator: ContentGeneratorSettings, filePath: string, extractedImagesDir: string) {
  const fileExtractedImagesDir = resolver.resolve(extractedImagesDir, getFileName(filePath))
  for (const blockType of contentGenerator.imagesToExtract) {
    // const regex = /\\begin{tikzpicture}([\s\S]*?)\\end{tikzpicture}/sg
    const regex = new RegExp(`\\\\begin{${blockType}}([\\s\\S]*?)\\\\end{${blockType}}`, 'sg')
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
    let match = regex.exec(content)
    if (match != null) {
      fs.mkdirSync(fileExtractedImagesDir, { recursive: true })
      const includedImagesDir = resolver.resolve(fileExtractedImagesDir, contentGenerator.getLatexRelativeIncludedImagesDir(fileExtractedImagesDir, filePath))
      fs.writeFileSync(resolver.resolve(fileExtractedImagesDir, includedImagesDirFileName), includedImagesDir)
    }
    let i = 1
    while (match != null) {
      const fileName = `${blockType}-${i}.tex`
      fs.writeFileSync(resolver.resolve(fileExtractedImagesDir, fileName), contentGenerator.generateExtractedImageFileContent(fileExtractedImagesDir, filePath, blockType, match[0]))
      i++
      match = regex.exec(content)
    }
  }
}

function replaceImages (resolver: Resolver, contentGenerator: ContentGeneratorSettings, root: HTMLElement, imagesDestDir: string, imagesDestURL: string) {
  const images = root.querySelectorAll('img')
  for (const image of images) {
    const src = image.getAttribute('src')
    if (!src) {
      continue
    }
    const extension = path.extname(src)
    if (extension === '') {
      image.setAttribute('alt', src)
      for (const testExtension of ['.svg', '.png', '.jpeg', '.jpg']) {
        if (fs.existsSync(resolver.resolve(imagesDestDir, src + testExtension))) {
          image.setAttribute('src', `/${imagesDestURL}/${src}${testExtension}`)
          break
        }
      }
    }
  }
  for (const blockType of contentGenerator.imagesToExtract) {
    const images = root.querySelectorAll(`.${blockType}-image`)
    for (let i = 0; i < images.length; i++) {
      images[i].replaceWith(`<img src="/${imagesDestURL}/${blockType}-${i + 1}.svg" class="extracted-image ${blockType}-image" alt="${blockType}-${i + 1}">`)
    }
  }
}

function removeEmptyTitles (root: HTMLElement) {
  const bubbleTitles = root.querySelectorAll('h2, h3, h4')
  for (const bubbleTitle of bubbleTitles) {
    if (bubbleTitle.text.trim().length === 0) {
      bubbleTitle.remove()
    }
  }
}

function replaceVspaceElements (root: HTMLElement) {
  const vspaces = root.querySelectorAll('.vertical-space')
  for (const vspace of vspaces) {
    const text = vspace.text.trim()
    if (text.startsWith('-')) {
      vspace.remove()
      continue
    }
    vspace.setAttribute('style', `height: ${text};`)
    vspace.innerHTML = ''
  }
}

function adjustColSize (root: HTMLElement) {
  const rows = root.querySelectorAll('.row')
  for (const row of rows) {
    const columns = row.querySelectorAll('> .col')
    const sizeElement = row.querySelector('> .first-col-size')
    if (columns.length === 2) {
      if (sizeElement && sizeElement.text.trim().length > 0) {
        const size = parseFloat(sizeElement.text.trim())
        columns[0].setAttribute('style', `--column-size: ${size};`)
        columns[1].setAttribute('style', `--column-size: ${1 - size};`)
      } else {
        columns[0].classList.remove('col')
        columns[1].classList.remove('col')
        columns[0].classList.add('col-12')
        columns[1].classList.add('col-12')
        columns[0].classList.add('col-lg-6')
        columns[1].classList.add('col-lg-6')
      }
    }
    sizeElement?.remove()
  }
}

function handleProofs (root: HTMLElement) {
  const proofs = root.querySelectorAll('.proof')
  for (const proof of proofs) {
    const firstEmphasis = proof.querySelector('em')
    if (firstEmphasis) {
      firstEmphasis.replaceWith(firstEmphasis.outerHTML.replace('Proof.', 'Démonstration.'))
    }
  }
}

function handleReferences (root: HTMLElement) {
  const references = root.querySelectorAll('.bookref')
  let previousReference
  for (const reference of references) {
    const short = reference.querySelector('.bookrefshort')!.text.trim()
    let html = reference.querySelector('.bookrefpage')!.text.trim()
    if (short.length > 0) {
      previousReference = short
      html = `<strong>[${short}]</strong><br>${html}`
    }
    if (previousReference) {
      reference.innerHTML = `<a href="/bibliographie#${previousReference}">${html}</a>`
    }
  }
}

function renderMath (root: HTMLElement) {
  const mathElements = root.querySelectorAll('eq')
  for (const mathElement of mathElements) {
    const text = mathElement.text.trim()
    mathElement.replaceWith(
      katex.renderToString(filterUnknownSymbols(text), {
        displayMode: mathElement.getAttribute('env') === 'displaymath',
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

function filterUnknownSymbols (text: string) {
  return text
    .replace(/(\\left *|\\right *)*\\VERT/g, '$1 | $1 | $1 |')
    .replace(/\\overset{(.*)}&{(.*)}/g, '&\\overset{$1}{$2}')
}

async function handleImages (resolver: Resolver, contentGenerator: ContentGeneratorSettings, imagesDir: string, previousImagesBuildDir: string | null, imagesDestDir: string) {
  if (!fs.existsSync(imagesDir)) {
    return
  }
  const files = fs.readdirSync(imagesDir)
  for (const file of files) {
    const filePath = resolver.resolve(imagesDir, file)
    if (fs.lstatSync(filePath).isDirectory()) {
      await handleImages(
        resolver,
        contentGenerator,
        filePath,
        previousImagesBuildDir ? resolver.resolve(previousImagesBuildDir, file) : null,
        resolver.resolve(imagesDestDir, file)
      )
      continue
    }

    if (!contentGenerator.shouldHandleImagesOfDirectory(imagesDir)) {
      continue
    }

    if (file.endsWith('.tex')) {
      logger.info(name, `Compiling LaTeX image "${filePath}"...`)
      const fileName = getFileName(file)
      let svgFile = `${fileName}.svg`
      if (!debug || !fs.existsSync(resolver.resolve(imagesDestDir, svgFile))) {
        let includedImagesDir = imagesDir
        if (fs.existsSync(resolver.resolve(imagesDir, includedImagesDirFileName))) {
          includedImagesDir = fs.readFileSync(resolver.resolve(imagesDir, includedImagesDirFileName), { encoding: 'utf-8' })
        }
        const { builtPdf, wasCached } = generatePdf(resolver, imagesDir, file, previousImagesBuildDir, includedImagesDir, imagesDir, `${fileName}.pdf`)
        if (builtPdf) {
          let svgPath = previousImagesBuildDir ? resolver.resolve(previousImagesBuildDir, svgFile) : null
          if (!wasCached || !svgPath || !fs.existsSync(svgPath)) {
            svgFile = pdftocairo(resolver, imagesDir, builtPdf)
            svgPath = resolver.resolve(imagesDir, svgFile)
          }
          fs.mkdirSync(imagesDestDir, { recursive: true })
          fs.copyFileSync(svgPath, resolver.resolve(imagesDestDir, svgFile))
          fs.copyFileSync(resolver.resolve(imagesDir, builtPdf), resolver.resolve(imagesDestDir, builtPdf))
          fs.copyFileSync(resolver.resolve(imagesDir, `${builtPdf}.checksums`), resolver.resolve(imagesDestDir, `${builtPdf}.checksums`))
        }
      }
      logger.success(name, 'Done.')
    } else if (file.endsWith('.pdf')) {
      const svgFile = pdftocairo(resolver, imagesDir, file)
      fs.mkdirSync(imagesDestDir, { recursive: true })
      fs.copyFileSync(resolver.resolve(imagesDir, svgFile), resolver.resolve(imagesDestDir, svgFile))
    } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      fs.mkdirSync(imagesDestDir, { recursive: true })
      fs.copyFileSync(resolver.resolve(imagesDir, file), resolver.resolve(imagesDestDir, file))
    }
  }
}

function toString (slug: string, root: HTMLElement) {
  const header: { [key: string]: any } = { slug }

  const name = root.querySelector('.docname h1')
  let title = root.querySelector('.doctitle')
  if (name) {
    header.name = name.innerHTML.trim()
    if (!title) {
      title = name
    }
  }
  if (title) {
    header['page-title'] = title.text.trim()
    header['page-title-search'] = normalizeString(header['page-title'])
  }
  const categories = root.querySelector('.doccategories')
  if (categories) {
    header.categories = categories.text.trim().split(', ')
  }
  const summary = root.querySelector('.docsummary p')
  if (summary) {
    header.summary = summary.innerHTML.trim()
    header['page-description'] = summary.text.trim()
  }

  return matter.stringify(root.innerHTML, header)
}

function generatePdf (resolver: Resolver, directory: string, file: string, previousBuildDir: string | null, includedImagesDir: string, pdfDestDir: string, pdfDestFileName: string) {
  const filePath = resolver.resolve(directory, file)
  const destPdf = resolver.resolve(pdfDestDir, pdfDestFileName)
  if (debug && fs.existsSync(destPdf)) {
    return { builtPdf: null, wasCached: false }
  }
  const checksums = JSON.stringify(calculateTexFileChecksums(resolver, includedImagesDir, filePath))
  const previousPdfFile = previousBuildDir ? resolver.resolve(previousBuildDir, pdfDestFileName) : null
  const previousChecksumsFile = previousBuildDir ? resolver.resolve(previousBuildDir, `${pdfDestFileName}.checksums`) : null
  const builtPdf = `${getFileName(file)}.pdf`
  fs.mkdirSync(pdfDestDir, { recursive: true })
  fs.writeFileSync(resolver.resolve(pdfDestDir, `${pdfDestFileName}.checksums`), checksums)
  if (previousPdfFile && previousChecksumsFile && fs.existsSync(previousChecksumsFile) && checksums === fs.readFileSync(previousChecksumsFile, { encoding: 'utf-8' }) && fs.existsSync(previousPdfFile)) {
    logger.info(name, 'Fully cached PDF found.')
    fs.copyFileSync(previousPdfFile, destPdf)
    return { builtPdf, wasCached: true }
  } else if (latexmk(resolver, directory, file)) {
    fs.copyFileSync(resolver.resolve(directory, builtPdf), destPdf)
    execSync('latexmk -quiet -c', { cwd: directory })
    return { builtPdf, wasCached: false }
  }
  return { builtPdf: null, wasCached: false }
}

function calculateTexFileChecksums (resolver: Resolver, includedImagesDir: string, file: string) {
  const latexIncludeCommands = [
    {
      command: 'includegraphics',
      directory: includedImagesDir,
      extensions: ['.pdf', '.svg', '.png', '.jpeg', '.jpg'],
      excludes: []
    },
    {
      command: 'documentclass',
      directory: path.dirname(file),
      extensions: ['.cls'],
      excludes: ['standalone']
    },
    {
      command: 'include',
      directory: path.dirname(file),
      extensions: ['.tex'],
      excludes: []
    }
  ]
  const fileName = getFileName(file)
  const checksums: { [key: string]: string } = {}
  checksums[fileName] = generateChecksum(fs.readFileSync(file, { encoding: 'utf-8' }))
  for (const latexIncludeCommand of latexIncludeCommands) {
    const regex = new RegExp(`\\\\${latexIncludeCommand.command}(\\[[A-Za-zÀ-ÖØ-öø-ÿ\\d, =.\\\\-]*])?{([A-Za-zÀ-ÖØ-öø-ÿ\\d/, .-]+)}`, 'gs')
    const content = fs.readFileSync(file, { encoding: 'utf-8' })
    let match = regex.exec(content)
    while (match != null) {
      const fileName = match[2]
      if (!latexIncludeCommand.excludes.includes(fileName) && !(fileName in checksums)) {
        const extensions = ['', ...latexIncludeCommand.extensions]
        let includeFile = resolver.resolve(latexIncludeCommand.directory, fileName)
        for (const extension of extensions) {
          const includeFileWithExtension = `${includeFile}${extension}`
          if (fs.existsSync(includeFileWithExtension)) {
            includeFile = includeFileWithExtension
            break
          }
        }
        if (!fs.existsSync(includeFile)) {
          logger.warn(name, `Unable to find file "${includeFile}[${latexIncludeCommand.extensions.join(' | ')}]".`)
          match = regex.exec(content)
          continue
        }
        checksums[fileName] = generateChecksum(fs.readFileSync(includeFile, { encoding: 'utf-8' }))
      }
      match = regex.exec(content)
    }
  }
  return checksums
}

function latexmk (resolver: Resolver, directory: string, file: string) {
  try {
    execSync(`latexmk -lualatex "${file}"`, { cwd: directory })
    return true
  } catch (ex) {
    logger.fatal(name, ex)
    const logFile = resolver.resolve(directory, file.replace('.tex', '.log'))
    if (fs.existsSync(logFile)) {
      const logString = fs.readFileSync(logFile, { encoding: 'utf-8' })
      logger.fatal(name, 'Here is the log :')
      logger.fatal(name, logString)
    }
    return false
  }
}

function pdftocairo (resolver: Resolver, directory: string, pdfFileName: string) {
  const fileName = getFileName(pdfFileName)
  const svgFile = `${fileName}.svg`
  if (!debug || !fs.existsSync(resolver.resolve(directory, svgFile))) {
    execSync(`pdftocairo -svg "${pdfFileName}" "${svgFile}"`, { cwd: directory })
  }
  return svgFile
}