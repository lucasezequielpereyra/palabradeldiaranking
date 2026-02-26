const TZ = "America/Argentina/Buenos_Aires";

/** Returns current date/time in Argentina (GMT-3) */
export function nowAR(): Date {
  const now = new Date();
  const ar = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  return ar;
}

/** Returns start (00:00) and end (00:00 next day) of today in Argentina, as UTC Dates */
export function getTodayBoundsAR(): { start: Date; end: Date } {
  const ar = nowAR();
  // Build start of day in AR time
  const startAR = new Date(ar.getFullYear(), ar.getMonth(), ar.getDate(), 0, 0, 0, 0);
  const endAR = new Date(ar.getFullYear(), ar.getMonth(), ar.getDate() + 1, 0, 0, 0, 0);

  // Convert back to UTC by adding 3 hours (AR is UTC-3)
  const start = new Date(startAR.getTime() + 3 * 60 * 60 * 1000);
  const end = new Date(endAR.getTime() + 3 * 60 * 60 * 1000);
  return { start, end };
}

/** Returns week bounds (Monday 00:00 to next Monday 00:00) in Argentina, as UTC Dates */
export function getWeekBoundsAR(): { start: Date; end: Date } {
  const ar = nowAR();
  const day = ar.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(ar.getFullYear(), ar.getMonth(), ar.getDate() - diff, 0, 0, 0, 0);
  const nextMonday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7, 0, 0, 0, 0);

  const start = new Date(monday.getTime() + 3 * 60 * 60 * 1000);
  const end = new Date(nextMonday.getTime() + 3 * 60 * 60 * 1000);
  return { start, end };
}

/** Returns month bounds (1st 00:00 to 1st next month 00:00) in Argentina, as UTC Dates */
export function getMonthBoundsAR(): { start: Date; end: Date } {
  const ar = nowAR();
  const startAR = new Date(ar.getFullYear(), ar.getMonth(), 1, 0, 0, 0, 0);
  const endAR = new Date(ar.getFullYear(), ar.getMonth() + 1, 1, 0, 0, 0, 0);

  const start = new Date(startAR.getTime() + 3 * 60 * 60 * 1000);
  const end = new Date(endAR.getTime() + 3 * 60 * 60 * 1000);
  return { start, end };
}
