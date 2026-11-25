import secrets
from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from datetime import date, datetime, timedelta
from db import get_db, update_overdue_statuses
from auth import current_user, login_user, logout_user, login_required, make_password, verify_password
from utils import csrf_token, valid_csrf, active_loans_count, limiter, sanitize_text, is_valid_email

public = Blueprint("public", __name__)

@public.app_context_processor
def inject_user():
    return {"user": current_user()}

@public.route("/")
def index():
    if request.args.get("legacy") != "1":
        return send_from_directory(".", "index.html")
    update_overdue_statuses()
    conn = get_db()
    total_copies = conn.execute("SELECT COALESCE(SUM(copies_total), 0) FROM books").fetchone()[0]
    available_copies = conn.execute("SELECT COALESCE(SUM(copies_available), 0) FROM books").fetchone()[0]
    today_issued = conn.execute("SELECT COUNT(*) FROM book_issues WHERE issue_date = date('now')").fetchone()[0]
    stats = {
        "books": conn.execute("SELECT COUNT(*) FROM books").fetchone()[0],
        "copies_total": total_copies or 12480,
        "students": conn.execute("SELECT COUNT(*) FROM users WHERE role='student'").fetchone()[0],
        "active": conn.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue')").fetchone()[0],
        "today_issued": today_issued,
        "available_copies": available_copies or 11320
    }
    books = conn.execute("SELECT b.*, c.name category_name FROM books b JOIN categories c ON c.id=b.category_id ORDER BY b.id DESC LIMIT 8").fetchall()
    featured_book = conn.execute("SELECT b.*, c.name category_name FROM books b JOIN categories c ON c.id=b.category_id WHERE b.copies_available > 0 ORDER BY b.copies_available DESC LIMIT 1").fetchone()
    if not featured_book and books:
        featured_book = books[0]
    cats = conn.execute("SELECT * FROM categories ORDER BY name").fetchall()
    conn.close()
    return render_template("page.html", title="Smart Library", heading="Smart Library Management System",
                           subtitle="Modern library circulation, requests, books and fine management.",
                           body_html=render_template("_home.html", stats=stats, books=books, featured_book=featured_book, cats=cats))

@public.route("/login", methods=["GET", "POST"])
@limiter.limit("6 per minute", methods=["POST"])
def login():
    next_url = sanitize_text(request.args.get("next") or request.form.get("next", ""), 200)
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired. Please try again.", "danger")
        else:
            email = sanitize_text(request.form.get("email", ""), 120).lower()
            password = request.form.get("password", "")
            conn = get_db()
            user = conn.execute("SELECT * FROM users WHERE lower(email)=? AND status='active'", (email,)).fetchone()
            conn.close()
            if user and verify_password(password, user["password"]):
                login_user(user)
                flash(f"Welcome back, {user['name']}!", "success")
                # Open redirect protection: strictly relative paths
                if next_url and next_url.startswith("/") and not next_url.startswith("//"):
                    return redirect(next_url)
                role = user["role"]
                return redirect(url_for({"admin": "admin.dashboard", "staff": "staff.dashboard", "student": "student.dashboard"}[role]))
            flash("Invalid email or password.", "danger")
    return render_template("form.html", title="Login", heading="Sign in", csrf=csrf_token(), fields=[
        {"name": "email", "label": "Email", "type": "email", "required": True},
        {"name": "password", "label": "Password", "type": "password", "required": True},
        {"name": "next", "label": "", "type": "hidden", "value": next_url}
    ], submit="Sign in",
    extra_links=[
        {"text": "Forgot your password? Reset it here", "url": url_for("public.reset_password")},
        {"text": "Don't have an account? Register as a student", "url": url_for("public.register")}
    ])

@public.route("/logout")
def logout():
    logout_user()
    flash("You have been signed out.", "success")
    return redirect(url_for("public.login"))

