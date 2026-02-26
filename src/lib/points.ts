export function calculatePoints(attempts: number, failed: boolean): number {
  if (failed) return 0;
  return 7 - attempts;
}
