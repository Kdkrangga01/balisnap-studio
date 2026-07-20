const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const templatesDir = path.join(__dirname, '../public/templates');

async function convertAll() {
  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.svg'));
  console.log(`Found ${files.length} SVG files to convert to PNG.`);
  for (const file of files) {
    const svgPath = path.join(templatesDir, file);
    const pngPath = path.join(templatesDir, file.replace('.svg', '.png'));
    console.log(`Converting ${file} to PNG...`);
    try {
      await sharp(svgPath).png().toFile(pngPath);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err);
    }
  }
  console.log('Conversion completed.');
}

convertAll();
