export interface ParsedResult {
  gameNumber: number;
  attempts: number;
  maxAttempts: number;
  failed: boolean;
  emojiGrid: string;
  points: number;
}

export function parseGameResult(text: string): ParsedResult | null {
  const trimmed = text.trim();

  // Extract game number
  const gameMatch = trimmed.match(/La palabra del d[ií]a #(\d+)/i);
  if (!gameMatch) return null;
  const gameNumber = parseInt(gameMatch[1], 10);

  // Extract attempts
  const attemptsMatch = trimmed.match(/(\d+|X)\/(\d+)/);
  if (!attemptsMatch) return null;

  const failed = attemptsMatch[1] === "X";
  const attempts = failed ? 6 : parseInt(attemptsMatch[1], 10);
  const maxAttempts = parseInt(attemptsMatch[2], 10);

  if (!failed && (attempts < 1 || attempts > 6)) return null;
  if (maxAttempts !== 6) return null;

  // Extract emoji grid (lines containing game emojis)
  const emojiRegex = /^[⬛⬜🟨🟩🟦🟧🟥\s]+$/;
  const lines = trimmed.split("\n");
  const emojiLines = lines.filter((line) => emojiRegex.test(line.trim()) && line.trim().length > 0);

  if (emojiLines.length === 0) return null;
  if (!failed && emojiLines.length !== attempts) return null;

  const emojiGrid = emojiLines.map((l) => l.trim()).join("\n");
  const points = failed ? 0 : 7 - attempts;

  return { gameNumber, attempts, maxAttempts, failed, emojiGrid, points };
}
