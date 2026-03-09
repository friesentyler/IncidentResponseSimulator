#!/bin/bash

# Deployment script for the Execution Service (Flask)
# This script handles the build and service management on the Attack VM.

set -e

echo "🚀 Starting Execution Service deployment..."

# 1. Setup Python Backend
echo "🐍 Setting up Flask environment..."
cd execution-service

# Create virtualenv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtualenv..."
    python3 -m venv venv
fi

source venv/bin/activate
# Skip pip upgrade to reduce network calls; use --no-cache-dir for reliability
pip install --no-cache-dir -r requirements.txt

cd ..

# 2. Finalize Infrastructure Configs
echo "🛠️ Finalizing Gunicorn config..."
PROJECT_ROOT=$(pwd)
sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" deployment/execution_gunicorn.conf.py > deployment/execution_gunicorn_final.conf.py

# 3. Reload Services
echo "🔄 Reloading Execution Service..."

# Restart Gunicorn (App Server)
# We use pkill for simplicity as requested/used in the other script
pkill -f "gunicorn.*execution_gunicorn_final" || true
# Kill anything on port 5001 just in case
fuser -k 5001/tcp || true

nohup execution-service/venv/bin/gunicorn -c deployment/execution_gunicorn_final.conf.py > execution_gunicorn.log 2>&1 &

echo "✅ Execution Service deployment complete!"
