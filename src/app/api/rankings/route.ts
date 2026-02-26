import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import GameResult from "@/lib/models/GameResult";
import User from "@/lib/models/User";

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function getMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "daily";
    const gameNumber = searchParams.get("gameNumber");

    // Ensure User model is registered
    User;

    if (type === "daily") {
      const gn = gameNumber ? parseInt(gameNumber, 10) : null;

      let filter: Record<string, unknown> = {};
      if (gn) {
        filter = { gameNumber: gn };
      } else {
        // Get the latest game number
        const latest = await GameResult.findOne().sort({ gameNumber: -1 });
        if (!latest) return NextResponse.json([]);
        filter = { gameNumber: latest.gameNumber };
      }

      const results = await GameResult.find(filter)
        .sort({ points: -1, submittedAt: 1 })
        .populate("userId", "nickname")
        .lean();

      const rankings = results.map((r, i) => ({
        position: i + 1,
        nickname: (r.userId as unknown as { nickname: string })?.nickname || "?",
        oddsUserId: (r.userId as unknown as { _id: string })?._id?.toString(),
        attempts: r.attempts,
        failed: r.failed,
        points: r.points,
        emojiGrid: r.emojiGrid,
        gameNumber: r.gameNumber,
      }));

      return NextResponse.json(rankings);
    }

    // Aggregate rankings for weekly/monthly/historical
    let dateFilter: Record<string, unknown> = {};
    if (type === "weekly") {
      const { start, end } = getWeekBounds();
      dateFilter = { submittedAt: { $gte: start, $lt: end } };
    } else if (type === "monthly") {
      const { start, end } = getMonthBounds();
      dateFilter = { submittedAt: { $gte: start, $lt: end } };
    }

    const pipeline: mongoose.PipelineStage[] = [
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter } as mongoose.PipelineStage] : []),
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$points" },
          gamesPlayed: { $sum: 1 },
          avgPoints: { $avg: "$points" },
        },
      },
      { $sort: { totalPoints: -1, avgPoints: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    const results = await GameResult.aggregate(pipeline);

    const rankings = results.map((r, i) => ({
      position: i + 1,
      nickname: r.user.nickname,
      userId: r._id.toString(),
      totalPoints: r.totalPoints,
      gamesPlayed: r.gamesPlayed,
      avgPoints: Math.round(r.avgPoints * 100) / 100,
    }));

    return NextResponse.json(rankings);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
