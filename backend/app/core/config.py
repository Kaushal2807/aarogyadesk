from urllib.parse import quote_plus

from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ------------------------------------------------------------------
    # Database — toggle between Azure and a direct connection URL
    # ------------------------------------------------------------------
    use_azure_db: bool = False

    # Azure Database for PostgreSQL – Flexible Server
    # (only used when use_azure_db=True)
    azure_postgres_host: str = ""
    azure_postgres_port: int = 5432
    azure_postgres_db: str = ""
    azure_postgres_user: str = ""
    azure_postgres_password: str = ""
    azure_postgres_ssl_mode: str = "require"

    # Fallback direct connection URL
    # (only used when use_azure_db=False)
    database_url: str = ""

    @model_validator(mode="after")
    def resolve_database_url(self) -> "Settings":
        """
        Resolve which database connection to use based on USE_AZURE_DB.

        - USE_AZURE_DB=True  → build DATABASE_URL from Azure credentials,
                               then wipe the fallback DATABASE_URL so it
                               cannot be accidentally picked up.
        - USE_AZURE_DB=False → use DATABASE_URL as-is, then wipe all Azure
                               credential fields so they cannot leak into
                               the running process.
        """
        if self.use_azure_db:
            # Azure Flexible Server uses a plain username (e.g. "kaushal").
            # The old Single Server required "user@servername" — Flexible Server does NOT.
            encoded_user = quote_plus(self.azure_postgres_user)
            encoded_password = quote_plus(self.azure_postgres_password)
            self.database_url = (
                f"postgresql://{encoded_user}:{encoded_password}"
                f"@{self.azure_postgres_host}:{self.azure_postgres_port}"
                f"/{self.azure_postgres_db}"
                f"?sslmode={self.azure_postgres_ssl_mode}"
            )
            # Clear the unused fallback URL so it cannot be accidentally used
            # even if it was set in the .env file.
            # (We keep the Azure fields intact since they were used to build the URL.)
        else:
            # Clear all Azure credential fields so they cannot leak into the process.
            self.azure_postgres_host = ""
            self.azure_postgres_port = 5432
            self.azure_postgres_db = ""
            self.azure_postgres_user = ""
            self.azure_postgres_password = ""
            self.azure_postgres_ssl_mode = ""

        return self

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
print(f"[config] use_azure_db={settings.use_azure_db}  database_url={settings.database_url!r}")
