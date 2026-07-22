const sharp = require('sharp');

async function inspectPng() {
  const file = 'public/stickers/nailong-dance-stretch.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Scan horizontal lines across the image to see where alpha is 0 in the middle!
  for (let y = 0; y < h; y += 5) {
    let alphaLine = `y=${y.toString().padStart(3)}: `;
    let transparentCount = 0;
    for (let x = 0; x < w; x += 5) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < 100) {
        alphaLine += '.';
        transparentCount++;
      } else {
        alphaLine += '#';
      }
    }
    console.log(alphaLine + ` (${transparentCount} empty)`);
  }
}

inspectPng();
