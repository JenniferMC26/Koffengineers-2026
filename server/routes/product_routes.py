from flask import Blueprint
from controllers import product_controller

bp = Blueprint("products", __name__, url_prefix="/api")


@bp.get("/categorias")
def categorias():
    return product_controller.list_categories()


@bp.get("/productos")
def productos():
    return product_controller.list_products()


@bp.get("/productos/<int:product_id>")
def producto(product_id):
    return product_controller.get_product(product_id)
