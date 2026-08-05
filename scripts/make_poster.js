import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// LIVE 24/7 Supabase Cloud Edge Function Link!
const link = 'https://docs.google.com/forms/d/e/1FAIpQLSf7pj4rSdPIf3CZcrDvvq0tYQ16VhhCWIt1Ts3pp6b_WpLzSQ/viewform';
const logoPath = 'C:\\Users\\Rangga\\.gemini\\antigravity-ide\\brain\\99cd0fca-b90f-4b31-b427-62545fff908f\\media__1785896246205.jpg';
const outputDir = 'c:\\Testing Program\\BaliSnap Studio';

async function generateHDPosterVariant(colorHex, filename) {
  const posterWidth = 2400; // 300 DPI Ultra HD Print Quality
  const posterHeight = 3300;
  const qrSize = 1300;
  const logoRatio = 0.30;

  // 1. Generate QR Code with Live Supabase Cloud Notification Link
  const qrBuffer = await QRCode.toBuffer(link, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: qrSize,
    margin: 2,
    color: {
      dark: colorHex,
      light: '#FFFFFF'
    }
  });

  // 2. Prepare Ultra-HD Circular Logo
  const logoSize = Math.floor(qrSize * logoRatio);
  const borderPadding = 20;
  const backgroundSize = logoSize + borderPadding * 2;

  const scale2x = 2;
  const logoSize2x = logoSize * scale2x;
  const bgSize2x = backgroundSize * scale2x;

  const whiteCircleBuffer2x = Buffer.from(
    `<svg width="${bgSize2x}" height="${bgSize2x}">
      <circle cx="${bgSize2x / 2}" cy="${bgSize2x / 2}" r="${bgSize2x / 2}" fill="#FFFFFF" />
     </svg>`
  );

  const logoCircleMask2x = Buffer.from(
    `<svg width="${logoSize2x}" height="${logoSize2x}">
      <circle cx="${logoSize2x / 2}" cy="${logoSize2x / 2}" r="${logoSize2x / 2}" fill="#FFFFFF" />
     </svg>`
  );

  const processedLogo2x = await sharp(logoPath)
    .resize(logoSize2x, logoSize2x, { kernel: 'lanczos3', fit: 'cover' })
    .sharpen({ sigma: 1.5, m1: 0.5, m2: 2.0 })
    .composite([{
      input: logoCircleMask2x,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  const logoWithBg2x = await sharp({
    create: {
      width: bgSize2x,
      height: bgSize2x,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: whiteCircleBuffer2x, top: 0, left: 0 },
      { input: processedLogo2x, top: borderPadding * scale2x, left: borderPadding * scale2x }
    ])
    .png()
    .toBuffer();

  const logoWithBgHD = await sharp(logoWithBg2x)
    .resize(backgroundSize, backgroundSize, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const finalQRBuffer = await sharp(qrBuffer)
    .composite([
      {
        input: logoWithBgHD,
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  // Save standalone QR code image
  const standaloneQrName = filename.replace('poster_', '');
  fs.writeFileSync(path.join(outputDir, standaloneQrName), finalQRBuffer);
  fs.writeFileSync(path.join(outputDir, 'public', standaloneQrName), finalQRBuffer);

  // 3. Create Ultra HD Poster SVG Background (2400 x 3300 px)
  const svgLayout = Buffer.from(`
    <svg width="${posterWidth}" height="${posterHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FFFFFF" />
      <rect x="60" y="60" width="${posterWidth - 120}" height="${posterHeight - 120}" rx="48" fill="#FFFFFF" stroke="${colorHex}" stroke-width="9" />

      <!-- Top Header -->
      <text x="1200" y="340" text-anchor="middle" font-family="'Trebuchet MS', 'Arial Black', Arial, sans-serif" font-weight="900" font-size="108" fill="${colorHex}" letter-spacing="3">
        QR CODE ANTI BULLYING
      </text>

      <!-- Frame Box for QR Code -->
      <rect x="500" y="480" width="1400" height="1400" rx="60" fill="#FFFFFF" stroke="${colorHex}" stroke-width="18" />

      <!-- SIGAP Badge -->
      <rect x="650" y="1840" width="1100" height="190" rx="45" fill="${colorHex}" />
      <text x="1200" y="1975" text-anchor="middle" font-family="'Trebuchet MS', 'Arial Black', Arial, sans-serif" font-weight="900" font-size="115" fill="#FFFFFF" letter-spacing="10">
        SIGAP
      </text>

      <!-- Bottom Instructions -->
      <text x="1200" y="2340" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-weight="bold" font-size="90" fill="#1e293b">
        Siswa dapat melaporkan
      </text>
      <text x="1200" y="2470" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-weight="bold" font-size="90" fill="#1e293b">
        tindakan bullying dengan
      </text>
      <text x="1200" y="2600" text-anchor="middle" font-family="'Georgia', 'Times New Roman', serif" font-weight="bold" font-size="90" fill="#1e293b">
        cara scan QR CODE <tspan fill="#2563eb" font-size="105">⬆</tspan>
      </text>

      <!-- Subtext Footer -->
      <text x="1200" y="2940" text-anchor="middle" font-family="'Arial', sans-serif" font-weight="600" font-size="54" fill="#64748b" letter-spacing="2">
        SMP NEGERI 3 NUSA PENIDA
      </text>
    </svg>
  `);

  const posterBuffer = await sharp(svgLayout)
    .composite([
      {
        input: finalQRBuffer,
        top: 530,
        left: 550
      }
    ])
    .png()
    .toBuffer();

  const mainPath = path.join(outputDir, filename);
  const publicPath = path.join(outputDir, 'public', filename);

  fs.writeFileSync(mainPath, posterBuffer);
  fs.writeFileSync(publicPath, posterBuffer);

  console.log('Successfully generated live 24/7 QR Poster: ' + filename);
}

async function run() {
  await generateHDPosterVariant('#000000', 'poster_qrcode_anti_bullying_sigap_black.png');
  await generateHDPosterVariant('#0e3a5a', 'poster_qrcode_anti_bullying_sigap.png');
}

run().catch(console.error);
