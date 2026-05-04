import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.models import Course, Semester, SemesterResult, User  # noqa: F401
from app.routes import academic, auth

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Do not block app startup if Postgres is unreachable (Railway healthcheck on /health still passes).
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        logger.exception(
            "Could not connect or create tables; check DATABASE_URL. "
            "Health and OpenAPI still run; authenticated routes will fail until the DB is available."
        )
    yield


app = FastAPI(title="CGPA Tracker API", version="1.0.0", lifespan=lifespan)

_extra_cors = [o.strip() for o in (settings.cors_origins or "").split(",") if o.strip()]
_cors_allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *_extra_cors,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins,
    # Next dev often uses another port (e.g. 3001).
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(academic.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
