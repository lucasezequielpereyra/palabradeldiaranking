import DailyWord, { IDailyWord } from "./models/DailyWord";
import { getRandomUnusedWord } from "./words";

const NO_REPEAT_DAYS = 60;

/**
 * Determines the word category for a given game number.
 * Priority: dificil > media > normal
 * - "dificil" every 6th game (gameNumber % 6 === 0)
 * - "media" every 2nd game (gameNumber % 2 === 0), unless it's already dificil
 * - "normal" for all other games
 */
function getCategoryForGameNumber(
  gameNumber: number
): "normal" | "media" | "dificil" {
  if (gameNumber % 6 === 0) return "dificil";
  if (gameNumber % 2 === 0) return "media";
  return "normal";
}

/**
 * Gets words used in the last N days to prevent repetition.
 */
async function getRecentlyUsedWords(): Promise<string[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - NO_REPEAT_DAYS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const recentWords = await DailyWord.find({
    date: { $gte: cutoffStr },
  })
    .select("word")
    .lean();

  return recentWords.map((w) => w.word);
}

/**
 * Gets or creates the daily word for a given date and game number.
 * If no word is set by an admin, auto-assigns a random word from the
 * appropriate category, avoiding words used in the last 60 days.
 */
export async function getOrCreateDailyWord(
  date: string,
  gameNumber: number
): Promise<IDailyWord> {
  let dailyWord = await DailyWord.findOne({ date });

  if (!dailyWord) {
    const category = getCategoryForGameNumber(gameNumber);
    const recentlyUsed = await getRecentlyUsedWords();
    const word = getRandomUnusedWord(recentlyUsed, category);

    dailyWord = await DailyWord.findOneAndUpdate(
      { date },
      { gameNumber, word, date, setBy: null },
      { upsert: true, new: true }
    );
  }

  return dailyWord!;
}
