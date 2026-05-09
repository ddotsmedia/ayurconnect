#!/usr/bin/env bash
set -euo pipefail

echo "Starting AyurConnect dev infra (postgres, redis, meilisearch, minio)..."
docker compose up -d

echo "Waiting for postgres to be healthy..."
for _ in {1..30}; do
  status=$(docker inspect -f '{{.State.Health.Status}}' ayurconnect-postgres 2>/dev/null || echo unknown)
  if [ "$status" = "healthy" ]; then
    echo "postgres: healthy"
    break
  fi
  sleep 2
done

echo "Service status:"
docker compose ps
