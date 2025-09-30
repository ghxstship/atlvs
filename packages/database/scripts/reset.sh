#!/bin/bash
set -e

echo "⚠️  WARNING: This will delete all data and reset the database!"
read -p "Are you sure? (yes/no): " -r
echo

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    pnpm prisma migrate reset --force
    echo "✅ Database reset complete!"
else
    echo "❌ Reset cancelled"
    exit 1
fi
