"""
database.py — Conexión modular a MariaDB
Una conexión por request, cerrada automáticamente al finalizar.
Optimizado para Raspberry Pi 4 (sin pool, mínimo overhead de memoria).
"""

import os
import pymysql
import pymysql.cursors
from flask import g


def get_db():
    """Abre (o reutiliza) la conexión de la request actual."""
    if "db" not in g:
        g.db = pymysql.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "clyro_db"),
            cursorclass=pymysql.cursors.DictCursor,
            charset="utf8mb4",
            autocommit=False,
        )
    return g.db


def close_db(exc=None):
    """Cierra la conexión al finalizar el contexto de la aplicación."""
    db = g.pop("db", None)
    if db is not None:
        db.close()
