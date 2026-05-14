from flask import Blueprint
from middleware.auth import admin_required
from controllers import admin_controller

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ── Pedidos ──────────────────────────────────────────────────────────────────

@bp.get("/pedidos")
@admin_required
def list_orders():
    return admin_controller.list_orders()


@bp.get("/pedidos/<int:order_id>")
@admin_required
def get_order(order_id):
    return admin_controller.get_order(order_id)


@bp.patch("/pedidos/<int:order_id>/estado")
@admin_required
def update_order_status(order_id):
    return admin_controller.update_order_status(order_id)


# ── Productos ─────────────────────────────────────────────────────────────────

@bp.post("/productos")
@admin_required
def create_product():
    return admin_controller.create_product()


@bp.put("/productos/<int:product_id>")
@admin_required
def update_product(product_id):
    return admin_controller.update_product(product_id)


@bp.delete("/productos/<int:product_id>")
@admin_required
def delete_product(product_id):
    return admin_controller.delete_product(product_id)


@bp.get("/stock-bajo")
@admin_required
def low_stock():
    return admin_controller.low_stock()
