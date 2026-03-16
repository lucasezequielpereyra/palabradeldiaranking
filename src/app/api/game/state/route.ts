import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import GameSession from "@/lib/models/GameSession";
import DailyWord from "@/lib/models/DailyWord";
import { getTodayDateAR, getGameNumberForDate } from "@/lib/game-number";
import { getOrCreateDailyWord } from "@/lib/daily-word-service";
import { calculatePoints } from "@/lib/points";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const todayDate = getTodayDateAR();
    const gameNumber = getGameNumberForDate(todayDate);

    // Ensure a daily word exists for today
    await getOrCreateDailyWord(todayDate, gameNumber);

    const gameSession = await GameSession.findOne({
      userId: session.user.id,
      gameNumber,
    });

    if (!gameSession) {
      return NextResponse.json({ status: "new", gameNumber });
    }

    const response: Record<string, unknown> = {
      status: gameSession.status,
      gameNumber,
      guesses: gameSession.guesses,
      evaluations: gameSession.evaluations,
    };

    // Only reveal word when game is over
    if (gameSession.status === "won" || gameSession.status === "lost") {
      const dailyWord = await DailyWord.findOne({ gameNumber });
      response.word = dailyWord?.word;
      response.attempts = gameSession.guesses.length;
      const failed = gameSession.status === "lost";
      response.points = calculatePoints(gameSession.guesses.length, failed);
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
