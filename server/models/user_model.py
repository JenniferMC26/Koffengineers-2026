"""
models/user_model.py — Queries sobre la tabla `usuarios`
"""

from database import get_db


def get_by_email(correo: str):
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
        return cur.fetchone()


def get_by_id(user_id: int):
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            "SELECT id_usuario, nombre_completo, correo, rol, fecha_registro "
            "FROM usuarios WHERE id_usuario = %s",
            (user_id,),
        )
        return cur.fetchone()


def create(nombre: str, correo: str, pw_hash: str) -> int:
    db = get_db()
    with db.cursor() as cur:
        cur.execute(
            "INSERT INTO usuarios (nombre_completo, correo, contrasena_hash) "
            "VALUES (%s, %s, %s)",
            (nombre, correo, pw_hash),
        )
        user_id = cur.lastrowid
    db.commit()
    return user_id
