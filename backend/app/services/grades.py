from __future__ import annotations

# Letter maps for common scales (max grade point = scale).
_SCALE_MAPS: dict[float, dict[str, float]] = {
    4.0: {"A": 4.0, "B": 3.0, "C": 2.0, "D": 1.0, "E": 0.5, "F": 0.0},
    5.0: {"A": 5.0, "B": 4.0, "C": 3.0, "D": 2.0, "E": 1.0, "F": 0.0},
}


def normalize_scale(scale: float) -> float:
    s = float(scale)
    if abs(s - 5.0) < 0.01:
        return 5.0
    return 4.0


def letter_map_for_scale(scale: float) -> dict[str, float]:
    s = normalize_scale(scale)
    return _SCALE_MAPS[s]


def grade_to_point(grade: str, scale: float = 4.0) -> float:
    g = grade.strip().upper()
    m = letter_map_for_scale(scale)
    if g not in m:
        raise ValueError(f"Invalid grade '{grade}'. Use one of: {', '.join(m)}")
    return m[g]


def semester_gpa(credits: list[float], points: list[float]) -> float:
    if not credits or sum(credits) <= 0:
        return 0.0
    num = sum(c * p for c, p in zip(credits, points, strict=True))
    den = sum(credits)
    return round(num / den, 4)


def cgpa_totals(rows: list[tuple[float, float]]) -> tuple[float, float, float]:
    """rows: (credit, grade_point) per course. Returns (total_credits, total_quality_points, cgpa)."""
    tc = 0.0
    tq = 0.0
    for credit, gp in rows:
        tc += credit
        tq += credit * gp
    if tc <= 0:
        return 0.0, 0.0, 0.0
    return tc, tq, round(tq / tc, 4)
