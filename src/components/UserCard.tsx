"use client";

import Link from "next/link";

interface UserCardProps {
  nickname: string;
  totalPoints: number;
  gamesPlayed: number;
  avgPoints: number;
  position: number;
}

export default function UserCard({ nickname, totalPoints, gamesPlayed, avgPoints, position }: UserCardProps) {
  return (
    <Link
      href={`/profile/${nickname}`}
      className="block bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-teal-500/50 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-slate-100">
          #{position} {nickname}
        </span>
        <span className="text-xl font-bold text-teal-400">{totalPoints} pts</span>
      </div>
      <div className="flex gap-4 text-sm text-slate-400">
        <span>{gamesPlayed} juegos</span>
        <span>Promedio: {avgPoints}</span>
      </div>
    </Link>
  );
}
