import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me-in-production")
DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]
ROOT_URLCONF = "swaraj_setu.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": ["django.template.context_processors.request"]},
}]
WSGI_APPLICATION = "swaraj_setu.wsgi.application"
DATABASES = {"default": {"ENGINE": "django.db.backends.dummy"}}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
USE_TZ = True
TIME_ZONE = "UTC"
ROOT_LOGGER = {"version": 1, "disable_existing_loggers": False}

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/swaraj_setu")
MONGODB_NAME = os.getenv("MONGODB_NAME", "swaraj_setu")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama-nlp:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
JWT_SECRET = os.getenv("JWT_SECRET", SECRET_KEY)
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = 60 * 60 * 24

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["api.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
}
CORS_ALLOW_ALL_ORIGINS = DEBUG
FILE_UPLOAD_MAX_MEMORY_SIZE = 25 * 1024 * 1024
