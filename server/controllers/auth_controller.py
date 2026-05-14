"""
controllers/auth_controller.py — Registro, login y perfil
"""

import bcrypt
import jwt
import pymysql
from datetime import datetime, timedelta, timezone
from flask import jsonify, request, g, current_app
from models import user_model


def register():
    data     = request.get_json(silent=True) or {}
    nombre   = (data.get("nombre_completo") or "").strip()
    correo   = (data.get("correo") or "").strip().lower()
    password = data.get("password") or ""

    if not nombre or not correo or not password:
        return jsonify({"error": "nombre_completo, correo y password son requeridos"}), 400
    if len(password) < 8:
        return jsonify({"error": "La contraseña debe tener al menos 8 caracteres"}), 400

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        user_id = user_model.create(nombre, correo, pw_hash)
    except pymysql.IntegrityError:
        return jsonify({"error": "El correo ya está registrado"}), 409

    user  = user_model.get_by_id(user_id)
    token = _create_token(user["id_usuario"], user["rol"])
    return jsonify({"token": token, "usuario": user}), 201


def login():
    data     = request.get_json(silent=True) or {}
    correo   = (data.get("correo") or "").strip().lower()
    password = data.get("password") or ""

    if not correo or not password:
        return jsonify({"error": "correo y password son requeridos"}), 400

    user = user_model.get_by_email(correo)
    if not user or not bcrypt.checkpw(password.encode(), user["contrasena_hash"].encode()):
        return jsonify({"error": "Credenciales inválidas"}), 401

    user.pop("contrasena_hash")
    token = _create_token(user["id_usuario"], user["rol"])
    return jsonify({"token": token, "usuario": user}), 200


def me():
    user = user_model.get_by_id(g.user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user), 200


def _create_token(user_id: int, role: str) -> str:
    payload = {
        "sub":  user_id,
        "role": role,
        "iat":  datetime.now(timezone.utc),
        "exp":  datetime.now(timezone.utc) + timedelta(hours=current_app.config["JWT_EXPIRY_H"]),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")
