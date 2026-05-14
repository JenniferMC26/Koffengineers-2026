"""
app.py — Clyro Marketplace Backend
Flask + MariaDB · Koffengineers 2026
"""

import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"]   = os.getenv("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET"]   = os.getenv("JWT_SECRET", "dev-jwt-secret")
    app.config["JWT_EXPIRY_H"] = 24

    CORS(app, origins=os.getenv("CORS_ORIGINS", "*"))

    from database import close_db
    app.teardown_appcontext(close_db)

    # Blueprints
    from routes import (
        auth_routes, product_routes, cart_routes,
        order_routes, shipping_routes, admin_routes,
    )
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(product_routes.bp)
    app.register_blueprint(cart_routes.bp)
    app.register_blueprint(order_routes.bp)
    app.register_blueprint(shipping_routes.bp)
    app.register_blueprint(admin_routes.bp)

    @app.get("/admin")
    def admin_panel():
        return send_from_directory("static", "admin.html")

    @app.get("/api/health")
    def health():
        from database import get_db
        try:
            db = get_db()
            with db.cursor() as cur:
                cur.execute("SELECT 1")
            return jsonify({"status": "ok", "db": "connected", "proyecto": "Clyro"}), 200
        except Exception as exc:
            return jsonify({"status": "error", "detail": str(exc)}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        # threaded=True es seguro en Pi4 y evita bloqueos por I/O de BD
        threaded=True,
        debug=(os.getenv("FLASK_ENV") == "development"),
    )
