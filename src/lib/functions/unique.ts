/**
 * Return array with only unique values. The function can be provided a custom
 * equality function to determine which items are considered equal. Defaults to
 * the "===" comparison.
 */
export function unique<T>(
  arr: T[],
  eq: (a: T, b: T) => boolean = (a: T, b: T) => a === b
) {
  return arr.filter((a, i) => arr.findIndex((b) => eq(a, b)) === i);
}
