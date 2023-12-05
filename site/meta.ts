/**
 * Represents a GitHub repository.
 *
 * @interface
 */
export interface GithubRepository {
  /**
   * The GitHub username.
   *
   * @type {string}
   */
  username: string;

  /**
   * The GitHub repository name.
   *
   * @type {string}
   */
  repository: string;
}

/**
 * Represents the metadata for the site.
 *
 * @interface
 */
interface SiteMeta {
  /**
   * The title of the site.
   *
   * @type {string}
   */
  title: string;

  /**
   * The description of the site.
   *
   * @type {string}
   */
  description: string;

  /**
   * The URL of the site.
   *
   * @type {string}
   */
  url: string;

  /**
   * The GitHub repository information.
   *
   * @type {GithubRepository}
   */
  github: GithubRepository;
}

/**
 * The metadata for the site.
 *
 * @type {SiteMeta}
 */
export const siteMeta: SiteMeta = {
  title: 'agreg.skyost.eu',
  description: 'Petit site contenant une flopée de resources pour l\'agrégation de mathématiques : plans, développements, bibliographie, ...',
  url: 'https://agreg.skyost.eu',
  github: {
    username: 'Skyost',
    repository: 'Agregation'
  }
}
