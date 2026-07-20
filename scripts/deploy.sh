#!/bin/bash
# AURA Learn Deployment Script
set -e

echo "=== AURA Learn Deployment ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose required"; exit 1; }

# Build and deploy
echo "Building images..."
docker-compose build

echo "Starting services..."
docker-compose up -d

echo "Running migrations..."
docker-compose exec -T backend alembic upgrade head

echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Health:   http://localhost:8000/health"
