"""
middleware/auth.py — Decoradores JWT
"""

import jwt
from functools import wraps
from flask import request, g, jsonify, current_app


def token_required(f):
    """Verifica el JWT en el header Authorization: Bearer <token>."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Token requerido"}), 401
        try:
            payload = jwt.decode(
                auth.split(" ")[1],
                current_app.config["JWT_SECRET"],
                algorithms=["HS256"],
            )
            g.user_id   = payload["sub"]
            g.user_role = payload["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Requiere JWT válido + rol admin."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.user_role != "admin":
            return jsonify({"error": "Acceso denegado"}), 403
        return f(*args, **kwargs)
    return decorated
