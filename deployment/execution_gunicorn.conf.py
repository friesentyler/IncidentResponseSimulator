# Gunicorn configuration for the Flask Execution Service
import os

bind = "0.0.0.0:5001"  # Flask app runs on 5001
workers = 2  # Small service, 2 workers is plenty
worker_class = "sync"
timeout = 60  # Allow some buffer for longer scripts
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Path to the Flask app
# The deployment script will replace {{PROJECT_ROOT}} with the actual path
pythonpath = "{{PROJECT_ROOT}}/execution-service"
wsgi_app = "app:app"
