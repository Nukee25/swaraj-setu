"""
WSGI config for swaraj_setu project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'swaraj_setu.settings')

application = get_wsgi_application()
