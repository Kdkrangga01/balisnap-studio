import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const link = 'https://docs.google.com/forms/d/e/1FAIpQLSf7pj4rSdPIf3CZcrDvvq0tYQ16VhhCWIt1Ts3pp6b_WpLzSQ/viewform';
const logoPath = 'C:\\Users\\Rangga\\.gemini\\antigravity-ide\\brain\\99cd0fca-b90f-4b31-b427-62545fff908f\\media__1785896246205.jpg';
const outputDir = 'c:\\Testing Program\\BaliSnap Studio';

async function generateVariant(colorHex, filename, logoRatio = 0.27) {
  const size = 1200;
  const margin = 2;

  // 1. Generate QR Code Buffer
  const qrBuffer = await QRCode.toBuffer(link, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: size,
    margin: margin,
    color: {
      dark: colorHex,
      light: '#FFFFFF'
    }
  });

  // 2. Prepare Logo (Slightly larger ~27% size)
  const logoSize = Math.floor(size * logoRatio); // 324px for 1200px
  const borderPadding = 14;
  const backgroundSize = logoSize + borderPadding * 2; // 352px

  const whiteCircleBuffer = Buffer.from(
    `<svg width="${backgroundSize}" height="${backgroundSize}">
      <circle cx="${backgroundSize / 2}" cy="${backgroundSize / 2}" r="${backgroundSize / 2}" fill="#FFFFFF" />
     </svg>`
  );

  const logoCircleMask = Buffer.from(
    `<svg width="${logoSize}" height="${logoSize}">
      <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="#FFFFFF" />
     </svg>`
  );

  const processedLogo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'cover' })
    .composite([{
      input: logoCircleMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  const logoWithBg = await sharp({
    create: {
      width: backgroundSize,
      height: backgroundSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: whiteCircleBuffer, top: 0, left: 0 },
      { input: processedLogo, top: borderPadding, left: borderPadding }
    ])
    .png()
    .toBuffer();

  const finalQR = await sharp(qrBuffer)
    .composite([
      {
        input: logoWithBg,
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  const mainPath = path.join(outputDir, filename);
  const publicPath = path.join(outputDir, 'public', filename);

  fs.writeFileSync(mainPath, finalQR);
  fs.writeFileSync(publicPath, finalQR);
  console.log(`Saved larger logo QR: ${filename}`);
}

async function run() {
  await generateVariant('#0e3a5a', 'qrcode_sigap_smpn3nusapenida.png', 0.27);
  await generateVariant('#000000', 'qrcode_sigap_smpn3nusapenida_black.png', 0.27);
}

run();
