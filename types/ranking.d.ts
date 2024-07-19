import type { Lesson, LessonContent } from '~/types/development'

/**
 * Represents a sheet, extending the LatexContentObject interface.
 *
 * @interface
 * @extends {Lesson}
 */
export interface Ranking extends Lesson {}

/**
 * Represents the content of a ranking, extending the Ranking interface.
 *
 * @interface
 * @extends {LessonContent}
 */
export interface RankingContent extends LessonContent {}
