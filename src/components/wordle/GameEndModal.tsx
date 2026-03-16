"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { TileState } from "@/lib/models/GameSession";
import { evaluationsToEmojiGrid } from "@/lib/emoji";

interface GameEndModalProps {
  status: "won" | "lost";
  word: string;
  attempts: number;
  gameNumber: number;
  evaluations: TileState[][];
  points: number;
}

function getTimeUntilMidnightAR(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const arTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const midnight = new Date(arTime);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const diff = midnight.getTime() - arTime.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function GameEndModal({
  status,
  word,
  attempts,
  gameNumber,
  evaluations,
  points,
}: GameEndModalProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnightAR());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnightAR());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [siteUrl, setSiteUrl] = useState("");
  useEffect(() => {
    setSiteUrl(window.location.origin);
  }, []);
  const shareText = `La palabra del día #${gameNumber} ${status === "won" ? attempts : "X"}/6\n\n${evaluationsToEmojiGrid(evaluations)}\n\n${siteUrl}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-slate-800/90 rounded-2xl p-6 border border-slate-700 max-w-sm mx-auto text-center"
    >
      <h2 className="text-2xl font-bold mb-2">
        {status === "won" ? "🎉 ¡Ganaste!" : "😔 No pudiste"}
      </h2>

      <p className="text-slate-300 mb-1">
        La palabra era: <span className="font-bold text-teal-400 text-lg">{word}</span>
      </p>

      {status === "won" && (
        <p className="text-slate-300 mb-4">
          Adivinaste en <span className="font-bold text-white">{attempts}</span> intento
          {attempts > 1 ? "s" : ""} — <span className="font-bold text-teal-400">+{points} pts</span>
        </p>
      )}

      {status === "lost" && (
        <p className="text-slate-300 mb-4">
          <span className="font-bold text-red-400">0 pts</span>
        </p>
      )}

      <div className="bg-slate-900 rounded-lg p-3 mb-4 font-mono text-sm whitespace-pre-line">
        {shareText}
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors mb-3"
      >
        {copied ? "¡Copiado!" : "Compartir resultado"}
      </button>

      <Link
        href="/ranking"
        className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors mb-4"
      >
        Ver ranking
      </Link>

      <div className="text-slate-400 text-sm">
        <p>Próxima palabra en</p>
        <p className="text-xl font-mono text-white mt-1">
          {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
        </p>
      </div>
    </motion.div>
  );
}
