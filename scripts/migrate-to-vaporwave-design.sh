#!/bin/bash

# Vaporwave Miami Vice Design System Migration Script
# This script helps migrate existing components to use the new pop art shadows and vaporwave colors

echo "🌴 Starting Vaporwave Miami Vice Design System Migration..."

# Define directories to process
DIRS=(
  "apps/web/app/_components"
  "apps/web/app/(marketing)"
  "apps/web/app/(app)"
  "packages/ui/src/components"
)

# Function to add pop art shadows to buttons
migrate_buttons() {
  echo "🎨 Migrating buttons to pop art style..."
  
  for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # Add pop-shadow classes to primary buttons
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/className="btn btn-primary/className="btn btn-primary pop-shadow-hover/g' {} \;
      
      # Add pop art style to CTA buttons
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/className=".*btn.*primary.*"/className="btn-pop"/g' {} \;
      
      echo "  ✅ Updated buttons in $dir"
    fi
  done
}

# Function to add glow effects to headings
migrate_headings() {
  echo "✨ Adding glow effects to headings..."
  
  for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # Add glow effects to main headings
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/className="text-display/className="text-display glow-accent/g' {} \;
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/className="text-h1/className="text-h1 glow-primary/g' {} \;
      
      echo "  ✅ Updated headings in $dir"
    fi
  done
}

# Function to update cards with pop art shadows
migrate_cards() {
  echo "🃏 Migrating cards to pop art style..."
  
  for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # Add pop art shadows to cards
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/className="card /className="card pop-shadow-md border-2 border-black /g' {} \;
      
      # Update interactive cards
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/hover:shadow-lg/pop-shadow-hover/g' {} \;
      
      echo "  ✅ Updated cards in $dir"
    fi
  done
}

# Function to update gradients to use vaporwave colors
migrate_gradients() {
  echo "🌈 Updating gradients to vaporwave style..."
  
  for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # Replace generic gradients with brand-specific ones
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/bg-gradient-to-r from-accent to-primary/ghxstship-gradient/g' {} \;
      find "$dir" -name "*.tsx" -type f -exec sed -i '' 's/bg-gradient-to-r from-primary to-accent/ghxstship-gradient/g' {} \;
      
      echo "  ✅ Updated gradients in $dir"
    fi
  done
}

