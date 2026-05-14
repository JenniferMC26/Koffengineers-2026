"""
controllers/cart_controller.py — Gestión del carrito
"""

from flask import jsonify, request, g
from models import cart_model, product_model


def get_cart():
    result = cart_model.get_items(g.user_id)
    return jsonify(result), 200


def add_to_cart():
    data       = request.get_json(silent=True) or {}
    product_id = data.get("id_producto")
    try:
        quantity = max(1, int(data.get("cantidad", 1)))
    except (TypeError, ValueError):
        quantity = 1

    if not product_id:
        return jsonify({"error": "id_producto es requerido"}), 400

    product = product_model.get_by_id(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404
    if product["stock"] < quantity:
        return jsonify({"error": "Stock insuficiente"}), 400

    cart_model.add_item(g.user_id, product_id, quantity)
    return jsonify({"message": "Producto agregado al carrito"}), 201


def remove_from_cart(item_id: int):
    affected = cart_model.remove_item(g.user_id, item_id)
    if not affected:
        return jsonify({"error": "Item no encontrado"}), 404
    return jsonify({"message": "Item eliminado"}), 200


def clear_cart():
    cart_model.clear(g.user_id)
    return jsonify({"message": "Carrito vaciado"}), 200
