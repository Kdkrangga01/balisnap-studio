const sharp = require('sharp');
const fs = require('fs');

async function fixDanceStretch() {
  const file = 'public/stickers/nailong-dance-stretch.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's inspect data: fill alpha = 255 for the neck gap (y=45..78, x=45..155)
  for (let y = 40; y <= 85; y++) {
    for (let x = 30; x <= 160; x++) {
      const idx = (y * w + x) * ch;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      // If it's part of Nailong's neck, yellow border, or inner shading (r > 150), make alpha = 255!
      if (r > 140) {
        data[idx + 3] = 255;
      }
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(file);

  console.log('Fixed nailong-dance-stretch.png: neck gap filled 100% solid!');
}

fixDanceStretch();
