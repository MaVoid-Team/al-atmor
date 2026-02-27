# PWA Icon Generation Guide

## Required Icons

The following icons are required for the PWA to function properly. You need to generate them from your Logo.png file.

### Icon Requirements (in frontend/public):

1. **icon-192x192.png** - 192x192 pixels (regular icon)
2. **icon-192x192-maskable.png** - 192x192 pixels (maskable icon for adaptive displays)
3. **icon-512x512.png** - 512x512 pixels (regular icon)
4. **icon-512x512-maskable.png** - 512x512 pixels (maskable icon for adaptive displays)
5. **favicon.ico** - Already exists in public folder (can keep as is)

### Option 1: Using Online Tool (Easiest)

1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload your Logo.png file
3. Download the generated icons
4. Extract and place the PNG files in frontend/public/

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick if not already installed
brew install imagemagick  # macOS
# or
choco install imagemagick # Windows (via Chocolatey)

# Generate 192x192
convert frontend/public/Logo.png -resize 192x192 frontend/public/icon-192x192.png

# Generate 512x512
convert frontend/public/Logo.png -resize 512x512 frontend/public/icon-512x512.png

# For maskable icons (add transparency/padding)
convert frontend/public/Logo.png -resize 192x192 -background none -gravity center -extent 192x192 frontend/public/icon-192x192-maskable.png
convert frontend/public/Logo.png -resize 512x512 -background none -gravity center -extent 512x512 frontend/public/icon-512x512-maskable.png
```

### Option 3: Using Node.js (sharp library)

You already have `sharp` installed! Create a script:

```javascript
// generate-icons.js
const sharp = require('sharp');
const path = require('path');

const logoPath = path.join(__dirname, 'public/Logo.png');
const publicPath = path.join(__dirname, 'public');

async function generateIcons() {
  try {
    // Generate 192x192
    await sharp(logoPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicPath, 'icon-192x192.png'));
    console.log('✓ Generated icon-192x192.png');

    // Generate 512x512
    await sharp(logoPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicPath, 'icon-512x512.png'));
    console.log('✓ Generated icon-512x512.png');

    // Generate maskable variants (with padding)
    await sharp(logoPath)
      .resize(150, 150)
      .png()
      .toFile(path.join(publicPath, 'icon-192x192-maskable.png'));
    console.log('✓ Generated icon-192x192-maskable.png');

    await sharp(logoPath)
      .resize(400, 400)
      .png()
      .toFile(path.join(publicPath, 'icon-512x512-maskable.png'));
    console.log('✓ Generated icon-512x512-maskable.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
```

Run it:
```bash
node generate-icons.js
```

## Next Steps
After generating icons:
1. Verify all PNG files are in frontend/public/
2. Continue with next.config.ts configuration
3. Build and test the PWA

## Verification
In DevTools when testing locally:
1. Open DevTools → Application tab → Manifest
2. Icons should load without 404 errors
3. Install prompt should appear when all requirements are met
