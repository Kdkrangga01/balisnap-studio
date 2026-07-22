const sharp = require('sharp');
const fs = require('fs');

const inputPath = 'C:/Users/Rangga/.gemini/antigravity-ide/brain/274139a2-4e57-4a18-9f3b-8f45e1fb85d2/media__1784705782891.png';

const crops = [
  { id: 'nailong-cat-costume', name: 'Nailong Kostum Kucing Full Body', x: 25, y: 55, w: 145, h: 190 },
  { id: 'nailong-dance-stretch', name: 'Nailong Joget Stretch Full Body', x: 160, y: 130, w: 170, h: 215 },
  { id: 'nailong-wave-happy', name: 'Nailong Waving Happy Full Body', x: 330, y: 55, w: 160, h: 195 },
  { id: 'nailong-wave-face', name: 'Nailong Intip Lucu', x: 515, y: 70, w: 195, h: 130 },
  { id: 'nailong-silly-open', name: 'Nailong Silly Lidah Melet Full Body', x: 10, y: 285, w: 200, h: 260 },
  { id: 'nailong-shopping-bags', name: 'Nailong Belanja Shopping Bags Full Body', x: 335, y: 270, w: 220, h: 225 },
  { id: 'nailong-bear-shirt', name: 'Nailong Kaos Beruang Full Body', x: 560, y: 205, w: 145, h: 190 },
  { id: 'nailong-blep-derp', name: 'Nailong Melet Gemes Full Body', x: 190, y: 410, w: 175, h: 250 },
  { id: 'nailong-curious', name: 'Nailong Penasaran Gemes Full Body', x: 360, y: 500, w: 165, h: 225 },
  { id: 'nailong-cheering', name: 'Nailong Cheering Sorak Full Body', x: 530, y: 400, w: 170, h: 230 },
  { id: 'nailong-standing-scale', name: 'Nailong Timbangan Berat Badan Full Body', x: 50, y: 560, w: 175, h: 265 },
  { id: 'nailong-sleepy-standing', name: 'Nailong Ngantuk Tidur Full Body', x: 210, y: 700, w: 180, h: 215 },
  { id: 'nailong-angry-pointing', name: 'Nailong Marah Menunjuk Full Body', x: 390, y: 730, w: 160, h: 185 },
  { id: 'nailong-running-cute', name: 'Nailong Lari Imut Full Body', x: 570, y: 815, w: 140, h: 100 }
];

async function extractStickers() {
  const imageBuffer = fs.readFileSync(inputPath);
  const sheetMeta = await sharp(imageBuffer).metadata();
  console.log(`Sheet size: ${sheetMeta.width}x${sheetMeta.height}`);

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

    // Helper: is pixel background tan (#d29a39 / #d89c32)?
    // Tan background has R: 180..230, G: 130..180, B: 30..80, with R > G > B
    const isTanBg = (r, g, b) => {
      if (r > 160 && g > 110 && g < 190 && b < 100 && r > g && g > b) return true;
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

    console.log(`Extracted full body Nailong sticker: ${outPath} (${w}x${h})`);
  }
}

extractStickers();
