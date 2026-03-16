"use client";

import WordleTile from "./WordleTile";
import type { TileState } from "@/lib/models/GameSession";

interface WordleBoardProps {
  guesses: string[];
  evaluations: TileState[][];
  guessSlots: string[];
  cursorPosition: number;
  onTileClick: (index: number) => void;
  maxAttempts?: number;
  shake?: boolean;
  pendingGuess?: string | null;
  pendingEvaluation?: TileState[] | null;
  revealPhase?: "none" | "checking" | "revealed";
}

export default function WordleBoard({
  guesses,
  evaluations,
  guessSlots,
  cursorPosition,
  onTileClick,
  maxAttempts = 6,
  shake = false,
  pendingGuess = null,
  pendingEvaluation = null,
  revealPhase = "none",
}: WordleBoardProps) {
  const rows = [];
  const hasPending = pendingGuess !== null;

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
    } else if (hasPending && i === guesses.length) {
      // Pending guess row (optimistic UI)
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {pendingGuess.split("").map((letter, j) => {
            const tileState =
              revealPhase === "revealed" && pendingEvaluation
                ? pendingEvaluation[j]
                : revealPhase === "checking"
                  ? "checking" as const
                  : "tbd" as const;
            return (
              <WordleTile
                key={j}
                letter={letter}
                state={tileState}
                delay={j}
              />
            );
          })}
        </div>
      );
    } else if (i === guesses.length + (hasPending ? 1 : 0)) {
      // Current guess row (editable)
      rows.push(
        <div
          key={i}
          className={`flex gap-1.5 justify-center ${shake ? "animate-shake" : ""}`}
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <WordleTile
              key={j}
              letter={guessSlots[j] || ""}
              state={guessSlots[j] ? "tbd" : "empty"}
              isCursor={j === cursorPosition}
              onClick={() => onTileClick(j)}
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
