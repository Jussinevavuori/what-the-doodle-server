export function getRandomItemFromSet<T>(set: Set<T>): T {
  let items = Array.from(set);
  return items[Math.floor(Math.random() * items.length)];
}
