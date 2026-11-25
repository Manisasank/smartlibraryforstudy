from flask import Blueprint, render_template, redirect, url_for, request, flash
from auth import roles_required
from db import get_db, update_overdue_statuses
from utils import csrf_token

staff = Blueprint("staff", __name__, url_prefix="/staff")

@staff.route("/")
@roles_required("staff", "admin")
def index():
    return redirect(url_for("staff.dashboard"))

@staff.route("/dashboard")
@roles_required("staff", "admin")
def dashboard():
    update_overdue_statuses()
    c = get_db()
    stats = {
        "active": c.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue')").fetchone()[0],
        "pending": c.execute("SELECT COUNT(*) FROM book_requests WHERE status='pending'").fetchone()[0],
        "overdue": c.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue') AND due_date<date('now')").fetchone()[0],
        "fines": c.execute("SELECT COALESCE(SUM(amount),0) FROM fines WHERE status='unpaid'").fetchone()[0]
    }
    c.close()
    return render_template("page.html", title="Staff Dashboard", heading="Circulation Desk",
                           body_html=render_template("_dashboard.html", stats=stats, role="staff"))

@staff.route("/books")
@roles_required("staff", "admin")
def books():
    return redirect(url_for("public.books"))

@staff.route("/book_details")
@roles_required("staff", "admin")
def book_details():
    return redirect(url_for("public.book_details", id=request.args.get("id")))

@staff.route("/issue_book", methods=["GET", "POST"])
@roles_required("staff", "admin")
def issue_book():
    from routes_admin import issue_book as admin_issue_book
    return admin_issue_book()

@staff.route("/return_book", methods=["GET", "POST"])
@roles_required("staff", "admin")
def return_book():
    from routes_admin import return_book as admin_return_book
    return admin_return_book()

@staff.route("/requests", methods=["GET", "POST"])
@roles_required("staff", "admin")
def requests():
    from routes_admin import requests as admin_requests
    return admin_requests()

@staff.route("/fines", methods=["GET", "POST"])
@roles_required("staff", "admin")
def fines():
    from routes_admin import fines as admin_fines
    return admin_fines()

@staff.route("/issued_books")
@roles_required("staff", "admin")
def issued_books():
    c = get_db()
    rows = c.execute("""SELECT bi.*,b.title,u.name user_name,u.identifier FROM book_issues bi JOIN books b ON b.id=bi.book_id JOIN users u ON u.id=bi.user_id ORDER BY bi.id DESC""").fetchall()
    c.close()
    return render_template("page.html", title="Issued Books", heading="Issued Books", body_html=render_template("_issues.html", rows=rows))

@staff.route("/student_history")
@roles_required("staff", "admin")
def student_history():
    c = get_db()
    rows = c.execute("""SELECT u.name,u.identifier,COUNT(bi.id) total_loans FROM users u LEFT JOIN book_issues bi ON bi.user_id=u.id WHERE u.role='student' GROUP BY u.id ORDER BY u.name""").fetchall()
    c.close()
    return render_template("page.html", title="Student History", heading="Student Borrowing History", body_html=render_template("_history.html", rows=rows))

@staff.route("/reports")
@roles_required("staff", "admin")
def reports():
    c = get_db()
    rows = [
        ("Books", c.execute("SELECT COUNT(*) FROM books").fetchone()[0]),
        ("Active loans", c.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue')").fetchone()[0]),
        ("Pending requests", c.execute("SELECT COUNT(*) FROM book_requests WHERE status='pending'").fetchone()[0])
    ]
    c.close()
    return render_template("page.html", title="Reports", heading="Staff Reports", rows=rows, headers=["Metric", "Value"])
