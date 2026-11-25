# Smart Library

A Python/Flask library management system with a professional glass interface, role-based access, catalog management, circulation, requests, fines, reports, profile management and SQLite persistence.

## Included roles

- Administrator
- Library Staff
- Student / Member

## Main features

- Secure login, registration and password reset
- Role-based dashboards
- Book catalog and book details
- Borrow requests
- Issue and return workflow
- Fine calculation and payment status
- User and book administration
- Reports and transactions
- Profile and password management
- Terms & Conditions and Privacy Policy pages
- Responsive glass-style UI
- Custom SVG favicon and branding
- Real database-driven library statistics

## Project structure

```text
smartlibraryforstudy/
├── app.py
├── auth.py
├── config.py
├── db.py
├── seed.py
├── utils.py
├── routes_public.py
├── routes_admin.py
├── routes_staff.py
├── routes_student.py
├── requirements.txt
├── .env.example
├── .gitignore
├── run_windows.bat
├── templates/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── instance/
    └── .gitkeep
```

## Run on Windows

1. Open PowerShell in this folder.
2. Create an environment:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Create the database and demo records:

```powershell
python seed.py
```

5. Start the application:

```powershell
python app.py
```

6. Open `http://127.0.0.1:5000/`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartlib.com | admin123 |
| Staff | staff@smartlib.com | staff123 |
| Student | student@smartlib.com | student123 |

Change these credentials before using the application with real users.

## Configuration

Copy `.env.example` to `.env` and change the secret key before deployment. The SQLite database is stored in `instance/smart_library.sqlite`.

## Documentation & Institutional Policies

- **Technical Parameter Document**: See [PARAMETER_DOCUMENT.md](PARAMETER_DOCUMENT.md) for full configuration, environment variables, database schema parameters, and role-permission matrices.
- **Rules and Regulations**: See [RULES_AND_REGULATIONS.md](RULES_AND_REGULATIONS.md) for circulation limits, due dates, overdue penalty calculations, material damage liabilities, and student clearance guidelines.

## Deployment

Use a Python/WSGI-capable host. A PHP-only host cannot run this Flask application.
