"""
Configuration for UNiverse Capital Flask backend.
Loads secrets from environment variables (see .env.example).
"""

import os
from dotenv import load_dotenv

# Load .env only in non-production environments
load_dotenv()


class BaseConfig:
    # ── Flask ─────────────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-please")
    DEBUG: bool = False
    TESTING: bool = False

    # ── MySQL ─────────────────────────────────────────────────────────────────
    MYSQL_HOST: str     = os.getenv("MYSQL_HOST", "127.0.0.1")
    MYSQL_PORT: int     = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER: str     = os.getenv("MYSQL_USER", "universe_user")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB: str       = os.getenv("MYSQL_DB", "universe_capital")
    MYSQL_POOL_NAME: str = "universe_pool"
    MYSQL_POOL_SIZE: int = int(os.getenv("MYSQL_POOL_SIZE", 5))
    MYSQL_POOL_RESET_SESSION: bool = True

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:4173"
    ).split(",")

    # ── Admin ─────────────────────────────────────────────────────────────────
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "change-this-admin-token")


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    MYSQL_POOL_SIZE = 3


class TestingConfig(BaseConfig):
    TESTING = True
    DEBUG = True
    MYSQL_DB = os.getenv("MYSQL_TEST_DB", "universe_capital_test")
    MYSQL_POOL_SIZE = 2


class ProductionConfig(BaseConfig):
    DEBUG = False
    MYSQL_POOL_SIZE = int(os.getenv("MYSQL_POOL_SIZE", 10))
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", "https://universecapital.in"
    ).split(",")


_CONFIG_MAP = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(env: str = "development"):
    return _CONFIG_MAP.get(env, DevelopmentConfig)