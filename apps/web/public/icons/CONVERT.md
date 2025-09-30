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
