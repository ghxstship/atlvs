#!/bin/bash
# Switch Active Brand Script

set -e

if [ -z "$1" ]; then
    echo "Usage: ./switch-brand.sh <brand-id>"
    echo ""
    echo "Available brands:"
    ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
    ls -1 "$ROOT_DIR/branding/config/"*.brand.json | xargs -n 1 basename | sed 's/.brand.json//' | sed 's/^/  - /'
    exit 1
fi

BRAND_ID="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "🔄 Switching to brand: $BRAND_ID"

# Build the brand
"$ROOT_DIR/branding/scripts/build-brand.sh" "$BRAND_ID"

echo ""
echo "✅ Successfully switched to brand: $BRAND_ID"
echo "   Restart your development server to see changes"
echo ""
