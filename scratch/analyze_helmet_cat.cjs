const sharp = require('sharp');

async function analyze() {
  const { data, info } = await sharp('public/stickers/cute-helmet-cat.jpg').raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  for (let yPct of [0.1, 0.25, 0.5, 0.75, 0.9]) {
    const y = Math.floor(h * yPct);
    let rowLog = `y=${y}: `;
    for (let x = 0; x < w; x += 40) {
      const idx = (y * w + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      rowLog += `[${r},${g},${b}] `;
    }
    console.log(rowLog);
  }
}

analyze();
