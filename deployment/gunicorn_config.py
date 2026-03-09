# Gunicorn configuration for IncidentResponseSimulator

bind = "127.0.0.1:8000"
workers = 3  # Adjusted for small VMs (usually 1-2 cores)
worker_class = "sync"
timeout = 120
keepalive = 5
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Django settings
pythonpath = "{{PROJECT_ROOT}}/backend/django_backend"
wsgi_app = "IncidentResponseSimulator.wsgi:application"
