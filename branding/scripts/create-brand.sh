#!/bin/bash
# Create New Brand Script - Bootstrap a new brand configuration

set -e

if [ -z "$1" ]; then
    echo "Usage: ./create-brand.sh <brand-id> [brand-name]"
    echo ""
    echo "Example: ./create-brand.sh mybrand \"My Brand\""
    exit 1
fi

BRAND_ID="$1"
BRAND_NAME="${2:-$BRAND_ID}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRANDING_DIR="$ROOT_DIR/branding"

echo "🎨 Creating new brand: $BRAND_ID"

# Check if brand already exists
if [ -f "$BRANDING_DIR/config/$BRAND_ID.brand.json" ]; then
    echo "❌ Error: Brand '$BRAND_ID' already exists!"
    exit 1
fi

# Create brand configuration from template
echo "📄 Creating brand configuration..."
cat > "$BRANDING_DIR/config/$BRAND_ID.brand.json" << EOF
{
  "version": "1.0.0",
  "brand": {
    "id": "$BRAND_ID",
    "name": "$BRAND_NAME",
    "slug": "$BRAND_ID",
    "tagline": "Your tagline here",
    "description": "Complete enterprise solution for managing projects, people, and resources.",
    "website": "https://$BRAND_ID.com",
    "support": {
      "email": "support@$BRAND_ID.com",
      "phone": "+1 (800) 555-0000",
      "website": "https://help.$BRAND_ID.com"
    },
    "legal": {
      "company": "$BRAND_NAME Inc.",
      "address": "123 Main St, San Francisco, CA 94105",
      "termsUrl": "/legal/terms",
      "privacyUrl": "/legal/privacy"
    }
  },
  "theme": {
    "mode": "light",
    "colors": {
      "brand": {
        "primary": "#3B82F6",
        "secondary": "#64748B",
        "accent": "#8B5CF6"
      },
      "semantic": {
        "success": "#10B981",
        "warning": "#F59E0B",
        "error": "#EF4444",
        "info": "#3B82F6"
      },
      "neutral": {
        "50": "#F8FAFC",
        "100": "#F1F5F9",
        "200": "#E2E8F0",
        "300": "#CBD5E1",
        "400": "#94A3B8",
        "500": "#64748B",
        "600": "#475569",
        "700": "#334155",
        "800": "#1E293B",
        "900": "#0F172A"
      }
    },
    "typography": {
      "fontFamily": {
        "heading": "Inter, system-ui, sans-serif",
        "body": "Inter, system-ui, sans-serif",
        "mono": "JetBrains Mono, monospace"
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem"
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      }
    },
    "spacing": {
      "xs": "0.25rem",
      "sm": "0.5rem",
      "md": "1rem",
      "lg": "1.5rem",
      "xl": "2rem",
      "2xl": "3rem",
      "3xl": "4rem"
    },
    "borderRadius": {
      "sm": "0.125rem",
      "base": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "base": "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  },
  "assets": {
    "logos": {
      "primary": "/branding/$BRAND_ID/logos/primary.svg",
      "icon": "/branding/$BRAND_ID/logos/icon.svg",
      "wordmark": "/branding/$BRAND_ID/logos/wordmark.svg"
    },
    "favicon": "/branding/$BRAND_ID/logos/favicon.ico",
    "images": {
      "hero": "/branding/$BRAND_ID/images/hero-background.jpg",
      "auth": "/branding/$BRAND_ID/images/auth-background.jpg",
      "placeholder": "/branding/$BRAND_ID/images/placeholder-avatar.png"
    }
  },
  "content": {
    "app": {
      "name": "$BRAND_NAME",
      "shortName": "$BRAND_ID",
      "welcomeMessage": "Welcome to $BRAND_NAME",
      "loginPrompt": "Sign in to your account",
      "signupPrompt": "Create your account"
    },
    "navigation": {
      "dashboard": "Dashboard",
      "projects": "Projects",
      "people": "People",
      "finance": "Finance",
      "assets": "Assets",
      "jobs": "Jobs",
      "companies": "Companies",
      "programming": "Programming",
      "analytics": "Analytics",
      "files": "Files",
      "settings": "Settings",
      "profile": "Profile"
    },
    "terminology": {
      "project": "project",
      "task": "task",
      "team": "team",
      "member": "member",
      "budget": "budget",
      "expense": "expense"
    }
  },
  "features": {
    "modules": {
      "dashboard": true,
      "projects": true,
      "people": true,
      "finance": true,
      "assets": true,
      "jobs": true,
      "companies": true,
      "programming": true,
      "analytics": true,
      "files": true,
      "settings": true,
      "profile": true
    }
  },
  "seo": {
    "title": "$BRAND_NAME — Enterprise SaaS Platform",
    "description": "Complete enterprise solution for managing projects, people, and resources.",
    "keywords": ["enterprise", "saas", "project management"],
    "ogImage": "/branding/$BRAND_ID/images/og-image.jpg"
  }
}
EOF

echo "✅ Brand configuration created"

# Create asset directories
echo "📁 Creating asset directories..."
mkdir -p "$BRANDING_DIR/assets/$BRAND_ID/logos"
mkdir -p "$BRANDING_DIR/assets/$BRAND_ID/images"
mkdir -p "$BRANDING_DIR/assets/$BRAND_ID/fonts"
echo "✅ Asset directories created"

# Add to brands registry
echo "📝 Updating brands registry..."
BRANDS_FILE="$BRANDING_DIR/config/brands.json"

# Create temporary file with updated brands
node -e "
const fs = require('fs');
const brands = JSON.parse(fs.readFileSync('$BRANDS_FILE', 'utf8'));
brands.brands.push({
  id: '$BRAND_ID',
  name: '$BRAND_NAME',
  slug: '$BRAND_ID',
  description: '$BRAND_NAME Brand Configuration',
  domains: ['$BRAND_ID.com', 'app.$BRAND_ID.com'],
  enabled: true,
  isDefault: false
});
fs.writeFileSync('$BRANDS_FILE', JSON.stringify(brands, null, 2));
"

echo "✅ Brand registered"

echo ""
echo "✨ Brand '$BRAND_ID' created successfully!"
echo ""
echo "Next steps:"
echo "  1. Edit branding/config/$BRAND_ID.brand.json to customize your brand"
echo "  2. Add logos to branding/assets/$BRAND_ID/logos/"
echo "  3. Add images to branding/assets/$BRAND_ID/images/"
echo "  4. Run: npm run brand:build $BRAND_ID"
echo "  5. Run: npm run brand:switch $BRAND_ID"
echo ""
