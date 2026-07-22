const sharp = require('sharp');
const fs = require('fs');

async function createClippedStickerPNG(inputJpgPath, outputPngPath, getPathD) {
  const imageBuffer = fs.readFileSync(inputJpgPath);
  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;
  const base64Jpg = imageBuffer.toString('base64');

  const pathD = getPathD(w, h);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <clipPath id="sticker-clip">
        <path d="${pathD}" />
      </clipPath>
    </defs>
    <!-- White die-cut outline background -->
    <path d="${pathD}" fill="#ffffff" stroke="#ffffff" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" />
    <!-- Original photo clipped to character shape -->
    <image href="data:image/jpeg;base64,${base64Jpg}" width="${w}" height="${h}" clip-path="url(#sticker-clip)" />
  </svg>`;

  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  fs.writeFileSync(outputPngPath, pngBuffer);
  console.log(`Created perfect non-destructive clipped sticker PNG: ${outputPngPath} (${w}x${h})`);
}

async function run() {
  // 1. cute-angry-cat.jpg (736 x 983)
  await createClippedStickerPNG(
    'public/stickers/cute-angry-cat.jpg',
    'public/stickers/cute-angry-cat.png',
    (w, h) => {
      // Smooth contour around Ragdoll cat with pink angry doodle and ears
      return `M ${w*0.25} ${h*0.14} 
              C ${w*0.20} ${h*0.08}, ${w*0.35} ${h*0.05}, ${w*0.50} ${h*0.12} 
              C ${w*0.65} ${h*0.05}, ${w*0.80} ${h*0.08}, ${w*0.75} ${h*0.14} 
              C ${w*0.92} ${h*0.25}, ${w*0.95} ${h*0.50}, ${w*0.90} ${h*0.72} 
              C ${w*0.85} ${h*0.88}, ${w*0.65} ${h*0.96}, ${w*0.50} ${h*0.96} 
              C ${w*0.35} ${h*0.96}, ${w*0.15} ${h*0.88}, ${w*0.10} ${h*0.72} 
              C ${w*0.05} ${h*0.50}, ${w*0.08} ${h*0.25}, ${w*0.25} ${h*0.14} Z`;
    }
  );

  // 2. cute-helmet-cat.jpg (736 x 736)
  await createClippedStickerPNG(
    'public/stickers/cute-helmet-cat.jpg',
    'public/stickers/cute-helmet-cat.png',
    (w, h) => {
      // Smooth contour around helmet kitten
      return `M ${w*0.50} ${h*0.06} 
              C ${w*0.75} ${h*0.06}, ${w*0.90} ${h*0.22}, ${w*0.88} ${h*0.48} 
              C ${w*0.86} ${h*0.70}, ${w*0.72} ${h*0.94}, ${w*0.50} ${h*0.94} 
              C ${w*0.28} ${h*0.94}, ${w*0.14} ${h*0.70}, ${w*0.12} ${h*0.48} 
              C ${w*0.10} ${h*0.22}, ${w*0.25} ${h*0.06}, ${w*0.50} ${h*0.06} Z`;
    }
  );

  // 3. cat-hipster.png.jpg (640 x 614)
  await createClippedStickerPNG(
    'public/stickers/cat-hipster.png.jpg',
    'public/stickers/cat-hipster.png',
    (w, h) => {
      // Contour around LA Cap, sunglasses, cat face & paws
      return `M ${w*0.25} ${h*0.12} 
              C ${w*0.40} ${h*0.04}, ${w*0.60} ${h*0.04}, ${w*0.75} ${h*0.12} 
              C ${w*0.92} ${h*0.25}, ${w*0.94} ${h*0.50}, ${w*0.88} ${h*0.75} 
              C ${w*0.75} ${h*0.95}, ${w*0.25} ${h*0.95}, ${w*0.12} ${h*0.75} 
              C ${w*0.06} ${h*0.50}, ${w*0.08} ${h*0.25}, ${w*0.25} ${h*0.12} Z`;
    }
  );

  // 4. cat-blue-ribbon.png.jpg (597 x 581)
  await createClippedStickerPNG(
    'public/stickers/cat-blue-ribbon.png.jpg',
    'public/stickers/cat-blue-ribbon.png',
    (w, h) => {
      return `M ${w*0.50} ${h*0.05} 
              C ${w*0.80} ${h*0.05}, ${w*0.92} ${h*0.30}, ${w*0.88} ${h*0.65} 
              C ${w*0.80} ${h*0.95}, ${w*0.20} ${h*0.95}, ${w*0.12} ${h*0.65} 
              C ${w*0.08} ${h*0.30}, ${w*0.20} ${h*0.05}, ${w*0.50} ${h*0.05} Z`;
    }
  );

  // 5. cat-pink-ribbon.png.jpg (579 x 656)
  await createClippedStickerPNG(
    'public/stickers/cat-pink-ribbon.png.jpg',
    'public/stickers/cat-pink-ribbon.png',
    (w, h) => {
      return `M ${w*0.50} ${h*0.05} 
              C ${w*0.80} ${h*0.05}, ${w*0.92} ${h*0.30}, ${w*0.88} ${h*0.65} 
              C ${w*0.80} ${h*0.95}, ${w*0.20} ${h*0.95}, ${w*0.12} ${h*0.65} 
              C ${w*0.08} ${h*0.30}, ${w*0.20} ${h*0.05}, ${w*0.50} ${h*0.05} Z`;
    }
  );

  // 6. dino-yellow.png.jpg (635 x 635)
  await createClippedStickerPNG(
    'public/stickers/dino-yellow.png.jpg',
    'public/stickers/dino-yellow.png',
    (w, h) => {
      return `M ${w*0.50} ${h*0.05} 
              C ${w*0.75} ${h*0.05}, ${w*0.92} ${h*0.30}, ${w*0.90} ${h*0.65} 
              C ${w*0.82} ${h*0.94}, ${w*0.18} ${h*0.94}, ${w*0.10} ${h*0.65} 
              C ${w*0.08} ${h*0.30}, ${w*0.25} ${h*0.05}, ${w*0.50} ${h*0.05} Z`;
    }
  );
}

run();
