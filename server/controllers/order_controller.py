"""
controllers/order_controller.py — Checkout y consulta de pedidos

Flujo de checkout:
  1. Validar datos de envío
  2. Obtener items del carrito
  3. Verificar stock
  4. Obtener costo de envío (Estándar / Exprés)
  5. Crear pedido, descontar stock, vaciar carrito (transacción única)
  6. Devolver resumen con tiempo estimado de entrega
"""

from flask import jsonify, request, g
from database import get_db
from models import cart_model, order_model


def checkout():
    data = request.get_json(silent=True) or {}

    shipping_method_id = data.get("id_metodo_envio")
    shipping_data = {
        "direccion_calle":   (data.get("direccion_calle")   or "").strip(),
        "ciudad":            (data.get("ciudad")            or "").strip(),
        "codigo_postal":     (data.get("codigo_postal")     or "").strip(),
        "telefono_contacto": (data.get("telefono_contacto") or "").strip(),
    }

    if not shipping_method_id:
        return jsonify({"error": "id_metodo_envio es requerido"}), 400
    if not all(shipping_data.values()):
        return jsonify({"error": "Datos de envío incompletos (direccion_calle, ciudad, "
                                 "codigo_postal, telefono_contacto)"}), 400

    items = cart_model.get_checkout_items(g.user_id)
    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    # Validación de stock antes de tocar la BD
    for item in items:
        if item["stock"] < item["cantidad"]:
            return jsonify({"error": f"Stock insuficiente para: {item['nombre']}"}), 400

    # Obtener método de envío
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM metodos_envio WHERE id_metodo = %s", (shipping_method_id,))
        metodo = cur.fetchone()
    if not metodo:
        return jsonify({"error": "Método de envío no encontrado"}), 400

    subtotal      = sum(float(i["precio"]) * i["cantidad"] for i in items)
    costo_envio   = float(metodo["costo"])
    total         = round(subtotal + costo_envio, 2)

    try:
        order_id = order_model.create(
            g.user_id, shipping_method_id, shipping_data, items, total
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({
        "message":          "Pedido creado exitosamente",
        "id_pedido":        order_id,
        "subtotal":         round(subtotal, 2),
        "costo_envio":      costo_envio,
        "total":            total,
        "metodo_envio":     metodo["nombre"],
        "tiempo_estimado":  metodo["tiempo_estimado"],
        "estado":           "pendiente",
    }), 201


def get_my_orders():
    orders = order_model.get_by_user(g.user_id)
    return jsonify(orders), 200


def get_order(order_id: int):
    order = order_model.get_by_id(order_id, g.user_id)
    if not order:
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify(order), 200
