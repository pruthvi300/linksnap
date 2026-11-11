from dotenv import load_dotenv
import os

load_dotenv()
class Settings:
    PROJECT_NAME: str = "SaaS URL Shortener"
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "password")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_DB: str = os.getenv("MYSQL_DB", "url_shortener")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24  # 1 day

settings = Settings()
