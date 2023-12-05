import type { LatexContentObject } from '~/types/latex.d'

/**
 * Represents a development, extending the LatexContentObject interface.
 *
 * @interface
 * @extends {LatexContentObject}
 */
export interface Development extends LatexContentObject {
  /**
   * The summary of the development.
   *
   * @type {string}
   */
  summary: string;

  /**
   * The page description of the development.
   *
   * @type {string}
   */
  'page-description': string;
}

/**
 * Represents the content of a development, extending the Development interface.
 *
 * @interface
 * @extends {Development}
 */
export interface DevelopmentContent extends Development {
  /**
   * The body content of the development.
   *
   * @type {string}
   */
  body: string;
}
