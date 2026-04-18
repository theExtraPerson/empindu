"""
Base settings for Empindu Django project.
Thrive With Nature
"""
from pathlib import Path
import environ

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Environment variables
env = environ.Env(
    DEBUG=(bool, False),
    SECRET_KEY=(str, "change-me-in-production"),
    ALLOWED_HOSTS=(list, ["localhost", "127.0.0.1"]),
)

# Read .env file
environ.Env.read_env(BASE_DIR / ".env")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env("DEBUG")

SECRET_KEY = env("SECRET_KEY")

ALLOWED_HOSTS = env("ALLOWED_HOSTS")

# Application definition
INSTALLED_APPS = [
    # Unfold MUST come before django.contrib.admin
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.import_export",
    # Django contrib
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "ninja",
    "allauth",
    "corsheaders",
    "modeltranslation",
    "cloudinary_storage",
    "cloudinary",
    "celery",
    "django_celery_beat",
    "django_celery_results",
    # Empindu apps
    "apps.accounts",
    "apps.artisans",
    "apps.products",
    "apps.orders",
    "apps.payments",
    "apps.gifting",
    "apps.heritage",
    "apps.notifications",
    "apps.telegram_bot",
    "apps.ml",
    "apps.media",
    "apps.search",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "apps.artisans.middleware.UnfoldContextFixMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
# Support both PostgreSQL and SQLite for development
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
    ),
}

# Use in-memory cache if Redis not available
if "redis" in env("REDIS_URL", default=""):
    CELERY_BROKER_URL = env("REDIS_URL")
else:
    # Fallback to database broker for development
    CELERY_BROKER_URL = "django://"
    CELERY_TASK_ALWAYS_EAGER = True  # Execute tasks immediately
CELERY_RESULT_BACKEND = "django-db"
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# Channel Layers (WebSocket support)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL", default="redis://localhost:6379/0")],
        },
    },
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en"
TIME_ZONE = "Africa/Kampala"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files (Cloudinary)
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": env("CLOUDINARY_API_KEY"),
    "API_SECRET": env("CLOUDINARY_API_SECRET"),
}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# CORS
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "https://empindu.lovable.app",
    ],
)

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Auth
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

# Unfold Admin Theme Configuration
UNFOLD = {
    "SITE_TITLE": "Empindu Operations",
    "SITE_HEADER": "Empindu | Thrive With Nature",
    "SITE_URL": "/",
    "SITE_SYMBOL": "eco",  # Material icon
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "COLORS": {
        "primary": {
            "50": "rgb(240, 250, 243)",
            "100": "rgb(216, 243, 220)",
            "200": "rgb(163, 230, 185)",
            "300": "rgb(110, 210, 149)",
            "400": "rgb(82, 183, 136)",  # C.sage
            "500": "rgb(45, 106, 79)",  # C.mid  -- primary brand green
            "600": "rgb(27, 58, 42)",  # C.forest
            "700": "rgb(20, 45, 32)",
            "800": "rgb(13, 31, 22)",
            "900": "rgb(8, 20, 14)",
        },
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Artisans & Craft",
                "separator": True,
                "items": [
                    {
                        "title": "Artisans",
                        "icon": "person",
                        "link": "/admin/artisans/artisan/",
                    },
                    {
                        "title": "Craft Traditions",
                        "icon": "palette",
                        "link": "/admin/artisans/crafttradition/",
                    },
                    {
                        "title": "Certifications",
                        "icon": "verified",
                        "link": "/admin/artisans/certification/",
                    },
                ],
            },
            {
                "title": "Catalogue",
                "separator": True,
                "items": [
                    {
                        "title": "Products",
                        "icon": "inventory_2",
                        "link": "/admin/products/product/",
                    },
                    {
                        "title": "Provenance Records",
                        "icon": "history_edu",
                        "link": "/admin/products/provenance/",
                    },
                ],
            },
            {
                "title": "Commerce",
                "separator": True,
                "items": [
                    {
                        "title": "Orders",
                        "icon": "shopping_bag",
                        "link": "/admin/orders/order/",
                    },
                    {
                        "title": "Gift Orders",
                        "icon": "card_giftcard",
                        "link": "/admin/gifting/giftorder/",
                    },
                    {
                        "title": "Return Requests",
                        "icon": "assignment_return",
                        "link": "/admin/orders/returnrequest/",
                    },
                    {
                        "title": "Payments",
                        "icon": "payments",
                        "link": "/admin/payments/paymenttransaction/",
                    },
                ],
            },
            {
                "title": "Operations",
                "separator": True,
                "items": [
                    {
                        "title": "Notifications",
                        "icon": "notifications",
                        "link": "/admin/notifications/notificationevent/",
                    },
                ],
            },
            {
                "title": "Heritage",
                "separator": True,
                "items": [
                    {
                        "title": "Heritage Fund Ledger",
                        "icon": "account_balance",
                        "link": "/admin/heritage/heritagefundentry/",
                    },
                    {
                        "title": "Distributions",
                        "icon": "volunteer_activism",
                        "link": "/admin/heritage/distribution/",
                    },
                ],
            },
        ],
    },
}




