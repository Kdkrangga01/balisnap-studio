const sharp = require('sharp');
const fs = require('fs');

const inputPath = 'C:/Users/Rangga/.gemini/antigravity-ide/brain/274139a2-4e57-4a18-9f3b-8f45e1fb85d2/media__1784705782891.png';

const crops = [
  { id: 'nailong-cat-costume', name: 'Nailong Kostum Kucing Full Body', x: 15, y: 45, w: 165, h: 210 },
  { id: 'nailong-dance-stretch', name: 'Nailong Joget Stretch Full Body', x: 150, y: 120, w: 190, h: 235 },
  { id: 'nailong-wave-happy', name: 'Nailong Waving Happy Full Body', x: 320, y: 45, w: 180, h: 215 },
  { id: 'nailong-wave-face', name: 'Nailong Intip Lucu', x: 505, y: 60, w: 215, h: 150 },
  { id: 'nailong-silly-open', name: 'Nailong Silly Lidah Melet Full Body', x: 0, y: 275, w: 220, h: 280 },
  { id: 'nailong-shopping-bags', name: 'Nailong Belanja Shopping Bags Full Body', x: 325, y: 260, w: 240, h: 245 },
  { id: 'nailong-bear-shirt', name: 'Nailong Kaos Beruang Full Body', x: 550, y: 195, w: 165, h: 210 },
  { id: 'nailong-blep-derp', name: 'Nailong Melet Gemes Full Body', x: 180, y: 400, w: 195, h: 270 },
  { id: 'nailong-curious', name: 'Nailong Penasaran Gemes Full Body', x: 350, y: 490, w: 185, h: 245 },
  { id: 'nailong-cheering', name: 'Nailong Cheering Sorak Full Body', x: 520, y: 390, w: 190, h: 250 },
  { id: 'nailong-standing-scale', name: 'Nailong Timbangan Berat Badan Full Body', x: 40, y: 550, w: 195, h: 285 },
  { id: 'nailong-sleepy-standing', name: 'Nailong Ngantuk Tidur Full Body', x: 200, y: 690, w: 200, h: 225 },
  { id: 'nailong-angry-pointing', name: 'Nailong Marah Menunjuk Full Body', x: 380, y: 720, w: 180, h: 195 },
  { id: 'nailong-running-cute', name: 'Nailong Lari Imut Full Body', x: 560, y: 805, w: 160, h: 110 }
];

async function extractStickersWithMargin() {
  const imageBuffer = fs.readFileSync(inputPath);
  const sheetMeta = await sharp(imageBuffer).metadata();

  for (const c of crops) {
    const croppedBuffer = await sharp(imageBuffer)
      .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const data = croppedBuffer.data;
    const w = croppedBuffer.info.width;
    const h = croppedBuffer.info.height;
    const ch = croppedBuffer.info.channels;

    const alpha = new Uint8Array(w * h);
    alpha.fill(255);

    const getPixel = (px, py) => {
      const idx = (py * w + px) * ch;
      return [data[idx], data[idx+1], data[idx+2]];
    };

    const isTanBg = (r, g, b) => {
      if (g >= 180 && r >= 200) return false;
      if (g < 180 && b < 100 && r > 150 && r > g && g > b) return true;
      return false;
    };

    const visited = new Uint8Array(w * h);
    const queue = [];

    for (let x = 0; x < w; x++) {
      queue.push(x, 0);
      queue.push(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      queue.push(0, y);
      queue.push(w - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const x = queue[head++];
      const y = queue[head++];
      const pos = y * w + x;

      if (visited[pos]) continue;
      visited[pos] = 1;

      const [r, g, b] = getPixel(x, y);
      if (isTanBg(r, g, b)) {
        alpha[pos] = 0;

        if (x > 0 && !visited[pos - 1]) queue.push(x - 1, y);
        if (x < w - 1 && !visited[pos + 1]) queue.push(x + 1, y);
        if (y > 0 && !visited[pos - w]) queue.push(x, y - 1);
        if (y < h - 1 && !visited[pos + w]) queue.push(x, y + w);
      }
    }

    const rgba = Buffer.alloc(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      rgba[i * 4] = data[i * ch];
      rgba[i * 4 + 1] = data[i * ch + 1];
      rgba[i * 4 + 2] = data[i * ch + 2];
      rgba[i * 4 + 3] = alpha[i];
    }

    const outPath = `public/stickers/${c.id}.png`;
    await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .png()
      .toFile(outPath);

    console.log(`Extracted PERFECT Nailong: ${outPath} (${w}x${h})`);
  }
}

extractStickersWithMargin();
