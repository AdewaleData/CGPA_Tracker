from __future__ import annotations

from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SemesterResult(Base):
    __tablename__ = "semester_results"
    __table_args__ = (UniqueConstraint("semester_id", name="uq_result_semester"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    semester_id: Mapped[int] = mapped_column(ForeignKey("semesters.id", ondelete="CASCADE"), unique=True)
    gpa: Mapped[float] = mapped_column(Numeric(5, 3), nullable=False)
    cgpa: Mapped[float] = mapped_column(Numeric(5, 3), nullable=False)

    semester: Mapped["Semester"] = relationship("Semester", back_populates="result")
