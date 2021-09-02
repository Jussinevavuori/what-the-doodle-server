export function rotateRight<T>(arr: T[]): T[] {
  return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
}
