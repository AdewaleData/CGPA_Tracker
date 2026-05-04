from __future__ import annotations

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    semester_id: Mapped[int] = mapped_column(ForeignKey("semesters.id", ondelete="CASCADE"), index=True)
    course_code: Mapped[str] = mapped_column(String(32), nullable=False)
    course_title: Mapped[str] = mapped_column(String(255), nullable=False)
    credit_unit: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    grade: Mapped[str] = mapped_column(String(4), nullable=False)
    grade_point: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)

    semester: Mapped["Semester"] = relationship("Semester", back_populates="courses")
