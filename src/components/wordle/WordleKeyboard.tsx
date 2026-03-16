"use client";

import { useCallback, useEffect } from "react";
import type { TileState } from "@/lib/models/GameSession";

interface WordleKeyboardProps {
  onKey: (key: string) => void;
  letterStates: Record<string, TileState>;
  disabled?: boolean;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const stateColors: Record<string, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-yellow-500 text-white border-yellow-500",
  absent: "bg-slate-700 text-slate-300 border-slate-700",
};

const defaultColor = "bg-slate-500 text-white hover:bg-slate-400 border-slate-500";

export default function WordleKeyboard({ onKey, letterStates, disabled = false }: WordleKeyboardProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER") {
        onKey("ENTER");
      } else if (key === "BACKSPACE") {
        onKey("⌫");
      } else if (/^[A-ZÑ]$/.test(key)) {
        onKey(key);
      }
    },
    [onKey, disabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="flex flex-col gap-1.5 items-center">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "⌫";
            const colorClass = letterStates[key]
              ? stateColors[letterStates[key]]
              : defaultColor;

            return (
              <button
                key={key}
                onClick={() => !disabled && onKey(key)}
                disabled={disabled}
                className={`${isSpecial ? "px-3 sm:px-4 text-xs" : "w-8 sm:w-10"} h-12 sm:h-14 rounded font-bold border transition-colors flex items-center justify-center ${colorClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
