from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "StratAxis"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # Database Settings
    DATABASE_URL: str
    
    # Security Settings
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str = "your_refresh_secret"  # Added default or adjust as needed
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Other App Settings
    SECRET_KEY: str = "local_secret"
    DEBUG: str = "true"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
