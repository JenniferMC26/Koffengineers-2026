from flask import Blueprint
from middleware.auth import token_required
from controllers import order_controller

bp = Blueprint("orders", __name__, url_prefix="/api/pedidos")


@bp.post("")
@token_required
def checkout():
    return order_controller.checkout()


@bp.get("")
@token_required
def my_orders():
    return order_controller.get_my_orders()


@bp.get("/<int:order_id>")
@token_required
def get_order(order_id):
    return order_controller.get_order(order_id)
