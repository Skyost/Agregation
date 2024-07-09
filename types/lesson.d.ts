import type { LatexContentObject } from '~/types/latex.d'

/**
 * Represents a lesson, extending the LatexContentObject interface.
 *
 * @interface
 * @extends {LatexContentObject}
 */
export interface Lesson extends LatexContentObject {}

/**
 * Represents the content of a lesson, extending the Lesson interface.
 *
 * @interface
 * @extends {Lesson}
 */
export interface LessonContent extends Lesson {
  /**
   * The body content of the lesson.
   *
   * @type {string}
   */
  body: string
}
