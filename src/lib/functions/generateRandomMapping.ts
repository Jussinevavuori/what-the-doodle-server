import { createIndexArray } from "./createIndexArray";
import { shuffle } from "./shuffle";

export function generateRandomMapping(
  n: number,
  isRestrictedState: (from: number, to: number) => boolean
) {
  const isValidMapping = (mapping: number[]) => {
    if (mapping.length !== n) {
      return false;
    }
    for (let i = 0; i < mapping.length; i++) {
      if (isRestrictedState(i, mapping[i])) {
        return false;
      }
    }
    return true;
  };

  let attempt = 0;

  while (true) {
    const mapping = shuffle(createIndexArray(n));
    if (isValidMapping(mapping)) {
      return mapping;
    }
  }
}
