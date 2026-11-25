import os
from datetime import timedelta
from flask import Flask, request, jsonify, render_template
from config import SECRET_KEY, FLASK_DEBUG, SESSION_COOKIE_SECURE, ALLOWED_ORIGINS
from db import init_db
from utils import csrf_token, limiter

app = Flask(__name__)

# Security & Session Configuration
app.config.update(
    SECRET_KEY=SECRET_KEY,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=SESSION_COOKIE_SECURE,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
    SESSION_REFRESH_EACH_REQUEST=True,
    MAX_CONTENT_LENGTH=16 * 1024 * 1024  # Enforce 16MB request payload limit
)

# Initialize Rate Limiter
limiter.init_app(app)

# Register Blueprints
from routes_public import public
from routes_admin import admin
from routes_staff import staff
from routes_student import student
from tictactoe_server import tictactoe_bp

app.register_blueprint(public)
app.register_blueprint(admin)
app.register_blueprint(staff)
app.register_blueprint(student)
app.register_blueprint(tictactoe_bp)

@app.context_processor
def globals_for_templates():
    return {"csrf_token": csrf_token}

# Centralized Security Headers & CORS Enforcement
@app.after_request
def add_security_headers(response):
    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Prevent Clickjacking via iframes
    response.headers["X-Frame-Options"] = "DENY"
    
    # Referrer privacy policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Restrict device sensor & feature access
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"
    
    # Cross-Origin Isolation
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    
    # Comprehensive Content Security Policy (CSP)
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers["Content-Security-Policy"] = csp

    # CORS Headers (Strict origin verification)
    origin = request.headers.get("Origin")
    if origin and origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-CSRF-Token, Authorization"

    return response

# Handle OPTIONS Preflight for API Endpoints
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        if origin and origin in ALLOWED_ORIGINS:
            response = app.make_default_options_response()
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-CSRF-Token, Authorization"
            return response

# Centralized Error Handlers (Prevents stack-trace leaks)
@app.errorhandler(400)
def bad_request(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Bad Request", "message": "The request could not be processed."}), 400
    return render_template("page.html", title="400 - Bad Request", heading="Bad Request",
                           subtitle="The requested action was invalid or missing required security parameters."), 400

@app.errorhandler(403)
def forbidden(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Forbidden", "message": "You do not have permission to access this resource."}), 403
    return render_template("page.html", title="403 - Forbidden", heading="Access Denied",
                           subtitle="You do not have permission to access this protected area."), 403

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Not Found", "message": "The requested API endpoint was not found."}), 404
    return render_template("page.html", title="404 - Not Found", heading="Page Not Found",
                           subtitle="The catalog entry or page you are looking for does not exist."), 404

@app.errorhandler(429)
def ratelimit_handler(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Too Many Requests", "message": "Rate limit exceeded. Please wait a moment and try again."}), 429
    return render_template("page.html", title="429 - Rate Limit Exceeded", heading="Too Many Requests",
                           subtitle="Rate limit exceeded. To protect system security, please slow down and try again shortly."), 429

@app.errorhandler(500)
def server_error(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500
    return render_template("page.html", title="500 - Server Error", heading="Internal Server Error",
                           subtitle="An unexpected internal error occurred. Our engineering team has been notified."), 500

@app.cli.command("init-db")
def init_db_command():
    init_db()
    print("Database initialized.")

if __name__ == "__main__":
    init_db()
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug = FLASK_DEBUG  # Hardened default: False
    app.run(host=host, port=port, debug=debug)
