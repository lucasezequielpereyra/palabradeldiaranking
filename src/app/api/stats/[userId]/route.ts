import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GameResult from "@/lib/models/GameResult";
import User from "@/lib/models/User";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();

    const { userId } = await params;

    // userId could be a nickname or actual userId
    let user = await User.findById(userId).catch(() => null);
    if (!user) {
      user = await User.findOne({ nickname: userId });
    }
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const results = await GameResult.find({ userId: user._id })
      .sort({ gameNumber: -1 })
      .lean();

    const totalGames = results.length;
    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const avgPoints = totalGames > 0 ? Math.round((totalPoints / totalGames) * 100) / 100 : 0;
    const wins = results.filter((r) => r.points === 6).length;
    const fails = results.filter((r) => r.failed).length;

    const distribution = [0, 0, 0, 0, 0, 0, 0]; // index 0 = failed, 1-6 = attempts
    for (const r of results) {
      if (r.failed) distribution[0]++;
      else distribution[r.attempts]++;
    }

    const recentResults = results.slice(0, 30).map((r) => ({
      gameNumber: r.gameNumber,
      attempts: r.attempts,
      failed: r.failed,
      points: r.points,
      emojiGrid: r.emojiGrid,
      submittedAt: r.submittedAt,
    }));

    return NextResponse.json({
      nickname: user.nickname,
      totalGames,
      totalPoints,
      avgPoints,
      wins,
      fails,
      distribution,
      recentResults,
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
