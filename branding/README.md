# ATLVS Whitelabel Branding System

Complete whitelabel branding system enabling unlimited brand configurations with single-source control over all UI aesthetics, content, and assets.

## 🎯 Quick Start

### List Available Brands
```bash
npm run brand:list
```

### Switch Brand
```bash
npm run brand:switch ghxstship
npm run dev
```

### Build Brand Assets
```bash
npm run brand:build default
```

## 📁 Directory Structure

```
branding/
├── config/              # Brand configurations (.json)
│   ├── brands.json     # Brand registry
│   ├── default.brand.json
│   ├── ghxstship.brand.json
│   └── opendeck.brand.json
│
├── assets/             # Brand-specific assets
│   ├── default/
│   ├── ghxstship/
│   └── opendeck/
│
├── content/            # Brand-specific content (future)
├── themes/             # Generated CSS themes (future)
└── scripts/            # Automation tools
    ├── build-brand.sh
    └── switch-brand.sh
```

## 🎨 Brand Configuration

Each brand has a complete JSON configuration defining:

- **Brand Info**: Name, tagline, description, support, legal
- **Theme**: Colors, typography, spacing, borders, shadows
- **Assets**: Logos, favicon, images, custom fonts
- **Content**: App labels, navigation, terminology, marketing
- **Features**: Module flags, integrations, customization
- **SEO**: Meta tags, OG images, social handles

### Example Configuration

```json
{
  "brand": {
    "id": "ghxstship",
    "name": "GHXSTSHIP",
    "tagline": "Enterprise Command Center"
  },
  "theme": {
    "colors": {
      "brand": {
        "primary": "#0F172A",
        "accent": "#3B82F6"
      }
    },
    "typography": {
      "fontFamily": {
        "heading": "ANTON, Impact, sans-serif"
      }
    }
  },
  "content": {
    "navigation": {
      "dashboard": "Command Center",
      "projects": "Missions",
      "people": "Crew"
    },
    "terminology": {
      "project": "mission",
      "team": "crew",
      "member": "sailor"
    }
  }
}
```

## 💻 Usage in Code

### React Components

```tsx
import { useBrand, useBrandContent, useBrandAssets } from '@/platform/brand';

function Header() {
  const { brand } = useBrand();
  const content = useBrandContent();
  const assets = useBrandAssets();

  return (
    <header>
      <img src={assets?.logos.primary} alt={brand?.brand.name} />
      <h1>{content?.app.name}</h1>
    </header>
  );
}
```

### Terminology

```tsx
import { useBrandTerminology, useBrandLabel } from '@/platform/brand';

function ProjectsList() {
  const t = useBrandTerminology();
  const label = useBrandLabel('projects');

  return (
    <div>
      <h2>{label}</h2> {/* "Missions" for GHXSTSHIP */}
      <p>Create a new {t('project')}</p> {/* "mission" */}
    </div>
  );
}
```

### Server-Side

```tsx
import { brandLoader } from '@/platform/brand/loader';

export default async function Layout({ children }) {
  const brand = await brandLoader.getActiveBrand();

  return (
    <html>
      <head>
        <title>{brand.seo.title}</title>
        <link rel="icon" href={brand.assets.favicon} />
      </head>
      <body>
        <BrandProvider initialBrand={brand}>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
```

## 🔧 Creating a New Brand

1. **Create brand configuration**
   ```bash
   cp branding/config/default.brand.json branding/config/mybrand.brand.json
   ```

2. **Edit configuration**
   - Update brand info, colors, typography
   - Customize navigation labels and terminology
   - Configure enabled modules

3. **Add brand assets**
   ```bash
   mkdir -p branding/assets/mybrand/logos
   mkdir -p branding/assets/mybrand/images
   # Add your logos, favicon, and images
   ```

4. **Register brand**
   Edit `branding/config/brands.json`:
   ```json
   {
     "brands": [
       {
         "id": "mybrand",
         "name": "My Brand",
         "slug": "mybrand",
         "domains": ["mybrand.com"],
         "enabled": true
       }
     ]
   }
   ```

5. **Build and test**
   ```bash
   npm run brand:switch mybrand
   npm run dev
   ```

## 🚀 Available Hooks

- `useBrand()` - Complete brand configuration
- `useBrandTheme()` - Theme values (colors, typography, spacing)
- `useBrandAssets()` - Asset paths (logos, images)
- `useBrandContent()` - Content strings (labels, copy)
- `useBrandTerminology()` - Custom terminology mapper
- `useBrandLabel(key)` - Get specific navigation label
- `useBrandName()` - Get brand name
- `useBrandColors()` - Get color palette
- `useModuleEnabled(module)` - Check if module enabled
- `useEnabledModules()` - Get all enabled modules

## 📋 Available Scripts

```bash
npm run brand:list        # List all available brands
npm run brand:build <id>  # Build specific brand
npm run brand:switch <id> # Switch active brand
```

## 🎨 Current Brands

### ATLVS (Default)
- Professional SaaS aesthetic
- Blue/neutral color scheme
- Standard module names

### GHXSTSHIP
- Bold nautical theme
- Dark navy colors
- Pirate terminology ("Missions", "Crew", "Fleet")

### OPENDECK
- Marketplace aesthetic
- Vibrant accent colors
- Commerce-focused

## 🔐 Environment Variables

```env
NEXT_PUBLIC_BRAND_ID=ghxstship
NEXT_PUBLIC_BRAND_MODE=runtime
NEXT_PUBLIC_BRAND_CONFIG_URL=/branding/config/ghxstship.brand.json
```

## 📚 Documentation

See `/docs/WHITELABEL_PLAN.md` for complete implementation plan and architecture details.

## 🎯 Features

✅ Single-source brand control  
✅ Runtime brand switching  
✅ Domain-based auto-detection  
✅ Complete UI theming  
✅ Custom terminology  
✅ Asset management  
✅ Module gating  
✅ Type-safe configurations  
✅ Zero code changes required  

## 🔄 Workflow

1. **Development**: Use default brand or switch as needed
2. **Preview**: Test different brands locally
3. **Deploy**: Build with specific brand or support multi-brand
4. **Switch**: Change active brand anytime with one command

---

**Ready to whitelabel your entire SaaS platform from a single configuration!** 🎨
