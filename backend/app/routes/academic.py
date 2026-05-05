from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.course import Course
from app.models.semester import Semester
from app.models.user import User
from app.services.academic import courses_for_semester, recompute_all_results
from app.services.grades import grade_to_point

router = APIRouter(tags=["academic"])


class CoursesSyncBody(BaseModel):
    semester_id: int
    courses: list[dict] = Field(default_factory=list)


def _semester_for_user(db: Session, semester_id: int, user: User) -> Semester | None:
    return db.query(Semester).filter(Semester.id == semester_id, Semester.user_id == user.id).first()


def _semester_credits_total(db: Session, semester_id: int) -> float:
    rows = db.query(Course).filter(Course.semester_id == semester_id).all()
    return float(sum(float(c.credit_unit) for c in rows))


@router.get("/semesters")
def list_semesters(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sems = (
        db.query(Semester)
        .filter(Semester.user_id == user.id)
        .order_by(Semester.position)
        .all()
    )
    out = []
    for s in sems:
        gpa = float(s.result.gpa) if s.result else None
        cgpa = float(s.result.cgpa) if s.result else None
        tc = _semester_credits_total(db, s.id)
        out.append(
            {
                "id": s.id,
                "year": s.year,
                "semester": s.semester,
                "position": s.position,
                "status": s.status,
                "label": s.label,
                "gpa": gpa,
                "cgpa": cgpa,
                "total_credits": tc,
            }
        )
    return out


@router.get("/semester/{semester_id}")
def get_semester(semester_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = _semester_for_user(db, semester_id, user)
    if not s:
        raise HTTPException(status_code=404, detail="Semester not found")
    courses = courses_for_semester(db, semester_id, user.id)
    gpa = float(s.result.gpa) if s.result else None
    cgpa = float(s.result.cgpa) if s.result else None
    return {
        "id": s.id,
        "year": s.year,
        "semester": s.semester,
        "position": s.position,
        "status": s.status,
        "label": s.label,
        "gpa": gpa,
        "cgpa": cgpa,
        "total_credits": _semester_credits_total(db, s.id),
        "courses": [
            {
                "id": c.id,
                "course_code": c.course_code,
                "course_title": c.course_title,
                "credit_unit": float(c.credit_unit),
                "grade": c.grade,
                "grade_point": float(c.grade_point),
            }
            for c in courses
        ],
    }


@router.post("/courses/sync")
def sync_courses(body: CoursesSyncBody, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = _semester_for_user(db, body.semester_id, user)
    if not s:
        raise HTTPException(status_code=404, detail="Semester not found")
    if s.status == "upcoming":
        raise HTTPException(
            status_code=400,
            detail="This term is still locked. Finish earlier terms before editing courses here.",
        )

    db.query(Course).filter(Course.semester_id == s.id).delete()
    for row in body.courses:
        code = str(row.get("course_code", "")).strip()
        title = str(row.get("course_title", "")).strip()
        credit = float(row.get("credit_unit", 0))
        grade = str(row.get("grade", "")).strip()
        if not code or credit <= 0:
            continue
        gp = grade_to_point(grade, float(user.cgpa_scale))
        db.add(
            Course(
                semester_id=s.id,
                course_code=code,
                course_title=title or code,
                credit_unit=credit,
                grade=grade.upper(),
                grade_point=gp,
            )
        )
    db.flush()
    recompute_all_results(db, user.id)
    db.commit()
    db.refresh(s)
    return get_semester(s.id, db, user)


@router.post("/semester/{semester_id}/complete")
def complete_semester(semester_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = _semester_for_user(db, semester_id, user)
    if not s:
        raise HTTPException(status_code=404, detail="Semester not found")
    if s.status != "active":
        raise HTTPException(status_code=400, detail="Semester is not active")
    if not s.courses:
        raise HTTPException(status_code=400, detail="Add at least one course before completing")

    s.status = "completed"
    s.completed_at = datetime.now(timezone.utc)

    nxt = (
        db.query(Semester)
        .filter(Semester.user_id == user.id, Semester.position == s.position + 1)
        .first()
    )
    if nxt and nxt.status == "upcoming":
        nxt.status = "active"

    db.commit()
    return {"ok": True}


@router.get("/transcript")
def transcript(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Full semester + course list for exports (e.g. PDF)."""
    sems = (
        db.query(Semester)
        .filter(Semester.user_id == user.id)
        .order_by(Semester.position)
        .all()
    )
    all_courses: list[tuple[Course, Semester]] = []
    for s in sems:
        for c in s.courses:
            all_courses.append((c, s))
    total_credits = sum(float(c.credit_unit) for c, _ in all_courses)
    total_qp = sum(float(c.credit_unit) * float(c.grade_point) for c, _ in all_courses)
    current_cgpa = round(total_qp / total_credits, 4) if total_credits > 0 else 0.0

    out_sems = []
    for s in sems:
        courses = courses_for_semester(db, s.id, user.id)
        gpa = float(s.result.gpa) if s.result else None
        cgpa = float(s.result.cgpa) if s.result else None
        out_sems.append(
            {
                "id": s.id,
                "year": s.year,
                "semester": s.semester,
                "position": s.position,
                "status": s.status,
                "label": s.label,
                "gpa": gpa,
                "cgpa": cgpa,
                "total_credits": _semester_credits_total(db, s.id),
                "courses": [
                    {
                        "course_code": c.course_code,
                        "course_title": c.course_title,
                        "credit_unit": float(c.credit_unit),
                        "grade": c.grade,
                        "grade_point": float(c.grade_point),
                    }
                    for c in courses
                ],
            }
        )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "name": user.name,
            "email": user.email,
            "course_duration": user.course_duration,
            "cgpa_scale": float(user.cgpa_scale),
        },
        "current_cgpa": current_cgpa,
        "total_credits": total_credits,
        "total_quality_points": round(total_qp, 4),
        "semesters": out_sems,
    }


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sems = (
        db.query(Semester)
        .filter(Semester.user_id == user.id)
        .order_by(Semester.position)
        .all()
    )
    active_id = next((x.id for x in sems if x.status == "active"), None)

    all_courses = []
    for s in sems:
        for c in s.courses:
            all_courses.append((s.position, c))

    total_credits = sum(float(c.credit_unit) for _, c in all_courses)
    total_qp = sum(float(c.credit_unit) * float(c.grade_point) for _, c in all_courses)
    current_cgpa = round(total_qp / total_credits, 4) if total_credits > 0 else 0.0

    gpa_by_semester: list[tuple[int, float]] = []
    for s in sems:
        if s.result:
            gpa_by_semester.append((s.position, float(s.result.gpa)))

    years = user.course_duration
    program_estimate = float(years * 34)
    scale = float(user.cgpa_scale)

    gpas = [float(s.result.gpa) for s in sems if s.result]
    average_semester_gpa = round(sum(gpas) / len(gpas), 4) if gpas else 0.0

    completed_with_res = [s for s in sems if s.status == "completed" and s.result]
    delta = None
    if completed_with_res:
        last_end = float(completed_with_res[-1].result.cgpa)
        delta = round(current_cgpa - last_end, 4)

    return {
        "current_cgpa": current_cgpa,
        "total_credits": total_credits,
        "total_quality_points": round(total_qp, 4),
        "program_total_credits_estimate": program_estimate,
        "cgpa_scale": scale,
        "active_semester_id": active_id,
        "gpa_by_semester": [{"position": p, "gpa": g} for p, g in gpa_by_semester],
        "cgpa_delta_vs_last_completed": delta,
        "average_semester_gpa": average_semester_gpa,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "course_duration": user.course_duration,
            "cgpa_scale": scale,
        },
    }
