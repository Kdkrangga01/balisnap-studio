const sharp = require('sharp');
const fs = require('fs');

async function processCheckeredOrWhiteBackground(inputPath, outputPath, isCatWhite = false) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Create alpha channel buffer
  const alpha = new Uint8Array(width * height);
  alpha.fill(255); // Default opaque

  const getPixel = (x, y) => {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  // Helper to check if pixel is background (white, light gray checker, or gray grid)
  const isBgPixel = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    // Gray or white checker pattern: low color saturation (diff < 25) and bright (min > 180 or r,g,b in [200..255])
    if (diff < 25 && min > 180) return true;
    // Also pure white
    if (r > 245 && g > 245 && b > 245) return true;
    return false;
  };

  // BFS Flood Fill from outer border
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Push all border pixels
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
      alpha[pos] = 0; // Make transparent

      // Add neighbors
      if (x > 0 && !visited[pos - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[pos + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[pos - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[pos + width]) queue.push(x, y + 1);
    }
  }

  // Combine RGB raw buffer with new Alpha channel
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
  
  console.log(`Saved transparent PNG: ${outputPath}`);
}

async function run() {
  await processCheckeredOrWhiteBackground('public/stickers/cat-hipster.png.jpg', 'public/stickers/cat-hipster-clean.png');
  await processCheckeredOrWhiteBackground('public/stickers/cat-blue-ribbon.png.jpg', 'public/stickers/cat-blue-ribbon-clean.png');
  await processCheckeredOrWhiteBackground('public/stickers/cat-pink-ribbon.png.jpg', 'public/stickers/cat-pink-ribbon-clean.png');
  await processCheckeredOrWhiteBackground('public/stickers/dino-yellow.png.jpg', 'public/stickers/dino-yellow-clean.png');
}

run();
