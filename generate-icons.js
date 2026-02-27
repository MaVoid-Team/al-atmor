const sharp = require('sharp');
const path = require('path');

const logoPath = path.join(__dirname, 'frontend/public/Logo.png');
const publicPath = path.join(__dirname, 'frontend/public');

async function generateIcons() {
  try {
    // Generate 192x192
    await sharp(logoPath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(publicPath, 'icon-192x192.png'));
    console.log('✓ Generated icon-192x192.png');

    // Generate 512x512
    await sharp(logoPath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(publicPath, 'icon-512x512.png'));
    console.log('✓ Generated icon-512x512.png');

    // Generate maskable variants (with padding for adaptive icons)
    await sharp(logoPath)
      .resize(168, 168, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicPath, 'icon-192x192-maskable.png'));
    console.log('✓ Generated icon-192x192-maskable.png');

    await sharp(logoPath)
      .resize(448, 448, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({ top: 32, bottom: 32, left: 32, right: 32, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(publicPath, 'icon-512x512-maskable.png'));
    console.log('✓ Generated icon-512x512-maskable.png');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
