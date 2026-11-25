import sqlite3
from contextlib import contextmanager
from pathlib import Path
from config import DATABASE_PATH, DEFAULT_LOAN_DAYS, DEFAULT_MAX_BOOKS, DEFAULT_FINE_RATE

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def transaction():
    conn = get_db()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def update_overdue_statuses():
    conn = get_db()
    conn.execute("UPDATE book_issues SET status = 'overdue' WHERE status = 'issued' AND due_date < date('now')")
    conn.commit()
    conn.close()

def init_db():
    conn = get_db()
    conn.execute("PRAGMA journal_mode = WAL")
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('admin','staff','student')),
        identifier TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        department TEXT DEFAULT 'General',
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        publisher TEXT,
        publication_year INTEGER,
        copies_total INTEGER NOT NULL DEFAULT 1,
        copies_available INTEGER NOT NULL DEFAULT 1,
        location_rack TEXT,
        cover_image TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS book_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'pending',
        remarks TEXT,
        processed_by INTEGER,
        processed_at DATETIME,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY(processed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS book_issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_code TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        request_id INTEGER,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        return_date DATE,
        status TEXT NOT NULL DEFAULT 'issued',
        issued_by INTEGER NOT NULL,
        received_by INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY(issued_by) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY(received_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS fines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'unpaid',
        fine_date DATE NOT NULL,
        paid_date DATETIME,
        received_by INTEGER,
        remarks TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(issue_id) REFERENCES book_issues(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(received_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Defaults
    defaults = [
        ("loan_duration_days", str(DEFAULT_LOAN_DAYS), "Default loan duration"),
        ("max_books_per_student", str(DEFAULT_MAX_BOOKS), "Maximum active loans"),
        ("daily_fine_rate", str(DEFAULT_FINE_RATE), "Fine per overdue day"),
    ]
    for key, value, desc in defaults:
        conn.execute(
            "INSERT OR IGNORE INTO system_settings(setting_key,setting_value,description) VALUES (?,?,?)",
            (key, value, desc)
        )

    categories = ["Computer Science", "Literature", "Mathematics", "Economics", "Science", "General"]
    for c in categories:
        conn.execute("INSERT OR IGNORE INTO categories(name) VALUES (?)", (c,))

    conn.commit()
    conn.close()

def get_setting(key, default=None):
    conn = get_db()
    row = conn.execute("SELECT setting_value FROM system_settings WHERE setting_key=?", (key,)).fetchone()
    conn.close()
    return row["setting_value"] if row else default
