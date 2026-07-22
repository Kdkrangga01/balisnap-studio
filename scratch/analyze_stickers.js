const sharp = require('sharp');
const fs = require('fs');

const files = [
  'public/stickers/cute-angry-cat.jpg',
  'public/stickers/cute-helmet-cat.jpg',
  'public/stickers/cat-hipster.png.jpg',
  'public/stickers/cat-blue-ribbon.png.jpg',
  'public/stickers/cat-pink-ribbon.png.jpg',
  'public/stickers/dino-yellow.png.jpg'
];

async function run() {
  for (const f of files) {
    if (fs.existsSync(f)) {
      const meta = await sharp(f).metadata();
      const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
      console.log(`File: ${f}, Size: ${info.width}x${info.height}, Channels: ${info.channels}`);
      // sample top-left, top-right, bottom-left, bottom-right corner pixels
      const getPixel = (x, y) => {
        const idx = (y * info.width + x) * info.channels;
        return [data[idx], data[idx+1], data[idx+2]];
      };
      console.log('  Top-Left (0,0):', getPixel(0, 0));
      console.log('  Top-Right:', getPixel(info.width - 1, 0));
      console.log('  Bottom-Left:', getPixel(0, info.height - 1));
      console.log('  Bottom-Right:', getPixel(info.width - 1, info.height - 1));
    }
  }
}

run();
