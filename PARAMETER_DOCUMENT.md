# Smart Library Management System — Parameter Document

This document provides the technical parameters, system configurations, database schema dictionary, API specifications, and role-based privilege parameters for the **Smart Library Management System** designed for universities and academic institutions.

---

## 1. System Configuration Parameters

The application is configured via environment variables (stored in `.env`) and defaults in `config.py`.

| Parameter Name | Type | Default Value | Config Key | Description |
|---|---|---|---|---|
| `SMARTLIB_SECRET_KEY` | String | `change-this-secret-key-in-production` | `SECRET_KEY` | Flask cryptographic session signing key and CSRF seed. |
| `SMARTLIB_DB_PATH` | String / Path | `instance/smart_library.sqlite` | `DATABASE_PATH` | Path to the SQLite database file. |
| `SMARTLIB_LOAN_DAYS` | Integer | `14` | `DEFAULT_LOAN_DAYS` | Standard loan duration for issued books (in days). |
| `SMARTLIB_MAX_BOOKS` | Integer | `3` | `DEFAULT_MAX_BOOKS` | Maximum number of active borrowed books per student. |
| `SMARTLIB_FINE_RATE` | Float | `2.0` | `DEFAULT_FINE_RATE` | Daily overdue penalty fee in local currency (e.g. ₹2.00 / day). |
| `APP_NAME` | String | `"Smart Library Management System"` | `APP_NAME` | Institutional branding name rendered on pages. |

---

## 2. Dynamic Runtime Parameters (`system_settings` table)

Administrators can adjust these dynamic runtime parameters via the Web UI (`/admin/settings`) without restarting the server:

| Setting Key | Data Type | Default | Description | Impacted Modules |
|---|---|---|---|---|
| `loan_duration_days` | Integer | `14` | Default duration from issue date to due date. | Issue Desk (`routes_admin.py`, `routes_staff.py`) |
| `max_books_per_student`| Integer | `3` | Max active borrows allowed (`issued` + `overdue`). | Request & Issue validation (`routes_student.py`) |
| `daily_fine_rate` | Float | `2.0` | Monetary penalty charged per overdue day upon return. | Fine calculation (`utils.py`, `return_book`) |

---

## 3. Database Schema Dictionary & Entity Parameters

The persistence layer is SQLite with foreign key enforcement (`PRAGMA foreign_keys = ON`).

### 3.1. `users`
Manages identity, authentication, and role assignments for students, faculty staff, and administrators.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `name` | TEXT | NOT NULL | User's full academic name |
| `email` | TEXT | NOT NULL, UNIQUE | Institutional email address (case-insensitive login) |
| `password` | TEXT | NOT NULL | Cryptographic hash (Werkzeug pbkdf2 / bcrypt compatible) |
| `role` | TEXT | NOT NULL, DEFAULT 'student' | Check: `'admin'`, `'staff'`, `'student'` |
| `identifier` | TEXT | UNIQUE | Institutional Student/Staff ID (e.g., `STU-001`, `STF-001`) |
| `phone` | TEXT | NULLABLE | Primary contact phone number |
| `address` | TEXT | NULLABLE | Residential / hostel address |
| `department` | TEXT | DEFAULT 'General' | Academic department (e.g., Computer Science, Mathematics) |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | User account state (`active`, `suspended`, `inactive`) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account registration timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last profile modification timestamp |

### 3.2. `categories`
Classifies books into academic subjects.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Category ID |
| `name` | TEXT | NOT NULL, UNIQUE | Category name (e.g., Computer Science, Literature) |
| `description` | TEXT | NULLABLE | Detailed scope of the category |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### 3.3. `books`
Contains the university catalog records and real-time inventory counts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Internal book ID |
| `isbn` | TEXT | NOT NULL, UNIQUE | 10 or 13-digit standard book identifier |
| `title` | TEXT | NOT NULL | Official title of the textbook or volume |
| `author` | TEXT | NOT NULL | Primary author(s) or editor(s) |
| `category_id` | INTEGER | NOT NULL, FK(`categories.id`) | Foreign key to category |
| `publisher` | TEXT | NULLABLE | Publishing company or press |
| `publication_year`| INTEGER | NULLABLE | Year of edition |
| `copies_total` | INTEGER | NOT NULL, DEFAULT 1 | Total inventory owned by university |
| `copies_available`| INTEGER | NOT NULL, DEFAULT 1 | Copies currently on shelf for borrowing |
| `location_rack` | TEXT | NULLABLE | Physical shelf locator code (e.g., `CS-A1`, `MATH-03`) |
| `cover_image` | TEXT | NULLABLE | URI or static path to book cover art |
| `description` | TEXT | NULLABLE | Summary, prerequisites, and syllabus notes |
| `status` | TEXT | NOT NULL, DEFAULT 'available' | Status flag (`available`, `archived`) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last inventory update timestamp |

