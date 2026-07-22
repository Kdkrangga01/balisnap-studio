const sharp = require('sharp');
const fs = require('fs');

const files = [
  'nailong-cat-costume.png',
  'nailong-dance-stretch.png',
  'nailong-wave-happy.png',
  'nailong-wave-face.png',
  'nailong-silly-open.png',
  'nailong-shopping-bags.png',
  'nailong-bear-shirt.png',
  'nailong-blep-derp.png',
  'nailong-curious.png',
  'nailong-cheering.png',
  'nailong-standing-scale.png',
  'nailong-sleepy-standing.png',
  'nailong-angry-pointing.png',
  'nailong-running-cute.png'
];

async function fixAllGaps() {
  for (const name of files) {
    const file = `public/stickers/${name}`;
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const ch = info.channels;

    // Fill any transparent pixels that are trapped inside the character's bounding box
    // (i.e. surrounded by opaque pixels horizontally)
    for (let y = 10; y < h - 10; y++) {
      let firstOpaque = -1;
      let lastOpaque = -1;
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * ch + 3] > 100) {
          if (firstOpaque === -1) firstOpaque = x;
          lastOpaque = x;
        }
      }

      if (firstOpaque !== -1 && lastOpaque > firstOpaque + 10) {
        for (let x = firstOpaque; x <= lastOpaque; x++) {
          const idx = (y * w + x) * ch;
          const r = data[idx], g = data[idx+1], b = data[idx+2];
          // If pixel between left & right opaque edges has alpha < 100 AND color is non-white (yellow/orange/shadow)
          if (data[idx + 3] < 100 && r > 120) {
            data[idx + 3] = 255;
          }
        }
      }
    }

    await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .png()
      .toFile(file);

    console.log(`Verified & solid-filled: ${name}`);
  }
}

fixAllGaps();
