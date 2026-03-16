import mongoose, { Schema, Document, Model } from "mongoose";

export type TileState = "correct" | "present" | "absent";
export type GameStatus = "playing" | "won" | "lost";

export interface IGameSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  gameNumber: number;
  guesses: string[];
  evaluations: TileState[][];
  status: GameStatus;
  startedAt: Date;
  completedAt: Date | null;
}

const GameSessionSchema = new Schema<IGameSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gameNumber: { type: Number, required: true },
  guesses: { type: [String], default: [] },
  evaluations: { type: [[String]], default: [] },
  status: { type: String, enum: ["playing", "won", "lost"], default: "playing" },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});

GameSessionSchema.index({ userId: 1, gameNumber: 1 }, { unique: true });

const GameSession: Model<IGameSession> =
  mongoose.models.GameSession || mongoose.model<IGameSession>("GameSession", GameSessionSchema);

export default GameSession;
