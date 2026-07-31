const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateStyledQR() {
  const url = 'https://balisnap-studio.vercel.app/';
  
  // Generate QR Code matrix
  const qrSvgRaw = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  // Extract inner SVG elements (paths/rects)
  const svgInnerMatch = qrSvgRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const qrPaths = svgInnerMatch ? svgInnerMatch[1] : '';

  // Get viewBox or width/height from qrSvgRaw
  const viewBoxMatch = qrSvgRaw.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 37 37';
  const size = parseInt(viewBox.split(' ')[2] || '37', 10);

  // Center logo overlay (e.g. camera / star icon)
  const centerSize = Math.floor(size * 0.24);
  const centerPos = (size - centerSize) / 2;

  // Composite full SVG artwork matching the user's screenshot!
  const width = 500;
  const height = 620;

  const fullSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      .bg { fill: #F4EBE8; }
      .card-bg { fill: #FFFFFF; stroke: #000000; stroke-width: 2.5; rx: 16px; }
      .badge-bg { fill: #000000; rx: 16px; }
      .badge-text { fill: #FFFFFF; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; font-size: 22px; letter-spacing: 5px; }
      .title-text { fill: #2C2623; font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; font-weight: bold; letter-spacing: 3px; text-anchor: middle; }
      .sub-text { fill: #5A524E; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; letter-spacing: 1px; text-anchor: middle; }
    </style>

    <!-- Outer Container Background -->
    <rect width="${width}" height="${height}" class="bg" />

    <!-- Top Section: Badge + QR Box -->
    <g transform="translate(45, 45)">
      
      <!-- Black Side Badge 'SCAN ME' -->
      <rect x="0" y="0" width="85" height="340" class="badge-bg" />
      <g transform="translate(48, 170) rotate(-90)">
        <text x="0" y="0" class="badge-text" text-anchor="middle">SCAN ME</text>
      </g>

      <!-- Main White QR Code Frame -->
      <rect x="95" y="0" width="315" height="340" class="card-bg" />

      <!-- QR Code Inner SVG -->
      <g transform="translate(112, 17) scale(${306 / size})">
        ${qrPaths}
        
        <!-- White cutout behind center logo -->
        <rect x="${centerPos}" y="${centerPos}" width="${centerSize}" height="${centerSize}" fill="#FFFFFF" rx="2" />
        
        <!-- Center Icon / Star Symbol -->
        <g transform="translate(${centerPos + centerSize*0.15}, ${centerPos + centerSize*0.15}) scale(${centerSize * 0.7 / 24})">
          <!-- Camera / Star Icon -->
          <path d="M12 2L14.4 8.6L21.5 9.2L16.1 13.9L17.7 20.8L12 17.2L6.3 20.8L7.9 13.9L2.5 9.2L9.6 8.6L12 2Z" fill="#000000"/>
        </g>
      </g>
    </g>

    <!-- Bottom Section: Typography -->
    <text x="250" y="445" class="title-text">SCAN TO REACH US</text>
    
    <!-- Subtitle Banner -->
    <rect x="0" y="525" width="${width}" height="95" fill="#E8DED9" />
    <text x="250" y="580" class="sub-text">balisnap-studio.vercel.app</text>
  </svg>
  `;

  // Output paths
  const artifactDir = `C:\\Users\\Rangga\\.gemini\\antigravity-ide\\brain\\46567a6e-d421-4b56-9cbe-6ab235366fbf`;
  const svgPath = path.join(artifactDir, 'balisnap_qrcode.svg');
  const pngPath = path.join(artifactDir, 'balisnap_qrcode.png');

  fs.writeFileSync(svgPath, fullSvg, 'utf8');
  console.log('Saved SVG to:', svgPath);

  // Convert SVG to PNG using sharp
  await sharp(Buffer.from(fullSvg))
    .png()
    .toFile(pngPath);
  
  console.log('Saved PNG to:', pngPath);
}

generateStyledQR().catch(err => {
  console.error('Error generating QR code:', err);
  process.exit(1);
});
