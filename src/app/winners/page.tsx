"use client";

import { useState, useEffect } from "react";
import WinnerCard from "@/components/WinnerCard";

interface Winner {
  gameNumber: number;
  nickname: string;
  points: number;
  attempts: number;
  failed: boolean;
  emojiGrid: string;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/winners?type=daily&limit=30")
      .then((res) => res.json())
      .then((d) => {
        setWinners(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-teal-400">
        Galería de ganadores
      </h1>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : winners.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No hay ganadores aún
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {winners.map((w) => (
            <WinnerCard
              key={w.gameNumber}
              gameNumber={w.gameNumber}
              nickname={w.nickname}
              points={w.points}
              attempts={w.attempts}
              failed={w.failed}
              emojiGrid={w.emojiGrid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
