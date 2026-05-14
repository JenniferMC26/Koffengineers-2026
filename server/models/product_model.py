"""
models/product_model.py — Queries sobre `productos` y `categorias`
"""

import math
from database import get_db

_ALLOWED_SORTS = {"precio", "nombre", "id_producto", "stock"}
_ALLOWED_FIELDS = {"id_categoria", "nombre", "descripcion", "precio", "stock", "imagen_url"}


def get_all(search="", category_id=None, sort="id_producto", order="DESC", page=1, per_page=12):
    if sort not in _ALLOWED_SORTS:
        sort = "id_producto"
    order = "DESC" if order not in ("ASC", "DESC") else order

    where_clauses, params = [], []
    if search:
        where_clauses.append("(p.nombre LIKE %s OR p.descripcion LIKE %s)")
        params += [f"%{search}%", f"%{search}%"]
    if category_id:
        where_clauses.append("p.id_categoria = %s")
        params.append(category_id)

    where = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    db = get_db()
    with db.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) AS total FROM productos p {where}", params)
        total = cur.fetchone()["total"]

        offset = (page - 1) * per_page
        cur.execute(
            f"""SELECT p.*, c.nombre AS categoria
                FROM productos p
                JOIN categorias c ON p.id_categoria = c.id_categoria
                {where}
                ORDER BY p.{sort} {order}
                LIMIT %s OFFSET %s""",
            params + [per_page, offset],
        )
        rows = cur.fetchall()

    return {
        "data":        rows,
        "total":       total,
        "page":        page,
        "per_page":    per_page,
        "total_pages": math.ceil(total / per_page) if total else 0,
    }


def get_by_id(product_id: int):
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            """SELECT p.*, c.nombre AS categoria
               FROM productos p
               JOIN categorias c ON p.id_categoria = c.id_categoria
               WHERE p.id_producto = %s""",
            (product_id,),
        )
        return cur.fetchone()


def get_categories():
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM categorias ORDER BY nombre")
        return cur.fetchall()


def create(data: dict) -> int:
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO productos (id_categoria, nombre, descripcion, precio, stock, imagen_url) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (
                data["id_categoria"], data["nombre"],
                data.get("descripcion", ""), data["precio"],
                data["stock"], data.get("imagen_url", ""),
            ),
        )
        product_id = cur.lastrowid
    db.commit()
    return product_id


def update(product_id: int, fields: dict) -> int:
    safe_fields = {k: v for k, v in fields.items() if k in _ALLOWED_FIELDS}
    if not safe_fields:
        return 0
    set_clause = ", ".join(f"{k}=%s" for k in safe_fields)
    db = get_db()
    with db.cursor() as cur:
        affected = cur.execute(
            f"UPDATE productos SET {set_clause} WHERE id_producto=%s",
            list(safe_fields.values()) + [product_id],
        )
    db.commit()
    return affected


def delete(product_id: int) -> int:
    db = get_db()
    with db.cursor() as cur:
        affected = cur.execute(
            "DELETE FROM productos WHERE id_producto=%s", (product_id,)
        )
    db.commit()
    return affected


def get_low_stock(threshold: int = 5):
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            "SELECT * FROM productos WHERE stock <= %s ORDER BY stock ASC",
            (threshold,),
        )
        return cur.fetchall()
