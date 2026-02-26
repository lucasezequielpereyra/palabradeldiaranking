"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import RankingTable from "@/components/RankingTable";

export default function HomePage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rankings?type=daily")
      .then((res) => res.json())
      .then((d) => {
        setRanking(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-teal-400">La Palabra</span> Ranking
        </h1>
        <p className="text-slate-400">
          ¿Quién adivina la palabra con menos intentos?
        </p>
      </div>

      {/* Quick submit CTA */}
      {session ? (
        <Link
          href="/submit"
          className="block bg-teal-600 hover:bg-teal-500 text-white text-center py-4 rounded-xl font-medium transition-colors"
        >
          Enviar mi resultado de hoy
        </Link>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-slate-300 mb-3">
            Inicia sesión para participar en el ranking
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors"
          >
            Entrar
          </Link>
        </div>
      )}

      {/* Today ranking */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-200">Ranking de hoy</h2>
          <Link
            href="/ranking"
            className="text-sm text-teal-400 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Cargando...</div>
        ) : (
          <RankingTable data={ranking.slice(0, 10)} type="daily" />
        )}
      </div>
    </div>
  );
}
