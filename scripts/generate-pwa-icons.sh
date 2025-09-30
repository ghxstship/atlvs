#!/bin/bash

# Generate PWA Icons for GHXSTSHIP
# This script creates placeholder icons using base64 encoded SVG

set -e

ICONS_DIR="apps/web/public/icons"
mkdir -p "$ICONS_DIR"

echo "🎨 Generating PWA Icons for GHXSTSHIP..."

# Create SVG template with GHXSTSHIP branding
create_svg() {
    local size=$1
    local output=$2
    
    cat > "$output" << 'EOF'
<svg width="SIZE" height="SIZE" xmlns="http://www.w3.org/2000/svg">
  <rect width="SIZE" height="SIZE" fill="#000000"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="FONTSIZE" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
    GHXST
  </text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="FONTSIZE2" font-weight="bold" fill="#3B82F6" text-anchor="middle" dominant-baseline="middle">
    SHIP
  </text>
</svg>
EOF
    
    # Replace SIZE placeholders
    sed -i '' "s/SIZE/$size/g" "$output"
    sed -i '' "s/FONTSIZE/$((size / 6))/g" "$output"
    sed -i '' "s/FONTSIZE2/$((size / 8))/g" "$output"
}

# Generate 192x192 icon
echo "  Creating icon-192x192.svg..."
create_svg 192 "$ICONS_DIR/icon-192x192.svg"

# Generate 512x512 icon
echo "  Creating icon-512x512.svg..."
create_svg 512 "$ICONS_DIR/icon-512x512.svg"

# Generate apple-touch-icon
echo "  Creating apple-touch-icon.svg..."
create_svg 180 "$ICONS_DIR/apple-touch-icon.svg"

# Create a README for conversion
cat > "$ICONS_DIR/CONVERT.md" << 'EOF'
# Converting SVG to PNG

The SVG icons have been generated. To convert them to PNG format:

## Option 1: Using ImageMagick (Recommended)
```bash
brew install imagemagick

# Convert icons
magick apps/web/public/icons/icon-192x192.svg apps/web/public/icons/icon-192x192.png
magick apps/web/public/icons/icon-512x512.svg apps/web/public/icons/icon-512x512.png
magick apps/web/public/icons/apple-touch-icon.svg apps/web/public/icons/apple-touch-icon.png
```

## Option 2: Using Online Tools
1. Visit https://cloudconvert.com/svg-to-png
2. Upload each SVG file
3. Download the PNG versions
4. Place in apps/web/public/icons/

## Option 3: Using Node.js
```bash
npm install -g svg2png-cli
svg2png apps/web/public/icons/icon-192x192.svg -o apps/web/public/icons/icon-192x192.png
svg2png apps/web/public/icons/icon-512x512.svg -o apps/web/public/icons/icon-512x512.png
svg2png apps/web/public/icons/apple-touch-icon.svg -o apps/web/public/icons/apple-touch-icon.png
```

## Verification
After conversion, verify the icons:
```bash
ls -lh apps/web/public/icons/*.png
```

You should see:
- icon-192x192.png (192x192 pixels)
- icon-512x512.png (512x512 pixels)
- apple-touch-icon.png (180x180 pixels)
EOF

echo ""
echo "✅ SVG icons generated successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Install ImageMagick: brew install imagemagick"
echo "  2. Convert SVG to PNG: see $ICONS_DIR/CONVERT.md"
echo "  3. Or use online converter: https://cloudconvert.com/svg-to-png"
echo ""
echo "📁 Icons location: $ICONS_DIR"
echo ""
