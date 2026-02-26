"use client";

import { useState, useEffect, use } from "react";
import StatsChart from "@/components/StatsChart";
import EmojiGrid from "@/components/EmojiGrid";

interface UserStats {
  nickname: string;
  totalGames: number;
  totalPoints: number;
  avgPoints: number;
  wins: number;
  fails: number;
  distribution: number[];
  recentResults: {
    gameNumber: number;
    attempts: number;
    failed: boolean;
    points: number;
    emojiGrid: string;
    submittedAt: string;
  }[];
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ nickname: string }>;
}) {
  const { nickname } = use(params);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stats/${encodeURIComponent(nickname)}`)
      .then((res) => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Usuario no encontrado");
        setLoading(false);
      });
  }, [nickname]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Cargando perfil...</div>;
  }

  if (error || !stats) {
    return <div className="text-center py-12 text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-teal-400 mb-4">{stats.nickname}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-100">{stats.totalGames}</div>
            <div className="text-xs text-slate-400">Juegos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-400">{stats.totalPoints}</div>
            <div className="text-xs text-slate-400">Puntos totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-100">{stats.avgPoints}</div>
            <div className="text-xs text-slate-400">Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
            <div className="text-xs text-slate-400">En 1 intento</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <StatsChart
        distribution={stats.distribution}
        recentResults={stats.recentResults}
      />

      {/* Recent results */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-3">Resultados recientes</h2>
        <div className="space-y-2">
          {stats.recentResults.map((r) => (
            <div
              key={r.gameNumber}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">
                  Juego #{r.gameNumber}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {r.failed ? "X" : r.attempts}/6
                  </span>
                  <span className={`font-bold ${r.points > 0 ? "text-teal-400" : "text-red-400"}`}>
                    {r.points} pts
                  </span>
                </div>
              </div>
              <EmojiGrid grid={r.emojiGrid} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
