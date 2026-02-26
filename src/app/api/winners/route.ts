import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import GameResult from "@/lib/models/GameResult";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    User; // ensure registered

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "daily";
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);

    if (type === "daily") {
      const pipeline: mongoose.PipelineStage[] = [
        { $sort: { gameNumber: -1, points: -1, submittedAt: 1 } },
        {
          $group: {
            _id: "$gameNumber",
            winnerId: { $first: "$userId" },
            points: { $first: "$points" },
            attempts: { $first: "$attempts" },
            failed: { $first: "$failed" },
            emojiGrid: { $first: "$emojiGrid" },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "winnerId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ];

      const results = await GameResult.aggregate(pipeline);
      const winners = results.map((r) => ({
        gameNumber: r._id,
        nickname: r.user.nickname,
        points: r.points,
        attempts: r.attempts,
        failed: r.failed,
        emojiGrid: r.emojiGrid,
      }));

      return NextResponse.json(winners);
    }

    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
