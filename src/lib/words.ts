import diccionario from "@/data/palabras-5.json";

const allWords = [
  ...diccionario.normal,
  ...diccionario.media,
  ...diccionario.dificil,
];
const wordSet = new Set<string>(allWords);

/** Checks if a word is a valid 5-letter Spanish word */
export function isValidWord(word: string): boolean {
  return wordSet.has(word.toUpperCase());
}

/** Returns a random word from the specified category that hasn't been used yet */
export function getRandomUnusedWord(
  usedWords: string[],
  category: "normal" | "media" | "dificil" = "normal"
): string {
  const pool = diccionario[category];
  const usedSet = new Set(usedWords.map((w) => w.toUpperCase()));
  const available = pool.filter((w) => !usedSet.has(w));
  if (available.length === 0) {
    // If all words used, just pick any random word from the category
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

/** Returns the full word list (all categories combined) */
export function getAllWords(): string[] {
  return allWords;
}

/** Returns words for a specific category */
export function getWordsByCategory(
  category: "normal" | "media" | "dificil"
): string[] {
  return diccionario[category];
}
