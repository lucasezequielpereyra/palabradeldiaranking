"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import WordleBoard from "./WordleBoard";
import WordleKeyboard from "./WordleKeyboard";
import GameEndModal from "./GameEndModal";
import HowToPlayBanner from "./HowToPlayBanner";
import type { TileState } from "@/lib/models/GameSession";

type GameStatus = "loading" | "new" | "playing" | "won" | "lost";

interface GameState {
  status: GameStatus;
  gameNumber: number;
  guesses: string[];
  evaluations: TileState[][];
  word?: string;
  attempts?: number;
  points?: number;
}

export default function WordleGame() {
  const { data: session, update: updateSession } = useSession();
  const [gameState, setGameState] = useState<GameState>({
    status: "loading",
    gameNumber: 0,
    guesses: [],
    evaluations: [],
  });
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const showHowToPlay = session?.user && !session.user.acceptedNewMode;

  // Fetch initial game state
  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch("/api/game/state", { cache: "no-store" });
        if (!res.ok) {
          setError("Error al cargar el juego");
          return;
        }
        const data = await res.json();
        setGameState({
          status: data.status || "new",
          gameNumber: data.gameNumber ?? 0,
          guesses: data.guesses || [],
          evaluations: data.evaluations || [],
          word: data.word,
          attempts: data.attempts,
          points: data.points,
        });
      } catch {
        setError("Error al cargar el juego");
      }
    }
    fetchState();
  }, []);

  // Compute letter states for keyboard coloring
  const letterStates = useMemo(() => {
    const states: Record<string, TileState> = {};
    for (let i = 0; i < gameState.guesses.length; i++) {
      const guess = gameState.guesses[i];
      const evaluation = gameState.evaluations[i];
      if (!evaluation) continue;
      for (let j = 0; j < guess.length; j++) {
        const letter = guess[j];
        const current = states[letter];
        const newState = evaluation[j];
        // Priority: correct > present > absent
        if (!current || newState === "correct" || (newState === "present" && current === "absent")) {
          states[letter] = newState;
        }
      }
    }
    return states;
  }, [gameState.guesses, gameState.evaluations]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    triggerShake();
    setTimeout(() => setError(""), 2000);
  }, [triggerShake]);

  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== 5) {
      showError("La palabra debe tener 5 letras");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: currentGuess }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Error al enviar");
        setSubmitting(false);
        return;
      }

      setGameState({
        status: data.status === "playing" ? "playing" : data.status,
        gameNumber: data.gameNumber,
        guesses: data.guesses,
        evaluations: data.evaluations,
        word: data.word,
        attempts: data.attempts,
        points: data.points,
      });
      setCurrentGuess("");
    } catch {
      showError("Error de conexión");
    }
    setSubmitting(false);
  }, [currentGuess, showError]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameState.status === "won" || gameState.status === "lost" || submitting) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "⌫") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-ZÑ]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [gameState.status, submitting, submitGuess, currentGuess.length]
  );

  if (gameState.status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  const isGameOver = gameState.status === "won" || gameState.status === "lost";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-teal-400">La Palabra del Día</h1>
        <p className="text-slate-400 text-sm">Juego #{gameState.gameNumber}</p>
      </div>

      {showHowToPlay && (
        <HowToPlayBanner onClose={async () => {
          await fetch("/api/user/accept-new-mode", { method: "POST" });
          await updateSession();
        }} />
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <WordleBoard
        guesses={gameState.guesses}
        evaluations={gameState.evaluations}
        currentGuess={currentGuess}
        shake={shake}
      />

      {!isGameOver && (
        <WordleKeyboard
          onKey={handleKey}
          letterStates={letterStates}
          disabled={submitting}
        />
      )}

      {isGameOver && (
        <GameEndModal
          status={gameState.status as "won" | "lost"}
          word={gameState.word || "?????"}
          attempts={gameState.attempts || gameState.guesses.length}
          gameNumber={gameState.gameNumber}
          evaluations={gameState.evaluations}
          points={gameState.points ?? 0}
        />
      )}
    </div>
  );
}
