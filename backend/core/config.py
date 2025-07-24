from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PGHOST: str
    PGDATABASE: str
    PGUSER: str
    PGPASSWORD: str
    PGSSLMODE: str
    PGCHANNELBINDING: str

    # JWT configuration
    JWT_SECRET_KEY: str
    JWT_ACCOUNT_CONFIRMATION: str 
    JWT_EXPIRATION_PERIOD: str = "1h"
    JWT_ACCOUNT_CONFIRMATION_EXPIRATION: str = "1h"
    JWT_PASSWORD_RESET_EXPIRATION: str = "30m"

    # MinIO S3 configuration
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str
    MINIO_REGION: str
    MINIO_SECURE: bool = False

    # MailerSend Email settings
    BREVO_API_KEY: str
    BREVO_SENDER_EMAIL: str = "noreply@yourdomain.com" # Update this to your verified Brevo sender email

    # Settings for the application
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Admin default password
    ADMIN_DEFAULT_PASSWORD: str = "admin123"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
