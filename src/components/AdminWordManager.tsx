"use client";

import { useState, useEffect, useCallback } from "react";

interface DailyWordItem {
  _id: string;
  gameNumber: number;
  word: string;
  date: string;
  setBy: { nickname: string } | null;
}

export default function AdminWordManager() {
  const [words, setWords] = useState<DailyWordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchWords = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/words");
      if (res.ok) {
        const data = await res.json();
        setWords(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !word) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, word }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Palabra "${word.toUpperCase()}" guardada para ${date}`);
        setWord("");
        setDate("");
        fetchWords();
      } else {
        setError(data.error || "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    }
    setSaving(false);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-teal-400">Palabras del día</h2>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm"
          required
        />
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase().slice(0, 5))}
          placeholder="PALABRA"
          maxLength={5}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm uppercase w-32"
          required
        />
        <button
          type="submit"
          disabled={saving || word.length !== 5}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {message && <p className="text-green-400 text-sm mb-4">{message}</p>}
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-400 text-sm">Cargando...</p>
      ) : words.length === 0 ? (
        <p className="text-slate-400 text-sm">No hay palabras configuradas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Fecha</th>
                <th className="pb-2 pr-4">Palabra</th>
                <th className="pb-2">Seteada por</th>
              </tr>
            </thead>
            <tbody>
              {words.map((w) => (
                <tr key={w._id} className="border-b border-slate-800">
                  <td className="py-2 pr-4 text-slate-300">{w.gameNumber}</td>
                  <td className="py-2 pr-4 text-slate-300">{w.date}</td>
                  <td className="py-2 pr-4 font-mono font-bold text-teal-400">{w.word}</td>
                  <td className="py-2 text-slate-400">
                    {w.setBy ? w.setBy.nickname : "Auto"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
