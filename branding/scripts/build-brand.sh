#!/bin/bash
# Build Brand Script - Generate all brand artifacts

set -e

BRAND_ID="${1:-default}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRANDING_DIR="$ROOT_DIR/branding"
WEB_DIR="$ROOT_DIR/apps/web"

echo "🚀 Building brand: $BRAND_ID"

# Validate brand exists
BRAND_CONFIG="$BRANDING_DIR/config/$BRAND_ID.brand.json"
if [ ! -f "$BRAND_CONFIG" ]; then
    echo "❌ Error: Brand configuration not found: $BRAND_CONFIG"
    exit 1
fi

echo "✅ Brand configuration found"

# Create public branding directory
mkdir -p "$WEB_DIR/public/branding/$BRAND_ID"

# Copy brand assets to public directory
if [ -d "$BRANDING_DIR/assets/$BRAND_ID" ]; then
    echo "📦 Copying brand assets..."
    cp -r "$BRANDING_DIR/assets/$BRAND_ID/"* "$WEB_DIR/public/branding/$BRAND_ID/"
    echo "✅ Assets copied successfully"
else
    echo "⚠️  Warning: No assets found for brand $BRAND_ID"
fi

# Copy brand configuration to public directory
echo "📄 Copying brand configuration..."
mkdir -p "$WEB_DIR/public/branding/config"
cp "$BRAND_CONFIG" "$WEB_DIR/public/branding/config/"
echo "✅ Configuration copied"

# Update .env.branding
echo "🔧 Updating environment configuration..."
cat > "$WEB_DIR/.env.branding" << EOF
# Active Brand Configuration
NEXT_PUBLIC_BRAND_ID=$BRAND_ID
NEXT_PUBLIC_BRAND_MODE=runtime
NEXT_PUBLIC_BRAND_CONFIG_URL=/branding/config/$BRAND_ID.brand.json
EOF
echo "✅ Environment updated"

echo ""
echo "✨ Brand '$BRAND_ID' built successfully!"
echo "   Run 'npm run dev' to see your changes"
echo ""
