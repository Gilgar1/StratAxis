from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "StratAxis"
    ENVIRONMENT: str = "development"
    # FastAPI runs on 8081 — Supabase Kong owns 8000
    PORT: int = 8081

    # Database Settings
    DATABASE_URL: str

    # Security Settings
    # This MUST equal the JWT_SECRET in infrastructure/supabase-docker/docker/.env
    # so JWTs issued by GoTrue can be verified locally by FastAPI without
    # making a network call to GoTrue on every request.
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str = "your_refresh_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Other App Settings
    SECRET_KEY: str = "local_secret"
    DEBUG: str = "true"

    # CORS — covers all local dev origins (Vite default + common alternatives)
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:8081",
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
