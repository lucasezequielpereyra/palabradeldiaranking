import type { TileState } from "./models/GameSession";

/**
 * Evaluates a Wordle guess against the answer.
 * Handles duplicate letters correctly per standard Wordle rules.
 */
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const result: TileState[] = new Array(g.length).fill("absent");
  const answerUsed = new Array(a.length).fill(false);

  // Pass 1: mark exact matches (correct)
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      answerUsed[i] = true;
    }
  }

  // Pass 2: mark present letters (wrong position)
  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < a.length; j++) {
      if (!answerUsed[j] && g[i] === a[j]) {
        result[i] = "present";
        answerUsed[j] = true;
        break;
      }
    }
  }

  return result;
}
