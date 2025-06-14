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
  // Use smaller font size for better balance and more padding
  const fontSize = Math.floor(actualSize * 0.28); // Reduced from 0.5 to 0.28
  
  // Create a more sophisticated design with gradient background
  const svg = `
    <svg width="${actualSize}" height="${actualSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient background for depth -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
        
        <!-- Subtle inner shadow for depth -->
        <filter id="innerShadow">
          <feGaussianBlur stdDeviation="2" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood flood-color="black" flood-opacity="0.2" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>
        
        <!-- Subtle glow for the text -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background with gradient -->
      <rect width="${actualSize}" height="${actualSize}" fill="url(#bgGradient)" rx="${actualSize * 0.17}" ry="${actualSize * 0.17}"/>
      
      <!-- Subtle border for definition -->
      <rect x="1" y="1" width="${actualSize - 2}" height="${actualSize - 2}" 
            fill="none" stroke="#333333" stroke-width="0.5" opacity="0.3"
            rx="${actualSize * 0.17}" ry="${actualSize * 0.17}"/>
      
      <!-- Main text with improved typography -->
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" 
            font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" 
            font-weight="600" 
            font-size="${fontSize}px" 
            fill="#FFFFFF"
            letter-spacing="${fontSize * 0.08}"
            filter="url(#glow)">
        LYB
      </text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function generateIcons() {
  console.log('Generating premium app icons with modern design...');

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

  console.log('\nAll premium icons generated successfully!');
}

generateIcons().catch(console.error);