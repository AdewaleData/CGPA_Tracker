from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.semester import Semester
from app.models.result import SemesterResult
from app.models.user import User
from app.services.grades import grade_to_point, semester_gpa


def all_user_courses(db: Session, user_id: int) -> list[Course]:
    return (
        db.query(Course)
        .join(Semester)
        .filter(Semester.user_id == user_id)
        .order_by(Semester.position, Course.id)
        .all()
    )


def courses_for_semester(db: Session, semester_id: int, user_id: int) -> list[Course]:
    sem = db.query(Semester).filter(Semester.id == semester_id, Semester.user_id == user_id).first()
    if not sem:
        return []
    return db.query(Course).filter(Course.semester_id == semester_id).order_by(Course.id).all()


def recompute_all_results(db: Session, user_id: int) -> None:
    """Refresh GPA/CGPA snapshot rows for every semester in chronological order."""
    sems = (
        db.query(Semester)
        .filter(Semester.user_id == user_id)
        .order_by(Semester.position)
        .all()
    )
    cumulative_credits = 0.0
    cumulative_qp = 0.0

    for sem in sems:
        courses = db.query(Course).filter(Course.semester_id == sem.id).all()
        if not courses:
            if sem.result:
                db.delete(sem.result)
            continue

        credits = [float(c.credit_unit) for c in courses]
        points = [float(c.grade_point) for c in courses]
        gpa = semester_gpa(credits, points)
        for c, p in zip(credits, points, strict=True):
            cumulative_credits += c
            cumulative_qp += c * p
        cgpa = round(cumulative_qp / cumulative_credits, 4) if cumulative_credits > 0 else 0.0

        if sem.result:
            sem.result.gpa = gpa
            sem.result.cgpa = cgpa
        else:
            db.add(SemesterResult(semester_id=sem.id, gpa=gpa, cgpa=cgpa))
    db.flush()


def refresh_all_grade_points_for_user(db: Session, user: User) -> None:
    """Re-derive stored grade_point from letter grades using the user's CGPA scale, then refresh results."""
    scale = float(user.cgpa_scale)
    courses = db.query(Course).join(Semester).filter(Semester.user_id == user.id).all()
    for c in courses:
        c.grade_point = grade_to_point(c.grade, scale)
    db.flush()
    recompute_all_results(db, user.id)


def ensure_semesters_for_duration(db: Session, user_id: int, years: int) -> None:
    """Create year×2 semester rows if missing (idempotent for register)."""
    existing = db.query(Semester).filter(Semester.user_id == user_id).count()
    if existing > 0:
        return
    pos = 0
    first = True
    for y in range(1, years + 1):
        for s in (1, 2):
            st = "active" if first else "upcoming"
            first = False
            db.add(
                Semester(
                    user_id=user_id,
                    year=y,
                    semester=s,
                    position=pos,
                    status=st,
                    label=f"Year {y} · Sem {s}",
                )
            )
            pos += 1
    db.flush()
