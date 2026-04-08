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
  apiUrl: '/api/',
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

PROJECT_ROOT=$(pwd) # Capture root before entering backend dir

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
# Ensure STATIC_ROOT is set relative to project root if not in settings
export STATIC_ROOT="$PROJECT_ROOT/backend/django_backend/static"
python manage.py collectstatic --noinput
python manage.py migrate
cd ../../

# 4. Finalize Infrastructure Configs
echo "🛠️ Finalizing Nginx and Gunicorn configs..."
# PROJECT_ROOT is already set above
# Use a temporary file to avoid editing the template directly in place
sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" deployment/nginx.conf > deployment/nginx_final.conf
sed "s|{{PROJECT_ROOT}}|$PROJECT_ROOT|g" deployment/gunicorn_config.py > deployment/gunicorn_final.conf

# 5. Reload Services
echo "🔄 Reloading Application Services..."

# Restart Gunicorn (App Server)
pkill -f "gunicorn" || true
nohup backend/venv/bin/gunicorn -c "$PROJECT_ROOT/deployment/gunicorn_final.conf" > gunicorn.log 2>&1 &

# Restart Nginx (Reverse Proxy)
if command -v systemctl >/dev/null 2>&1; then
    echo "⚙️ Applying Nginx configuration..."
    # Remove the default nginx config to avoid conflicts with 'default_server'
    rm -f /etc/nginx/sites-enabled/default
    
    cp deployment/nginx_final.conf /etc/nginx/sites-available/incident_response
    ln -sf /etc/nginx/sites-available/incident_response /etc/nginx/sites-enabled/
    
    # Fix permissions for Nginx to access the root folder
    echo "🔐 Setting directory permissions..."
    chmod +x /root
    chmod +x "$PROJECT_ROOT"
    chmod +x "$PROJECT_ROOT/backend"
    chmod +x "$PROJECT_ROOT/backend/django_backend"
    chmod -R 755 "$PROJECT_ROOT/backend/django_backend/static"

    nginx -t
    systemctl restart nginx
else
    echo "⚠️ systemctl not found, skipping nginx restart."
fi

echo "✅ Deployment complete!"
