"""
ASGI config for swaraj_setu project.
"""
import os
import django
from django.conf import settings
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'swaraj_setu.settings')
django.setup()

application = get_asgi_application()
