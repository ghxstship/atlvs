#!/bin/bash
set -e

echo "🚀 Starting GHXSTSHIP services..."

docker-compose up -d

echo "✅ Services started!"
echo "📱 Web: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "📊 Redis: localhost:6379"
