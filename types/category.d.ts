/**
 * Represents a category assigned to a object.
 *
 * @type {Category}
 */
export type Category = 'algebra' | 'analysis';

/**
 * Interface for objects that have categories.
 *
 * @interface
 */
export interface HasCategories {
  /**
   * An array of categories assigned to the object.
   *
   * @type {Category[]}
   */
  categories: Category[];
}
