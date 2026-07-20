#!/bin/bash
# AURA Learn Database Backup Script
set -e
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL..."
docker-compose exec -T postgres pg_dump -U postgres auralearn > "$BACKUP_DIR/database.sql"

echo "Backing up Redis..."
docker-compose exec -T redis redis-cli SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis.rdb"

echo "Backup saved to: $BACKUP_DIR"
