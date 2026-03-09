# Gunicorn configuration for IncidentResponseSimulator

bind = "127.0.0.1:8000"
workers = 4  # Recommended: (2 * number of cores) + 1
loglevel = "info"
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stdout

# Django settings
pythonpath = "/Users/tylerfriesen/Documents/IncidentResponseSimulator/backend/django_backend"
wsgi_app = "IncidentResponseSimulator.wsgi:application"
