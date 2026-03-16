"use client";

import { motion } from "framer-motion";
import type { TileState } from "@/lib/models/GameSession";

interface WordleTileProps {
  letter: string;
  state?: TileState | "empty" | "tbd";
  delay?: number;
}

const stateColors: Record<string, string> = {
  correct: "bg-green-600 border-green-600 text-white",
  present: "bg-yellow-500 border-yellow-500 text-white",
  absent: "bg-slate-700 border-slate-700 text-white",
  tbd: "bg-transparent border-slate-500 text-slate-100",
  empty: "bg-transparent border-slate-700",
};

export default function WordleTile({ letter, state = "empty", delay = 0 }: WordleTileProps) {
  const isRevealed = state === "correct" || state === "present" || state === "absent";

  return (
    <motion.div
      className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-2xl font-bold uppercase rounded select-none ${stateColors[state]}`}
      initial={isRevealed ? { rotateX: 0 } : undefined}
      animate={isRevealed ? { rotateX: [0, 90, 0] } : letter ? { scale: [1, 1.1, 1] } : undefined}
      transition={
        isRevealed
          ? { duration: 0.5, delay: delay * 0.15, times: [0, 0.5, 1] }
          : { duration: 0.1 }
      }
    >
      {letter}
    </motion.div>
  );
}
