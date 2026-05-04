from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    course_code: str = Field(min_length=1, max_length=32)
    course_title: str = Field(min_length=1, max_length=255)
    credit_unit: float = Field(gt=0, le=64)
    grade: str = Field(min_length=1, max_length=4)


class CourseOut(BaseModel):
    id: int
    course_code: str
    course_title: str
    credit_unit: float
    grade: str
    grade_point: float

    model_config = {"from_attributes": True}


class SemesterOut(BaseModel):
    id: int
    year: int
    semester: int
    position: int
    status: str
    label: str | None
    gpa: float | None = None
    cgpa: float | None = None
    total_credits: float = 0.0

    model_config = {"from_attributes": True}


class SemesterDetailOut(SemesterOut):
    courses: list[CourseOut] = []


class DashboardOut(BaseModel):
    current_cgpa: float
    total_credits: float
    total_quality_points: float
    program_total_credits_estimate: float
    active_semester_id: int | None
    gpa_by_semester: list[tuple[int, float]]  # position, gpa
    user: dict
