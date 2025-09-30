#!/bin/bash
set -e

echo "🧹 Cleaning Docker resources..."

docker-compose down -v
docker system prune -af

echo "✅ Cleanup complete!"
