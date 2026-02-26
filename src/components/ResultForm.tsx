"use client";

import { useState } from "react";
import { parseGameResult, ParsedResult } from "@/lib/parser";
import EmojiGrid from "./EmojiGrid";

export default function ResultForm() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleTextChange(value: string) {
    setText(value);
    setError("");
    setSuccess("");
    const result = parseGameResult(value);
    setParsed(result);
  }

  async function handleSubmit() {
    if (!parsed) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar");
      } else {
        setSuccess("Resultado guardado correctamente");
        setText("");
        setParsed(null);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Pega tu resultado de La Palabra del Día
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={`La palabra del día #1512 4/6\n\n⬛⬛🟨⬛⬛\n⬛🟨⬛🟨⬛\n⬛🟩⬛🟨🟨\n🟩🟩🟩🟩🟩`}
          rows={8}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
      </div>

      {parsed && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-teal-400">Vista previa</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">Juego #{parsed.gameNumber}</span>
            <span className="text-slate-400">
              {parsed.failed ? "X" : parsed.attempts}/6
            </span>
            <span className={`font-bold ${parsed.points > 0 ? "text-teal-400" : "text-red-400"}`}>
              {parsed.points} pts
            </span>
          </div>
          <EmojiGrid grid={parsed.emojiGrid} />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl px-4 py-3 text-teal-400 text-sm">
          {success}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!parsed || loading}
        className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors"
      >
        {loading ? "Enviando..." : "Enviar resultado"}
      </button>
    </div>
  );
}
