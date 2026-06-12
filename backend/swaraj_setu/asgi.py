"""
ASGI config for swaraj_setu project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'swaraj_setu.settings')

application = get_asgi_application()
