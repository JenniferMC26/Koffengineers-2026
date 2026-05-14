"""
controllers/product_controller.py — Catálogo de productos y categorías
"""

from flask import jsonify, request
from models import product_model


def list_products():
    search   = request.args.get("search", "").strip()
    sort     = request.args.get("sort", "id_producto")
    order    = request.args.get("order", "desc").upper()
    try:
        category_id = int(request.args.get("category", 0)) or None
        page        = max(1, int(request.args.get("page", 1)))
        per_page    = min(50, int(request.args.get("per_page", 12)))
    except (ValueError, TypeError):
        return jsonify({"error": "Parámetros de paginación inválidos"}), 400

    result = product_model.get_all(search, category_id, sort, order, page, per_page)
    return jsonify(result), 200


def get_product(product_id: int):
    product = product_model.get_by_id(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify(product), 200


def list_categories():
    cats = product_model.get_categories()
    return jsonify(cats), 200