### 3.4. `book_requests`
Maintains reservation queues when students request books online.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Request ID |
| `user_id` | INTEGER | NOT NULL, FK(`users.id`) | Student requesting the book |
| `book_id` | INTEGER | NOT NULL, FK(`books.id`) | Target book requested |
| `request_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Time reservation was placed |
| `status` | TEXT | NOT NULL, DEFAULT 'pending' | State: `'pending'`, `'approved'`, `'rejected'` |
| `remarks` | TEXT | NULLABLE | Reason or staff approval notes |
| `processed_by` | INTEGER | NULLABLE, FK(`users.id`) | Staff/Admin ID who processed request |
| `processed_at` | DATETIME | NULLABLE | Processing timestamp |

### 3.5. `book_issues`
Tracks active circulation, due dates, returns, and digital receipts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Issue ID |
| `issue_code` | TEXT | NOT NULL, UNIQUE | Formatted tracking code (e.g. `ISS-YYYYMMDD...`) |
| `user_id` | INTEGER | NOT NULL, FK(`users.id`) | Borrower user ID |
| `book_id` | INTEGER | NOT NULL, FK(`books.id`) | Borrowed book ID |
| `request_id` | INTEGER | NULLABLE | Optional origin request ID |
| `issue_date` | DATE | NOT NULL | Checkout date (`YYYY-MM-DD`) |
| `due_date` | DATE | NOT NULL | Mandatory return deadline (`YYYY-MM-DD`) |
| `return_date` | DATE | NULLABLE | Actual date returned |
| `status` | TEXT | NOT NULL, DEFAULT 'issued' | Circulation state: `'issued'`, `'overdue'`, `'returned'` |
| `issued_by` | INTEGER | NOT NULL, FK(`users.id`) | Librarian/Staff who checked out the book |
| `received_by` | INTEGER | NULLABLE, FK(`users.id`) | Librarian/Staff who checked in the book |
| `notes` | TEXT | NULLABLE | Condition on checkout or special remarks |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Audit timestamp |

### 3.6. `fines`
Financial ledger for overdue penalties.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Fine transaction ID |
| `issue_id` | INTEGER | NOT NULL, FK(`book_issues.id`)| Origin circulation record |
| `user_id` | INTEGER | NOT NULL, FK(`users.id`) | Student liable for fee |
| `amount` | REAL | NOT NULL, DEFAULT 0 | Calculated fee: `days_overdue * daily_fine_rate` |
| `status` | TEXT | NOT NULL, DEFAULT 'unpaid' | Settlement state: `'unpaid'`, `'paid'`, `'waived'` |
| `fine_date` | DATE | NOT NULL | Date fine assessed |
| `paid_date` | DATETIME | NULLABLE | Payment timestamp |
| `received_by` | INTEGER | NULLABLE, FK(`users.id`) | Staff member recording payment |
| `remarks` | TEXT | NULLABLE | Payment receipt or waiver authorization reason |

---

## 4. Role Privilege Parameter Matrix

| Capability / Route | Student | Staff | Administrator |
|---|:---:|:---:|:---:|
| Search Catalog & View Details | Yes | Yes | Yes |
| Request Books Online | Yes | No (Student only) | No |
| View Personal Borrow History & Receipt | Yes | No | No |
| View Personal Overdue Fines | Yes | No | No |
| Issue Book to Student | No | Yes | Yes |
| Return Book & Record Payment | No | Yes | Yes |
| Approve / Reject Book Requests | No | Yes | Yes |
| Mark Fine as Paid / Waived | No | Yes | Yes |
| View Circulation Stats & Reports | No | Yes | Yes |
| Add / Edit / Delete Catalog Books | No | No | Yes |
| Add / Edit / Suspend Users | No | No | Yes |
| Configure System Settings | No | No | Yes |

---

## 5. Security & Input Parameters

1. **CSRF Tokens**: Every state-altering HTTP request (`POST`) must supply a valid `_csrf` token matching `session["_csrf"]`.
2. **Password Standards**: Minimum 6 characters required during registration, user creation, and password reset. Stored via cryptographic one-way salted hashes.
3. **Session Variables**:
   - `session["user_id"]`: Integer user ID.
   - `session["role"]`: User role identifier (`student`, `staff`, `admin`).
   - `session["user_name"]`: Display name cached in session.
   - `session["_csrf"]`: Cryptographic random string.
