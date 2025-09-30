#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}

echo "🔄 Running migrations for environment: $ENVIRONMENT"

case $ENVIRONMENT in
  dev)
    pnpm prisma migrate dev
    ;;
  staging|prod)
    pnpm prisma migrate deploy
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ Migration complete!"
