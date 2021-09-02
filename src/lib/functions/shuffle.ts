import { randomInt } from "./randomInt";

export function shuffle<T>(arr: T[], shuffles?: number) {
  // If not specified, perform 2*arr.length shuffles
  const n = shuffles ?? arr.length * 2;

  // Copy array
  let a = [...arr];

  // Perform n random shuffles
  for (let shuffle = 0; shuffle < n; shuffle++) {
    // Pick two inequal random indices
    let i = 0;
    let j = 0;
    while (i === j) {
      i = randomInt(a.length);
      j = randomInt(a.length);
    }

    // Swap elements at indices
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }

  // Return shuffled array
  return a;
}
