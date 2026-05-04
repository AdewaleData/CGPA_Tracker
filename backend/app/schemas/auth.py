from pydantic import BaseModel, EmailStr, Field, field_validator


def _coerce_cgpa_scale(v: float) -> float:
    if abs(v - 5.0) < 0.01:
        return 5.0
    if abs(v - 4.0) < 0.01:
        return 4.0
    raise ValueError("cgpa_scale must be 4.0 or 5.0")


class RegisterBody(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    course_duration: int = Field(ge=4, le=6)
    cgpa_scale: float = Field(default=4.0, description="Maximum CGPA (4.0 or 5.0 scale)")

    @field_validator("cgpa_scale")
    @classmethod
    def validate_cgpa_scale(cls, v: float) -> float:
        return _coerce_cgpa_scale(v)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: int
    name: str
    email: str
    course_duration: int
    cgpa_scale: float

    model_config = {"from_attributes": True}


class MePatchBody(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    cgpa_scale: float | None = Field(default=None, description="4.0 or 5.0")

    @field_validator("cgpa_scale")
    @classmethod
    def validate_cgpa_scale(cls, v: float | None) -> float | None:
        if v is None:
            return None
        return _coerce_cgpa_scale(v)
