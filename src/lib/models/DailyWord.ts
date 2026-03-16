import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyWord extends Document {
  _id: mongoose.Types.ObjectId;
  gameNumber: number;
  word: string;
  date: string;
  setBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const DailyWordSchema = new Schema<IDailyWord>({
  gameNumber: { type: Number, required: true, unique: true },
  word: { type: String, required: true, uppercase: true, minlength: 5, maxlength: 5 },
  date: { type: String, required: true, unique: true },
  setBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now },
});

DailyWordSchema.index({ gameNumber: 1 }, { unique: true });
DailyWordSchema.index({ date: 1 }, { unique: true });

const DailyWord: Model<IDailyWord> =
  mongoose.models.DailyWord || mongoose.model<IDailyWord>("DailyWord", DailyWordSchema);

export default DailyWord;
