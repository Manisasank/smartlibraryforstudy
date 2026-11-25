from functools import wraps
from flask import session, redirect, url_for, flash, request
from werkzeug.security import check_password_hash, generate_password_hash
from db import get_db

def current_user():
    uid = session.get("user_id")
    if not uid:
        return None
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id=? AND status='active'", (uid,)).fetchone()
    conn.close()
    return user

def login_user(user):
    session.clear()
    session.permanent = True
    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session["user_name"] = user["name"]

def logout_user():
    session.clear()

def verify_password(raw, stored):
    if not raw or not stored:
        return False
    # Handles bcrypt hashes copied from legacy databases ($2y$) as well as Werkzeug scrypt/pbkdf2 hashes.
    if stored.startswith("$2y$"):
        stored = "$2b$" + stored[4:]
    try:
        return check_password_hash(stored, raw)
    except Exception:
        return False

def make_password(raw):
    # Generates secure scrypt hash via Werkzeug
    return generate_password_hash(raw)

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not current_user():
            flash("Please sign in to access that page.", "warning")
            target = request.full_path if request.query_string else request.path
            return redirect(url_for("public.login", next=target))
        return view(*args, **kwargs)
    return wrapped

def roles_required(*roles):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            user = current_user()
            if not user:
                flash("Please sign in to access that area.", "warning")
                return redirect(url_for("public.login", next=request.path))
            if user["role"] not in roles:
                flash("You do not have permission to access that area.", "danger")
                return redirect(url_for("public.index"))
            return view(*args, **kwargs)
        return wrapped
    return decorator
