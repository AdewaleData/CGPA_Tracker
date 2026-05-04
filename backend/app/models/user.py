from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    course_duration: Mapped[int] = mapped_column(Integer, nullable=False)  # 4, 5, or 6 years
    cgpa_scale: Mapped[float] = mapped_column(Float, nullable=False, default=4.0, server_default="4")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    semesters: Mapped[list["Semester"]] = relationship(
        "Semester", back_populates="user", cascade="all, delete-orphan", order_by="Semester.position"
    )
