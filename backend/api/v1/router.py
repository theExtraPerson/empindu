"""
API v1 Router - Master URL configuration for all API endpoints
Thrive With Nature
"""
from ninja import NinjaAPI
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTBearer(HttpBearer):
    """JWT authentication for API endpoints"""

    def authenticate(self, request, token: str):
        try:
            validated = JWTAuthentication().get_validated_token(token)
            return JWTAuthentication().get_user(validated)
        except Exception:
            return None


api = NinjaAPI(
    title="Empindu API",
    version="1.0.0",
    description="The Empindu artisan marketplace API",
    auth=JWTBearer(),
    urls_namespace="api",
)

from .auth import router as auth_router
from .artisans import router as artisans_router
from .products import router as products_router
from .orders import router as orders_router
from .gifting import router as gifting_router
from .payments import router as payments_router

api.add_router("/auth/", auth_router, auth=None)
api.add_router("/artisans/", artisans_router)
api.add_router("/products/", products_router)
api.add_router("/orders/", orders_router, auth=JWTBearer())
api.add_router("/gifting/", gifting_router)
api.add_router("/payments/", payments_router, auth=JWTBearer())
