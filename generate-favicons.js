const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = path.join(__dirname, '../project/public/Franx Studio Circlle Logo.png');
const outputDir = path.join(__dirname, '../project/public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate favicon-16x16.png
sharp(sourceImage)
  .resize(16, 16)
  .toFile(path.join(outputDir, 'favicon-16x16.png'))
  .then(() => console.log('Generated favicon-16x16.png'))
  .catch(err => console.error('Error generating favicon-16x16.png:', err));

// Generate favicon-32x32.png
sharp(sourceImage)
  .resize(32, 32)
  .toFile(path.join(outputDir, 'favicon-32x32.png'))
  .then(() => console.log('Generated favicon-32x32.png'))
  .catch(err => console.error('Error generating favicon-32x32.png:', err));

// Generate apple-touch-icon.png
sharp(sourceImage)
  .resize(180, 180)
  .toFile(path.join(outputDir, 'apple-touch-icon.png'))
  .then(() => console.log('Generated apple-touch-icon.png'))
  .catch(err => console.error('Error generating apple-touch-icon.png:', err));

// Generate safari-pinned-tab.svg
sharp(sourceImage)
  .resize(512, 512)
  .toFile(path.join(outputDir, 'safari-pinned-tab.svg'))
  .then(() => console.log('Generated safari-pinned-tab.svg'))
  .catch(err => console.error('Error generating safari-pinned-tab.svg:', err)); 