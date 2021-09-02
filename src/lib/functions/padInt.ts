/**
 * Utility function to pad integers to strings with extra zeroes
 */
export function padInt(num: number, len: number) {
  return num.toString().padStart(len, "0");
}
