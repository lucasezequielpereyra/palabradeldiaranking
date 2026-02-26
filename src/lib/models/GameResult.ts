import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGameResult extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  gameNumber: number;
  attempts: number;
  failed: boolean;
  emojiGrid: string;
  points: number;
  submittedAt: Date;
}

const GameResultSchema = new Schema<IGameResult>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gameNumber: { type: Number, required: true },
  attempts: { type: Number, required: true, min: 1, max: 6 },
  failed: { type: Boolean, default: false },
  emojiGrid: { type: String, required: true },
  points: { type: Number, required: true, min: 0, max: 6 },
  submittedAt: { type: Date, default: Date.now },
});

GameResultSchema.index({ userId: 1, gameNumber: 1 }, { unique: true });
GameResultSchema.index({ gameNumber: 1, points: -1 });
GameResultSchema.index({ submittedAt: -1 });

const GameResult: Model<IGameResult> =
  mongoose.models.GameResult ||
  mongoose.model<IGameResult>("GameResult", GameResultSchema);

export default GameResult;
