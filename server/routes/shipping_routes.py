from flask import Blueprint
from controllers import shipping_controller

bp = Blueprint("shipping", __name__, url_prefix="/api")


@bp.get("/envios")
def envios():
    return shipping_controller.get_shipping_methods()
