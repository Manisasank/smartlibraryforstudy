import os
from waitress import serve
from app import app
from db import init_db

if __name__ == "__main__":
    init_db()
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    threads = int(os.getenv("WAITRESS_THREADS", "8"))
    print("=" * 60)
    print(" Smart Library — Production WSGI Server (Waitress)")
    print(f" Serving on http://{host}:{port} with {threads} worker threads")
    print(f" Local URL:       http://localhost:{port}")
    print(f" Network Access:  http://<Your-Machine-IP>:{port}")
    print(" Press Ctrl+C to stop the server.")
    print("=" * 60)
    serve(app, host=host, port=port, threads=threads)
