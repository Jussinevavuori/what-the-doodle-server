import { randomInt } from "./randomInt";

export function randomInts(n: number, max: number, unique: boolean) {
  const canGenerateUnique = n < max;

  if (unique && !canGenerateUnique) {
    console.warn(`Could not generate ${n} unique numbers between 0 and ${max}`);
  }

  let nums: number[] = [];

  while (nums.length < n) {
    const nextNum = randomInt(max);
    if (unique && canGenerateUnique && nums.includes(nextNum)) {
      continue;
    }
    nums.push(nextNum);
  }

  return nums;
}
