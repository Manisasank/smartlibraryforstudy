import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(exist_ok=True)

# Cryptographic Secret Key with secure dynamic fallback
_env_secret = os.getenv("SMARTLIB_SECRET_KEY")
if not _env_secret or _env_secret.strip() in ("change-this-secret-key-in-production", "replace-with-a-long-random-secret"):
    SECRET_KEY = secrets.token_hex(32)
else:
    SECRET_KEY = _env_secret.strip()

DATABASE_PATH = os.getenv("SMARTLIB_DB_PATH", str(INSTANCE_DIR / "smart_library.sqlite"))

DEFAULT_LOAN_DAYS = int(os.getenv("SMARTLIB_LOAN_DAYS", "14"))
DEFAULT_MAX_BOOKS = int(os.getenv("SMARTLIB_MAX_BOOKS", "3"))
DEFAULT_FINE_RATE = float(os.getenv("SMARTLIB_FINE_RATE", "2.0"))

APP_NAME = "Smart Library Management System"

# Security Configurations
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")
SESSION_COOKIE_SECURE = os.getenv("FLASK_COOKIE_SECURE", "False").lower() in ("true", "1", "yes")

# CORS Allowed Origins
_allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://127.0.0.1:5000")
ALLOWED_ORIGINS = [orig.strip() for orig in _allowed_origins_raw.split(",") if orig.strip()]

RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
