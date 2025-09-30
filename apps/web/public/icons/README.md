# PWA Icons

## Required Icons

Create the following icons for PWA support:

1. **icon-192x192.png** (192x192 pixels)
   - Purpose: Android home screen, splash screen
   - Format: PNG with transparency
   - Design: GHXSTSHIP logo on dark background

2. **icon-512x512.png** (512x512 pixels)
   - Purpose: High-resolution displays, splash screens
   - Format: PNG with transparency
   - Design: GHXSTSHIP logo on dark background

3. **apple-touch-icon.png** (180x180 pixels)
   - Purpose: iOS home screen
   - Format: PNG (no transparency needed)
   - Design: GHXSTSHIP logo on dark background

## Design Guidelines

- Use the GHXSTSHIP brand colors (black background)
- Ensure logo is centered and has appropriate padding
- Test on both light and dark device themes
- Verify icons look good at all sizes

## Tools

- Figma/Sketch for design
- ImageOptim for compression
- PWA Asset Generator: https://github.com/elegantapp/pwa-asset-generator

## Quick Generation

```bash
npx pwa-asset-generator logo.svg ./public/icons \
  --icon-only \
  --favicon \
  --type png \
  --padding "10%"
```
