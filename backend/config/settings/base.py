"""
Base settings for Empindu Django project.
Thrive With Nature
"""
from os import environ
from pathlib import Path
from environ import env
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

LOGGING = {
    ...
}

# Environment variables)
ALLOWED_HOSTS = [
    "your-backend.up.railway.app",
    "empindu.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "https://empindu.vercel.app",
    "https://empindu.com",
    "https://api.empindu.com"
]

# Read .env file
environ.Env.read_env(BASE_DIR / ".env")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG", default=False)

SECRET_KEY = env("SECRET_KEY", default=None)

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=[
        "localhost",
        "127.0.0.1",
    ],
)

TELEGRAM_BOT_TOKEN = env("TELEGRAM_BOT_TOKEN")
TELEGRAM_WEBHOOK_URL = env("TELEGRAM_WEBHOOK_URL")
TELEGRAM_WEBHOOK_SECRET = env("TELEGRAM_WEBHOOK_SECRET")
TELEGRAM_ANNOUNCEMENT_CHAT_ID = env("TELEGRAM_ANNOUNCEMENT_CHAT_ID")
SOCIAL_AUTH_SHARED_SECRET = env("SOCIAL_AUTH_SHARED_SECRET")
FRONTEND_URL = env("FRONTEND_URL")
OPENAI_API_KEY = env("OPENAI_API_KEY")
OPENAI_TRANSCRIBE_MODEL = env("OPENAI_TRANSCRIBE_MODEL")

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
    "rest_framework",
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
    "api.v1.throttles.RequestSizeLimitMiddleware",
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

ASGI_APPLICATION = "config.asgi.application"

# Database
# PostgreSQL (production-ready with pgvector support)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': env('DB_NAME', default='empindu'),
#         'USER': env('DB_USER', default='postgres'),
#         'PASSWORD': env('DB_PASSWORD', default='3mpindu'),
#         'HOST': env('DB_HOST', default='127.0.0.1'),
#         'PORT': env('DB_PORT', default='5432'),
#         'ATOMIC_REQUESTS': True,
#         'CONN_MAX_AGE': env.int('DB_CONN_MAX_AGE', default=60),
#         'OPTIONS': {
#             'sslmode': env('DB_SSLMODE', default='prefer'),
#         }
#     }
# }

DATABASES = {
    "default": dj_database_url.config(
        default=env("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=True,
    )
}

# Ensure pgvector extension is used for AI/ML features
if 'postgresql' in DATABASES['default']['ENGINE']:
    # pgvector will be available in all PostgreSQL connections
    pass
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
    "CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME", default=""),
    "API_KEY": env("CLOUDINARY_API_KEY", default=""),
    "API_SECRET": env("CLOUDINARY_API_SECRET", default=""),
    "SECURE_URL": True,
    "STATICFILES_MANIFEST_ROOT": str(BASE_DIR / "staticfiles"),
}
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Cloudinary delivery defaults for Empindu content
CLOUDINARY_DEFAULT_TRANSFORMATIONS = {
    "profile": {"quality": "auto", "fetch_format": "auto", "crop": "fill", "gravity": "face"},
    "product": {"quality": "auto", "fetch_format": "auto", "crop": "fill", "gravity": "auto"},
    "story": {"quality": "auto", "fetch_format": "auto", "crop": "limit"},
}

# CORS
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "https://empindu.vercel.app",

          
          # Assuming Vercel for production
          # use app.empindu.com in production
    ],
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-empindu-social-secret",
]

SECURE_SSL_REDIRECT = not DEBUG

SESSION_COOKIE_SECURE = True

CSRF_COOKIE_SECURE = True

SECURE_BROWSER_XSS_FILTER = True

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"

SECURE_REFERRER_POLICY = "same-origin"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

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

# ============================================================================
# REST FRAMEWORK CONFIGURATION
# ============================================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    'DEFAULT_THROTTLE_CLASSES': [
        'api.v1.throttles.AuthThrottle',
        'api.v1.throttles.SearchThrottle',
        'api.v1.throttles.CheckoutThrottle',
        'api.v1.throttles.CustomThrottle',
    ],
    
    'DEFAULT_THROTTLE_RATES': {
        'auth': '50/minute',
        'search': '100/minute',
        'checkout': '30/minute',
        'global': '1000/hour',
    }
}




