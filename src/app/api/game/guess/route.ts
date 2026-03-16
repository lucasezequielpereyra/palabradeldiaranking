import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import GameSession from "@/lib/models/GameSession";
import GameResult from "@/lib/models/GameResult";
import { getTodayDateAR, getGameNumberForDate } from "@/lib/game-number";
import { getOrCreateDailyWord } from "@/lib/daily-word-service";
import { isValidWord } from "@/lib/words";
import { evaluateGuess } from "@/lib/wordle";
import { evaluationsToEmojiGrid } from "@/lib/emoji";
import { calculatePoints } from "@/lib/points";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { guess } = await req.json();
    if (!guess || typeof guess !== "string" || guess.length !== 5) {
      return NextResponse.json({ error: "La palabra debe tener 5 letras" }, { status: 400 });
    }

    const upperGuess = guess.toUpperCase();

    if (!isValidWord(upperGuess)) {
      return NextResponse.json({ error: "Palabra no válida" }, { status: 400 });
    }

    await dbConnect();

    const todayDate = getTodayDateAR();
    const gameNumber = getGameNumberForDate(todayDate);
    const dailyWord = await getOrCreateDailyWord(todayDate, gameNumber);

    // Get or create game session
    let gameSession = await GameSession.findOne({
      userId: session.user.id,
      gameNumber,
    });

    if (gameSession && gameSession.status !== "playing") {
      return NextResponse.json({ error: "Ya terminaste el juego de hoy" }, { status: 409 });
    }

    if (!gameSession) {
      // Check if user already has a GameResult for this game number (e.g., from manual submit)
      const existingResult = await GameResult.findOne({
        userId: session.user.id,
        gameNumber,
      });
      if (existingResult) {
        return NextResponse.json({ error: "Ya tenés un resultado para este juego" }, { status: 409 });
      }

      gameSession = await GameSession.create({
        userId: session.user.id,
        gameNumber,
      });
    }

    if (gameSession.guesses.length >= 6) {
      return NextResponse.json({ error: "Ya usaste todos los intentos" }, { status: 409 });
    }

    // Evaluate the guess
    const evaluation = evaluateGuess(upperGuess, dailyWord.word);

    gameSession.guesses.push(upperGuess);
    gameSession.evaluations.push(evaluation);

    const isWin = evaluation.every((e) => e === "correct");
    const isLastAttempt = gameSession.guesses.length >= 6;

    if (isWin) {
      gameSession.status = "won";
      gameSession.completedAt = new Date();
    } else if (isLastAttempt) {
      gameSession.status = "lost";
      gameSession.completedAt = new Date();
    }

    await gameSession.save();

    const response: Record<string, unknown> = {
      evaluation,
      guesses: gameSession.guesses,
      evaluations: gameSession.evaluations,
      status: gameSession.status,
      gameNumber,
    };

    // If game is over, create GameResult and reveal word
    if (gameSession.status === "won" || gameSession.status === "lost") {
      const failed = gameSession.status === "lost";
      const attempts = gameSession.guesses.length;
      const points = calculatePoints(attempts, failed);
      const emojiGrid = evaluationsToEmojiGrid(gameSession.evaluations);

      await GameResult.create({
        userId: session.user.id,
        gameNumber,
        attempts,
        failed,
        emojiGrid,
        points,
      });

      response.word = dailyWord.word;
      response.attempts = attempts;
      response.points = points;
      response.failed = failed;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
