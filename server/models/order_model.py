"""
models/order_model.py — Queries sobre `pedidos` y `detalles_pedido`
El descuento de stock y limpieza de carrito ocurren en la misma transacción.
"""

from database import get_db

VALID_STATUSES = {"pendiente", "pagado", "enviado", "entregado"}


def create(user_id, shipping_method_id, shipping_data, items, total) -> int:
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            """INSERT INTO pedidos
               (id_usuario, id_metodo_envio, direccion_calle, ciudad,
                codigo_postal, telefono_contacto, total, estado)
               VALUES (%s, %s, %s, %s, %s, %s, %s, 'pendiente')""",
            (
                user_id, shipping_method_id,
                shipping_data["direccion_calle"], shipping_data["ciudad"],
                shipping_data["codigo_postal"], shipping_data["telefono_contacto"],
                total,
            ),
        )
        order_id = cur.lastrowid

        for item in items:
            cur.execute(
                "INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) "
                "VALUES (%s, %s, %s, %s)",
                (order_id, item["id_producto"], item["cantidad"], item["precio"]),
            )
            # Descuento atómico: falla si no hay stock suficiente
            cur.execute(
                "UPDATE productos SET stock = stock - %s "
                "WHERE id_producto = %s AND stock >= %s",
                (item["cantidad"], item["id_producto"], item["cantidad"]),
            )
            if cur.rowcount == 0:
                db.rollback()
                raise ValueError(f"Stock insuficiente para: {item['nombre']}")

        # Vaciar carrito dentro de la misma transacción
        cur.execute("DELETE FROM carrito WHERE id_usuario=%s", (user_id,))

    db.commit()
    return order_id


def get_by_user(user_id: int) -> list:
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            """SELECT p.*, m.nombre AS metodo_envio, m.tiempo_estimado
               FROM pedidos p
               JOIN metodos_envio m ON p.id_metodo_envio = m.id_metodo
               WHERE p.id_usuario = %s
               ORDER BY p.fecha_pedido DESC""",
            (user_id,),
        )
        return cur.fetchall()


def get_by_id(order_id: int, user_id: int = None):
    db = get_db()
    with db.cursor() as cur:
        if user_id:
            cur.execute(
                """SELECT p.*, m.nombre AS metodo_envio, m.tiempo_estimado
                   FROM pedidos p
                   JOIN metodos_envio m ON p.id_metodo_envio = m.id_metodo
                   WHERE p.id_pedido = %s AND p.id_usuario = %s""",
                (order_id, user_id),
            )
        else:
            cur.execute(
                """SELECT p.*, u.nombre_completo, u.correo,
                          m.nombre AS metodo_envio, m.tiempo_estimado
                   FROM pedidos p
                   JOIN usuarios u ON p.id_usuario = u.id_usuario
                   JOIN metodos_envio m ON p.id_metodo_envio = m.id_metodo
                   WHERE p.id_pedido = %s""",
                (order_id,),
            )
        order = cur.fetchone()

    if order:
        with db.cursor() as cur:
            cur.execute(
                """SELECT d.*, pr.nombre, pr.imagen_url
                   FROM detalles_pedido d
                   JOIN productos pr ON d.id_producto = pr.id_producto
                   WHERE d.id_pedido = %s""",
                (order_id,),
            )
            order["items"] = cur.fetchall()

    return order


def get_all(status: str = None) -> list:
    db = get_db()
    base = """SELECT p.*, u.nombre_completo, u.correo, m.nombre AS metodo_envio
              FROM pedidos p
              JOIN usuarios u ON p.id_usuario = u.id_usuario
              JOIN metodos_envio m ON p.id_metodo_envio = m.id_metodo"""
    with db.cursor() as cur:
        if status:
            cur.execute(base + " WHERE p.estado=%s ORDER BY p.fecha_pedido DESC", (status,))
        else:
            cur.execute(base + " ORDER BY p.fecha_pedido DESC")
        return cur.fetchall()


def update_status(order_id: int, status: str) -> bool:
    if status not in VALID_STATUSES:
        return False
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            "UPDATE pedidos SET estado=%s WHERE id_pedido=%s", (status, order_id)
        )
    db.commit()
    return cur.rowcount > 0
