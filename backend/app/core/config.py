from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ------------------------------------------------------------------ #
    #  Neon Serverless PostgreSQL                                          #
    #  IMPORTANT: Use the *-pooler* endpoint (PgBouncer) to avoid         #
    #  "Control plane request failed" errors caused by Neon's scale-to-   #
    #  zero cold starts on the direct endpoint.                            #
    # ------------------------------------------------------------------ #
    database_url: str = (
        "postgresql://postgres.gfxudbkekitkrhtbikvp:vyzentech123"
        "@aws-1-ap-south-1.pooler.supabase.com:6543"
        "/postgres?sslmode=require"
    )

    # JWT
    secret_key: str = "aarogyadesk-secret-key-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    # App
    debug: bool = False
    api_v1_prefix: str = "/api"

    # Redis cache
    cache_enabled: bool = True
    redis_url: str = "redis://localhost:6379/0"
    cache_default_ttl_seconds: int = 300

    class Config:
        env_file = ".env"


settings = Settings()
