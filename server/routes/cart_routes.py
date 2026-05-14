from flask import Blueprint
from middleware.auth import token_required
from controllers import cart_controller

bp = Blueprint("cart", __name__, url_prefix="/api/carrito")


@bp.get("")
@token_required
def get_cart():
    return cart_controller.get_cart()


@bp.post("")
@token_required
def add_to_cart():
    return cart_controller.add_to_cart()


@bp.delete("/<int:item_id>")
@token_required
def remove_item(item_id):
    return cart_controller.remove_from_cart(item_id)


@bp.delete("")
@token_required
def clear_cart():
    return cart_controller.clear_cart()
