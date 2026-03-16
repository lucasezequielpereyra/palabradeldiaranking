import { nowAR } from "./date";

// Continue from lapalabradeldia.com numbering: #1529 = 2026-03-16
const REFERENCE_GAME_NUMBER = 1529;
const REFERENCE_DATE = "2026-03-16"; // YYYY-MM-DD in Argentina timezone

/** Returns the date string "YYYY-MM-DD" for today in Argentina timezone */
export function getTodayDateAR(): string {
  const ar = nowAR();
  const y = ar.getFullYear();
  const m = String(ar.getMonth() + 1).padStart(2, "0");
  const d = String(ar.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Calculates game number for a given date string "YYYY-MM-DD" */
export function getGameNumberForDate(dateStr: string): number {
  const ref = new Date(REFERENCE_DATE + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const diffDays = Math.floor((target.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  return REFERENCE_GAME_NUMBER + diffDays;
}

/** Calculates the date string for a given game number */
export function getDateForGameNumber(gameNumber: number): string {
  const ref = new Date(REFERENCE_DATE + "T00:00:00");
  const diff = gameNumber - REFERENCE_GAME_NUMBER;
  const target = new Date(ref.getTime() + diff * 24 * 60 * 60 * 1000);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
