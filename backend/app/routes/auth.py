from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.database import get_db
from app.schemas.auth import LoginBody, MePatchBody, RegisterBody, TokenResponse, UserPublic
from app.services.auth_service import create_access_token, register_user, verify_password
from app.services.academic import refresh_all_grade_points_for_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterBody, db: Session = Depends(get_db)):
    try:
        user = register_user(db, body)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserPublic)
def patch_me(
    body: MePatchBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    changed_scale = False
    if body.name is not None:
        user.name = body.name.strip()
    if body.cgpa_scale is not None:
        new_s = float(body.cgpa_scale)
        if new_s != float(user.cgpa_scale):
            user.cgpa_scale = new_s
            changed_scale = True
    if changed_scale:
        refresh_all_grade_points_for_user(db, user)
    db.commit()
    db.refresh(user)
    return user
