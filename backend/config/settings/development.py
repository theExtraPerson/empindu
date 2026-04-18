"""
Development settings for Empindu.
Thrive With Nature
"""
from .base import *

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Development-specific overrides
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable Sentry in development
if "sentry_sdk" in globals():
    del sentry_sdk
