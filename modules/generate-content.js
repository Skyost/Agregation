import { parse } from 'node-html-parser'
import { normalizeString } from '../utils/utils'

const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync
const katex = require('katex')
const matter = require('gray-matter')
const logger = require('./logger')

// TODO: Cache system.

module.exports = function () {
  const srcDir = this.options.generateContent.srcDir
  const destDir = this.options.generateContent.destDir
  const pdfDir = this.options.generateContent.pdfDir
  const pandocRedefinitions = this.options.generateContent.pandocRedefinitions
  const imagesDir = this.options.generateContent.imagesDir
  const imagesDestDir = this.options.generateContent.imagesDestDir
  const gatherings = this.options.generateContent.gatherings
  const gatheringsTitles = this.options.generateContent.gatheringsTitles
  const ignored = this.options.generateContent.ignored.map(file => path.resolve(file))
  ignored.push(path.resolve(pandocRedefinitions))
  ignored.push(path.resolve(imagesDir))
  this.nuxt.hook('build:compile', async function ({ name }) {
    if (name === 'server') {
      const gatheringsFiles = await generateGatherings(gatherings, gatheringsTitles, srcDir)
      await processFiles(ignored, pandocRedefinitions, path.resolve(srcDir), path.resolve(destDir), path.resolve(pdfDir), gatheringsFiles)
      await handleImages(imagesDir, imagesDestDir)
    }
  })
}

function generateGatherings (gatherings, gatheringsTitles, srcDir) {
  const gatheringFiles = new Set()
  for (const gathering of gatherings) {
    logger.info(`Generating gathering "${gathering}"...`)
    const directories = gathering.split('-')
    const title = directories
      .map(directory => gatheringsTitles[directory])
      .join(' \\& ')
    let content = `\\input{common}
\\input{gathering}

\\renewcommand{\\gatheringtitle}{${title}}

\\begin{document}
`
    for (const directory of directories) {
      const files = fs.readdirSync(path.resolve(srcDir, directory)).filter(file => file.endsWith('.tex') && fs.lstatSync(path.resolve(srcDir, directory, file)).isFile())
      if (directories.length > 1) {
        content += `\\gathering{${gatheringsTitles[directory]}}\n`
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        content += '\\inputcontent' + (i === 0 ? '*' : '') + `{${directory}/${file}}\n`
      }
    }
    content += '\\end{document}'
    const gatheringFile = path.resolve(srcDir, `${gathering}.tex`)
    fs.writeFileSync(gatheringFile, content)
    gatheringFiles.add(gatheringFile)
  }
  return gatheringFiles
}

async function processFiles (ignored, pandocRedefinitions, directory, mdDir, pdfDir, gatheringsFiles) {
  const files = fs.readdirSync(directory)
  for (const file of files) {
    const filePath = path.resolve(directory, file)
    if (!fs.existsSync(filePath) || ignored.includes(filePath)) {
      continue
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      await processFiles(ignored, pandocRedefinitions, filePath, path.resolve(mdDir, file), path.resolve(pdfDir, file), gatheringsFiles)
    } else if (file.endsWith('.tex')) {
      logger.info(`Processing "${filePath}"...`)
      const fileName = getFileName(file)
      if (!gatheringsFiles.has(filePath)) {
        fs.mkdirSync(mdDir, { recursive: true })
        const htmlContent = execSync(`pandoc "${path.relative(directory, pandocRedefinitions)}" "${filePath}" -t html --gladtex`, {
          cwd: directory,
          encoding: 'utf-8'
        })
        const root = parse(htmlContent)
        handleReferences(root)
        renderMath(root)
        addVueComponents(root)
        fs.writeFileSync(path.resolve(mdDir, fileName + '.md'), toString(root))
      }
      latexmk(directory, file)
      fs.mkdirSync(pdfDir, { recursive: true })
      fs.copyFileSync(path.resolve(directory, `${fileName}.pdf`), path.resolve(pdfDir, `${fileName}.pdf`))
      if (gatheringsFiles.has(filePath)) {
        execSync('latexmk -quiet -c', { cwd: directory })
      }
    }
  }
}

function renderMath (root) {
  const mathElements = root.querySelectorAll('eq')
  for (const mathElement of mathElements) {
    mathElement.replaceWith(
      katex.renderToString(filterUnknownSymbols(mathElement.text), {
        displayMode: mathElement.getAttribute('env') === 'displaymath',
        output: 'html'
      })
    )
  }
}

function filterUnknownSymbols (text) {
  return text
    .replace(/(\\left *|\\right *)*\\VERT/g, '$1 | $1 | $1 |')
    .replace(/\\overset{(.*)}&{(.*)}/g, '&\\overset{$1}{$2}')
}

function handleReferences (root) {
  const references = root.querySelectorAll('.bookref')
  let previousReference
  for (const reference of references) {
    const matches = reference.innerHTML.match(/\[[A-Z0-9\-']+]/)
    if (matches) {
      previousReference = matches[0]
    }
    if (previousReference) {
      const html = reference.innerHTML.trim().replace('<strong>[]</strong><br>', '')
      reference.innerHTML = `<a href="/bibliographie#${previousReference}">${html}</a>`
    }
  }
}

function addVueComponents (root) {
  const proofs = root.querySelectorAll('.demonstration')
  for (const proof of proofs) {
    const insertProofTitleElement = proof.querySelector('> p') ?? proof
    let html = '<em>Démonstration</em>.'
    if (insertProofTitleElement.tagName !== 'P') {
      html = `<p>${html}</p>`
    }
    insertProofTitleElement.innerHTML = `${html} ${insertProofTitleElement.innerHTML}`
    proof.replaceWith(`<proof-collapsible>${proof.outerHTML}</proof-collapsible>`)
  }
}

function toString (root) {
  const header = {}
  const name = root.querySelector('.docname h1')
  if (name) {
    header.name = name.innerHTML.trim()
    header['page-title'] = name.text.trim()
    header['page-title-search'] = normalizeString(header['page-title'])
  }
  const categories = root.querySelector('.doccategories')
  if (categories) {
    header.categories = categories.rawText.trim().split(', ')
  }
  const summary = root.querySelector('.docsummary p')
  if (summary) {
    header.summary = summary.innerHTML.trim()
    header['page-description'] = summary.text.trim()
  }
  return matter.stringify(root.innerHTML, header)
}

async function handleImages (imagesDir, imagesDestDir) {
  const files = fs.readdirSync(imagesDir)
  for (const file of files) {
    const filePath = path.resolve(imagesDir, file)
    if (fs.lstatSync(filePath).isDirectory()) {
      await handleImages(filePath, path.resolve(imagesDestDir, file))
    } else if (file.endsWith('.tex')) {
      logger.info(`Handling image "${filePath}"...`)
      const fileName = getFileName(file)
      latexmk(imagesDir, file)
      execSync(`pdftocairo -svg "${fileName}.pdf" "${fileName}.svg"`, { cwd: imagesDir })
      fs.mkdirSync(imagesDestDir, { recursive: true })
      fs.copyFileSync(path.resolve(imagesDir, `${fileName}.svg`), path.resolve(imagesDestDir, `${fileName}.svg`))
    }
  }
}

function latexmk (directory, file) {
  return execSync(`latexmk -quiet -pdflatex=lualatex -pdf "${file}"`, { cwd: directory })
}

function getFileName (file) {
  const extension = file.substring(file.lastIndexOf('.'))
  return path.basename(file).substring(0, file.length - extension.length)
}
