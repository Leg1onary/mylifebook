from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "MyLifeBook"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str  # asyncpg DSN: postgresql+asyncpg://user:pass@host/db

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS — comma-separated origins
    cors_origins: str = "https://mylifebook.ru,https://www.mylifebook.ru"

    # OpenRouter AI
    openrouter_api_key: str = ""
    openrouter_model: str = "anthropic/claude-3.5-haiku"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
