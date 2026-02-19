/**
 * Ensure the property is returned as an array.
 *
 * - If null/undefined, returns an empty array.
 * - If already an array, returns as is.
 * - Otherwise, wraps the value in an array.
 *
 * @returns The property as an array
 *
 * @example
 * ```typescript
 * PropertyHelper.ensureArray(null)          // []
 * PropertyHelper.ensureArray('foo')         // ['foo']
 * PropertyHelper.ensureArray(['foo', 'bar']) // ['foo', 'bar']
 * ```
 * @param property
 */
export const ensureArray = <T>(property: T | Array<T> | null | undefined): T[] => {
  if (property === null || property === undefined) {
    return []
  }
  if (Array.isArray(property)) {
    return property
  }
  return [property]
}
