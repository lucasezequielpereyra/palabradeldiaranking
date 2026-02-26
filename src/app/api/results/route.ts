import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import GameResult from "@/lib/models/GameResult";
import { parseGameResult } from "@/lib/parser";
import { getTodayBoundsAR } from "@/lib/date";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Texto del resultado requerido" }, { status: 400 });
    }

    const parsed = parseGameResult(text);
    if (!parsed) {
      return NextResponse.json({ error: "No se pudo parsear el resultado. Verifica el formato." }, { status: 400 });
    }

    await dbConnect();

    // Check duplicate game number
    const existing = await GameResult.findOne({
      userId: session.user.id,
      gameNumber: parsed.gameNumber,
    });

    if (existing) {
      return NextResponse.json({ error: "Ya enviaste un resultado para este juego" }, { status: 409 });
    }

    // Check: only 1 result per day (Argentina GMT-3)
    const { start, end } = getTodayBoundsAR();
    const todayResult = await GameResult.findOne({
      userId: session.user.id,
      submittedAt: { $gte: start, $lt: end },
    });

    if (todayResult) {
      return NextResponse.json({ error: "Ya enviaste un resultado hoy. Volvé mañana." }, { status: 409 });
    }

    const result = await GameResult.create({
      userId: session.user.id,
      gameNumber: parsed.gameNumber,
      attempts: parsed.attempts,
      failed: parsed.failed,
      emojiGrid: parsed.emojiGrid,
      points: parsed.points,
    });

    return NextResponse.json({ message: "Resultado guardado", result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const gameNumber = searchParams.get("gameNumber");

    const filter: Record<string, unknown> = { userId: session.user.id };
    if (gameNumber) filter.gameNumber = parseInt(gameNumber, 10);

    const results = await GameResult.find(filter).sort({ submittedAt: -1 }).limit(50);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
