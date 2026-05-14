"""
controllers/admin_controller.py — Panel administrativo (solo rol admin)
"""

from flask import jsonify, request
from models import order_model, product_model

_VALID_STATUSES    = {"pendiente", "pagado", "enviado", "entregado"}
_ALLOWED_P_FIELDS  = {"id_categoria", "nombre", "descripcion", "precio", "stock", "imagen_url"}


# ── Pedidos ──────────────────────────────────────────────────────────────────

def list_orders():
    estado  = request.args.get("estado", "").strip()
    orders  = order_model.get_all(estado if estado else None)
    return jsonify(orders), 200


def get_order(order_id: int):
    order = order_model.get_by_id(order_id)
    if not order:
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify(order), 200


def update_order_status(order_id: int):
    data   = request.get_json(silent=True) or {}
    estado = data.get("estado")
    if estado not in _VALID_STATUSES:
        return jsonify({"error": f"Estado inválido. Opciones: {sorted(_VALID_STATUSES)}"}), 400
    if not order_model.update_status(order_id, estado):
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify({"message": "Estado actualizado", "estado": estado}), 200


# ── Productos ─────────────────────────────────────────────────────────────────

def create_product():
    data     = request.get_json(silent=True) or {}
    required = ["id_categoria", "nombre", "precio", "stock"]
    missing  = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Campos requeridos: {missing}"}), 400

    product_id = product_model.create(data)
    return jsonify({"message": "Producto creado", "id_producto": product_id}), 201


def update_product(product_id: int):
    data   = request.get_json(silent=True) or {}
    fields = {k: data[k] for k in _ALLOWED_P_FIELDS if k in data}
    if not fields:
        return jsonify({"error": "Sin campos válidos para actualizar"}), 400
    product_model.update(product_id, fields)
    return jsonify({"message": "Producto actualizado"}), 200


def delete_product(product_id: int):
    if not product_model.delete(product_id):
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({"message": "Producto eliminado"}), 200


def low_stock():
    try:
        umbral = int(request.args.get("umbral", 5))
    except ValueError:
        umbral = 5
    productos = product_model.get_low_stock(umbral)
    return jsonify({"umbral": umbral, "productos": productos, "total": len(productos)}), 200
