"use client";

import Link from "next/link";
import EmojiGrid from "./EmojiGrid";

interface DailyEntry {
  position: number;
  nickname: string;
  attempts: number;
  failed: boolean;
  points: number;
  emojiGrid: string;
  gameNumber: number;
}

interface AggregateEntry {
  position: number;
  nickname: string;
  totalPoints: number;
  gamesPlayed: number;
  avgPoints: number;
}

type RankingEntry = DailyEntry | AggregateEntry;

interface RankingTableProps {
  data: RankingEntry[];
  type: "daily" | "weekly" | "monthly" | "historical";
}

function isDailyEntry(entry: RankingEntry): entry is DailyEntry {
  return "attempts" in entry;
}

function getMedalEmoji(position: number): string {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return `${position}`;
}

export default function RankingTable({ data, type }: RankingTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No hay resultados aún
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((entry) => (
        <div
          key={`${entry.position}-${entry.nickname}`}
          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
            entry.position <= 3
              ? "bg-slate-800/80 border border-slate-700"
              : "bg-slate-800/40 hover:bg-slate-800/60"
          }`}
        >
          <div className="w-10 text-center text-lg font-bold">
            {getMedalEmoji(entry.position)}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${entry.nickname}`}
              className="font-medium text-slate-100 hover:text-teal-400 transition-colors"
            >
              {entry.nickname}
            </Link>

            {type === "daily" && isDailyEntry(entry) && (
              <div className="mt-1">
                <EmojiGrid grid={entry.emojiGrid} size="sm" />
              </div>
            )}

            {!isDailyEntry(entry) && (
              <div className="text-xs text-slate-400 mt-0.5">
                {entry.gamesPlayed} juegos · Promedio: {entry.avgPoints} pts
              </div>
            )}
          </div>

          <div className="text-right">
            {isDailyEntry(entry) ? (
              <div>
                <div className="text-lg font-bold text-teal-400">{entry.points} pts</div>
                <div className="text-xs text-slate-400">
                  {entry.failed ? "X" : entry.attempts}/6
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-teal-400">
                {entry.totalPoints} pts
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
