import re
import secrets
from datetime import date, datetime, timedelta
from flask import session, flash, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import DEFAULT_FINE_RATE, DEFAULT_LOAN_DAYS, RATELIMIT_STORAGE_URI
from db import get_db, get_setting

# Centralized rate limiter
def _get_client_identifier():
    # Support reverse proxy headers safely (X-Forwarded-For) if present
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address()

limiter = Limiter(
    key_func=_get_client_identifier,
    default_limits=["300 per day", "80 per hour"],
    storage_uri=RATELIMIT_STORAGE_URI
)

def csrf_token():
    token = session.get("_csrf")
    if not token:
        token = secrets.token_urlsafe(32)
        session["_csrf"] = token
    return token

def valid_csrf(token):
    return bool(token) and secrets.compare_digest(token, session.get("_csrf", ""))

def generate_code(prefix):
    return f"{prefix}-{datetime.now().strftime('%Y%m%d%H%M%S')}-{secrets.token_hex(2).upper()}"

def sanitize_text(text, max_len=255):
    """Sanitize and strip input, removing control characters and enforcing length bounds."""
    if text is None:
        return ""
    # Strip dangerous non-printable/control chars except newline and tab
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', str(text)).strip()
    return cleaned[:max_len]

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def is_valid_email(email):
    """Validate standard RFC email formatting."""
    if not email or len(email) > 254:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def calculate_fine(due_date, return_date=None):
    if isinstance(due_date, (datetime, date)):
        due = due_date if isinstance(due_date, date) and not isinstance(due_date, datetime) else due_date.date()
    else:
        due = datetime.strptime(str(due_date)[:10], "%Y-%m-%d").date()
    if return_date:
        if isinstance(return_date, (datetime, date)):
            ret = return_date if isinstance(return_date, date) and not isinstance(return_date, datetime) else return_date.date()
        else:
            ret = datetime.strptime(str(return_date)[:10], "%Y-%m-%d").date()
    else:
        ret = date.today()
    days = max(0, (ret - due).days)
    rate = float(get_setting("daily_fine_rate", DEFAULT_FINE_RATE))
    return days, round(days * rate, 2)

def active_loans_count(user_id):
    conn = get_db()
    n = conn.execute(
        "SELECT COUNT(*) FROM book_issues WHERE user_id=? AND status IN ('issued','overdue')",
        (user_id,)
    ).fetchone()[0]
    conn.close()
    return n
