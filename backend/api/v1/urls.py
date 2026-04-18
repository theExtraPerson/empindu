"""
URLs for API v1
"""
from django.urls import path
from api.v1.router import api

urlpatterns = [
    path("", api.urls),
]
