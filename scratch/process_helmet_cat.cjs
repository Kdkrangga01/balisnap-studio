const sharp = require('sharp');

async function removeBackgroundForHelmetCat(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const alpha = new Uint8Array(width * height);
  alpha.fill(255);

  const getPixel = (x, y) => {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  const isStickerBorder = (r, g, b) => {
    // White/cream sticker outline or helmet outline
    if (r > 235 && g > 235 && b > 230) return true;
    // Bright yellow helmet
    if (r > 220 && g > 180 && b < 100) return true;
    return false;
  };

  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pos = y * width + x;

    if (visited[pos]) continue;
    visited[pos] = 1;

    const [r, g, b] = getPixel(x, y);
    if (!isStickerBorder(r, g, b)) {
      alpha[pos] = 0;

      if (x > 0 && !visited[pos - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[pos + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[pos - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[pos + width]) queue.push(x, y + 1);
    }
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = data[i * channels];
    rgba[i * 4 + 1] = data[i * channels + 1];
    rgba[i * 4 + 2] = data[i * channels + 2];
    rgba[i * 4 + 3] = alpha[i];
  }

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`Successfully generated transparent PNG for helmet cat: ${outputPath}`);
}

removeBackgroundForHelmetCat('public/stickers/cute-helmet-cat.jpg', 'public/stickers/cute-helmet-cat.png');
