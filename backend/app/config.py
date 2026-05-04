from urllib.parse import quote_plus

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # If set (non-empty), used as-is. Otherwise built from POSTGRES_* below.
    database_url_override: str | None = Field(default=None, validation_alias="DATABASE_URL")

    postgres_user: str = Field(default="postgres", validation_alias="POSTGRES_USER")
    postgres_password: str | None = Field(default=None, validation_alias="POSTGRES_PASSWORD")
    postgres_host: str = Field(default="127.0.0.1", validation_alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, validation_alias="POSTGRES_PORT")
    postgres_db: str = Field(default="cgpa_tracker", validation_alias="POSTGRES_DB")

    jwt_secret: str = "change-me-in-production-use-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        override = (self.database_url_override or "").strip()
        if override:
            return override
        if self.postgres_password:
            u = quote_plus(self.postgres_user)
            p = quote_plus(self.postgres_password)
            return f"postgresql://{u}:{p}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        return "postgresql://postgres:postgres@localhost:5432/cgpa_tracker"


settings = Settings()
