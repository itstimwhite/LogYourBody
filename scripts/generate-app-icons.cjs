const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Icon sizes for different platforms
const iconSizes = {
  // iOS App Icons
  ios: [
    { size: 20, scale: 1, name: 'AppIcon-20.png' },
    { size: 20, scale: 2, name: 'AppIcon-20@2x.png' },
    { size: 20, scale: 3, name: 'AppIcon-20@3x.png' },
    { size: 29, scale: 1, name: 'AppIcon-29.png' },
    { size: 29, scale: 2, name: 'AppIcon-29@2x.png' },
    { size: 29, scale: 3, name: 'AppIcon-29@3x.png' },
    { size: 40, scale: 1, name: 'AppIcon-40.png' },
    { size: 40, scale: 2, name: 'AppIcon-40@2x.png' },
    { size: 40, scale: 3, name: 'AppIcon-40@3x.png' },
    { size: 60, scale: 2, name: 'AppIcon-60@2x.png' },
    { size: 60, scale: 3, name: 'AppIcon-60@3x.png' },
    { size: 76, scale: 1, name: 'AppIcon-76.png' },
    { size: 76, scale: 2, name: 'AppIcon-76@2x.png' },
    { size: 83.5, scale: 2, name: 'AppIcon-83.5@2x.png' },
    { size: 1024, scale: 1, name: 'AppIcon-1024.png' },
    // iPad specific
    { size: 20, scale: 1, name: 'AppIcon-20-ipad.png' },
    { size: 20, scale: 2, name: 'AppIcon-20@2x-ipad.png' },
    { size: 29, scale: 1, name: 'AppIcon-29-ipad.png' },
    { size: 29, scale: 2, name: 'AppIcon-29@2x-ipad.png' },
    { size: 40, scale: 1, name: 'AppIcon-40-ipad.png' },
    { size: 40, scale: 2, name: 'AppIcon-40@2x-ipad.png' },
  ],
  // Web icons
  web: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ]
};

async function generateIcon(size) {
  const actualSize = size;
  const fontSize = Math.floor(actualSize * 0.5);
  const padding = Math.floor(actualSize * 0.1);

  // Create SVG with black background and white text
  const svg = `
    <svg width="${actualSize}" height="${actualSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${actualSize}" height="${actualSize}" fill="#000000"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
            font-family="SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif" 
            font-weight="bold" font-size="${fontSize}px" fill="#FFFFFF">
        LYB
      </text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function generateIcons() {
  console.log('Generating app icons with black background and white text...');

  // Generate iOS icons
  const iosPath = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
  
  for (const icon of iconSizes.ios) {
    const size = icon.size * icon.scale;
    const buffer = await generateIcon(size);
    const outputPath = path.join(iosPath, icon.name);
    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${icon.name} (${size}x${size})`);
  }

  // Generate web icons
  const publicPath = path.join(__dirname, '../public');
  
  for (const icon of iconSizes.web) {
    const buffer = await generateIcon(icon.size);
    const outputPath = path.join(publicPath, icon.name);
    await sharp(buffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate favicon.ico (multi-resolution)
  const icon16 = await generateIcon(16);
  const icon32 = await generateIcon(32);
  const icon48 = await generateIcon(48);

  // For now, just copy the 32x32 as favicon.ico
  await sharp(icon32)
    .resize(32, 32)
    .toFile(path.join(publicPath, 'favicon.ico'));
  console.log('✓ Generated favicon.ico');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);