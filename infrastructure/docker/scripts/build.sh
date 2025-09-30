#!/bin/bash
set -e

echo "🐳 Building Docker images..."

docker-compose build --no-cache

echo "✅ Build complete!"
