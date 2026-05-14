"""
models/cart_model.py — Queries sobre la tabla `carrito`
"""

from database import get_db


def get_items(user_id: int) -> dict:
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            """SELECT c.id_carrito, c.cantidad,
                      p.id_producto, p.nombre, p.precio, p.imagen_url, p.stock,
                      (c.cantidad * p.precio) AS subtotal
               FROM carrito c
               JOIN productos p ON c.id_producto = p.id_producto
               WHERE c.id_usuario = %s""",
            (user_id,),
        )
        items = cur.fetchall()
    total = sum(float(i["subtotal"]) for i in items)
    return {"items": items, "total": round(total, 2)}


def get_checkout_items(user_id: int) -> list:
    """Devuelve items con datos necesarios para validar stock y calcular totales."""
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            """SELECT c.cantidad, p.id_producto, p.nombre, p.precio, p.stock
               FROM carrito c
               JOIN productos p ON c.id_producto = p.id_producto
               WHERE c.id_usuario = %s""",
            (user_id,),
        )
        return cur.fetchall()


def add_item(user_id: int, product_id: int, quantity: int):
    db = get_db()
    with db.cursor() as cur:
        # Sin UNIQUE constraint en schema → SELECT + INSERT/UPDATE manual
        cur.execute(
            "SELECT id_carrito, cantidad FROM carrito "
            "WHERE id_usuario=%s AND id_producto=%s",
            (user_id, product_id),
        )
        existing = cur.fetchone()
        if existing:
            cur.execute(
                "UPDATE carrito SET cantidad=%s WHERE id_carrito=%s",
                (existing["cantidad"] + quantity, existing["id_carrito"]),
            )
        else:
            cur.execute(
                "INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (%s, %s, %s)",
                (user_id, product_id, quantity),
            )
    db.commit()


def remove_item(user_id: int, item_id: int) -> int:
    db = get_db()
    with db.cursor() as cur:
        affected = cur.execute(
            "DELETE FROM carrito WHERE id_carrito=%s AND id_usuario=%s",
            (item_id, user_id),
        )
    db.commit()
    return affected


def clear(user_id: int):
    db = get_db()
    with db.cursor() as cur:
        cur.execute("DELETE FROM carrito WHERE id_usuario=%s", (user_id,))
    db.commit()
