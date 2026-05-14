"""
controllers/shipping_controller.py — Métodos de envío disponibles
"""

from flask import jsonify
from database import get_db


def get_shipping_methods():
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM metodos_envio ORDER BY costo ASC")
        methods = cur.fetchall()
    return jsonify(methods), 200
