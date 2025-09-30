#!/bin/bash
set -e

echo "⏹️  Stopping GHXSTSHIP services..."

docker-compose down

echo "✅ Services stopped!"
