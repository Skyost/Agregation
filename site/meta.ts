export interface GithubRepository {
  username: string,
  repository: string
}

interface SiteMeta {
  title: string,
  description: string,
  url: string,
  github: GithubRepository
}

export const siteMeta: SiteMeta = {
  title: 'agreg.skyost.eu',
  description: 'Petit site contenant une flopée de resources pour l\'agrégation de mathématiques : plans, développements, bibliographie, ...',
  url: 'https://agreg.skyost.eu',
  github: {
    username: 'Skyost',
    repository: 'Agregation'
  }
}
