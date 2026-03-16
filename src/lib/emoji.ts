import type { TileState } from "./models/GameSession";

const EMOJI_MAP: Record<TileState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

/** Converts evaluation arrays to an emoji grid string compatible with the existing parser */
export function evaluationsToEmojiGrid(evaluations: TileState[][]): string {
  return evaluations.map((row) => row.map((tile) => EMOJI_MAP[tile]).join("")).join("\n");
}
