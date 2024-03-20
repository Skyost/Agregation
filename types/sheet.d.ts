import type { Development, DevelopmentContent } from '~/types/development'

/**
 * Represents a sheet, extending the LatexContentObject interface.
 *
 * @interface
 * @extends {Development}
 */
export interface Sheet extends Development {}

/**
 * Represents the content of a sheet, extending the Sheet interface.
 *
 * @interface
 * @extends {DevelopmentContent}
 */
export interface SheetContent extends DevelopmentContent {}
