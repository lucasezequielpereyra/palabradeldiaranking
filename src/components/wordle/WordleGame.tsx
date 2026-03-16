"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import WordleBoard from "./WordleBoard";
import WordleKeyboard from "./WordleKeyboard";
import GameEndModal from "./GameEndModal";
import HowToPlayBanner from "./HowToPlayBanner";
import { isValidWord } from "@/lib/words";
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

const EMPTY_SLOTS: string[] = ["", "", "", "", ""];
const REVEAL_DURATION_MS = 5 * 150 + 500 + 300; // stagger + flip + color transition

export default function WordleGame() {
  const { data: session, update: updateSession } = useSession();
  const [gameState, setGameState] = useState<GameState>({
    status: "loading",
    gameNumber: 0,
    guesses: [],
    evaluations: [],
  });
  const [guessSlots, setGuessSlots] = useState<string[]>([...EMPTY_SLOTS]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const showHowToPlay = session?.user && !session.user.acceptedNewMode;

  // Optimistic UI state
  const [pendingGuess, setPendingGuess] = useState<string | null>(null);
  const [pendingEvaluation, setPendingEvaluation] = useState<TileState[] | null>(null);
  const [revealPhase, setRevealPhase] = useState<"none" | "checking" | "revealed">("none");
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  // Compute letter states for keyboard coloring
  const letterStates = useMemo(() => {
    const states: Record<string, TileState> = {};
    // Include confirmed guesses
    for (let i = 0; i < gameState.guesses.length; i++) {
      const guess = gameState.guesses[i];
      const evaluation = gameState.evaluations[i];
      if (!evaluation) continue;
      for (let j = 0; j < guess.length; j++) {
        const letter = guess[j];
        const current = states[letter];
        const newState = evaluation[j];
        if (!current || newState === "correct" || (newState === "present" && current === "absent")) {
          states[letter] = newState;
        }
      }
    }
    // Include pending guess if revealed
    if (pendingGuess && pendingEvaluation && revealPhase === "revealed") {
      for (let j = 0; j < pendingGuess.length; j++) {
        const letter = pendingGuess[j];
        const current = states[letter];
        const newState = pendingEvaluation[j];
        if (!current || newState === "correct" || (newState === "present" && current === "absent")) {
          states[letter] = newState;
        }
      }
    }
    return states;
  }, [gameState.guesses, gameState.evaluations, pendingGuess, pendingEvaluation, revealPhase]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    triggerShake();
    setTimeout(() => setError(""), 2000);
  }, [triggerShake]);

  const handleTileClick = useCallback((index: number) => {
    if (gameState.status === "won" || gameState.status === "lost" || submitting) return;
    setCursorPosition(index);
  }, [gameState.status, submitting]);

  const submitGuess = useCallback(async () => {
    const guess = guessSlots.join("");
    if (guess.length !== 5 || guessSlots.some(s => s === "")) {
      showError("La palabra debe tener 5 letras");
      return;
    }

    // Client-side validation (instant)
    if (!isValidWord(guess)) {
      showError("Palabra no válida");
      return;
    }

    // Phase 1: Optimistic lock — start animation immediately
    setPendingGuess(guess);
    setRevealPhase("checking");
    setGuessSlots([...EMPTY_SLOTS]);
    setCursorPosition(0);
    setSubmitting(true);

    // Phase 2: API call (runs in parallel with animation)
    try {
      const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Revert: restore guess to editable slots
        setPendingGuess(null);
        setRevealPhase("none");
        setGuessSlots(guess.split(""));
        setCursorPosition(4);
        showError(data.error || "Error al enviar");
        setSubmitting(false);
        return;
      }

      // Apply evaluation colors
      setPendingEvaluation(data.evaluation);
      setRevealPhase("revealed");

      // Wait for reveal animation to complete, then commit to gameState
      revealTimeoutRef.current = setTimeout(() => {
        setGameState({
          status: data.status === "playing" ? "playing" : data.status,
          gameNumber: data.gameNumber,
          guesses: data.guesses,
          evaluations: data.evaluations,
          word: data.word,
          attempts: data.attempts,
          points: data.points,
        });
        setPendingGuess(null);
        setPendingEvaluation(null);
        setRevealPhase("none");
        setSubmitting(false);
      }, REVEAL_DURATION_MS);
    } catch {
      // Revert on network error
      setPendingGuess(null);
      setRevealPhase("none");
      setGuessSlots(guess.split(""));
      setCursorPosition(4);
      showError("Error de conexión");
      setSubmitting(false);
    }
  }, [guessSlots, showError]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameState.status === "won" || gameState.status === "lost" || submitting) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "⌫") {
        setGuessSlots(prev => {
          const newSlots = [...prev];
          if (newSlots[cursorPosition] !== "") {
            // Clear current position
            newSlots[cursorPosition] = "";
          } else if (cursorPosition > 0) {
            // Move back and clear
            newSlots[cursorPosition - 1] = "";
            setCursorPosition(cursorPosition - 1);
          }
          return newSlots;
        });
      } else if (/^[A-ZÑ]$/.test(key)) {
        setGuessSlots(prev => {
          const newSlots = [...prev];
          newSlots[cursorPosition] = key;
          return newSlots;
        });
        if (cursorPosition < 4) {
          setCursorPosition(cursorPosition + 1);
        }
      }
    },
    [gameState.status, submitting, submitGuess, cursorPosition]
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
        guessSlots={guessSlots}
        cursorPosition={cursorPosition}
        onTileClick={handleTileClick}
        shake={shake}
        pendingGuess={pendingGuess}
        pendingEvaluation={pendingEvaluation}
        revealPhase={revealPhase}
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
