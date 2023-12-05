import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { Octokit } from '@octokit/core'
import { createResolver, defineNuxtModule, type Resolver } from '@nuxt/kit'
import * as latex from '../utils/latex'
import * as logger from '../utils/logger'
import { type GithubRepository, siteMeta } from '../site/meta'
import { latexOptions, type LatexGenerateOptions } from '../site/latex'
import { debug } from '../site/debug'

export interface ModuleOptions extends LatexGenerateOptions {
  github: GithubRepository,
  moveFiles: boolean
}

const name = 'latex-pdf-generator'
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
    configKey: 'latexPdfGenerator'
  },
  defaults: {
    github: siteMeta.github,
    ...latexOptions.generate,
    moveFiles: !debug
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url)
    const srcDir = nuxt.options.srcDir
    const latexDirectoryPath = resolver.resolve(srcDir, options.sourceDirectory)

    let previousBuildDirectoryPath = resolver.resolve(srcDir, options.previousBuildDirectoryPath)
    const downloadResult = await downloadPreviousBuild(resolver, previousBuildDirectoryPath, options)
    previousBuildDirectoryPath = resolver.resolve(previousBuildDirectoryPath, options.destinationDirectory)

    generateGatherings(resolver, latexDirectoryPath, options)

    const ignore = options.ignore.map(file => resolver.resolve(srcDir, file))
    const destinationDirectoryPath = resolver.resolve(srcDir, 'node_modules', `.${name}`, options.destinationDirectory)
    generatePdf(
      resolver,
      path.relative(resolver.resolve(srcDir, 'content'), latexDirectoryPath),
      latexDirectoryPath,
      destinationDirectoryPath,
      ignore,
      downloadResult ? previousBuildDirectoryPath : null,
      options
    )

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: `/${options.destinationDirectory}/`,
      dir: destinationDirectoryPath
    })
  }
})

const downloadPreviousBuild = async (resolver: Resolver, directoryPath: string, options: ModuleOptions) => {
  try {
    logger.info(name, `Downloading and unzipping the previous build at ${options.github.username}/${options.github.repository}@gh-pages...`)
    if (fs.existsSync(directoryPath)) {
      logger.success(name, 'Already downloaded.')
      return true
    }
    const octokit = new Octokit()
    const response = await octokit.request('GET /repos/{owner}/{repo}/zipball/{ref}', {
      owner: options.github.username,
      repo: options.github.repository,
      ref: 'gh-pages'
    })
    const zip = new AdmZip(Buffer.from(response.data as Buffer))
    const zipRootDir = zip.getEntries()[0].entryName

    const parentPath = path.dirname(directoryPath)
    if (!fs.existsSync(parentPath)) {
      fs.mkdirSync(parentPath, { recursive: true })
    }
    for (const previousBuildCacheDirectory of options.previousBuildCacheDirectories) {
      zip.extractEntryTo(`${zipRootDir}${previousBuildCacheDirectory}/`, parentPath)
    }
    fs.renameSync(resolver.resolve(parentPath, zipRootDir), resolver.resolve(parentPath, path.basename(directoryPath)))
    logger.success(name, 'Done.')
    return true
  } catch (exception) {
    logger.warn(name, exception)
  }
  return false
}

const generateGatherings = (resolver: Resolver, latexDirectoryPath: string, options: ModuleOptions) => {
  const generatedGatherings = []
  for (const gathering of options.gatherings) {
    let fileName = ''
    for (const data of gathering.data) {
      fileName += (data.directory + '-')
    }
    fileName = fileName.substring(0, fileName.length - 1)
    logger.info(name, `Generating gathering "${fileName}"...`)
    const gatheringFile = resolver.resolve(latexDirectoryPath, `${fileName}.tex`)
    generatedGatherings.push(gatheringFile)

    const template = fs.readFileSync(resolver.resolve(latexDirectoryPath, options.gatheringTemplate), { encoding: 'utf8' })
    let content = ''
    for (const data of gathering.data) {
      const directory = resolver.resolve(latexDirectoryPath, data.directory)
      const files = fs
        .readdirSync(directory)
        .filter((file: string) => file.endsWith('.tex') && fs.lstatSync(resolver.resolve(directory, file)).isFile())
      if (gathering.data.length > 1) {
        content += `\\gathering{${data.title}}\n`
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        content += '\\inputcontent' + (i === 0 ? '*' : '') + `{${data.directory}/${file}}\n`
      }
    }
    fs.writeFileSync(gatheringFile, template
      .replace('%s', gathering.data.map(data => data.title).join(' \\& '))
      .replace('%s', gathering.header ?? '')
      .replace('%s', content)
    )
    logger.success(name, 'Done.')
  }
  return generatedGatherings
}

const generatePdf = (
  resolver: Resolver,
  texDirectoryRelativePath: string,
  directoryPath: string,
  destinationDirectoryPath: string,
  ignore: string[],
  previousBuildDirectory: string | null,
  options: ModuleOptions
) => {
  const files = fs.readdirSync(directoryPath)
  for (const file of files) {
    const filePath = resolver.resolve(directoryPath, file)
    if (ignore.includes(filePath) || !fs.existsSync(filePath)) {
      logger.info(name, `Ignored ${filePath}.`)
      continue
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      generatePdf(
        resolver,
        texDirectoryRelativePath + '/' + file,
        filePath,
        resolver.resolve(destinationDirectoryPath, file),
        ignore,
        previousBuildDirectory == null ? null : resolver.resolve(previousBuildDirectory, file),
        options
      )
      continue
    }

    const extension = path.extname(file)
    if (extension === '.tex') {
      logger.info(name, `Processing "${filePath}"...`)
      const { builtFilePath, checksumsFilePath } = latex.generatePdf(
        filePath,
        options.getIncludeGraphicsDirectories(texDirectoryRelativePath),
        { cacheDirectory: previousBuildDirectory == null ? undefined : previousBuildDirectory }
      )
      if (builtFilePath) {
        fs.mkdirSync(destinationDirectoryPath, { recursive: true })
        fs.copyFileSync(builtFilePath, resolver.resolve(destinationDirectoryPath, path.parse(builtFilePath).base))
        if (options.moveFiles) {
          fs.unlinkSync(builtFilePath)
        }
        if (checksumsFilePath) {
          fs.copyFileSync(checksumsFilePath, resolver.resolve(destinationDirectoryPath, path.parse(checksumsFilePath).base))
          if (options.moveFiles) {
            fs.unlinkSync(checksumsFilePath)
          }
        }
        logger.success(name, 'Done.')
      } else {
        logger.warn(name, 'Error.')
      }
    }
  }
}
