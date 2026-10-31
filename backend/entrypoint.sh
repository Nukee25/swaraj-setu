#!/bin/sh
set -eu
python -c "from api.db import ensure_indexes; ensure_indexes()"
exec gunicorn swaraj_setu.wsgi:application --bind 0.0.0.0:8000 --workers "${GUNICORN_WORKERS:-2}" --timeout 120
