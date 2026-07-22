const sharp = require('sharp');
const fs = require('fs');

const crops = [
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

async function verify() {
  for (const name of crops) {
    const file = `public/stickers/${name}`;
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    
    // Check center box (from 25% to 75% width/height)
    let totalPixels = 0;
    let transparentInCenter = 0;
    for (let y = Math.floor(h * 0.25); y < Math.floor(h * 0.75); y++) {
      for (let x = Math.floor(w * 0.25); x < Math.floor(w * 0.75); x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        totalPixels++;
        if (alpha < 200) transparentInCenter++;
      }
    }
    console.log(`File: ${name} -> Center transparent pixels: ${transparentInCenter} / ${totalPixels} (${((transparentInCenter/totalPixels)*100).toFixed(1)}%)`);
  }
}

verify();
