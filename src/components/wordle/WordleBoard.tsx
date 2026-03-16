"use client";

import WordleTile from "./WordleTile";
import type { TileState } from "@/lib/models/GameSession";

interface WordleBoardProps {
  guesses: string[];
  evaluations: TileState[][];
  currentGuess: string;
  maxAttempts?: number;
  shake?: boolean;
}

export default function WordleBoard({
  guesses,
  evaluations,
  currentGuess,
  maxAttempts = 6,
  shake = false,
}: WordleBoardProps) {
  const rows = [];

  for (let i = 0; i < maxAttempts; i++) {
    if (i < guesses.length) {
      // Completed guess row
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {guesses[i].split("").map((letter, j) => (
            <WordleTile
              key={j}
              letter={letter}
              state={evaluations[i]?.[j] || "absent"}
              delay={j}
            />
          ))}
        </div>
      );
    } else if (i === guesses.length) {
      // Current guess row
      const isCurrentRow = true;
      rows.push(
        <div
          key={i}
          className={`flex gap-1.5 justify-center ${isCurrentRow && shake ? "animate-shake" : ""}`}
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <WordleTile
              key={j}
              letter={currentGuess[j] || ""}
              state={currentGuess[j] ? "tbd" : "empty"}
            />
          ))}
        </div>
      );
    } else {
      // Empty row
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {Array.from({ length: 5 }).map((_, j) => (
            <WordleTile key={j} letter="" state="empty" />
          ))}
        </div>
      );
    }
  }

  return <div className="flex flex-col gap-1.5">{rows}</div>;
}
