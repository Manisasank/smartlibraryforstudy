from flask import Blueprint, render_template, redirect, url_for, request, flash
from datetime import date
from auth import roles_required, current_user
from db import get_db, get_setting, update_overdue_statuses
from utils import csrf_token, valid_csrf, active_loans_count, limiter

student = Blueprint("student", __name__, url_prefix="/student")

@student.route("/")
@roles_required("student", "admin", "staff")
def index():
    return redirect(url_for("student.dashboard"))

@student.route("/dashboard")
@roles_required("student", "admin", "staff")
def dashboard():
    update_overdue_statuses()
    u = current_user()
    c = get_db()
    today = date.today()
    borrows = c.execute("SELECT COUNT(*) FROM book_issues WHERE user_id=? AND status IN ('issued','overdue')", (u["id"],)).fetchone()[0]
    requests_cnt = c.execute("SELECT COUNT(*) FROM book_requests WHERE user_id=? AND status='pending'", (u["id"],)).fetchone()[0]
    fines_amt = c.execute("SELECT COALESCE(SUM(amount),0) FROM fines WHERE user_id=? AND status='unpaid'", (u["id"],)).fetchone()[0]
    history_cnt = c.execute("SELECT COUNT(*) FROM book_issues WHERE user_id=?", (u["id"],)).fetchone()[0]

    stats = {
        "borrows": borrows,
        "requests": requests_cnt,
        "fines": fines_amt,
        "history_count": history_cnt
    }
    raw_loans = c.execute("SELECT bi.*,b.title,b.author,b.isbn,b.location_rack FROM book_issues bi JOIN books b ON b.id=bi.book_id WHERE bi.user_id=? AND bi.status IN ('issued','overdue') ORDER BY bi.due_date", (u["id"],)).fetchall()
    loans = []
    for l in raw_loans:
        d_dict = dict(l)
        try:
            due_d = date.fromisoformat(l["due_date"])
            diff = (due_d - today).days
            d_dict["days_left"] = diff
        except Exception:
            d_dict["days_left"] = 0
        loans.append(d_dict)
    c.close()
    return render_template("page.html", title="Student Dashboard", heading="Student Library Portal",
                           subtitle="Overview of your active loans, requests, and library status.",
                           body_html=render_template("_student_dashboard.html", stats=stats, loans=loans, user=u))

@student.route("/receipt/<int:issue_id>")
@roles_required("student", "admin", "staff")
def receipt(issue_id):
    u = current_user()
    c = get_db()
    sql = """SELECT bi.*, b.title, b.author, b.isbn, b.location_rack, u.name user_name, u.identifier, u.department
             FROM book_issues bi
             JOIN books b ON b.id=bi.book_id
             JOIN users u ON u.id=bi.user_id
             WHERE bi.id=?"""
    if u["role"] == "student":
        sql += " AND bi.user_id = ?"
        record = c.execute(sql, (issue_id, u["id"])).fetchone()
    else:
        record = c.execute(sql, (issue_id,)).fetchone()
    c.close()
    if not record:
        flash("Borrowing pass or circulation record not found.", "danger")
        return redirect(url_for("student.my_books"))
    return render_template("page.html", title=f"Pass #{record['issue_code']}", heading="Borrowing Pass & Receipt",
                           subtitle=f"Official digital circulation record • Issue #{record['issue_code']}",
                           body_html=render_template("_receipt.html", r=record))

@student.route("/books")
@roles_required("student", "admin", "staff")
def books():
    return redirect(url_for("public.books"))

@student.route("/book_details")
@roles_required("student", "admin", "staff")
def book_details():
    return redirect(url_for("public.book_details", id=request.args.get("id")))

@student.route("/request_book", methods=["POST"])
@roles_required("student")
@limiter.limit("15 per minute")
def request_book():
    bid = request.form.get("id", type=int)
    if not valid_csrf(request.form.get("_csrf")):
        flash("Security token expired or invalid request. Please try again.", "danger")
        return redirect(url_for("public.book_details", id=bid) if bid else url_for("public.books"))

    u = current_user()
    c = get_db()
    book = c.execute("SELECT * FROM books WHERE id=?", (bid,)).fetchone()
    if not book:
        c.close()
        flash("Book not found.", "danger")
        return redirect(url_for("public.books"))
    if book["copies_available"] <= 0:
        c.close()
        flash("No copies are currently available to borrow.", "danger")
        return redirect(url_for("public.book_details", id=bid))
    if active_loans_count(u["id"]) >= int(get_setting("max_books_per_student", 3)):
        c.close()
        flash("Borrowing limit reached. Please return an existing book before requesting more.", "danger")
        return redirect(url_for("student.my_books"))
    if c.execute("SELECT id FROM book_issues WHERE user_id=? AND book_id=? AND status IN ('issued','overdue')", (u["id"], bid)).fetchone():
        c.close()
        flash("You currently have an active loan for this book.", "warning")
        return redirect(url_for("public.book_details", id=bid))
    if c.execute("SELECT id FROM book_requests WHERE user_id=? AND book_id=? AND status IN ('pending','approved')", (u["id"], bid)).fetchone():
        c.close()
        flash("You already have an active request for this book.", "info")
        return redirect(url_for("student.my_requests"))
    c.execute("INSERT INTO book_requests(user_id,book_id,status,remarks) VALUES(?,?,?,?)", (u["id"], bid, "pending", "Submitted via Student Portal"))
    c.commit()
    c.close()
    flash(f"Borrow request for '{book['title']}' submitted successfully!", "success")
    return redirect(url_for("student.my_requests"))

@student.route("/my_books")
@roles_required("student", "admin", "staff")
def my_books():
    update_overdue_statuses()
    u = current_user()
    c = get_db()
    rows = c.execute("SELECT bi.*,b.title,b.author,b.isbn,u.name user_name FROM book_issues bi JOIN books b ON b.id=bi.book_id JOIN users u ON u.id=bi.user_id WHERE bi.user_id=? ORDER BY bi.id DESC", (u["id"],)).fetchall()
    c.close()
    return render_template("page.html", title="My Books", heading="My Borrowed Books", subtitle="Your complete history of borrowed titles and current status.", body_html=render_template("_issues.html", rows=rows, student_view=True))

@student.route("/my_fines")
@roles_required("student", "admin", "staff")
def my_fines():
    u = current_user()
    c = get_db()
    rows = c.execute("SELECT f.*,b.title,bi.issue_code FROM fines f JOIN book_issues bi ON bi.id=f.issue_id JOIN books b ON b.id=bi.book_id WHERE f.user_id=? ORDER BY f.id DESC", (u["id"],)).fetchall()
    c.close()
    return render_template("page.html", title="My Fines", heading="My Fines", subtitle="Overdue penalties and payment records.", body_html=render_template("_fines.html", rows=rows, csrf=csrf_token(), student_view=True))

@student.route("/my_requests")
@student.route("/requests")
@roles_required("student", "admin", "staff")
def my_requests():
    u = current_user()
    c = get_db()
    rows = c.execute("SELECT br.*,b.title,b.isbn FROM book_requests br JOIN books b ON b.id=br.book_id WHERE br.user_id=? ORDER BY br.id DESC", (u["id"],)).fetchall()
    c.close()
    return render_template("page.html", title="My Requests", heading="My Book Requests", subtitle="Status of your pending and processed borrowing requests.", body_html=render_template("_student_requests.html", rows=rows, csrf=csrf_token()))

@student.route("/profile")
@roles_required("student", "admin", "staff")
def profile():
    return redirect(url_for("public.profile"))
