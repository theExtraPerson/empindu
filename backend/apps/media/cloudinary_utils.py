from __future__ import annotations

from typing import Any

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from django.conf import settings


def configure_cloudinary() -> None:
    """Configure Cloudinary from Django settings for Empindu media uploads."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE.get("CLOUD_NAME", ""),
        api_key=settings.CLOUDINARY_STORAGE.get("API_KEY", ""),
        api_secret=settings.CLOUDINARY_STORAGE.get("API_SECRET", ""),
        secure=True,
    )


def build_public_id(*parts: str) -> str:
    """Create a Cloudinary public_id using Empindu's folder structure."""
    return "/".join(part.strip("/") for part in parts if part and part.strip("/"))


def get_cloudinary_url(public_id: str, transformation: str = "product", width: int | None = None, height: int | None = None) -> str:
    """Return an optimized Cloudinary URL for Empindu media assets."""
    configure_cloudinary()
    opts = dict(settings.CLOUDINARY_DEFAULT_TRANSFORMATIONS.get(transformation, {}))
    if width:
        opts["width"] = width
    if height:
        opts["height"] = height
    url, _ = cloudinary_url(public_id, **opts)
    return url


def upload_media(file_path: str, *, folder: str, public_id: str | None = None, transformation: str = "product") -> dict[str, Any]:
    """Upload a file to Cloudinary and return the delivery payload."""
    configure_cloudinary()
    upload_kwargs: dict[str, Any] = {"folder": folder, "resource_type": "image"}
    if public_id:
        upload_kwargs["public_id"] = public_id

    result = cloudinary.uploader.upload(file_path, **upload_kwargs)
    return {
        "secure_url": result.get("secure_url"),
        "public_id": result.get("public_id"),
        "url": result.get("url"),
        "optimized_url": get_cloudinary_url(result.get("public_id", ""), transformation=transformation),
    }
