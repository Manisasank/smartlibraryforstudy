from flask import Blueprint, render_template, request, redirect, url_for, flash
from datetime import date, datetime, timedelta
from auth import roles_required, current_user, make_password
from db import get_db, get_setting, update_overdue_statuses
from utils import csrf_token, valid_csrf, generate_code, calculate_fine, sanitize_text, is_valid_email, limiter

admin = Blueprint("admin", __name__, url_prefix="/admin")

@admin.route("/")
@roles_required("admin")
def index():
    return redirect(url_for("admin.dashboard"))

@admin.route("/dashboard")
@roles_required("admin")
def dashboard():
    update_overdue_statuses()
    c = get_db()
    today = date.today().isoformat()
    stats = {
        "books": c.execute("SELECT COUNT(*) FROM books").fetchone()[0],
        "active": c.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue')").fetchone()[0],
        "overdue": c.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue') AND due_date<?", (today,)).fetchone()[0],
        "requests": c.execute("SELECT COUNT(*) FROM book_requests WHERE status='pending'").fetchone()[0],
        "students": c.execute("SELECT COUNT(*) FROM users WHERE role='student'").fetchone()[0],
        "fines": c.execute("SELECT COALESCE(SUM(amount),0) FROM fines WHERE status='unpaid'").fetchone()[0],
    }
    c.close()
    body = render_template("_dashboard.html", stats=stats, role="admin")
    return render_template("page.html", title="Admin Dashboard", heading="Administrative Dashboard", body_html=body)

@admin.route("/users", methods=["GET", "POST"])
@roles_required("admin")
def users():
    c = get_db()
    if request.method == "POST" and request.form.get("action") == "delete":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            target_id = request.form.get("id", type=int)
            if target_id == current_user()["id"]:
                flash("You cannot delete your own administrative account.", "danger")
            else:
                c.execute("DELETE FROM users WHERE id=? AND role!='admin'", (target_id,))
                c.commit()
                flash("User deleted.", "success")
        return redirect(url_for("admin.users"))

    search = sanitize_text(request.args.get("search", ""), 80)
    sql = "SELECT id,name,email,role,identifier,phone,status FROM users"
    params = []
    if search:
        sql += " WHERE name LIKE ? OR email LIKE ? OR identifier LIKE ?"
        params = [f"%{search}%"] * 3
    sql += " ORDER BY id DESC"
    rows = c.execute(sql, params).fetchall()
    c.close()
    body = render_template("_users.html", rows=rows, csrf=csrf_token())
    return render_template("page.html", title="Users", heading="User Management",
                           action_url=url_for("admin.add_user"), action_text="Add User", body_html=body)

@admin.route("/add_user", methods=["GET", "POST"])
@roles_required("admin")
def add_user():
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired. Please try again.", "danger")
        else:
            name = sanitize_text(request.form.get("name", ""), 80)
            email = sanitize_text(request.form.get("email", ""), 120).lower()
            password = request.form.get("password", "")
            role = request.form.get("role", "student")
            identifier = sanitize_text(request.form.get("identifier", ""), 40)
            phone = sanitize_text(request.form.get("phone", ""), 25)
            address = sanitize_text(request.form.get("address", ""), 200)
            department = sanitize_text(request.form.get("department", "General"), 80)
            status = request.form.get("status", "active")

            if role not in ("student", "staff", "admin"):
                role = "student"
            if status not in ("active", "suspended", "inactive"):
                status = "active"

            if not name or not is_valid_email(email):
                flash("A valid name and email address are required.", "danger")
            elif len(password) < 6:
                flash("Password must be at least 6 characters.", "danger")
            else:
                c = get_db()
                try:
                    if not identifier:
                        prefix = "ADM" if role == "admin" else ("STF" if role == "staff" else "STU")
                        identifier = generate_code(prefix)
                    c.execute("""INSERT INTO users(name,email,password,role,identifier,phone,address,department,status)
                                 VALUES(?,?,?,?,?,?,?,?,?)""",
                              (name, email, make_password(password), role, identifier, phone, address, department, status))
                    c.commit()
                    c.close()
                    flash("User added successfully.", "success")
                    return redirect(url_for("admin.users"))
                except Exception:
                    c.rollback()
                    c.close()
                    flash("Could not create user. Verify that email or identifier is not duplicated.", "danger")

    return render_template("form.html", title="Add User", heading="Add User", csrf=csrf_token(), fields=[
        {"name": "name", "label": "Name", "required": True},
        {"name": "email", "label": "Email", "type": "email", "required": True},
        {"name": "password", "label": "Password", "type": "password", "required": True},
        {"name": "role", "label": "Role", "type": "select", "options": [("student", "Student"), ("staff", "Staff"), ("admin", "Admin")]},
        {"name": "identifier", "label": "Identifier"},
        {"name": "phone", "label": "Phone"},
        {"name": "department", "label": "Department"},
        {"name": "address", "label": "Address", "type": "textarea"}
    ], submit="Create User", back_url=url_for("admin.users"))

