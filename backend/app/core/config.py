from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://neondb_owner:npg_pQzFUc2SfT6n@ep-purple-mountain-anj8lnhd.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

    # JWT
    secret_key: str = "aarogyadesk-secret-key-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    # App
    debug: bool = False
    api_v1_prefix: str = "/api"

    class Config:
        env_file = ".env"


settings = Settings()
