from flask import Blueprint
from middleware.auth import token_required
from controllers import auth_controller

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    return auth_controller.register()


@bp.post("/login")
def login():
    return auth_controller.login()


@bp.get("/me")
@token_required
def me():
    return auth_controller.me()
