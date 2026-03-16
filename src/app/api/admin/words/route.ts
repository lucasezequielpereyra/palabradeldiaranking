import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import DailyWord from "@/lib/models/DailyWord";
import { isValidWord } from "@/lib/words";
import { getGameNumberForDate } from "@/lib/game-number";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await dbConnect();

    const words = await DailyWord.find()
      .sort({ gameNumber: -1 })
      .limit(30)
      .populate("setBy", "nickname");

    return NextResponse.json(words);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { date, word } = await req.json();

    if (!date || !word) {
      return NextResponse.json({ error: "Fecha y palabra requeridas" }, { status: 400 });
    }

    const upperWord = word.toUpperCase();
    if (upperWord.length !== 5) {
      return NextResponse.json({ error: "La palabra debe tener 5 letras" }, { status: 400 });
    }

    if (!isValidWord(upperWord)) {
      return NextResponse.json({ error: "La palabra no está en el diccionario" }, { status: 400 });
    }

    await dbConnect();

    const gameNumber = getGameNumberForDate(date);

    const dailyWord = await DailyWord.findOneAndUpdate(
      { date },
      {
        gameNumber,
        word: upperWord,
        date,
        setBy: session.user.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Palabra guardada", dailyWord }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
