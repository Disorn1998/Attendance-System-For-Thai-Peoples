#!/bin/bash
# scripts/deploy.sh
# Deployment script for production VM

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📦 Pulling latest changes from Git..."
git pull origin main

# Build and restart containers
echo "🏗️ Building and restarting Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Run database migrations
echo "🗄️ Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Optional: Run seed if necessary (usually only for first deploy)
# echo "🌱 Seeding database..."
# docker compose -f docker-compose.prod.yml exec -T backend npx prisma db seed

echo "✅ Deployment completed successfully!"
