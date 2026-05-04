from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Semester(Base):
    __tablename__ = "semesters"
    __table_args__ = (UniqueConstraint("user_id", "year", "semester", name="uq_user_year_semester"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 or 2
    position: Mapped[int] = mapped_column(Integer, nullable=False)  # 0-based order for display
    # upcoming = locked; active = current term; completed = finalized
    status: Mapped[str] = mapped_column(String(16), default="upcoming", nullable=False)
    label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="semesters")
    courses: Mapped[list["Course"]] = relationship("Course", back_populates="semester", cascade="all, delete-orphan")
    result: Mapped["SemesterResult | None"] = relationship(
        "SemesterResult", back_populates="semester", uselist=False, cascade="all, delete-orphan"
    )
