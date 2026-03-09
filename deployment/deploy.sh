#!/bin/bash

# Deployment script for IncidentResponseSimulator
# This script handles the build and service management for a production deployment.

set -e

echo "🚀 Starting production deployment process..."

# 1. Setup Environment Files
echo "📝 Setting up environment files..."

# Create Django .env
cat > backend/.env <<EOL
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_PRODUCT_ID=${STRIPE_PRODUCT_ID}
EXECUTION_SERVICE_URL=${EXECUTION_SERVICE_URL}
DEBUG=False
EOL

# Create Angular environment.ts
# Note: In production, Nginx serves on port 80/443, so we drop the :8000
mkdir -p frontend/angular_frontend/src/environments
cat > frontend/angular_frontend/src/environments/environment.ts <<EOL
export const environment = {
  production: true,
  apiUrl: 'http://${SSH_HOST}/api/',
  stripePublishableKey: '${STRIPE_PUBLISHABLE_KEY}'
};
EOL

# 2. Build Angular Frontend
echo "🏗️ Building Angular frontend..."
cd frontend/angular_frontend
# Using 'npm ci' for faster, more reliable installs in CI/CD
npm ci --no-audit --no-fund
# Building with no-progress to keep logs clean and help identify hangs
npm run build -- --configuration=production --progress=false
cd ../../

# 3. Setup Django Backend
echo "🐍 Setting up Django backend..."
cd backend

# Activate virtualenv
if [ ! -d "venv" ]; then
    echo "📦 Creating virtualenv..."
    python3.14 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cd django_backend
python manage.py collectstatic --noinput
python manage.py migrate
cd ../../

# 4. Finalize Infrastructure Configs
echo "🛠️ Finalizing Nginx and Gunicorn configs..."
PROJECT_ROOT=$(pwd)
# Use a temporary file to avoid editing the template directly in place
sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" deployment/nginx.conf > deployment/nginx_final.conf
sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" deployment/gunicorn_config.py > deployment/gunicorn_final.conf

# 5. Reload Services
echo "🔄 Reloading Application Services..."

# Restart Gunicorn (App Server)
pkill -f "gunicorn" || true
nohup backend/venv/bin/gunicorn -c deployment/gunicorn_final.conf > gunicorn.log 2>&1 &

# Restart Nginx (Reverse Proxy)
if command -v systemctl >/dev/null 2>&1; then
    systemctl restart nginx
else
    echo "⚠️ systemctl not found, skipping nginx restart. (This script is intended for Linux production servers)"
fi

echo "✅ Deployment complete!"
