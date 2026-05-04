/** Must match backend `normalize_scale` (4.0 vs 5.0). */
export function normalizeCgpaScale(scale: number): 4 | 5 {
  return Math.abs(scale - 5) < 0.01 ? 5 : 4;
}

export function letterGradePoints(scale: number): Record<string, number> {
  return normalizeCgpaScale(scale) === 5
    ? { A: 5, B: 4, C: 3, D: 2, F: 0 }
    : { A: 4, B: 3, C: 2, D: 1, F: 0 };
}
