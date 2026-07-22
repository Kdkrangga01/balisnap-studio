const sharp = require('sharp');
const fs = require('fs');

async function removeBackgroundForCheckered(inputPath, outputPath) {
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

  const isBgPixel = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    // Checkered background or white background
    if (diff < 30 && min > 175) return true;
    if (r > 240 && g > 240 && b > 240) return true;
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
    if (isBgPixel(r, g, b)) {
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

  console.log(`Successfully generated transparent PNG: ${outputPath}`);
}

async function removeBackgroundForAngryCat(inputPath, outputPath) {
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

  // For angry cat: room photo background is non-white and non-pink.
  // The cat has a white die-cut outline (R>240, G>240, B>240) and pink doodle border (R>230, G:170-220, B:180-230).
  const isStickerBorder = (r, g, b) => {
    // Pure white die-cut sticker edge
    if (r > 240 && g > 240 && b > 235) return true;
    // Pink doodle edge
    if (r > 230 && g > 150 && g < 235 && b > 170) return true;
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

  console.log(`Successfully generated transparent PNG for angry cat: ${outputPath}`);
}

async function run() {
  await removeBackgroundForCheckered('public/stickers/cat-hipster.png.jpg', 'public/stickers/cat-hipster.png');
  await removeBackgroundForCheckered('public/stickers/cat-blue-ribbon.png.jpg', 'public/stickers/cat-blue-ribbon.png');
  await removeBackgroundForCheckered('public/stickers/cat-pink-ribbon.png.jpg', 'public/stickers/cat-pink-ribbon.png');
  await removeBackgroundForCheckered('public/stickers/dino-yellow.png.jpg', 'public/stickers/dino-yellow.png');
  await removeBackgroundForAngryCat('public/stickers/cute-angry-cat.jpg', 'public/stickers/cute-angry-cat.png');
}

run();