@admin.route("/edit_user/<int:user_id>", methods=["GET", "POST"])
@roles_required("admin")
def edit_user(user_id):
    c = get_db()
    u = c.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not u:
        c.close()
        flash("User not found.", "danger")
        return redirect(url_for("admin.users"))

    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            name = sanitize_text(request.form.get("name", ""), 80)
            email = sanitize_text(request.form.get("email", ""), 120).lower()
            role = request.form.get("role", u["role"])
            status = request.form.get("status", u["status"])
            identifier = sanitize_text(request.form.get("identifier", ""), 40)
            phone = sanitize_text(request.form.get("phone", ""), 25)
            dept = sanitize_text(request.form.get("department", ""), 80)
            addr = sanitize_text(request.form.get("address", ""), 200)
            pwd = request.form.get("password", "")

            # Prevent self-demotion or self-suspension by logged in admin
            if user_id == current_user()["id"]:
                role = "admin"
                status = "active"

            if role not in ("student", "staff", "admin"):
                role = u["role"]
            if status not in ("active", "suspended", "inactive"):
                status = u["status"]

            if not name or not is_valid_email(email):
                flash("Valid name and email are required.", "danger")
            else:
                try:
                    if pwd:
                        if len(pwd) < 6:
                            flash("Password must be at least 6 characters.", "danger")
                            c.close()
                            return redirect(url_for("admin.edit_user", user_id=user_id))
                        c.execute("""UPDATE users SET name=?,email=?,role=?,identifier=?,phone=?,department=?,address=?,status=?,password=?,updated_at=CURRENT_TIMESTAMP WHERE id=?""",
                                  (name, email, role, identifier, phone, dept, addr, status, make_password(pwd), user_id))
                    else:
                        c.execute("""UPDATE users SET name=?,email=?,role=?,identifier=?,phone=?,department=?,address=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?""",
                                  (name, email, role, identifier, phone, dept, addr, status, user_id))
                    c.commit()
                    c.close()
                    flash("User updated successfully.", "success")
                    return redirect(url_for("admin.users"))
                except Exception:
                    c.rollback()
                    c.close()
                    flash("Could not update user. Check duplicate email or identifier.", "danger")
                    return redirect(url_for("admin.edit_user", user_id=user_id))
    c.close()
    return render_template("form.html", title="Edit User", heading="Edit User", csrf=csrf_token(), fields=[
        {"name": "name", "label": "Name", "value": u["name"], "required": True},
        {"name": "email", "label": "Email", "type": "email", "value": u["email"], "required": True},
        {"name": "password", "label": "New password (optional)", "type": "password"},
        {"name": "role", "label": "Role", "type": "select", "value": u["role"], "options": [("student", "Student"), ("staff", "Staff"), ("admin", "Admin")]},
        {"name": "identifier", "label": "Identifier", "value": u["identifier"]},
        {"name": "phone", "label": "Phone", "value": u["phone"]},
        {"name": "department", "label": "Department", "value": u["department"]},
        {"name": "status", "label": "Status", "type": "select", "value": u["status"], "options": [("active", "Active"), ("suspended", "Suspended"), ("inactive", "Inactive")]},
        {"name": "address", "label": "Address", "type": "textarea", "value": u["address"]}
    ], submit="Update User", back_url=url_for("admin.users"))

