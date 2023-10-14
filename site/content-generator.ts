import path from 'path'
import * as fs from 'fs'
import { getFileName } from '../utils/utils'

export interface MarkdownResource {
    title: string,
    url: string
}

interface GatheringData {
  directory: string,
  title: string
}

interface Gathering {
  data: GatheringData[],
  header?: string
}

export interface ContentGeneratorSettings {
    destinationUrl: string,
    pdfDestination: string,
    imagesDestination: string,
    imagesDirectories: { [key: string]: string },
    imagesToExtract: string[],
    getLatexRelativeIncludedImagesDir: (fileExtractedImagesDir: string, filePat: string) => string,
    generateExtractedImageFileContent: (fileExtractedImagesDir: string, filePat: string, blockType: string, content: string) => string,
    fileNameFilter: (fileName: string) => string,
    shouldGenerateMarkdown: (fileName: string) => boolean,
    shouldHandleImagesOfDirectory: (directory: string) => boolean,
    shouldGeneratePdf: (fileName: string) => boolean,
    generatePrintVariant: (fileName: string, fileContent: string) => string | null,
    gatherings: Gathering[],
    generateGatheringContent (gathering: Gathering): string,
    ignored: string[]
}

export const contentGeneratorSettings: ContentGeneratorSettings = {
  destinationUrl: '/',
  pdfDestination: 'pdf',
  imagesDestination: 'images/latex',
  imagesDirectories: {},
  imagesToExtract: ['tikzpicture'],
  getLatexRelativeIncludedImagesDir (fileExtractedImagesDir, filePath) {
    return path.posix.join(path.relative(fileExtractedImagesDir, path.dirname(filePath)).split(path.sep).join(path.posix.sep), 'images', getFileName(filePath))
  },
  generateExtractedImageFileContent (_, __, ___, content) {
    return `\\documentclass[tikz]{standalone}

\\usepackage{tikz}
\\usepackage{tkz-euclide}
\\usepackage{fourier-otf}
\\usepackage{fontspec}

\\usetikzlibrary{calc}

\\tikzset{
  graphfonctionlabel/.style args={at #1 #2 with #3}{
    postaction={
      decorate, decoration={markings, mark= at position #1 with \\node [#2] {#3};}
    }
  },
  every picture/.append style={scale=1.5, every node/.style={scale=1.5}}
}

\\begin{document}
  ${content}
\\end{document}
`
  },
  fileNameFilter: fileName => fileName,
  shouldGenerateMarkdown: _ => true,
  shouldHandleImagesOfDirectory: _ => true,
  shouldGeneratePdf: _ => true,
  generatePrintVariant: (_, __) => null,
  gatherings: [
    {
      data: [
        {
          directory: 'lecons',
          title: 'Plans de leçons'
        }
      ]
    },
    {
      data: [
        {
          directory: 'developpements',
          title: 'Développements'
        }
      ]
    },
    {
      data: [
        {
          directory: 'lecons',
          title: 'Plans de leçons'
        },
        {
          directory: 'developpements',
          title: 'Développements'
        }
      ],
      header: `\\renewcommand{\\dev}[1]{%
\t\\reversemarginpar%
\t\\todo[noline]{
\t\t\\protect\\vspace{16pt}%
\t\t\\protect\\par%
\t\t\\bfseries\\color{devcolor}\\hyperref[#1]{DEV}]{}%
}%
\t\\normalmarginpar%
}`
    }
  ],
  generateGatheringContent: (gathering: Gathering) => {
    let content = `\\input{common}
\\input{gathering}
\\setbibliographypath{bibliography.bib}
\\input{bibliography}

\\renewcommand{\\gatheringtitle}{${gathering.data.map(data => data.title).join(' \\& ')}}

${gathering.header ?? ''}

\\begin{document}
`
    for (const data of gathering.data) {
      const files = fs
        .readdirSync(data.directory)
        .filter((file: string) => file.endsWith('.tex') && fs.lstatSync(path.resolve(data.directory, file)).isFile())
      if (gathering.data.length > 1) {
        content += `\\gathering{${data.title}}\n`
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        content += '\\inputcontent' + (i === 0 ? '*' : '') + `{${data.directory}/${file}}\n`
      }
    }
    content += '\\end{document}'
    return content
  },
  ignored: [
    'latex/bibliography.tex',
    'latex/common.tex',
    'latex/gathering.tex'
  ]
}
