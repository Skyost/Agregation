export interface SiteDirectories {
  latexDirectory: string,
  booksDirectory: string,
  downloadDirectory: string
}

export const siteDirectories: SiteDirectories = {
  latexDirectory: 'latex/',
  booksDirectory: 'content/livres/',
  downloadDirectory: process.env.GITHUB_DOWNLOAD_DIRECTORY
}