# Function to add brand-specific theming hints
add_brand_theming_comments() {
  echo "🏷️  Adding brand theming comments..."
  
  # Add comments to help developers understand brand theming
  cat > "docs/BRAND_THEMING_GUIDE.md" << 'EOF'
# Brand-Specific Theming Guide

## Overview
The GHXSTSHIP platform uses a vaporwave Miami Vice color palette with brand-specific theming:

- **ATLVS**: Pink-focused theme (Neon Pink #FF0080, Hot Pink #FF1493, Soft Pink #FF69B4)
- **OPENDECK**: Blue-focused theme (Electric Blue #00FFFF, Miami Blue #0099FF, Deep Blue #006699)
- **Marketing/GHXSTSHIP**: Full vaporwave palette with both pink and blue

## Pop Art Double Shadows
All components can use the pop art shadow system:

```css
/* Basic shadows */
.pop-shadow-sm    /* 3px + 6px offset */
.pop-shadow       /* 4px + 8px offset */
.pop-shadow-md    /* 6px + 12px offset */
.pop-shadow-lg    /* 8px + 16px offset */
.pop-shadow-xl    /* 12px + 24px offset */

/* Interactive shadows */
.pop-shadow-hover /* Hover effect with transform */
.pop-shadow-active /* Active/pressed effect */

/* Color variants */
.pop-shadow-primary
.pop-shadow-success
.pop-shadow-warning
.pop-shadow-destructive
```

## Glow Effects
Add neon glow effects to important elements:

```css
.glow-pink      /* Neon pink glow */
.glow-blue      /* Electric blue glow */
.glow-accent    /* Brand accent glow */
.glow-primary   /* Brand primary glow */
```

## Gradients
Brand-specific gradient utilities:

```css
.atlvs-gradient      /* Pink spectrum */
.opendeck-gradient   /* Blue spectrum */
.ghxstship-gradient  /* Pink to blue */
.gradient-pink-blue  /* Generic pink to blue */
```

## Component Classes
Pre-built component variants:

```css
.btn-pop        /* Pop art button style */
.card-pop       /* Pop art card style */
```

## Usage Examples

### ATLVS Components (Pink Theme)
```tsx
<Button className="btn-pop">ATLVS Action</Button>
<Card className="card-pop glow-pink">ATLVS Content</Card>
<h1 className="text-display glow-pink atlvs-gradient">ATLVS TITLE</h1>
```

### OPENDECK Components (Blue Theme)
```tsx
<Button className="btn btn-primary pop-shadow-hover glow-blue">OPENDECK Action</Button>
<Card className="card pop-shadow-md border-2 border-black">OPENDECK Content</Card>
<h1 className="text-display glow-blue opendeck-gradient">OPENDECK TITLE</h1>
```

### Marketing Components (Full Theme)
```tsx
<Button className="btn-pop">Get Started</Button>
<Card className="card-pop">Feature Card</Card>
<h1 className="text-display glow-accent ghxstship-gradient">THE FUTURE</h1>
```
EOF

  echo "  ✅ Created brand theming guide"
}

# Function to create a validation script
create_validation_script() {
  echo "🔍 Creating validation script..."
  
  cat > "scripts/validate-vaporwave-migration.sh" << 'EOF'
#!/bin/bash

echo "🌴 Validating Vaporwave Design System Migration..."

# Check for old shadow classes that should be migrated
echo "Checking for old shadow classes..."
OLD_SHADOWS=$(find apps packages -name "*.tsx" -type f -exec grep -l "shadow-lg\|shadow-md\|shadow-sm" {} \; | wc -l)
if [ "$OLD_SHADOWS" -gt 0 ]; then
  echo "  ⚠️  Found $OLD_SHADOWS files with old shadow classes"
  find apps packages -name "*.tsx" -type f -exec grep -l "shadow-lg\|shadow-md\|shadow-sm" {} \;
else
  echo "  ✅ No old shadow classes found"
fi

# Check for pop art shadow usage
echo "Checking for pop art shadow adoption..."
POP_SHADOWS=$(find apps packages -name "*.tsx" -type f -exec grep -l "pop-shadow" {} \; | wc -l)
echo "  📊 Found $POP_SHADOWS files using pop art shadows"

# Check for glow effect usage
echo "Checking for glow effect adoption..."
GLOW_EFFECTS=$(find apps packages -name "*.tsx" -type f -exec grep -l "glow-" {} \; | wc -l)
echo "  ✨ Found $GLOW_EFFECTS files using glow effects"

# Check for brand gradient usage
echo "Checking for brand gradient adoption..."
BRAND_GRADIENTS=$(find apps packages -name "*.tsx" -type f -exec grep -l "atlvs-gradient\|opendeck-gradient\|ghxstship-gradient" {} \; | wc -l)
echo "  🌈 Found $BRAND_GRADIENTS files using brand gradients"

echo "🎯 Migration validation complete!"
EOF

  chmod +x "scripts/validate-vaporwave-migration.sh"
  echo "  ✅ Created validation script"
}

# Run migration steps
migrate_buttons
migrate_headings
migrate_cards
migrate_gradients
add_brand_theming_comments
create_validation_script

echo ""
echo "🎉 Vaporwave Miami Vice Design System Migration Complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Updated buttons with pop art shadows"
echo "  ✅ Added glow effects to headings"
echo "  ✅ Migrated cards to pop art style"
echo "  ✅ Updated gradients to vaporwave colors"
echo "  ✅ Created brand theming guide"
echo "  ✅ Created validation script"
echo ""
echo "🔧 Next Steps:"
echo "  1. Run: npm run dev to test the changes"
echo "  2. Run: ./scripts/validate-vaporwave-migration.sh to validate migration"
echo "  3. Review: docs/BRAND_THEMING_GUIDE.md for usage guidelines"
echo ""
echo "🎨 The new design system features:"
echo "  • Pop art double shadows (6px + 12px offset with #000 and accent colors)"
echo "  • Vaporwave Miami Vice color palette"
echo "  • Brand-specific theming (ATLVS=Pink, OPENDECK=Blue, Marketing=Both)"
echo "  • Neon glow effects for important elements"
echo "  • Interactive hover and active states"
echo ""
