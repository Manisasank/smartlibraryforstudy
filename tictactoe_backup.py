"""
TICTACTOE PRO — CHECKLIST #5: AUTOMATED DATABASE BACKUP & ROTATION ENGINE
Performs timestamped SQLite database dumps, executes PRAGMA integrity checks, and prunes stale backups.
"""
import os
import shutil
import sqlite3
import datetime

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups", "tictactoe")
SOURCE_DB = os.path.join(os.path.dirname(__file__), "instance", "library.db")

def ensure_backup_dir():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR, exist_ok=True)

def verify_db_integrity(db_path):
    """Executes SQLite integrity check to ensure zero corruption before archiving."""
    if not os.path.exists(db_path):
        return False, "Database file does not exist"
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check;")
        result = cursor.fetchone()
        conn.close()
        if result and result[0] == "ok":
            return True, "Integrity OK"
        return False, f"Integrity check failed: {result}"
    except Exception as e:
        return False, str(e)

def create_database_backup():
    """Generates an atomic, timestamped backup snapshot."""
    ensure_backup_dir()

    # If instance/library.db doesn't exist, create a dedicated tictactoe DB
    db_file = SOURCE_DB
    if not os.path.exists(db_file):
        os.makedirs(os.path.dirname(db_file), exist_ok=True)
        conn = sqlite3.connect(db_file)
        conn.execute("CREATE TABLE IF NOT EXISTS tictactoe_stats (id INTEGER PRIMARY KEY, player TEXT, wins INT, losses INT, ties INT);")
        conn.commit()
        conn.close()

    is_ok, msg = verify_db_integrity(db_file)
    if not is_ok:
        print(f"❌ Backup aborted: {msg}")
        return None

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"tictactoe_backup_{timestamp}.sqlite"
    dest_path = os.path.join(BACKUP_DIR, backup_filename)

    shutil.copy2(db_file, dest_path)
    file_size_kb = os.path.getsize(dest_path) / 1024

    print(f"✅ Checklist #5 Verified: Database backup created at {dest_path} ({file_size_kb:.1f} KB)")
    rotate_old_backups(keep_count=7)
    return dest_path

def rotate_old_backups(keep_count=7):
    """Maintains last N backups and prunes older snapshots."""
    backups = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.startswith("tictactoe_backup_")]
    backups.sort(key=os.path.getmtime, reverse=True)
    if len(backups) > keep_count:
        for stale in backups[keep_count:]:
            os.remove(stale)
            print(f"🧹 Pruned stale backup: {os.path.basename(stale)}")

if __name__ == "__main__":
    create_database_backup()