@admin.route("/delete_user/<int:user_id>", methods=["POST"])
@roles_required("admin")
def delete_user(user_id):
    if not valid_csrf(request.form.get("_csrf")):
        flash("Security token expired.", "danger")
    elif user_id == current_user()["id"]:
        flash("You cannot delete your own administrative account.", "danger")
    else:
        c = get_db()
        c.execute("DELETE FROM users WHERE id=? AND role!='admin'", (user_id,))
        c.commit()
        c.close()
        flash("User deleted.", "success")
    return redirect(url_for("admin.users"))

@admin.route("/books", methods=["GET", "POST"])
@roles_required("admin")
def books():
    c = get_db()
    if request.method == "POST" and request.form.get("action") == "delete":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            bid = request.form.get("id", type=int)
            try:
                c.execute("DELETE FROM books WHERE id=?", (bid,))
                c.commit()
                flash("Book deleted.", "success")
            except Exception:
                c.rollback()
                flash("Cannot delete a book that has active or historical circulation records.", "danger")
        c.close()
        return redirect(url_for("admin.books"))

    rows = c.execute("SELECT b.*,c.name category FROM books b JOIN categories c ON c.id=b.category_id ORDER BY b.id DESC").fetchall()
    c.close()
    return render_template("page.html", title="Books", heading="Manage Books", action_url=url_for("admin.add_book"),
                           action_text="Add Book", body_html=render_template("_admin_books.html", rows=rows, csrf=csrf_token()))