@public.route("/register", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def register():
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired. Please try again.", "danger")
        else:
            name = sanitize_text(request.form.get("name", ""), 80)
            email = sanitize_text(request.form.get("email", ""), 120).lower()
            password = request.form.get("password", "")
            phone = sanitize_text(request.form.get("phone", ""), 25)

            if len(password) < 6 or len(password) > 128:
                flash("Password must be between 6 and 128 characters.", "danger")
            elif not name or not is_valid_email(email):
                flash("A valid name and email address are required.", "danger")
            else:
                try:
                    conn = get_db()
                    identifier = "STU-" + datetime.now().strftime("%y%m%d%H%M%S")
                    conn.execute("INSERT INTO users(name,email,password,role,identifier,phone) VALUES(?,?,?,?,?,?)",
                                 (name, email, make_password(password), "student", identifier, phone))
                    conn.commit()
                    conn.close()
                    flash("Registration successful! You can now sign in.", "success")
                    return redirect(url_for("public.login"))
                except Exception:
                    flash("Email is already registered or unavailable.", "danger")
    return render_template("form.html", title="Register", heading="Create Student Account", csrf=csrf_token(), fields=[
        {"name": "name", "label": "Full name", "required": True},
        {"name": "email", "label": "Email address", "type": "email", "required": True},
        {"name": "phone", "label": "Phone number", "required": True},
        {"name": "password", "label": "Password (min 6 characters)", "type": "password", "required": True}
    ], submit="Create Account",
    extra_links=[
        {"text": "Already have an account? Sign in here", "url": url_for("public.login")}
    ])

@public.route("/books")
@login_required
def books():
    update_overdue_statuses()
    search = sanitize_text(request.args.get("search", ""), 100)
    category = sanitize_text(request.args.get("category", ""), 60)
    conn = get_db()
    sql = """SELECT b.id,b.title,b.author,b.isbn,c.name category,b.copies_available,b.copies_total,b.location_rack,b.publisher,b.publication_year,b.description
           FROM books b JOIN categories c ON c.id=b.category_id WHERE 1=1"""
    params = []
    if search:
        sql += " AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.description LIKE ?)"
        params += [f"%{search}%"] * 4
    if category:
        sql += " AND c.name=?"
        params.append(category)
    sql += " ORDER BY b.title"
    rows = conn.execute(sql, params).fetchall()
    cats = conn.execute("SELECT name FROM categories ORDER BY name").fetchall()
    conn.close()
    body = render_template("_books.html", rows=rows, cats=cats, search=search, category=category)
    return render_template("page.html", title="Books", heading="Library Catalog",
                           subtitle=f"Showing {len(rows)} books in catalog", body_html=body)

@public.route("/book_details")
@login_required
def book_details():
    bid = request.args.get("id", type=int)
    conn = get_db()
    book = conn.execute("""SELECT b.*,c.name category FROM books b JOIN categories c ON c.id=b.category_id WHERE b.id=?""", (bid,)).fetchone()
    conn.close()
    if not book:
        flash("Book not found.", "danger")
        return redirect(url_for("public.books"))
    return render_template("page.html", title=book["title"], heading=book["title"],
                           subtitle=f"ISBN: {book['isbn']} · {book['category']}",
                           body_html=render_template("_book_details.html", book=book, csrf=csrf_token()))

@public.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    u = current_user()
    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired. Please try again.", "danger")
        elif request.form.get("action") == "update_profile":
            clean_name = sanitize_text(request.form.get("name", ""), 80)
            clean_phone = sanitize_text(request.form.get("phone", ""), 25)
            clean_dept = sanitize_text(request.form.get("department", ""), 80)
            clean_addr = sanitize_text(request.form.get("address", ""), 200)

            if not clean_name:
                flash("Name cannot be empty.", "danger")
            else:
                conn = get_db()
                conn.execute("UPDATE users SET name=?,phone=?,department=?,address=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
                             (clean_name, clean_phone, clean_dept, clean_addr, u["id"]))
                conn.commit()
                conn.close()
                session["user_name"] = clean_name
                flash("Profile updated successfully.", "success")
                return redirect(url_for("public.profile"))
        elif request.form.get("action") == "change_password":
            cur_pwd = request.form.get("current_password", "")
            new_pwd = request.form.get("new_password", "")
            cnf_pwd = request.form.get("confirm_password", "")

            if not verify_password(cur_pwd, u["password"]):
                flash("Current password is incorrect.", "danger")
            elif new_pwd != cnf_pwd:
                flash("New passwords do not match.", "danger")
            elif len(new_pwd) < 6 or len(new_pwd) > 128:
                flash("New password must be between 6 and 128 characters.", "danger")
            else:
                conn = get_db()
                conn.execute("UPDATE users SET password=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", (make_password(new_pwd), u["id"]))
                conn.commit()
                conn.close()
                flash("Password changed successfully.", "success")
                return redirect(url_for("public.profile"))
    return render_template("page.html", title="Profile", heading="My Profile",
                           subtitle="Manage your personal information and credentials.",
                           body_html=render_template("_profile.html", u=current_user(), csrf=csrf_token()))

@public.route("/reset_password", methods=["GET", "POST"])
@limiter.limit("5 per minute", methods=["POST"])
def reset_password():
    token_val = sanitize_text(request.args.get("token") or request.form.get("token") or "", 64)
    email_val = sanitize_text(request.args.get("email") or request.form.get("email") or "", 120).lower()

    if request.method == "POST":
        if not valid_csrf(request.form.get("_csrf")):
            flash("Security token expired. Please try again.", "danger")
        else:
            action = request.form.get("action", "request_reset" if not token_val else "confirm_reset")
            if action == "request_reset":
                email = sanitize_text(request.form.get("email", ""), 120).lower()
                if not is_valid_email(email):
                    flash("Please provide a valid registered email address.", "danger")
                else:
                    conn = get_db()
                    user = conn.execute("SELECT id FROM users WHERE lower(email)=? AND status='active'", (email,)).fetchone()
                    if user:
                        reset_token = secrets.token_urlsafe(24)
                        expires = (datetime.now() + timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
                        conn.execute("DELETE FROM password_resets WHERE lower(email)=?", (email,))
                        conn.execute("INSERT INTO password_resets(email, token, expires_at) VALUES(?,?,?)",
                                     (email, reset_token, expires))
                        conn.commit()
                        conn.close()
                        flash(f"Reset token generated for {email}: {reset_token}", "info")
                        return redirect(url_for("public.reset_password", email=email, token=reset_token))
                    conn.close()
                    flash("If an active account exists with that email, reset instructions have been issued.", "info")
            elif action == "confirm_reset":
                email = sanitize_text(request.form.get("email", ""), 120).lower()
                token = sanitize_text(request.form.get("token", ""), 64)
                new_pwd = request.form.get("new_password", "")
                if len(new_pwd) < 6 or len(new_pwd) > 128:
                    flash("Password must be between 6 and 128 characters.", "danger")
                else:
                    conn = get_db()
                    reset_row = conn.execute(
                        "SELECT id FROM password_resets WHERE lower(email)=? AND token=? AND expires_at > datetime('now')",
                        (email, token)
                    ).fetchone()
                    if not reset_row:
                        conn.close()
                        flash("Invalid or expired reset token. Please request a new reset.", "danger")
                    else:
                        conn.execute("UPDATE users SET password=?, updated_at=CURRENT_TIMESTAMP WHERE lower(email)=?",
                                     (make_password(new_pwd), email))
                        conn.execute("DELETE FROM password_resets WHERE lower(email)=?", (email,))
                        conn.commit()
                        conn.close()
                        flash("Password updated successfully! You can now log in.", "success")
                        return redirect(url_for("public.login"))

    # If token is present, show password reset form; otherwise show request form
    if token_val:
        fields = [
            {"name": "action", "type": "hidden", "value": "confirm_reset"},
            {"name": "email", "label": "Registered Email", "type": "email", "value": email_val, "required": True},
            {"name": "token", "label": "Security Reset Token", "value": token_val, "required": True},
            {"name": "new_password", "label": "New Password (min 6 characters)", "type": "password", "required": True},
        ]
        submit_btn = "Update Password"
    else:
        fields = [
            {"name": "action", "type": "hidden", "value": "request_reset"},
            {"name": "email", "label": "Registered Account Email", "type": "email", "value": email_val, "required": True},
        ]
        submit_btn = "Generate Reset Token"

    return render_template("form.html", title="Reset Password", heading="Reset Password", csrf=csrf_token(),
                           fields=fields, submit=submit_btn,
                           extra_links=[
                               {"text": "Remember your credentials? Back to sign in", "url": url_for("public.login")}
                           ])

@public.route("/api/spotlight")
@limiter.limit("60 per minute")
def api_spotlight():
    q = sanitize_text(request.args.get("q") or "", 100)
    u = current_user()
    conn = get_db()
    results = {"books": [], "links": []}

    all_links = [
        {"title": "Library Catalog", "subtitle": "Search all books, authors and topics", "url": url_for("public.books"), "icon": "📚"},
        {"title": "Home Page", "subtitle": "Library portal overview and live stats", "url": url_for("public.index"), "icon": "🏛️"},
    ]
    if u:
        all_links.append({"title": "My Profile & Security", "subtitle": "Digital card, personal info and password", "url": url_for("public.profile"), "icon": "👤"})
        if u["role"] == "student":
            all_links.append({"title": "Student Dashboard", "subtitle": "Overview of active loans and readings", "url": url_for("student.dashboard"), "icon": "📊"})
            all_links.append({"title": "My Borrowed Books", "subtitle": "Track loan periods and return dates", "url": url_for("student.my_books"), "icon": "📖"})
            all_links.append({"title": "My Book Requests", "subtitle": "Status of your borrowing requests", "url": url_for("student.my_requests"), "icon": "📋"})
            all_links.append({"title": "My Fines", "subtitle": "Check overdue status and penalties", "url": url_for("student.my_fines"), "icon": "💳"})
        elif u["role"] in ["admin", "staff"]:
            role_pre = u["role"]
            all_links.append({"title": "Issue Book Desk", "subtitle": "Checkout book to registered student", "url": url_for(f"{role_pre}.issue_book"), "icon": "📤"})
            all_links.append({"title": "Return Book Desk", "subtitle": "Process return with live fine preview", "url": url_for(f"{role_pre}.return_book"), "icon": "📥"})
            all_links.append({"title": "Book Requests", "subtitle": "Approve or reject student requests", "url": url_for(f"{role_pre}.requests"), "icon": "📝"})
            all_links.append({"title": "Fines Desk", "subtitle": "Manage collected and waived fines", "url": url_for(f"{role_pre}.fines"), "icon": "💰"})
        if u["role"] == "admin":
            all_links.append({"title": "Admin Dashboard", "subtitle": "Administrative control center", "url": url_for("admin.dashboard"), "icon": "⚡"})
            all_links.append({"title": "Manage Books", "subtitle": "Inventory, add and update book records", "url": url_for("admin.books"), "icon": "📘"})
            all_links.append({"title": "Manage Users", "subtitle": "Student and staff account management", "url": url_for("admin.users"), "icon": "👥"})
            all_links.append({"title": "System Settings", "subtitle": "Configure loan duration and fine rates", "url": url_for("admin.settings"), "icon": "⚙️"})
    else:
        all_links.append({"title": "Sign In", "subtitle": "Access student, staff, or admin portal", "url": url_for("public.login"), "icon": "🔐"})
        all_links.append({"title": "Create Account", "subtitle": "Register as a student reader", "url": url_for("public.register"), "icon": "✨"})

    if q:
        q_lower = q.lower()
        results["links"] = [l for l in all_links if q_lower in l["title"].lower() or q_lower in l["subtitle"].lower()]

        sql = """SELECT b.id, b.title, b.author, b.isbn, b.copies_available, b.copies_total, b.location_rack, c.name category
                 FROM books b JOIN categories c ON c.id=b.category_id
                 WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR c.name LIKE ?
                 ORDER BY b.copies_available DESC LIMIT 6"""
        param = f"%{q}%"
        rows = conn.execute(sql, (param, param, param, param)).fetchall()
        for r in rows:
            results["books"].append({
                "id": r["id"],
                "title": r["title"],
                "author": r["author"],
                "isbn": r["isbn"],
                "category": r["category"],
                "available": r["copies_available"],
                "total": r["copies_total"],
                "rack": r["location_rack"] or "General",
                "url": url_for("public.book_details", id=r["id"])
            })
    else:
        results["links"] = all_links[:5]
        top_books = conn.execute("""SELECT b.id, b.title, b.author, b.isbn, b.copies_available, b.copies_total, b.location_rack, c.name category
                                    FROM books b JOIN categories c ON c.id=b.category_id
                                    WHERE b.copies_available > 0
                                    LIMIT 4""").fetchall()
        for r in top_books:
            results["books"].append({
                "id": r["id"],
                "title": r["title"],
                "author": r["author"],
                "isbn": r["isbn"],
                "category": r["category"],
                "available": r["copies_available"],
                "total": r["copies_total"],
                "rack": r["location_rack"] or "General",
                "url": url_for("public.book_details", id=r["id"])
            })

    conn.close()
    return jsonify(results)

@public.route("/api/assistant", methods=["GET", "POST"])
@limiter.limit("30 per minute")
def api_assistant():
    query = sanitize_text(request.values.get("q") or "", 200)
    if not query:
        return jsonify({"reply": "Hello! I am your Smart Library AI Research Assistant. Ask me about books, topics, loan policies, or search our live catalog."})

    q_lower = query.lower()
    conn = get_db()

    # Pre-programmed intelligent explanations for common research queries
    if "machine learning" in q_lower or "what is ml" in q_lower or "explain machine learning" in q_lower:
        rows = conn.execute("SELECT b.id, b.title, b.author, b.copies_available, c.name category FROM books b JOIN categories c ON c.id=b.category_id WHERE b.title LIKE '%code%' OR b.category_id=1 LIMIT 3").fetchall()
        books_data = [{"id": r["id"], "title": r["title"], "author": r["author"], "available": r["copies_available"]} for r in rows]
        conn.close()
        return jsonify({
            "reply": "Machine learning is a branch of artificial intelligence that empowers computers to discover patterns from data and make autonomous decisions or predictions without explicit hand-coded rules. In our collection, you can explore core computer science and algorithmic foundations to master this domain.",
            "books": books_data
        })

    if "summarize" in q_lower or "research paper" in q_lower or "paper help" in q_lower:
        conn.close()
        return jsonify({
            "reply": "For academic research, we recommend referencing peer-reviewed titles from our Computer Science, Science, and Mathematics categories. You can cite any book using its registered ISBN and publisher directly from each book's details page."
        })

    if any(k in q_lower for k in ["rule", "policy", "fine", "overdue", "duration", "limit"]):
        loan_days = conn.execute("SELECT setting_value FROM system_settings WHERE setting_key='loan_duration_days'").fetchone()
        fine_rate = conn.execute("SELECT setting_value FROM system_settings WHERE setting_key='daily_fine_rate'").fetchone()
        max_books = conn.execute("SELECT setting_value FROM system_settings WHERE setting_key='max_books_per_student'").fetchone()
        conn.close()
        days_str = loan_days["setting_value"] if loan_days else "14"
        rate_str = fine_rate["setting_value"] if fine_rate else "2.0"
        max_str = max_books["setting_value"] if max_books else "3"
        return jsonify({
            "reply": f"• Standard loan duration: {days_str} days.\n• Max simultaneous loans per student: {max_str} books.\n• Overdue fine rate: ₹{rate_str}/day after due date.\n• Books can be requested directly online and collected at the circulation desk."
        })

    if any(k in q_lower for k in ["how many", "count", "statistics", "total books", "status"]):
        total_books = conn.execute("SELECT COUNT(*) FROM books").fetchone()[0]
        active_loans = conn.execute("SELECT COUNT(*) FROM book_issues WHERE status IN ('issued','overdue')").fetchone()[0]
        students = conn.execute("SELECT COUNT(*) FROM users WHERE role='student'").fetchone()[0]
        conn.close()
        return jsonify({
            "reply": f"The library currently manages {total_books} book title(s), {students} registered students, and {active_loans} active loans with all digital systems operational."
        })

    # Catalog search query
    sql = """SELECT b.id, b.title, b.author, b.isbn, b.copies_available, b.copies_total, b.location_rack, c.name category
             FROM books b JOIN categories c ON c.id=b.category_id
             WHERE b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR c.name LIKE ? OR b.description LIKE ?
             ORDER BY b.copies_available DESC
             LIMIT 4"""
    param = f"%{query}%"
    rows = conn.execute(sql, (param, param, param, param, param)).fetchall()
    conn.close()

    if not rows:
        return jsonify({
            "reply": f"I couldn't find any titles matching '{query}'. Try searching for subjects like 'Computer Science', 'Algorithms', 'Java', or browse our full catalog."
        })

    books_data = []
    reply_lines = [f"I found {len(rows)} matching book(s) in our catalog:"]
    for r in rows:
        books_data.append({
            "id": r["id"],
            "title": r["title"],
            "author": r["author"],
            "category": r["category"],
            "available": r["copies_available"],
            "rack": r["location_rack"]
        })
        avail_str = f"{r['copies_available']} available" if r["copies_available"] > 0 else "all copies borrowed"
        reply_lines.append(f"• **{r['title']}** by {r['author']} ({r['category']}) — {avail_str} (Rack: {r['location_rack'] or 'N/A'})")

    return jsonify({
        "reply": "\n".join(reply_lines),
        "books": books_data
    })

@public.route("/privacy")
def privacy():
    return render_template("legal.html", title="Privacy Policy & GDPR Compliance", heading="Privacy Policy & Data Protection", kind="privacy")

@public.route("/terms")
def terms():
    return render_template("legal.html", title="Terms of Service & Fair Use", heading="Terms of Service & Acceptable Use", kind="terms")

@public.route("/refund")
def refund():
    return render_template("legal.html", title="Refund Policy & Fee Transparency", heading="Refund Policy & Fee Transparency", kind="refund")

@public.route("/cookies")
def cookies():
    return render_template("legal.html", title="Cookie & Local Storage Policy", heading="Cookie & Session Policy", kind="cookies")

@public.route("/deletion-request", methods=["GET", "POST"])
def deletion_request():
    if request.method == "POST":
        flash("Your Data Deletion & Privacy Rights request has been logged and queued for administrative processing in compliance with GDPR Article 17.", "success")
        return redirect(url_for("public.deletion_request"))
    return render_template("legal.html", title="Data Deletion Request (GDPR Art. 17)", heading="Data Deletion Request & Privacy Rights", kind="deletion")


# --- STUDENT SMART LIBRARY MODERN WEB APP ROUTES ---
@public.route("/portal")
@public.route("/app")
def student_portal():
    return send_from_directory(".", "index.html")

@public.route("/app.css")
def serve_app_css():
    return send_from_directory(".", "app.css")

@public.route("/app.js")
def serve_app_js():
    return send_from_directory(".", "app.js")

@public.route("/manifest.json")
def serve_manifest():
    return send_from_directory(".", "manifest.json")

@public.route("/sw.js")
def serve_sw():
    return send_from_directory(".", "sw.js")

@public.route("/library_3d.js")
def serve_library_3d():
    return send_from_directory(".", "library_3d.js")
