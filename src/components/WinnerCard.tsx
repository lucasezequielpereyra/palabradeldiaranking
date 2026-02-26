"use client";

import EmojiGrid from "./EmojiGrid";

interface WinnerCardProps {
  gameNumber: number;
  nickname: string;
  points: number;
  attempts: number;
  failed: boolean;
  emojiGrid: string;
}

export default function WinnerCard({ gameNumber, nickname, points, attempts, failed, emojiGrid }: WinnerCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-teal-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">Juego #{gameNumber}</span>
        <span className="text-sm font-bold text-teal-400">{points} pts</span>
      </div>
      <div className="mb-2">
        <span className="text-lg font-bold text-slate-100">🏆 {nickname}</span>
        <span className="ml-2 text-sm text-slate-400">
          {failed ? "X" : attempts}/6
        </span>
      </div>
      <EmojiGrid grid={emojiGrid} size="sm" />
    </div>
  );
}