@admin.route("/add_book", methods=["GET", "POST"])
@roles_required("admin")
def add_book():
    c = get_db()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            isbn = sanitize_text(request.form.get("isbn", ""), 30)
            title = sanitize_text(request.form.get("title", ""), 150)
            author = sanitize_text(request.form.get("author", ""), 100)
            category_id = request.form.get("category_id", type=int) or 1
            publisher = sanitize_text(request.form.get("publisher", ""), 100)
            pub_year = request.form.get("publication_year", type=int)
            copies = max(1, min(1000, request.form.get("copies_total", type=int) or 1))
            rack = sanitize_text(request.form.get("location_rack", ""), 50)
            desc = sanitize_text(request.form.get("description", ""), 1000)

            if not isbn or not title or not author:
                flash("ISBN, Title, and Author are required fields.", "danger")
            else:
                try:
                    c.execute("""INSERT INTO books(isbn,title,author,category_id,publisher,publication_year,copies_total,copies_available,location_rack,description,status)
                                 VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                              (isbn, title, author, category_id, publisher, pub_year, copies, copies, rack, desc, "available"))
                    c.commit()
                    c.close()
                    flash("Book added successfully.", "success")
                    return redirect(url_for("admin.books"))
                except Exception:
                    c.rollback()
                    c.close()
                    flash("Could not add book. ISBN may already exist in the catalog.", "danger")
                    return redirect(url_for("admin.add_book"))

    cats = c.execute("SELECT id,name FROM categories ORDER BY name").fetchall()
    c.close()
    return render_template("form.html", title="Add Book", heading="Add Book", csrf=csrf_token(), fields=[
        {"name": "isbn", "label": "ISBN", "required": True},
        {"name": "title", "label": "Title", "required": True},
        {"name": "author", "label": "Author", "required": True},
        {"name": "category_id", "label": "Category", "type": "select", "options": [(str(x["id"]), x["name"]) for x in cats]},
        {"name": "publisher", "label": "Publisher"},
        {"name": "publication_year", "label": "Publication year", "type": "number"},
        {"name": "copies_total", "label": "Copies", "type": "number", "value": 1, "required": True},
        {"name": "location_rack", "label": "Rack"},
        {"name": "description", "label": "Description", "type": "textarea"}
    ], submit="Add Book", back_url=url_for("admin.books"))

@admin.route("/edit_book/<int:book_id>", methods=["GET", "POST"])
@roles_required("admin")
def edit_book(book_id):
    c = get_db()
    b = c.execute("SELECT * FROM books WHERE id=?", (book_id,)).fetchone()
    if not b:
        c.close()
        flash("Book not found.", "danger")
        return redirect(url_for("admin.books"))

    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            isbn = sanitize_text(request.form.get("isbn", ""), 30)
            title = sanitize_text(request.form.get("title", ""), 150)
            author = sanitize_text(request.form.get("author", ""), 100)
            cat_id = request.form.get("category_id", type=int) or b["category_id"]
            publisher = sanitize_text(request.form.get("publisher", ""), 100)
            pub_year = request.form.get("publication_year", type=int)
            total = max(1, min(1000, request.form.get("copies_total", type=int) or b["copies_total"]))
            borrowed = b["copies_total"] - b["copies_available"]
            available = max(0, total - borrowed)
            rack = sanitize_text(request.form.get("location_rack", ""), 50)
            desc = sanitize_text(request.form.get("description", ""), 1000)

            if not isbn or not title or not author:
                flash("ISBN, Title, and Author are required fields.", "danger")
            else:
                try:
                    c.execute("""UPDATE books SET isbn=?,title=?,author=?,category_id=?,publisher=?,publication_year=?,copies_total=?,copies_available=?,location_rack=?,description=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?""",
                              (isbn, title, author, cat_id, publisher, pub_year, total, available, rack, desc, "available" if available > 0 else "borrowed", book_id))
                    c.commit()
                    c.close()
                    flash("Book updated successfully.", "success")
                    return redirect(url_for("admin.books"))
                except Exception:
                    c.rollback()
                    c.close()
                    flash("Could not update book. Verify ISBN uniqueness.", "danger")
                    return redirect(url_for("admin.edit_book", book_id=book_id))

    cats = c.execute("SELECT id,name FROM categories ORDER BY name").fetchall()
    c.close()
    return render_template("form.html", title="Edit Book", heading="Edit Book", csrf=csrf_token(), fields=[
        {"name": "isbn", "label": "ISBN", "value": b["isbn"], "required": True},
        {"name": "title", "label": "Title", "value": b["title"], "required": True},
        {"name": "author", "label": "Author", "value": b["author"], "required": True},
        {"name": "category_id", "label": "Category", "type": "select", "value": b["category_id"], "options": [(str(x["id"]), x["name"]) for x in cats]},
        {"name": "publisher", "label": "Publisher", "value": b["publisher"]},
        {"name": "publication_year", "label": "Publication year", "type": "number", "value": b["publication_year"]},
        {"name": "copies_total", "label": "Copies", "type": "number", "value": b["copies_total"], "required": True},
        {"name": "location_rack", "label": "Rack", "value": b["location_rack"]},
        {"name": "description", "label": "Description", "type": "textarea", "value": b["description"]}
    ], submit="Update Book", back_url=url_for("admin.books"))

@admin.route("/delete_book/<int:book_id>", methods=["POST"])
@roles_required("admin")
def delete_book(book_id):
    if not valid_csrf(request.form.get("_csrf")):
        flash("Security token expired.", "danger")
    else:
        c = get_db()
        try:
            c.execute("DELETE FROM books WHERE id=?", (book_id,))
            c.commit()
            flash("Book deleted.", "success")
        except Exception:
            c.rollback()
            flash("Cannot delete a book that has circulation history.", "danger")
        c.close()
    return redirect(url_for("admin.books"))

@admin.route("/requests", methods=["GET", "POST"])
@roles_required("admin", "staff")
def requests():
    update_overdue_statuses()
    c = get_db()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            rid = request.form.get("request_id", type=int)
            action = request.form.get("action")
            req = c.execute("SELECT * FROM book_requests WHERE id=?", (rid,)).fetchone()
            if req and req["status"] == "pending":
                if action == "approve":
                    book = c.execute("SELECT * FROM books WHERE id=?", (req["book_id"],)).fetchone()
                    if book and book["copies_available"] > 0:
                        issue_date = date.today()
                        due = issue_date + timedelta(days=int(get_setting("loan_duration_days", 14)))
                        c.execute("UPDATE book_requests SET status='approved',processed_by=?,processed_at=CURRENT_TIMESTAMP WHERE id=?", (current_user()["id"], rid))
                        c.execute("INSERT INTO book_issues(issue_code,user_id,book_id,request_id,issue_date,due_date,status,issued_by,notes) VALUES(?,?,?,?,?,?,?,?,?)",
                                  (generate_code("ISS"), req["user_id"], req["book_id"], rid, issue_date.isoformat(), due.isoformat(), "issued", current_user()["id"], "Issued via request approval"))
                        c.execute("UPDATE books SET copies_available=copies_available-1 WHERE id=?", (req["book_id"],))
                        flash("Request approved and book issued successfully.", "success")
                    else:
                        flash("No available copies to approve request.", "danger")
                elif action == "reject":
                    rem = sanitize_text(request.form.get("remarks", "Rejected by staff"), 200)
                    c.execute("UPDATE book_requests SET status='rejected',remarks=?,processed_by=?,processed_at=CURRENT_TIMESTAMP WHERE id=?", (rem, current_user()["id"], rid))
                    flash("Request rejected.", "info")
                c.commit()
    rows = c.execute("""SELECT br.*,b.title,u.name user_name,u.email FROM book_requests br JOIN books b ON b.id=br.book_id JOIN users u ON u.id=br.user_id ORDER BY br.id DESC""").fetchall()
    c.close()
    return render_template("page.html", title="Requests", heading="Book Requests", subtitle="Review and process student borrowing requests.", body_html=render_template("_requests.html", rows=rows, csrf=csrf_token(), prefix="admin"))

@admin.route("/issue_book", methods=["GET", "POST"])
@roles_required("admin", "staff")
def issue_book():
    update_overdue_statuses()
    c = get_db()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            sid = request.form.get("student_id", type=int)
            bid = request.form.get("book_id", type=int)
            issue_str = request.form.get("issue_date", "").strip()
            issue = date.fromisoformat(issue_str) if issue_str else date.today()
            due_str = request.form.get("due_date", "").strip()
            due = date.fromisoformat(due_str) if due_str else (issue + timedelta(days=int(get_setting("loan_duration_days", 14))))
            notes = sanitize_text(request.form.get("notes", ""), 200)

            student = c.execute("SELECT id FROM users WHERE id=? AND role='student' AND status='active'", (sid,)).fetchone()
            book = c.execute("SELECT * FROM books WHERE id=?", (bid,)).fetchone()
            loans = c.execute("SELECT COUNT(*) FROM book_issues WHERE user_id=? AND status IN ('issued','overdue')", (sid,)).fetchone()[0]
            duplicate = c.execute("SELECT id FROM book_issues WHERE user_id=? AND book_id=? AND status IN ('issued','overdue')", (sid, bid)).fetchone()

            if not student or not book or book["copies_available"] <= 0 or loans >= int(get_setting("max_books_per_student", 3)) or duplicate:
                flash("Unable to issue: verify student active status, book availability, borrowing limit, or duplicate active loan.", "danger")
            else:
                c.execute("INSERT INTO book_issues(issue_code,user_id,book_id,issue_date,due_date,status,issued_by,notes) VALUES(?,?,?,?,?,?,?,?)",
                          (generate_code("ISS"), sid, bid, issue.isoformat(), due.isoformat(), "issued", current_user()["id"], notes))
                c.execute("UPDATE books SET copies_available=copies_available-1 WHERE id=?", (bid,))
                c.commit()
                flash("Book issued successfully.", "success")
                c.close()
                redir = "staff.issue_book" if current_user()["role"] == "staff" else "admin.issue_book"
                return redirect(url_for(redir))

    students = c.execute("SELECT id,identifier,name FROM users WHERE role='student' AND status='active' ORDER BY name").fetchall()
    books = c.execute("SELECT id,isbn,title,copies_available FROM books WHERE copies_available>0 ORDER BY title").fetchall()
    c.close()
    redir = "staff.dashboard" if current_user()["role"] == "staff" else "admin.dashboard"
    return render_template("form.html", title="Issue Book", heading="Issue Book", csrf=csrf_token(), fields=[
        {"name": "student_id", "label": "Student", "type": "select", "options": [(str(x["id"]), f'{x["name"]} ({x["identifier"] or "STU"})') for x in students]},
        {"name": "book_id", "label": "Book", "type": "select", "options": [(str(x["id"]), f'{x["title"]} — ISBN: {x["isbn"]} ({x["copies_available"]} avail)') for x in books]},
        {"name": "issue_date", "label": "Issue date", "type": "date", "value": date.today().isoformat()},
        {"name": "due_date", "label": "Due date", "type": "date", "value": (date.today() + timedelta(days=int(get_setting("loan_duration_days", 14)))).isoformat()},
        {"name": "notes", "label": "Notes", "type": "textarea"}
    ], submit="Issue Book", back_url=url_for(redir))

@admin.route("/return_book", methods=["GET", "POST"])
@roles_required("admin", "staff")
def return_book():
    update_overdue_statuses()
    c = get_db()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            iid = request.form.get("issue_id", type=int)
            ret_str = request.form.get("return_date", "").strip()
            ret = ret_str if ret_str else date.today().isoformat()
            notes = sanitize_text(request.form.get("notes", ""), 200)

            issue = c.execute("SELECT * FROM book_issues WHERE id=? AND status IN ('issued','overdue')", (iid,)).fetchone()
            if issue:
                days, amount = calculate_fine(issue["due_date"], ret)
                c.execute("UPDATE book_issues SET return_date=?,status='returned',received_by=?,notes=? WHERE id=?", (ret, current_user()["id"], notes, iid))
                c.execute("UPDATE books SET copies_available=min(copies_total, copies_available+1) WHERE id=?", (issue["book_id"],))
                if days > 0:
                    status = "paid" if request.form.get("payment_status") == "paid" else "unpaid"
                    c.execute("INSERT OR REPLACE INTO fines(issue_id,user_id,amount,status,fine_date,paid_date,received_by) VALUES(?,?,?,?,?,?,?)",
                              (iid, issue["user_id"], amount, status, ret, datetime.now().isoformat() if status == "paid" else None, current_user()["id"]))
                    flash(f"Book returned. {days} day(s) overdue fine: ₹{amount:.2f} ({status}).", "warning" if status == "unpaid" else "success")
                else:
                    flash("Book returned on time. No fines applied.", "success")
                c.commit()
            else:
                flash("Active issue record not found.", "danger")
            c.close()
            redir = "staff.return_book" if current_user()["role"] == "staff" else "admin.return_book"
            return redirect(url_for(redir))

    rate = get_setting("daily_fine_rate", 2.0)
    rows = c.execute("""SELECT bi.id,bi.issue_code,bi.due_date,b.title,u.name user_name FROM book_issues bi JOIN books b ON b.id=bi.book_id JOIN users u ON u.id=bi.user_id WHERE bi.status IN ('issued','overdue') ORDER BY bi.due_date""").fetchall()
    c.close()
    redir = "staff.dashboard" if current_user()["role"] == "staff" else "admin.dashboard"
    return render_template("form.html", title="Return Book", heading="Return Book", csrf=csrf_token(), fields=[
        {"name": "issue_id", "label": "Issued book", "type": "select", "options": [(str(x["id"]), f'{x["title"]} — {x["user_name"]} (Due: {x["due_date"]})', {"data-duedate": str(x["due_date"]), "data-finerate": str(rate)}) for x in rows]},
        {"name": "return_date", "label": "Return date", "type": "date", "value": date.today().isoformat()},
        {"name": "payment_status", "label": "Fine payment status (if applicable)", "type": "select", "options": [("unpaid", "Unpaid"), ("paid", "Paid")]},
        {"name": "notes", "label": "Notes", "type": "textarea"}
    ], submit="Process Return", back_url=url_for(redir), is_return_form=True)

@admin.route("/fines", methods=["GET", "POST"])
@roles_required("admin", "staff")
def fines():
    c = get_db()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            fid = request.form.get("fine_id", type=int)
            action = request.form.get("action")
            if action == "paid":
                c.execute("UPDATE fines SET status='paid',paid_date=CURRENT_TIMESTAMP,received_by=? WHERE id=?", (current_user()["id"], fid))
            elif action == "waived":
                c.execute("UPDATE fines SET status='waived',received_by=? WHERE id=?", (current_user()["id"], fid))
            c.commit()
    rows = c.execute("""SELECT f.*,u.name user_name,bi.issue_code,b.title FROM fines f JOIN users u ON u.id=f.user_id JOIN book_issues bi ON bi.id=f.issue_id JOIN books b ON b.id=bi.book_id ORDER BY f.id DESC""").fetchall()
    c.close()
    return render_template("page.html", title="Fines", heading="Fine Management", body_html=render_template("_fines.html", rows=rows, csrf=csrf_token()))

@admin.route("/issued_books")
@roles_required("admin")
def issued_books():
    c = get_db()
    rows = c.execute("""SELECT bi.*,b.title,u.name user_name,u.identifier FROM book_issues bi JOIN books b ON b.id=bi.book_id JOIN users u ON u.id=bi.user_id ORDER BY bi.id DESC""").fetchall()
    c.close()
    return render_template("page.html", title="Issued Books", heading="Issued Books", body_html=render_template("_issues.html", rows=rows))

@admin.route("/issues")
@roles_required("admin")
def issues():
    return issued_books()

@admin.route("/reports")
@roles_required("admin")
def reports():
    c = get_db()
    rows = [
        ("Total books", c.execute("SELECT COUNT(*) FROM books").fetchone()[0]),
        ("Students", c.execute("SELECT COUNT(*) FROM users WHERE role='student'").fetchone()[0]),
        ("Active loans", c.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue')").fetchone()[0]),
        ("Unpaid fines", c.execute("SELECT COALESCE(SUM(amount),0) FROM fines WHERE status='unpaid'").fetchone()[0])
    ]
    c.close()
    return render_template("page.html", title="Reports", heading="Reports", rows=rows, headers=["Metric", "Value"])

@admin.route("/transactions")
@roles_required("admin")
def transactions():
    return reports()

@admin.route("/settings", methods=["GET", "POST"])
@roles_required("admin")
def settings():
    c = get_db()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired.", "danger")
        else:
            try:
                days = max(1, min(365, int(request.form.get("loan_duration_days", 14))))
                max_b = max(1, min(20, int(request.form.get("max_books_per_student", 3))))
                fine = max(0.0, min(1000.0, float(request.form.get("daily_fine_rate", 2.0))))

                c.execute("INSERT OR REPLACE INTO system_settings(setting_key,setting_value) VALUES(?,?)", ("loan_duration_days", str(days)))
                c.execute("INSERT OR REPLACE INTO system_settings(setting_key,setting_value) VALUES(?,?)", ("max_books_per_student", str(max_b)))
                c.execute("INSERT OR REPLACE INTO system_settings(setting_key,setting_value) VALUES(?,?)", ("daily_fine_rate", str(fine)))
                c.commit()
                flash("Settings updated successfully.", "success")
            except ValueError:
                flash("Invalid numeric value entered for settings.", "danger")

    rows = c.execute("SELECT setting_key,setting_value FROM system_settings").fetchall()
    c.close()
    return render_template("form.html", title="Settings", heading="Library Settings", csrf=csrf_token(), fields=[
        {"name": "loan_duration_days", "label": "Loan duration (days)", "type": "number", "value": next((x["setting_value"] for x in rows if x["setting_key"] == "loan_duration_days"), "14")},
        {"name": "max_books_per_student", "label": "Maximum books per student", "type": "number", "value": next((x["setting_value"] for x in rows if x["setting_key"] == "max_books_per_student"), "3")},
        {"name": "daily_fine_rate", "label": "Daily fine rate (₹/day)", "type": "number", "value": next((x["setting_value"] for x in rows if x["setting_key"] == "daily_fine_rate"), "2")}
    ], submit="Save Settings")
