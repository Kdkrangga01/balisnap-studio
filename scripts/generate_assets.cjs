const fs = require('fs');
const path = require('path');

// Ensure public subdirectories exist
const templatesDir = path.join(__dirname, '../public/templates');
const stickersDir = path.join(__dirname, '../public/stickers');

if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
if (!fs.existsSync(stickersDir)) fs.mkdirSync(stickersDir, { recursive: true });

// ==========================================
// HELPER: Generate sprocket holes for film strip
// ==========================================
function generateSprocketHoles(height, x, holeW, holeH, gap) {
  let holes = '';
  for (let y = gap; y < height - gap; y += gap) {
    holes += `<rect x="${x}" y="${y}" width="${holeW}" height="${holeH}" rx="3" fill="#1a1a1a"/>`;
  }
  return holes;
}

// ==========================================
// HELPER: Generate scattered pattern (hearts, stars, dots)
// ==========================================
function generateScatteredHearts(width, height, count, color, opacity) {
  let shapes = '';
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  };
  const rand = rng(width * height + count);
  for (let i = 0; i < count; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const size = 6 + rand() * 10;
    const rot = rand() * 360;
    shapes += `<g transform="translate(${x},${y}) rotate(${rot}) scale(${size / 20})">
      <path d="M0,-4 C-2,-8 -8,-8 -8,-4 C-8,0 -2,4 0,8 C2,4 8,0 8,-4 C8,-8 2,-8 0,-4Z" fill="${color}" opacity="${opacity}"/>
    </g>`;
  }
  return shapes;
}

function generateScatteredStars(width, height, count, color, opacity) {
  let shapes = '';
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  };
  const rand = rng(width + height + count * 7);
  for (let i = 0; i < count; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const size = 4 + rand() * 8;
    shapes += `<polygon points="${x},${y - size} ${x + size * 0.3},${y - size * 0.3} ${x + size},${y - size * 0.2} ${x + size * 0.4},${y + size * 0.2} ${x + size * 0.6},${y + size} ${x},${y + size * 0.5} ${x - size * 0.6},${y + size} ${x - size * 0.4},${y + size * 0.2} ${x - size},${y - size * 0.2} ${x - size * 0.3},${y - size * 0.3}" fill="${color}" opacity="${opacity}"/>`;
  }
  return shapes;
}

function generatePolkaDots(width, height, count, color, opacity) {
  let dots = '';
  const rng = (seed) => {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  };
  const rand = rng(width * 3 + height * 5 + count);
  for (let i = 0; i < count; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = 3 + rand() * 5;
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
  }
  return dots;
}

// ==========================================
// HELPER: Decorative corners (art deco style)
// ==========================================
function generateCornerDecorations(width, height, color, size) {
  const s = size;
  return `
    <!-- Top-left corner -->
    <path d="M${s * 0.3},${s * 0.5} L${s * 0.3},${s * 0.3} L${s * 0.5},${s * 0.3}" stroke="${color}" stroke-width="3" fill="none"/>
    <path d="M${s * 0.15},${s * 0.7} L${s * 0.15},${s * 0.15} L${s * 0.7},${s * 0.15}" stroke="${color}" stroke-width="2" fill="none"/>
    <!-- Top-right corner -->
    <path d="M${width - s * 0.5},${s * 0.3} L${width - s * 0.3},${s * 0.3} L${width - s * 0.3},${s * 0.5}" stroke="${color}" stroke-width="3" fill="none"/>
    <path d="M${width - s * 0.7},${s * 0.15} L${width - s * 0.15},${s * 0.15} L${width - s * 0.15},${s * 0.7}" stroke="${color}" stroke-width="2" fill="none"/>
    <!-- Bottom-left corner -->
    <path d="M${s * 0.3},${height - s * 0.5} L${s * 0.3},${height - s * 0.3} L${s * 0.5},${height - s * 0.3}" stroke="${color}" stroke-width="3" fill="none"/>
    <path d="M${s * 0.15},${height - s * 0.7} L${s * 0.15},${height - s * 0.15} L${s * 0.7},${height - s * 0.15}" stroke="${color}" stroke-width="2" fill="none"/>
    <!-- Bottom-right corner -->
    <path d="M${width - s * 0.5},${height - s * 0.3} L${width - s * 0.3},${height - s * 0.3} L${width - s * 0.3},${height - s * 0.5}" stroke="${color}" stroke-width="3" fill="none"/>
    <path d="M${width - s * 0.7},${height - s * 0.15} L${width - s * 0.15},${height - s * 0.15} L${width - s * 0.15},${height - s * 0.7}" stroke="${color}" stroke-width="2" fill="none"/>
  `;
}

// ==========================================
// HELPER: Ribbon/bow decoration
// ==========================================
function generateRibbon(cx, cy, color, size) {
  const s = size;
  return `
    <g transform="translate(${cx},${cy})">
      <ellipse cx="${-s * 0.5}" cy="0" rx="${s * 0.5}" ry="${s * 0.3}" fill="${color}" transform="rotate(-20)"/>
      <ellipse cx="${s * 0.5}" cy="0" rx="${s * 0.5}" ry="${s * 0.3}" fill="${color}" transform="rotate(20)"/>
      <circle cx="0" cy="0" r="${s * 0.15}" fill="${color}"/>
      <path d="M${-s * 0.1},${s * 0.1} L${-s * 0.2},${s * 0.6}" stroke="${color}" stroke-width="3" fill="none"/>
      <path d="M${s * 0.1},${s * 0.1} L${s * 0.2},${s * 0.6}" stroke="${color}" stroke-width="3" fill="none"/>
    </g>
  `;
}

// ==========================================
// MAIN SVG FRAME GENERATOR
// ==========================================
function generateFrame(config) {
  const { width, height, slots, style, id } = config;
  const maskId = `mask-${id}`;

  // Mask cutouts for photo slots
  const maskRects = slots.map((s, i) =>
    `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="black" rx="${s.rx || 0}"/>`
  ).join('\n');

  let bgContent = '';
  let fgContent = '';
  let bottomText = '';

  // Bottom branding area
  const brandY = height - 70;
  const brandFontSize = height >= 2800 ? 36 : 28;
  const subFontSize = height >= 2800 ? 18 : 14;

  // ==========================================
  // PINTEREST MAROON STYLE (EXACT REPLICA)
  // ==========================================
  if (style.type === 'pinterest_maroon') {
    const borderColor = '#7C0A21';
    const ticketBgColor = '#FFF9E6';

    bgContent = `
      <rect width="100%" height="100%" fill="${borderColor}"/>
      <!-- Left & Right ticket cuts aligned to scaled ticket position -->
      <circle cx="292" cy="2145" r="10" fill="${borderColor}"/>
      <circle cx="508" cy="2145" r="10" fill="${borderColor}"/>
    `;

    fgContent = `
      <!-- SLOT BORDERS -->
      ${slots.map(s => `
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${borderColor}" stroke-width="8"/>
        <rect x="${s.x - 4}" y="${s.y - 4}" width="${s.w + 8}" height="${s.h + 8}" fill="none" stroke="#5E0013" stroke-width="2"/>
      `).join('\n')}

      <!-- RETRO POLAROID CAMERA -->
      <g transform="translate(0, 20)">
        <rect x="180" y="80" width="440" height="300" rx="35" fill="#EAECEE" stroke="#BDC3C7" stroke-width="4"/>
        <rect x="180" y="320" width="440" height="60" rx="15" fill="#5D6D7E"/>
        <path d="M 220,120 L 580,120 L 560,150 L 240,150 Z" fill="#2C3E50"/>
        <circle cx="400" cy="250" r="95" fill="#1A1A1A" stroke="#2C3E50" stroke-width="8"/>
        <circle cx="400" cy="250" r="80" fill="none" stroke="#BDC3C7" stroke-width="6"/>
        <circle cx="400" cy="250" r="65" fill="#0D1B2A"/>
        <circle cx="400" cy="250" r="50" fill="none" stroke="#1B4965" stroke-width="12" opacity="0.6"/>
        <ellipse cx="425" cy="225" rx="18" ry="8" fill="#52B788" opacity="0.4" transform="rotate(-30 425 225)"/>
        <circle cx="375" cy="215" r="7" fill="#FFF" opacity="0.8"/>
        <rect x="220" y="160" width="80" height="80" rx="8" fill="#D5D8DC" stroke="#95A5A6" stroke-width="3"/>
        <rect x="230" y="170" width="60" height="60" rx="4" fill="#F2F3F4"/>
        <line x1="240" y1="170" x2="240" y2="230" stroke="#BDC3C7" stroke-width="3"/>
        <line x1="250" y1="170" x2="250" y2="230" stroke="#BDC3C7" stroke-width="3"/>
        <line x1="260" y1="170" x2="260" y2="230" stroke="#BDC3C7" stroke-width="3"/>
        <line x1="270" y1="170" x2="270" y2="230" stroke="#BDC3C7" stroke-width="3"/>
        <line x1="280" y1="170" x2="280" y2="230" stroke="#BDC3C7" stroke-width="3"/>
        <rect x="500" y="150" width="60" height="45" rx="6" fill="#2C3E50"/>
        <rect x="515" y="160" width="30" height="25" rx="3" fill="#5DADE2"/>
        <rect x="500" y="210" width="40" height="12" rx="4" fill="#E67E22"/>
        <circle cx="230" cy="285" r="22" fill="#E74C3C" stroke="#C0392B" stroke-width="3"/>
        <text x="530" y="300" font-family="'Poppins', sans-serif" font-weight="900" font-size="20" fill="#2C3E50" text-anchor="middle">One</text>
        <text x="530" y="320" font-family="'Poppins', sans-serif" font-weight="900" font-size="20" fill="#2C3E50" text-anchor="middle">Step<tspan fill="#F39C12">2</tspan></text>
      </g>

      <!-- TOP RIBBON (RED BOW) -->
      <g transform="translate(130, 10)">
        <path d="M 80,70 C 40,20 -10,30 20,70 C 45,90 70,80 80,70 Z" fill="#990000" stroke="#660000" stroke-width="2"/>
        <path d="M 80,70 C 120,20 170,30 140,70 C 115,90 90,80 80,70 Z" fill="#990000" stroke="#660000" stroke-width="2"/>
        <path d="M 75,75 L 10,130 L 25,140 L 75,85 Z" fill="#990000" stroke="#660000" stroke-width="1.5"/>
        <path d="M 85,75 L 150,130 L 135,140 L 85,85 Z" fill="#990000" stroke="#660000" stroke-width="1.5"/>
        <circle cx="80" cy="70" r="12" fill="#800000" stroke="#660000" stroke-width="2"/>
      </g>

      <!-- WHITE CAT STICKER -->
      <g transform="translate(170, 310)">
        <polygon points="10,60 20,0 50,30 80,0 90,60 50,80" fill="#FFF" stroke="#660000" stroke-width="3"/>
        <polygon points="20,40 25,10 40,30" fill="#FADBD8"/>
        <polygon points="80,40 75,10 60,30" fill="#FADBD8"/>
        <circle cx="35" cy="45" r="4" fill="#000"/>
        <circle cx="65" cy="45" r="4" fill="#000"/>
        <polygon points="50,53 47,50 53,50" fill="#E74C3C"/>
        <line x1="25" y1="55" x2="5" y2="55" stroke="#000" stroke-width="1.5"/>
        <line x1="25" y1="60" x2="5" y2="65" stroke="#000" stroke-width="1.5"/>
        <line x1="75" y1="55" x2="95" y2="55" stroke="#000" stroke-width="1.5"/>
        <line x1="75" y1="60" x2="95" y2="65" stroke="#000" stroke-width="1.5"/>
      </g>

      <!-- HIBISCUS FLOWER -->
      <g transform="translate(560, 310)">
        <ellipse cx="25" cy="40" rx="30" ry="20" fill="#FAF4EE" stroke="#E5E7EB" stroke-width="1" transform="rotate(-30 25 40)"/>
        <ellipse cx="55" cy="20" rx="25" ry="30" fill="#FFF" stroke="#E5E7EB" stroke-width="1" transform="rotate(10 55 20)"/>
        <ellipse cx="85" cy="40" rx="30" ry="20" fill="#FAF4EE" stroke="#E5E7EB" stroke-width="1" transform="rotate(30 85 40)"/>
        <ellipse cx="75" cy="70" rx="25" ry="30" fill="#FFF" stroke="#E5E7EB" stroke-width="1" transform="rotate(-20 75 70)"/>
        <ellipse cx="35" cy="70" rx="25" ry="30" fill="#FFF" stroke="#E5E7EB" stroke-width="1" transform="rotate(20 35 70)"/>
        <circle cx="55" cy="45" r="8" fill="#F1C40F"/>
        <path d="M 55,45 Q 85,25 95,20" fill="none" stroke="#E74C3C" stroke-width="4" stroke-linecap="round"/>
        <circle cx="95" cy="20" r="5" fill="#F1C40F"/>
      </g>

      <!-- SNOOPY CUPID (Overlapping Left Border) -->
      <g transform="translate(35, 890) scale(1.15)">
        <ellipse cx="40" cy="10" rx="28" ry="18" fill="#FFF" stroke="#000" stroke-width="3"/>
        <ellipse cx="70" cy="15" rx="15" ry="9" fill="#FFF" stroke="#000" stroke-width="3"/>
        <circle cx="85" cy="15" r="5" fill="#000"/>
        <path d="M 20,5 C 10,0 0,20 15,35 Q 25,40 20,5" fill="#000"/>
        <circle cx="45" cy="8" r="2.5" fill="#000"/>
        <rect x="25" y="30" width="30" height="38" rx="15" fill="#FFF" stroke="#000" stroke-width="3"/>
        <path d="M 15,35 C -5,20 0,50 15,45 Z" fill="#FADBD8" stroke="#E74C3C" stroke-width="1.5"/>
        <path d="M 75,30 Q 90,40 75,70" fill="none" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round"/>
        <line x1="75" y1="30" x2="75" y2="70" stroke="#AAA" stroke-width="1.5"/>
        <line x1="60" y1="50" x2="115" y2="50" stroke="#8B5A2B" stroke-width="3"/>
        <path d="M 115,50 l 10,-8 c 5,0 5,10 0,11 c -5,1 -10,-3 -10,-3 Z" fill="#E74C3C"/>
        <rect x="25" y="68" width="11" height="18" rx="5" fill="#FFF" stroke="#000" stroke-width="3"/>
        <rect x="40" y="68" width="11" height="18" rx="5" fill="#FFF" stroke="#000" stroke-width="3"/>
      </g>

      <!-- RED STAR -->
      <g transform="translate(680, 890)">
        <polygon points="50,10 65,45 100,45 70,65 82,100 50,80 18,100 30,65 0,45 35,45" fill="#B01D2E" stroke="#FFF" stroke-width="3"/>
        <polygon points="50,18 61,47 90,47 65,64 75,92 50,76 25,92 35,64 10,47 39,47" fill="none" stroke="#E59866" stroke-width="1.5" stroke-dasharray="3,2"/>
      </g>

      <!-- PLUSH SNOOPY WITH HEART -->
      <g transform="translate(620, 1430)">
        <ellipse cx="110" cy="60" rx="28" ry="22" fill="#FFF" stroke="#555" stroke-width="2"/>
        <circle cx="75" cy="65" r="6" fill="#000"/>
        <path d="M 130,55 C 145,50 150,75 135,90 Z" fill="#111"/>
        <circle cx="105" cy="58" r="2.5" fill="#000"/>
        <path d="M 80,85 C 70,75 50,85 80,120 C 110,85 90,75 80,85 Z" fill="#8B5A2B" stroke="#5C3A21" stroke-width="2"/>
        <rect x="95" y="85" width="38" height="42" rx="14" fill="#FFF" stroke="#555" stroke-width="2"/>
        <ellipse cx="90" cy="95" rx="14" ry="8" fill="#FFF" stroke="#555" stroke-width="2" transform="rotate(25 90 95)"/>
      </g>

      <!-- THE TICKET (Bottom Center - Scaled up) -->
      <g transform="translate(292, 2105) scale(1.2)">
        <rect x="0" y="0" width="180" height="70" rx="10" fill="${ticketBgColor}" stroke="#8B1D2F" stroke-width="3"/>
        <rect x="6" y="6" width="168" height="58" rx="6" fill="none" stroke="#8B1D2F" stroke-width="1.5" stroke-dasharray="4,2"/>
        <text x="20" y="35" font-family="monospace" font-size="9" fill="#8B1D2F" transform="rotate(-90 20 35)" text-anchor="middle">48645235</text>
        <text x="160" y="35" font-family="monospace" font-size="9" fill="#8B1D2F" transform="rotate(90 160 35)" text-anchor="middle">48645235</text>
        <text x="90" y="22" font-family="Georgia, serif" font-weight="bold" font-size="12" fill="#8B1D2F" text-anchor="middle">good</text>
        <text x="90" y="35" font-family="Georgia, serif" font-weight="bold" font-size="12" fill="#8B1D2F" text-anchor="middle">things</text>
        <text x="90" y="48" font-family="Georgia, serif" font-weight="bold" font-size="12" fill="#8B1D2F" text-anchor="middle">are</text>
        <text x="90" y="61" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="#8B1D2F" text-anchor="middle">coming</text>
        <!-- Circle cuts on top of cream background to show border behind -->
        <circle cx="0" cy="35" r="8" fill="${borderColor}"/>
        <circle cx="180" cy="35" r="8" fill="${borderColor}"/>
      </g>

      <!-- TEDDY BEAR WITH GIFT (Larger, drawn on top of ticket) -->
      <g transform="translate(10, 1910) scale(1.4)">
        <circle cx="100" cy="110" r="45" fill="#935116" stroke="#5C3A21" stroke-width="3"/>
        <circle cx="60" cy="75" r="18" fill="#935116" stroke="#5C3A21" stroke-width="3"/>
        <circle cx="60" cy="75" r="9" fill="#FADBD8"/>
        <circle cx="140" cy="75" r="18" fill="#935116" stroke="#5C3A21" stroke-width="3"/>
        <circle cx="140" cy="75" r="9" fill="#FADBD8"/>
        <ellipse cx="100" cy="123" rx="18" ry="12" fill="#FFF"/>
        <ellipse cx="100" cy="118" rx="7" ry="4" fill="#000"/>
        <path d="M 95,127 Q 100,131 105,127" fill="none" stroke="#000" stroke-width="1.5"/>
        <circle cx="82" cy="100" r="5" fill="#000"/>
        <circle cx="118" cy="100" r="5" fill="#000"/>
        <polygon points="100,150 78,142 78,158" fill="#FFF" stroke="#CCC" stroke-width="1.5"/>
        <polygon points="100,150 122,142 122,158" fill="#FFF" stroke="#CCC" stroke-width="1.5"/>
        <circle cx="100" cy="150" r="5" fill="#FFF" stroke="#CCC" stroke-width="1.5"/>
        <polygon points="100,20 78,70 122,70" fill="#F4D03F" stroke="#B7950B" stroke-width="2"/>
        <circle cx="95" cy="45" r="2.5" fill="#E74C3C"/>
        <circle cx="105" cy="55" r="3" fill="#3498DB"/>
        <circle cx="90" cy="62" r="2.5" fill="#2ECC71"/>
        <circle cx="100" cy="15" r="7" fill="#E74C3C"/>
        <ellipse cx="105" cy="180" rx="48" ry="38" fill="#935116" stroke="#5C3A21" stroke-width="3"/>
        <ellipse cx="50" cy="165" rx="22" ry="12" fill="#935116" stroke="#5C3A21" stroke-width="3" transform="rotate(-30 50 165)"/>
        <ellipse cx="160" cy="165" rx="22" ry="12" fill="#935116" stroke="#5C3A21" stroke-width="3" transform="rotate(30 160 165)"/>
        <ellipse cx="65" cy="215" rx="22" ry="18" fill="#935116" stroke="#5C3A21" stroke-width="3"/>
        <ellipse cx="65" cy="215" rx="13" ry="10" fill="#E59866"/>
        <ellipse cx="145" cy="215" rx="22" ry="18" fill="#935116" stroke="#5C3A21" stroke-width="3"/>
        <ellipse cx="145" cy="215" rx="13" ry="10" fill="#E59866"/>
        <rect x="-10" y="170" width="50" height="45" fill="#3498DB" stroke="#2980B9" stroke-width="2"/>
        <rect x="-15" y="165" width="60" height="10" fill="#F48FB1" stroke="#F06292" stroke-width="2"/>
        <rect x="11" y="165" width="8" height="50" fill="#E74C3C"/>
      </g>

      <!-- CUTE CAKE (Bottom Right - Scaled up) -->
      <g transform="translate(565, 2095) scale(1.35)">
        <rect x="0" y="30" width="80" height="50" rx="10" fill="#FFF" stroke="#E5E7EB" stroke-width="2"/>
        <circle cx="25" cy="55" r="2.5" fill="#000"/>
        <circle cx="55" cy="55" r="2.5" fill="#000"/>
        <path d="M 37,60 Q 40,63 43,60" fill="none" stroke="#000" stroke-width="1.5"/>
        <circle cx="18" cy="58" r="3" fill="#FADBD8"/>
        <circle cx="62" cy="58" r="3" fill="#FADBD8"/>
        <polygon points="20,20 12,30 28,30" fill="#E74C3C" stroke="#C0392B" stroke-width="1"/>
        <polygon points="60,20 52,30 68,30" fill="#E74C3C" stroke="#C0392B" stroke-width="1"/>
        <polygon points="40,15 30,28 50,28" fill="#E74C3C" stroke="#C0392B" stroke-width="1"/>
        <circle cx="10" cy="30" r="4.5" fill="#2E4053"/>
        <circle cx="30" cy="30" r="4.5" fill="#2E4053"/>
        <circle cx="50" cy="30" r="4.5" fill="#2E4053"/>
        <circle cx="70" cy="30" r="4.5" fill="#2E4053"/>
      </g>
    `;
  }

  // ==========================================
  // BREAKING NEWS STYLE
  // ==========================================
  else if (style.type === 'breaking_news') {
    const bgColor = '#EAE6DF';
    const accentColor = '#C0392B';
    const darkColor = '#2C3E50';

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <!-- Newspaper background lines -->
      <line x1="40" y1="20" x2="${width - 40}" y2="20" stroke="${darkColor}" stroke-width="4"/>
      <line x1="40" y1="35" x2="${width - 40}" y2="35" stroke="${darkColor}" stroke-width="1.5"/>
    `;

    fgContent = `
      <!-- Headline banner at top -->
      <rect x="40" y="55" width="${width - 80}" height="100" fill="${accentColor}"/>
      <text x="${width / 2}" y="120" text-anchor="middle" font-family="'Impact', Arial Black, sans-serif" font-size="52" fill="white" letter-spacing="4">BREAKING NEWS</text>
      
      <!-- Sub-banners -->
      <rect x="40" y="165" width="220" height="30" fill="${darkColor}"/>
      <text x="150" y="186" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="white">DAILY REPORT</text>
      <text x="${width - 150}" y="186" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="${darkColor}">BALI EDITION</text>
      <line x1="40" y1="205" x2="${width - 40}" y2="205" stroke="${darkColor}" stroke-width="3"/>

      <!-- Slot Borders -->
      ${slots.map(s => `
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${darkColor}" stroke-width="5"/>
        <rect x="${s.x + 5}" y="${s.y + 5}" width="${s.w - 10}" height="${s.h - 10}" fill="none" stroke="white" stroke-width="2"/>
      `).join('\n')}

      <!-- Megaphone Sticker at bottom-left -->
      <g transform="translate(60, ${height - 240}) scale(1.1)">
        <path d="M 30,50 L 70,30 L 70,70 Z" fill="#F39C12" stroke="${darkColor}" stroke-width="3"/>
        <ellipse cx="70" cy="50" rx="10" ry="20" fill="#E67E22" stroke="${darkColor}" stroke-width="3"/>
        <rect x="15" y="45" width="20" height="25" rx="5" fill="#BDC3C7" stroke="${darkColor}" stroke-width="3" transform="rotate(15 25 55)"/>
        <path d="M 70,40 Q 95,40 90,50 Q 95,60 70,60" fill="none" stroke="${darkColor}" stroke-width="3" stroke-linecap="round"/>
        <text x="105" y="55" font-family="'Impact', sans-serif" font-size="28" fill="${accentColor}" transform="rotate(-10)">LOL!</text>
      </g>

      <!-- Magnifying Glass sticker -->
      <g transform="translate(${width - 160}, 230) scale(0.9)">
        <circle cx="50" cy="50" r="25" fill="#AED6F1" stroke="${darkColor}" stroke-width="4" opacity="0.8"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="${darkColor}" stroke-width="4"/>
        <line x1="68" y1="68" x2="95" y2="95" stroke="${darkColor}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="42" cy="42" r="8" fill="white" opacity="0.6"/>
      </g>

      <!-- Hot Gossip speech bubble -->
      <g transform="translate(${width - 170}, ${height / 2 - 120})">
        <rect x="0" y="0" width="130" height="50" rx="15" fill="white" stroke="${darkColor}" stroke-width="3"/>
        <polygon points="20,50 30,65 40,50" fill="white" stroke="${darkColor}" stroke-width="3"/>
        <polygon points="20,48 30,60 40,48" fill="white"/>
        <text x="65" y="32" text-anchor="middle" font-family="'Comic Sans MS', cursive, sans-serif" font-weight="bold" font-size="14" fill="${darkColor}">HOT GOSSIP!</text>
      </g>

      <!-- Bottom news ticker -->
      <rect x="40" y="${height - 110}" width="${width - 80}" height="50" fill="${darkColor}"/>
      <text x="60" y="${height - 78}" font-family="monospace" font-weight="bold" font-size="18" fill="#F1C40F">BALISNAP NEWS: UNBELIEVABLY ESTHETIC PEEPS SPOTTED! DETAILED VISUALS CONFIRMED...</text>
    `;
  }

  // ==========================================
  // RETRO TV STYLE
  // ==========================================
  else if (style.type === 'retro_tv') {
    const bgColor = '#EBF5FB';
    const gridColor = '#AED6F1';
    const bezelColor = '#C0392B';
    const bezelDark = '#962D22';

    let gridLines = '';
    for (let x = 0; x < width; x += 40) {
      gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${gridColor}" stroke-width="1" opacity="0.4"/>`;
    }
    for (let y = 0; y < height; y += 40) {
      gridLines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${gridColor}" stroke-width="1" opacity="0.4"/>`;
    }

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${gridLines}
    `;

    fgContent = `
      <!-- Retro TV bezel ornaments -->
      ${slots.map((s, i) => {
      const tvX = s.x - 20;
      const tvY = s.y - 20;
      const tvW = s.w + 100;
      const tvH = s.h + 40;

      return `
          <rect x="${tvX}" y="${tvY}" width="${tvW}" height="${tvH}" rx="25" fill="${bezelColor}" stroke="#2C3E50" stroke-width="6"/>
          <rect x="${s.x - 5}" y="${s.y - 5}" width="${s.w + 10}" height="${s.h + 10}" rx="15" fill="none" stroke="${bezelDark}" stroke-width="5"/>
          <rect x="${s.x + s.w + 10}" y="${s.y}" width="60" height="${s.h}" rx="10" fill="#EAECEE" stroke="#2C3E50" stroke-width="3"/>
          <circle cx="${s.x + s.w + 40}" cy="${s.y + 40}" r="15" fill="#7F8C8D" stroke="#2C3E50" stroke-width="3"/>
          <line x1="${s.x + s.w + 40}" y1="${s.y + 25}" x2="${s.x + s.w + 40}" y2="${s.y + 40}" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
          <circle cx="${s.x + s.w + 40}" cy="${s.y + 90}" r="15" fill="#7F8C8D" stroke="#2C3E50" stroke-width="3"/>
          <line x1="${s.x + s.w + 25}" y1="${s.y + 140}" x2="${s.x + s.w + 55}" y2="${s.y + 140}" stroke="#7F8C8D" stroke-width="3" stroke-linecap="round"/>
          <line x1="${s.x + s.w + 25}" y1="${s.y + 150}" x2="${s.x + s.w + 55}" y2="${s.y + 150}" stroke="#7F8C8D" stroke-width="3" stroke-linecap="round"/>
          <line x1="${s.x + s.w + 25}" y1="${s.y + 160}" x2="${s.x + s.w + 55}" y2="${s.y + 160}" stroke="#7F8C8D" stroke-width="3" stroke-linecap="round"/>
          <line x1="${s.x + s.w + 25}" y1="${s.y + 170}" x2="${s.x + s.w + 55}" y2="${s.y + 170}" stroke="#7F8C8D" stroke-width="3" stroke-linecap="round"/>
          <rect x="${s.x + 15}" y="${s.y + 15}" width="65" height="30" rx="5" fill="black" opacity="0.6"/>
          <text x="${s.x + 47}" y="${s.y + 35}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#2ECC71">CH 0${i + 1}</text>
          <polygon points="${s.x + s.w - 35},${s.y + 20} ${s.x + s.w - 20},${s.y + 30} ${s.x + s.w - 35},${s.y + 40}" fill="#F1C40F"/>
        `;
    }).join('\n')}

      <!-- Retro rotary phone -->
      <g transform="translate(${width / 2 - 60}, ${height - 200}) scale(1.1)">
        <path d="M 20,70 C 10,40 110,40 100,70 Z" fill="#D35400" stroke="#2C3E50" stroke-width="4"/>
        <rect x="30" y="70" width="60" height="15" rx="5" fill="#E67E22" stroke="#2C3E50" stroke-width="3"/>
        <circle cx="60" cy="58" r="18" fill="white" stroke="#2C3E50" stroke-width="3"/>
        <circle cx="60" cy="58" r="10" fill="#BDC3C7"/>
        <path d="M 10,25 Q 60,10 110,25 Q 115,35 105,40 Q 60,25 15,40 Q 5,35 10,25 Z" fill="#D35400" stroke="#2C3E50" stroke-width="3"/>
        <rect x="50" y="32" width="20" height="20" fill="#D35400" stroke="#2C3E50" stroke-width="3"/>
      </g>
    `;
  }

  // ==========================================
  // CUTE MASCOT STYLE
  // ==========================================
  else if (style.type === 'cute_mascot') {
    const bgColor = '#FFEBF0';
    const accentColor = '#FF8DA1';
    const cloudColor = '#FFF5F7';

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${generateScatteredHearts(width, height, 15, accentColor, 0.25)}
    `;

    fgContent = `
      <path d="M -50,120 Q 50,70 150,110 Q 250,60 350,100 Q 450,70 550,110 Q 650,60 750,100 Q 850,120 900,120 L 900,-50 L -50,-50 Z" fill="${cloudColor}"/>
      <path d="M -50,${height - 100} Q 100,${height - 150} 250,${height - 100} Q 400,${height - 150} 550,${height - 100} Q 700,${height - 150} 850,${height - 100} L 900,${height + 100} L -50,${height + 100} Z" fill="${cloudColor}"/>

      <!-- Slot Borders -->
      ${slots.map(s => `
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${accentColor}" stroke-width="7" rx="15"/>
        <rect x="${s.x + 4}" y="${s.y + 4}" width="${s.w - 8}" height="${s.h - 8}" fill="none" stroke="white" stroke-width="3" rx="11"/>
      `).join('\n')}

      <!-- Cute Loopy mascot -->
      <g transform="translate(${width / 2 - 50}, 20) scale(0.9)">
        <circle cx="50" cy="50" r="42" fill="#F1948A" stroke="#C0392B" stroke-width="3"/>
        <circle cx="15" cy="18" r="12" fill="#F1948A" stroke="#C0392B" stroke-width="3"/>
        <circle cx="15" cy="18" r="6" fill="#FADBD8"/>
        <circle cx="85" cy="18" r="12" fill="#F1948A" stroke="#C0392B" stroke-width="3"/>
        <circle cx="85" cy="18" r="6" fill="#FADBD8"/>
        <ellipse cx="35" cy="45" rx="4" ry="6" fill="#000"/>
        <ellipse cx="65" cy="45" rx="4" ry="6" fill="#000"/>
        <ellipse cx="50" cy="58" rx="12" ry="8" fill="#FFF"/>
        <polygon points="50,56 46,52 54,52" fill="#000"/>
        <circle cx="28" cy="54" r="6" fill="#F5B7B1"/>
        <circle cx="72" cy="54" r="6" fill="#F5B7B1"/>
        <path d="M 45,61 Q 50,65 55,61" fill="none" stroke="#000" stroke-width="2"/>
      </g>

      <!-- Bear mascot -->
      <g transform="translate(40, ${height - 180}) scale(1.1)">
        <circle cx="40" cy="50" r="35" fill="#D35400" stroke="#873600" stroke-width="3"/>
        <circle cx="15" cy="22" r="10" fill="#D35400" stroke="#873600" stroke-width="3"/>
        <circle cx="65" cy="22" r="10" fill="#D35400" stroke="#873600" stroke-width="3"/>
        <circle cx="28" cy="45" r="4" fill="#000"/>
        <circle cx="52" cy="45" r="4" fill="#000"/>
        <ellipse cx="40" cy="55" rx="10" ry="7" fill="white"/>
        <circle cx="40" cy="52" r="3" fill="#000"/>
      </g>

      <!-- Bunny mascot -->
      <g transform="translate(${width - 150}, ${height - 190}) scale(1.1)">
        <ellipse cx="40" cy="60" rx="32" ry="28" fill="#FFF" stroke="#BDC3C7" stroke-width="3"/>
        <ellipse cx="25" cy="25" rx="9" ry="25" fill="#FFF" stroke="#BDC3C7" stroke-width="3" transform="rotate(-10 25 25)"/>
        <ellipse cx="25" cy="25" rx="4" ry="18" fill="#FFD1DC" transform="rotate(-10 25 25)"/>
        <ellipse cx="55" cy="25" rx="9" ry="25" fill="#FFF" stroke="#BDC3C7" stroke-width="3" transform="rotate(10 55 25)"/>
        <ellipse cx="55" cy="25" rx="4" ry="18" fill="#FFD1DC" transform="rotate(10 55 25)"/>
        <circle cx="28" cy="55" r="4" fill="#000"/>
        <circle cx="52" cy="55" r="4" fill="#000"/>
        <polygon points="40,62 37,59 43,59" fill="#FF8DA1"/>
        <circle cx="20" cy="62" r="5" fill="#FFD1DC"/>
        <circle cx="60" cy="62" r="5" fill="#FFD1DC"/>
      </g>

      <text x="${width / 2}" y="${height - 50}" text-anchor="middle" font-family="'Caveat', cursive, sans-serif" font-weight="bold" font-size="28" fill="#D87093">always together ♥</text>
    `;
  }

  // ==========================================
  // CINEMA TICKET STYLE
  // ==========================================
  else if (style.type === 'cinema_ticket') {
    const ticketBg = '#FAF0DD';
    const darkColor = '#4A3B32';
    const lineY1 = 280;
    const lineY2 = height - 300;

    bgContent = `
      <rect width="100%" height="100%" fill="${ticketBg}"/>
      <circle cx="0" cy="${lineY1}" r="30" fill="${darkColor}"/>
      <circle cx="${width}" cy="${lineY1}" r="30" fill="${darkColor}"/>
      <circle cx="0" cy="${lineY2}" r="30" fill="${darkColor}"/>
      <circle cx="${width}" cy="${lineY2}" r="30" fill="${darkColor}"/>
    `;

    fgContent = `
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="none" stroke="${darkColor}" stroke-width="6" rx="10"/>

      <!-- Film strip holes -->
      ${Array.from({ length: Math.floor(height / 80) }).map((_, i) => {
      const y = i * 80 + 40;
      if (Math.abs(y - lineY1) < 60 || Math.abs(y - lineY2) < 60) return '';
      return `
          <rect x="30" y="${y}" width="15" height="25" rx="3" fill="${darkColor}"/>
          <rect x="${width - 45}" y="${y}" width="15" height="25" rx="3" fill="${darkColor}"/>
        `;
    }).join('\n')}

      <line x1="30" y1="${lineY1}" x2="${width - 30}" y2="${lineY1}" stroke="${darkColor}" stroke-width="3" stroke-dasharray="10,8"/>
      <line x1="30" y1="${lineY2}" x2="${width - 30}" y2="${lineY2}" stroke="${darkColor}" stroke-width="3" stroke-dasharray="10,8"/>

      <!-- Barcode -->
      <g transform="translate(${width / 2 - 150}, 50)">
        ${Array.from({ length: 28 }).map((_, i) => {
      const w = (i % 3 === 0) ? 6 : (i % 2 === 0) ? 2 : 4;
      const x = i * 11;
      return `<rect x="${x}" y="0" width="${w}" height="60" fill="${darkColor}"/>`;
    }).join('\n')}
        <text x="150" y="80" text-anchor="middle" font-family="monospace" font-size="12" fill="${darkColor}" letter-spacing="4">NO. 20260716</text>
      </g>

      <!-- Slot Borders -->
      ${slots.map(s => `
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${darkColor}" stroke-width="4"/>
        <rect x="${s.x + 6}" y="${s.y + 6}" width="${s.w - 12}" height="${s.h - 12}" fill="none" stroke="${darkColor}" stroke-width="1.5" stroke-dasharray="4,2"/>
      `).join('\n')}

      <text x="${width / 2}" y="${lineY1 - 50}" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="bold" font-size="28" fill="${darkColor}" letter-spacing="6">NOW SHOWING</text>
      <text x="${width / 2}" y="${lineY2 + 80}" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="bold" font-size="32" fill="${darkColor}" letter-spacing="4">ADMIT ONE</text>
      <text x="${width / 2}" y="${lineY2 + 130}" text-anchor="middle" font-family="monospace" font-size="14" fill="${darkColor}" letter-spacing="2">BALISNAP CINEMA TICKET</text>
    `;
  }

  // ==========================================
  // Y2K BADDIE CYBER STYLE
  // ==========================================
  else if (style.type === 'y2k_baddie') {
    const bgColor = '#1B0822';
    const gridColor = '#D01C8B';
    const starColor = '#00F0FF';

    let gridLines = '';
    for (let x = -width; x < width * 2; x += 60) {
      gridLines += `<line x1="${x}" y1="0" x2="${x + height / 2}" y2="${height}" stroke="${gridColor}" stroke-width="1" opacity="0.25"/>`;
      gridLines += `<line x1="${x}" y1="0" x2="${x - height / 2}" y2="${height}" stroke="${gridColor}" stroke-width="1" opacity="0.25"/>`;
    }

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${gridLines}
    `;

    fgContent = `
      <!-- Cyber Star Sparkles -->
      <g transform="translate(60, 60) scale(1.2)">
        <path d="M 30,0 Q 30,25 55,30 Q 30,35 30,60 Q 30,35 5,30 Q 30,25 30,0" fill="${starColor}"/>
        <circle cx="30" cy="30" r="4" fill="white"/>
      </g>
      <g transform="translate(${width - 110}, ${height / 2 - 50})">
        <path d="M 30,0 Q 30,25 55,30 Q 30,35 30,60 Q 30,35 5,30 Q 30,25 30,0" fill="#FF00A0"/>
        <circle cx="30" cy="30" r="4" fill="white"/>
      </g>
      <g transform="translate(60, ${height - 200}) scale(0.9)">
        <path d="M 30,0 Q 30,25 55,30 Q 30,35 30,60 Q 30,35 5,30 Q 30,25 30,0" fill="${starColor}"/>
      </g>

      <!-- Slot Borders -->
      ${slots.map(s => `
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${gridColor}" stroke-width="6" rx="8"/>
        <rect x="${s.x - 3}" y="${s.y - 3}" width="${s.w + 6}" height="${s.h + 6}" fill="none" stroke="${starColor}" stroke-width="2" rx="11" opacity="0.7"/>
      `).join('\n')}

      <!-- Y2K Wireframe heart -->
      <g transform="translate(${width - 140}, ${height / 2 + 220}) scale(0.8)">
        <path d="M 50,30 C 50,10 20,10 20,30 C 20,55 50,75 50,75 C 50,75 80,55 80,30 C 80,10 50,10 50,30 Z" fill="none" stroke="${starColor}" stroke-width="4"/>
        <path d="M 50,35 C 50,20 28,20 28,35 C 28,52 50,67 50,67 C 50,67 72,52 72,35 C 72,20 50,20 50,35 Z" fill="none" stroke="#FF00A0" stroke-width="2" stroke-dasharray="4,2"/>
      </g>

      <text x="${width / 2}" y="${height - 50}" text-anchor="middle" font-family="'Arial Black', Gadget, sans-serif" font-weight="900" font-size="24" fill="${starColor}" letter-spacing="4">CYBER BADDIE <tspan fill="#FF00A0">99</tspan></text>
    `;
  }

  // ==========================================
  // COZY KNIT STYLE
  // ==========================================
  else if (style.type === 'cozy_knit') {
    const knitBgColor = '#EAE2D5';
    const highlightColor = '#FFFDF9';
    const shadowColor = '#CFC0AC';

    // Generate repeat rows of vertical knit stitches (wales)
    let knitColumns = '';
    const colWidth = 60;
    const stitchHeight = 30;
    for (let colX = 0; colX < width; colX += colWidth) {
      // Draw background shadow line for vertical groove channel
      knitColumns += `<rect x="${colX + colWidth/2 - 4}" y="0" width="8" height="${height}" fill="${shadowColor}" opacity="0.3"/>`;
      
      // Draw stacked V-loops vertically
      for (let y = -10; y < height + 40; y += stitchHeight) {
        const leftX = colX + 4;
        const midX = colX + colWidth/2;
        const rightX = colX + colWidth - 4;
        
        knitColumns += `
          <!-- Highlight curve -->
          <path d="M ${leftX},${y} C ${leftX + 10},${y + 8} ${midX - 4},${y + 12} ${midX},${y + 20} C ${midX + 4},${y + 12} ${rightX - 10},${y + 8} ${rightX},${y}" fill="none" stroke="${highlightColor}" stroke-width="4.5" stroke-linecap="round"/>
          <!-- Shadow curve slightly shifted down -->
          <path d="M ${leftX},${y} C ${leftX + 10},${y + 8} ${midX - 4},${y + 12} ${midX},${y + 20} C ${midX + 4},${y + 12} ${rightX - 10},${y + 8} ${rightX},${y}" fill="none" stroke="${shadowColor}" stroke-width="1.8" stroke-linecap="round" transform="translate(0, 2.5)"/>
        `;
      }
    }

    bgContent = `
      <rect width="100%" height="100%" fill="${knitBgColor}"/>
      ${knitColumns}
      
      <!-- Soft shadows -->
      <filter id="cozy-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="3" dy="6" stdDeviation="6" flood-color="#4A3B32" flood-opacity="0.2"/>
      </filter>
    `;

    fgContent = `
      <!-- 1. TOP STICKER PILL -->
      <g filter="url(#cozy-shadow)">
        <!-- Pill Base -->
        <rect x="40" y="80" width="${width - 80}" height="100" rx="50" fill="#FAF8F5" stroke="#E9E5DE" stroke-width="2.5"/>
        <rect x="44" y="84" width="${width - 88}" height="92" rx="46" fill="none" stroke="#FAF8F5" stroke-width="2"/>
        
        <!-- Tulip -->
        <g transform="translate(100, 95) scale(0.65)">
          <path d="M 15,35 L 15,65" stroke="#82C4A2" stroke-width="7" stroke-linecap="round"/>
          <path d="M 15,60 C 5,55 0,45 5,35 C 10,48 15,50 15,60 M 15,60 C 25,55 30,45 25,35 C 20,48 15,50 15,60" fill="#82C4A2"/>
          <path d="M 15,10 C 2,25 0,42 15,50 C 30,42 28,25 15,10 Z" fill="#E8A7B5"/>
          <path d="M 5,20 C -2,32 5,42 12,46" fill="#F1948A" opacity="0.9"/>
          <path d="M 25,20 C 32,32 25,42 18,46" fill="#F1948A" opacity="0.9"/>
        </g>

        <!-- Strawberry Shortcake -->
        <g transform="translate(190, 105) scale(0.65)">
          <ellipse cx="25" cy="48" rx="28" ry="8" fill="#EAECEE" stroke="#BDC3C7" stroke-width="2"/>
          <path d="M 5,42 L 40,25 L 45,42 Z" fill="#F9E79F"/>
          <path d="M 5,34 L 40,17 L 45,34 Z" fill="#FAF8F5"/>
          <path d="M 5,26 L 40,9 L 45,26 Z" fill="#F9E79F"/>
          <path d="M 5,18 L 40,1 L 45,18 Z" fill="#FAF8F5"/>
          <path d="M 5,28 L 40,11" stroke="#E74C3C" stroke-width="3"/>
          <path d="M 5,14 L 40,0" stroke="#FAF8F5" stroke-width="4"/>
          <path d="M 22,2 C 16,-4 12,6 22,12 C 32,6 28,-4 22,2 Z" fill="#E74C3C"/>
          <circle cx="20" cy="5" r="0.8" fill="white"/>
          <circle cx="24" cy="7" r="0.8" fill="white"/>
        </g>

        <!-- Pink Bow -->
        <g transform="translate(285, 105) scale(0.65)">
          <path d="M 12,20 C -5,5 -10,35 12,24 C 34,35 29,5 12,20 Z" fill="#F1948A" stroke="#C0392B" stroke-width="1.5"/>
          <circle cx="12" cy="20" r="6" fill="#E8A7B5" stroke="#C0392B" stroke-width="1.5"/>
          <path d="M 10,24 C 0,35 -5,55 5,60" fill="none" stroke="#F1948A" stroke-width="5" stroke-linecap="round"/>
          <path d="M 14,24 C 24,35 29,55 19,60" fill="none" stroke="#F1948A" stroke-width="5" stroke-linecap="round"/>
        </g>

        <!-- Coffee Cup -->
        <g transform="translate(370, 105) scale(0.62)">
          <ellipse cx="25" cy="44" rx="25" ry="6" fill="#FDFEFE" stroke="#BDC3C7" stroke-width="2"/>
          <ellipse cx="38" cy="24" rx="8" ry="10" fill="none" stroke="#FDFEFE" stroke-width="4"/>
          <path d="M 10,14 L 40,14 C 40,34 10,34 10,14 Z" fill="#FDFEFE" stroke="#BDC3C7" stroke-width="2"/>
          <ellipse cx="25" cy="14" rx="15" ry="4" fill="#D35400"/>
          <path d="M 20,4 Q 17,-4 22,-8" fill="none" stroke="#BDC3C7" stroke-width="2" stroke-linecap="round"/>
          <path d="M 28,6 Q 25,-2 30,-6" fill="none" stroke="#BDC3C7" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- White Heart -->
        <g transform="translate(460, 108) scale(0.68)">
          <path d="M 20,12 C 20,4 2,4 2,18 C 2,30 20,42 20,48 C 20,42 38,30 38,18 C 38,4 20,4 20,12 Z" fill="#FDFEFE" stroke="#EAECEE" stroke-width="2.5"/>
          <ellipse cx="14" cy="16" rx="6" ry="3" fill="#FAF8F5" opacity="0.6" transform="rotate(-30 14 16)"/>
        </g>

        <!-- Yellow Star -->
        <g transform="translate(555, 108) scale(0.65)">
          <polygon points="25,2 32,16 47,19 36,30 38,45 25,38 12,45 14,30 3,19 18,16" fill="#F9E79F" stroke="#F39C12" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="20" cy="18" r="3" fill="white" opacity="0.5"/>
        </g>

        <!-- Sparkle Cross -->
        <g transform="translate(640, 108) scale(0.65)">
          <path d="M 25,5 C 25,18 20,20 5,20 C 20,20 25,22 25,35 C 25,22 30,20 45,20 C 30,20 25,18 25,5" fill="#5D6D7E" stroke="#34495E" stroke-width="2.5" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- 2. PHOTO SLOT OVERLAY CONTAINER -->
      <g filter="url(#cozy-shadow)">
        ${slots.map(s => `
          <rect x="${s.x - 20}" y="${s.y - 20}" width="${s.w + 40}" height="${s.h + 40}" rx="35" fill="#FAF8F5" stroke="#E9E5DE" stroke-width="3"/>
          <rect x="${s.x - 12}" y="${s.y - 12}" width="${s.w + 24}" height="${s.h + 24}" rx="27" fill="none" stroke="#FAF8F5" stroke-width="3"/>
          <rect x="${s.x - 2}" y="${s.y - 2}" width="${s.w + 4}" height="${s.h + 4}" rx="${s.rx || 15}" fill="none" stroke="#D5D0C7" stroke-width="4"/>
        `).join('\n')}
      </g>

      <!-- 3. SMALL WHITE FLOWER -->
      <g filter="url(#cozy-shadow)">
        <g transform="translate(100, 810) scale(0.9)">
          <circle cx="30" cy="18" r="16" fill="#FDFEFE"/>
          <circle cx="16" cy="30" r="16" fill="#FDFEFE"/>
          <circle cx="22" cy="48" r="16" fill="#FDFEFE"/>
          <circle cx="42" cy="42" r="16" fill="#FDFEFE"/>
          <circle cx="44" cy="24" r="16" fill="#FDFEFE"/>
          <circle cx="30" cy="30" r="11" fill="#F9E79F"/>
        </g>
      </g>

      <!-- 4. BOTTOM LEFT SKETCHED BOW -->
      <g stroke="#3E342B" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 180,1050 C 135,1000 110,1040 180,1070 C 250,1040 225,1000 180,1050 Z" stroke-width="2.5"/>
        <path d="M 182,1048 C 140,1005 115,1045 182,1068 C 248,1045 220,1005 182,1048 Z" stroke-width="1.2" stroke-dasharray="2,1"/>
        <ellipse cx="180" cy="1060" rx="8" ry="7" fill="#EAE2D5" stroke-width="2.5"/>
        <circle cx="180" cy="1060" r="4" stroke-width="1.2"/>
        <path d="M 175,1065 C 160,1110 135,1170 150,1230" stroke-width="2.5"/>
        <path d="M 174,1066 C 158,1112 133,1172 148,1230 M 177,1064 C 162,1108 137,1168 152,1230" stroke-width="0.8"/>
        <path d="M 185,1065 C 200,1110 225,1170 210,1230" stroke-width="2.5"/>
        <path d="M 186,1066 C 202,1112 227,1172 212,1230 M 184,1064 C 198,1108 223,1168 208,1230" stroke-width="0.8"/>
        <g stroke-width="1.5" stroke="#3E342B">
          <line x1="100" y1="1020" x2="100" y2="1030"/>
          <line x1="95" y1="1025" x2="105" y2="1025"/>
          <line x1="250" y1="1040" x2="250" y2="1050"/>
          <line x1="245" y1="1045" x2="255" y2="1045"/>
          <line x1="80" y1="1120" x2="80" y2="1130"/>
          <line x1="75" y1="1125" x2="85" y2="1125"/>
          <line x1="260" y1="1150" x2="260" y2="1160"/>
          <line x1="255" y1="1155" x2="265" y2="1155"/>
          <circle cx="110" cy="1100" r="1.5" fill="#3E342B"/>
          <circle cx="230" cy="1110" r="1.5" fill="#3E342B"/>
          <circle cx="105" cy="1180" r="1.5" fill="#3E342B"/>
        </g>
      </g>

      <!-- 5. BOTTOM RIGHT FELT MENU PANEL -->
      <g filter="url(#cozy-shadow)">
        <rect x="420" y="900" width="330" height="400" rx="35" fill="#FAF8F5" stroke="#E9E5DE" stroke-width="3"/>
        <rect x="432" y="912" width="306" height="376" rx="23" fill="none" stroke="#CFC0AC" stroke-width="1.8" stroke-dasharray="8,6"/>
        <line x1="440" y1="995" x2="730" y2="995" stroke="#E9E5DE" stroke-width="3"/>
        <line x1="440" y1="1085" x2="730" y2="1085" stroke="#E9E5DE" stroke-width="3"/>
        <line x1="440" y1="1175" x2="730" y2="1175" stroke="#E9E5DE" stroke-width="3"/>
        <text x="465" y="963" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" fill="#3E342B">Reply</text>
        <path d="M 685,958 Q 700,958 695,945 M 685,958 L 693,950 M 685,958 L 693,966" stroke="#3E342B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M 695,945 Q 700,968 678,966" stroke="#3E342B" stroke-width="3" stroke-linecap="round" fill="none"/>
        <text x="465" y="1048" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" fill="#3E342B">Forward</text>
        <path d="M 678,1035 L 698,1042 L 678,1049 L 683,1042 Z" stroke="#3E342B" stroke-linejoin="round" fill="none" stroke-width="2.5"/>
        <line x1="683" y1="1042" x2="695" y2="1042" stroke="#3E342B" stroke-width="2.5"/>
        <text x="465" y="1138" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" fill="#3E342B">Copy</text>
        <rect x="682" y="1122" width="12" height="12" rx="2.5" stroke="#3E342B" stroke-width="2.5" fill="none"/>
        <path d="M 690,1122 L 690,1118 Q 690,1116 688,1116 L 678,1116 Q 676,1116 676,1118 L 676,1128 Q 676,1130 678,1130 L 682,1130" stroke="#3E342B" stroke-linecap="round" fill="none" stroke-width="2.5"/>
        <text x="465" y="1228" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" fill="#E74C3C">Report</text>
        <path d="M 680,1212 Q 675,1212 675,1220 Q 675,1228 682,1228 L 682,1233 L 687,1228 Q 695,1228 695,1220 Q 695,1212 680,1212 Z" stroke="#E74C3C" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
        <line x1="684" y1="1218" x2="684" y2="1222" stroke="#E74C3C" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="684" cy="1225" r="1.2" fill="#E74C3C"/>
      </g>
    `;
  }

  // ==========================================
  // FILM STRIP STYLE
  // ==========================================
  else if (style.type === 'filmstrip') {
    const stripColor = style.stripColor || '#111111';
    const sprocketColor = style.sprocketColor || '#1a1a1a';
    const holeGap = 55;
    const holeW = 22;
    const holeH = 16;
    const stripMargin = 50;

    bgContent = `
      <rect width="100%" height="100%" fill="${stripColor}"/>
      <!-- Left sprocket holes -->
      ${generateSprocketHoles(height, 12, holeW, holeH, holeGap)}
      <!-- Right sprocket holes -->
      ${generateSprocketHoles(height, width - 12 - holeW, holeW, holeH, holeGap)}
    `;

    // Frame numbers near each slot
    fgContent = slots.map((s, i) => `
      <text x="${s.x + s.w - 10}" y="${s.y + s.h + 28}" text-anchor="end" font-family="monospace" font-size="18" fill="#888" letter-spacing="1">${String(i + 1).padStart(2, '0')}A</text>
    `).join('');

    bottomText = `
      <text x="${width / 2}" y="${brandY}" text-anchor="middle" font-family="monospace" font-size="${brandFontSize}" font-weight="bold" fill="#FBBF24" letter-spacing="3">BALISNAP STUDIO</text>
      <text x="${width / 2}" y="${brandY + brandFontSize + 4}" text-anchor="middle" font-family="monospace" font-size="${subFontSize}" fill="#666" letter-spacing="2">FILM ${String(Math.floor(Math.random() * 900) + 100)}</text>
    `;
  }

  // ==========================================
  // KOREAN 4-CUT STYLE
  // ==========================================
  else if (style.type === 'korean') {
    const borderColor = style.borderColor || '#E8B4B8';
    const bgColor = style.bgColor || '#FFF5F7';
    const accentColor = style.accentColor || '#D4A0A7';
    const borderWidth = style.borderWidth || 35;

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <!-- Thick colored outer border -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth * 2}" rx="20"/>
      <!-- Inner white border -->
      <rect x="${borderWidth}" y="${borderWidth}" width="${width - borderWidth * 2}" height="${height - borderWidth * 2}" fill="white" rx="12"/>
      <!-- Subtle pattern in border area -->
      ${generateScatteredHearts(width, height, 25, accentColor, 0.15)}
    `;

    // Slot borders
    fgContent = slots.map(s =>
      `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${borderColor}" stroke-width="4" rx="${s.rx || 8}"/>`
    ).join('\n');

    bottomText = `
      <text x="${width / 2}" y="${brandY - 10}" text-anchor="middle" font-family="'Caveat', cursive, sans-serif" font-size="${brandFontSize + 6}" font-weight="bold" fill="${borderColor}" letter-spacing="1">BaliSnap Studio</text>
      <line x1="${width / 2 - 60}" y1="${brandY + 8}" x2="${width / 2 + 60}" y2="${brandY + 8}" stroke="${accentColor}" stroke-width="1.5"/>
    `;
  }

  // ==========================================
  // POLAROID STYLE
  // ==========================================
  else if (style.type === 'polaroid') {
    const shadowColor = style.shadowColor || 'rgba(0,0,0,0.08)';
    const tapeColor = style.tapeColor || '#C9A66B';

    bgContent = `
      <!-- White card base -->
      <rect width="100%" height="100%" fill="#FFFFFF" rx="8"/>
      <!-- Subtle paper shadow -->
      <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="#E8E0D8" stroke-width="2" rx="6"/>
      <!-- Slight aged paper effect -->
      <rect width="100%" height="100%" fill="#F8F4EE" opacity="0.3"/>
    `;

    // Tape/clip decorations at corners
    const tapeW = 60, tapeH = 20;
    fgContent = `
      <!-- Decorative tape at top -->
      <rect x="${width / 2 - tapeW / 2}" y="-${tapeH / 3}" width="${tapeW}" height="${tapeH}" rx="2" fill="${tapeColor}" opacity="0.7" transform="rotate(-5 ${width / 2} ${tapeH / 2})"/>
    `;

    // Slot inner shadows
    fgContent += slots.map(s =>
      `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="#DDD" stroke-width="1.5" rx="${s.rx || 0}"/>
       <rect x="${s.x + 2}" y="${s.y + 2}" width="${s.w - 4}" height="${s.h - 4}" fill="none" stroke="#EEE" stroke-width="1" rx="${s.rx || 0}"/>`
    ).join('\n');

    const bottomPadding = height >= 1400 ? 100 : 70;
    bottomText = `
      <text x="${width / 2}" y="${height - bottomPadding + 15}" text-anchor="middle" font-family="'Playfair Display', serif" font-size="${brandFontSize}" font-weight="bold" fill="#6B4A3A" letter-spacing="2">BaliSnap Studio</text>
      <text x="${width / 2}" y="${height - bottomPadding + 15 + brandFontSize}" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="${subFontSize}" fill="#B8A898" letter-spacing="3">${new Date().getFullYear()}.07.16</text>
    `;
  }

  // ==========================================
  // CUTE / KAWAII STYLE
  // ==========================================
  else if (style.type === 'cute') {
    const bgColor = style.bgColor || '#FFF0F5';
    const borderColor = style.borderColor || '#FFB6C1';
    const accentColor = style.accentColor || '#FF69B4';
    const patternType = style.pattern || 'hearts';

    let pattern = '';
    if (patternType === 'hearts') {
      pattern = generateScatteredHearts(width, height, 40, accentColor, 0.12);
    } else if (patternType === 'stars') {
      pattern = generateScatteredStars(width, height, 35, accentColor, 0.1);
    } else if (patternType === 'dots') {
      pattern = generatePolkaDots(width, height, 50, accentColor, 0.1);
    }

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <!-- Thick colored border -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${borderColor}" stroke-width="24" rx="30"/>
      <!-- Scattered pattern -->
      ${pattern}
    `;

    // Ribbon at top center
    fgContent = generateRibbon(width / 2, 35, accentColor, 28);

    // Slot borders with rounded corners
    fgContent += slots.map(s =>
      `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${borderColor}" stroke-width="5" rx="${s.rx || 15}"/>
       <rect x="${s.x + 5}" y="${s.y + 5}" width="${s.w - 10}" height="${s.h - 10}" fill="none" stroke="white" stroke-width="2" rx="${s.rx || 12}" opacity="0.6"/>`
    ).join('\n');

    // Small star decorations near corners of each slot
    fgContent += slots.map((s, i) => {
      const starX = i % 2 === 0 ? s.x - 8 : s.x + s.w - 4;
      const starY = s.y - 8;
      return `<polygon points="${starX},${starY - 6} ${starX + 2},${starY - 2} ${starX + 6},${starY} ${starX + 2},${starY + 2} ${starX},${starY + 6} ${starX - 2},${starY + 2} ${starX - 6},${starY} ${starX - 2},${starY - 2}" fill="${accentColor}" opacity="0.5"/>`;
    }).join('\n');

    bottomText = `
      <text x="${width / 2}" y="${brandY - 5}" text-anchor="middle" font-family="'Caveat', cursive, sans-serif" font-size="${brandFontSize + 8}" font-weight="bold" fill="${accentColor}" letter-spacing="1">BaliSnap Studio</text>
      ${generateScatteredHearts(width, brandY - 30, 5, accentColor, 0.3)}
    `;
  }

  // ==========================================
  // RETRO / AESTHETIC STYLE
  // ==========================================
  else if (style.type === 'retro') {
    const bgColor = style.bgColor || '#F5EDE0';
    const borderColor = style.borderColor || '#8B7355';
    const accentColor = style.accentColor || '#C9A66B';
    const patternStyle = style.pattern || 'crosshatch';

    let pattern = '';
    if (patternStyle === 'crosshatch') {
      // Subtle cross-hatch pattern
      for (let x = 0; x < width; x += 30) {
        pattern += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${borderColor}" stroke-width="0.3" opacity="0.15"/>`;
      }
      for (let y = 0; y < height; y += 30) {
        pattern += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${borderColor}" stroke-width="0.3" opacity="0.15"/>`;
      }
    } else if (patternStyle === 'dotgrid') {
      pattern = generatePolkaDots(width, height, 60, borderColor, 0.08);
    }

    bgContent = `
      <rect width="100%" height="100%" fill="${bgColor}"/>
      ${pattern}
      <!-- Double-line border (vintage ticket feel) -->
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="none" stroke="${borderColor}" stroke-width="3" rx="5"/>
      <rect x="22" y="22" width="${width - 44}" height="${height - 44}" fill="none" stroke="${borderColor}" stroke-width="1" rx="3" stroke-dasharray="8,4"/>
    `;

    // Art deco corner decorations
    fgContent = generateCornerDecorations(width, height, accentColor, 80);

    // Slot borders
    fgContent += slots.map(s =>
      `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${borderColor}" stroke-width="3" rx="${s.rx || 4}"/>`
    ).join('\n');

    // Vintage stamp/ticket element
    const stampY = height >= 2800 ? brandY - 60 : brandY - 30;
    fgContent += `
      <line x1="${width / 2 - 80}" y1="${stampY - 15}" x2="${width / 2 + 80}" y2="${stampY - 15}" stroke="${accentColor}" stroke-width="1"/>
    `;

    bottomText = `
      <text x="${width / 2}" y="${brandY}" text-anchor="middle" font-family="'Playfair Display', serif" font-size="${brandFontSize}" font-weight="bold" fill="${borderColor}" letter-spacing="4">BALISNAP STUDIO</text>
      <text x="${width / 2}" y="${brandY + brandFontSize + 2}" text-anchor="middle" font-family="monospace" font-size="${subFontSize}" fill="${accentColor}" letter-spacing="2">EST. 2026 · BALI</text>
      <line x1="${width / 2 - 80}" y1="${brandY + brandFontSize + 12}" x2="${width / 2 + 80}" y2="${brandY + brandFontSize + 12}" stroke="${accentColor}" stroke-width="1"/>
    `;
  }

  // Assemble full SVG
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="${maskId}">
      <rect width="100%" height="100%" fill="white"/>
      ${maskRects}
    </mask>
  </defs>
  <g mask="url(#${maskId})">
    ${bgContent}
  </g>
  ${fgContent}
  ${bottomText}
</svg>`;

  return svg.trim();
}


// ==========================================
// 30 FRAME CONFIGURATIONS
// ==========================================
const frameConfigs = [

  // ============================================
  // FILM STRIP (6 templates)
  // ============================================

  // 1. Classic Film Strip — 1 slot wide
  {
    id: "film-classic-1",
    width: 1200, height: 1500,
    slots: [{ x: 65, y: 60, w: 1070, h: 1070 }],
    style: { type: 'filmstrip', stripColor: '#111111' }
  },
  // 2. Film Strip Vertical — 3 slots
  {
    id: "film-strip-3",
    width: 800, height: 2400,
    slots: [
      { x: 65, y: 60, w: 670, h: 500 },
      { x: 65, y: 610, w: 670, h: 500 },
      { x: 65, y: 1160, w: 670, h: 500 }
    ],
    style: { type: 'filmstrip', stripColor: '#111111' }
  },
  // 3. Film Strip Vertical — 4 slots (classic 4-cut film)
  {
    id: "film-strip-4",
    width: 800, height: 3000,
    slots: [
      { x: 65, y: 60, w: 670, h: 500 },
      { x: 65, y: 610, w: 670, h: 500 },
      { x: 65, y: 1160, w: 670, h: 500 },
      { x: 65, y: 1710, w: 670, h: 500 }
    ],
    style: { type: 'filmstrip', stripColor: '#111111' }
  },
  // 4. Film Contact Sheet — 2x2 grid
  {
    id: "film-contact-2x2",
    width: 1200, height: 1200,
    slots: [
      { x: 65, y: 55, w: 510, h: 420 },
      { x: 625, y: 55, w: 510, h: 420 },
      { x: 65, y: 525, w: 510, h: 420 },
      { x: 625, y: 525, w: 510, h: 420 }
    ],
    style: { type: 'filmstrip', stripColor: '#1a1a1a' }
  },
  // 5. Film Strip 6-shot — 2x3 grid
  {
    id: "film-contact-6",
    width: 1200, height: 1600,
    slots: [
      { x: 65, y: 55, w: 510, h: 370 },
      { x: 625, y: 55, w: 510, h: 370 },
      { x: 65, y: 475, w: 510, h: 370 },
      { x: 625, y: 475, w: 510, h: 370 },
      { x: 65, y: 895, w: 510, h: 370 },
      { x: 625, y: 895, w: 510, h: 370 }
    ],
    style: { type: 'filmstrip', stripColor: '#111111' }
  },
  // 6. Film Mini Strip — 8 shots (2x4 grid)
  {
    id: "film-mini-8",
    width: 1200, height: 2000,
    slots: [
      { x: 65, y: 55, w: 510, h: 340 },
      { x: 625, y: 55, w: 510, h: 340 },
      { x: 65, y: 445, w: 510, h: 340 },
      { x: 625, y: 445, w: 510, h: 340 },
      { x: 65, y: 835, w: 510, h: 340 },
      { x: 625, y: 835, w: 510, h: 340 },
      { x: 65, y: 1225, w: 510, h: 340 },
      { x: 625, y: 1225, w: 510, h: 340 }
    ],
    style: { type: 'filmstrip', stripColor: '#111111' }
  },

  // ============================================
  // KOREAN 4-CUT (6 templates)
  // ============================================

  // 7. Korean Pink — 3 slots vertical
  {
    id: "korean-pink-3",
    width: 800, height: 2400,
    slots: [
      { x: 80, y: 80, w: 640, h: 500, rx: 10 },
      { x: 80, y: 630, w: 640, h: 500, rx: 10 },
      { x: 80, y: 1180, w: 640, h: 500, rx: 10 }
    ],
    style: { type: 'korean', borderColor: '#E8B4B8', bgColor: '#FFF5F7', accentColor: '#D4A0A7', borderWidth: 35 }
  },
  // 8. Korean Lavender — 4 slots vertical
  {
    id: "korean-lavender-4",
    width: 800, height: 3000,
    slots: [
      { x: 80, y: 80, w: 640, h: 500, rx: 10 },
      { x: 80, y: 630, w: 640, h: 500, rx: 10 },
      { x: 80, y: 1180, w: 640, h: 500, rx: 10 },
      { x: 80, y: 1730, w: 640, h: 500, rx: 10 }
    ],
    style: { type: 'korean', borderColor: '#C4B5D0', bgColor: '#F8F0FF', accentColor: '#A890BE', borderWidth: 35 }
  },
  // 9. Korean Mint — 2 slots vertical
  {
    id: "korean-mint-2",
    width: 800, height: 1600,
    slots: [
      { x: 80, y: 80, w: 640, h: 540, rx: 10 },
      { x: 80, y: 670, w: 640, h: 540, rx: 10 }
    ],
    style: { type: 'korean', borderColor: '#8ECFC0', bgColor: '#F0FFF8', accentColor: '#6DB5A0', borderWidth: 35 }
  },
  // 10. Korean Maroon — Pinterest Exact Replica (3 slots)
  {
    id: "korean-maroon-3",
    width: 800, height: 2400,
    slots: [
      { x: 80, y: 440, w: 640, h: 480 },
      { x: 80, y: 980, w: 640, h: 480 },
      { x: 80, y: 1520, w: 640, h: 480 }
    ],
    style: { type: 'pinterest_maroon' }
  },
  // 11. Korean Baby Blue — 1 slot (single portrait)
  {
    id: "korean-blue-1",
    width: 800, height: 1200,
    slots: [
      { x: 80, y: 80, w: 640, h: 800, rx: 12 }
    ],
    style: { type: 'korean', borderColor: '#89B9D4', bgColor: '#F0F8FF', accentColor: '#6A9FBF', borderWidth: 35 }
  },
  // 12. Korean Cream — 6 slots (2x3 grid)
  {
    id: "korean-cream-6",
    width: 1200, height: 1800,
    slots: [
      { x: 65, y: 65, w: 510, h: 400, rx: 10 },
      { x: 625, y: 65, w: 510, h: 400, rx: 10 },
      { x: 65, y: 515, w: 510, h: 400, rx: 10 },
      { x: 625, y: 515, w: 510, h: 400, rx: 10 },
      { x: 65, y: 965, w: 510, h: 400, rx: 10 },
      { x: 625, y: 965, w: 510, h: 400, rx: 10 }
    ],
    style: { type: 'korean', borderColor: '#D4C4A8', bgColor: '#FFFAF0', accentColor: '#B8A88C', borderWidth: 30 }
  },

  // ============================================
  // POLAROID (6 templates)
  // ============================================

  // 13. Classic Polaroid — single
  {
    id: "polaroid-single",
    width: 1200, height: 1500,
    slots: [{ x: 80, y: 80, w: 1040, h: 1040 }],
    style: { type: 'polaroid', tapeColor: '#C9A66B' }
  },
  // 14. Polaroid Double — side by side
  {
    id: "polaroid-double",
    width: 1200, height: 1000,
    slots: [
      { x: 60, y: 60, w: 510, h: 600 },
      { x: 630, y: 60, w: 510, h: 600 }
    ],
    style: { type: 'polaroid', tapeColor: '#D8C3A5' }
  },
  // 15. Polaroid Triple Stack — vertical
  {
    id: "polaroid-triple",
    width: 800, height: 2200,
    slots: [
      { x: 80, y: 80, w: 640, h: 460 },
      { x: 80, y: 590, w: 640, h: 460 },
      { x: 80, y: 1100, w: 640, h: 460 }
    ],
    style: { type: 'polaroid', tapeColor: '#E8B4B8' }
  },
  // 16. Polaroid Grid — 2x2
  {
    id: "polaroid-grid-4",
    width: 1200, height: 1500,
    slots: [
      { x: 60, y: 60, w: 510, h: 510 },
      { x: 630, y: 60, w: 510, h: 510 },
      { x: 60, y: 620, w: 510, h: 510 },
      { x: 630, y: 620, w: 510, h: 510 }
    ],
    style: { type: 'polaroid', tapeColor: '#C9A66B' }
  },
  // 17. Polaroid Collection — 6 shots
  {
    id: "polaroid-collection-6",
    width: 1200, height: 1600,
    slots: [
      { x: 60, y: 60, w: 350, h: 500 },
      { x: 425, y: 60, w: 350, h: 500 },
      { x: 790, y: 60, w: 350, h: 500 },
      { x: 60, y: 620, w: 350, h: 500 },
      { x: 425, y: 620, w: 350, h: 500 },
      { x: 790, y: 620, w: 350, h: 500 }
    ],
    style: { type: 'polaroid', tapeColor: '#B8A88C' }
  },
  // 18. Polaroid Wall — 8 mini shots
  {
    id: "polaroid-wall-8",
    width: 1200, height: 1600,
    slots: [
      { x: 50, y: 50, w: 250, h: 300 },
      { x: 330, y: 50, w: 250, h: 300 },
      { x: 610, y: 50, w: 250, h: 300 },
      { x: 890, y: 50, w: 250, h: 300 },
      { x: 50, y: 420, w: 250, h: 300 },
      { x: 330, y: 420, w: 250, h: 300 },
      { x: 610, y: 420, w: 250, h: 300 },
      { x: 890, y: 420, w: 250, h: 300 }
    ],
    style: { type: 'polaroid', tapeColor: '#D4C4A8' }
  },

  // ============================================
  // CUTE / KAWAII (6 templates)
  // ============================================

  // 19. Cute Pink Hearts — 1 slot
  {
    id: "cute-hearts-1",
    width: 1200, height: 1500,
    slots: [{ x: 90, y: 90, w: 1020, h: 1020, rx: 25 }],
    style: { type: 'cute', bgColor: '#FFF0F5', borderColor: '#FFB6C1', accentColor: '#FF69B4', pattern: 'hearts' }
  },
  // 20. Cute Peach Stars — 3 slots vertical (peaking bear/bunny mascot style)
  {
    id: "cute-peach-3",
    width: 800, height: 2400,
    slots: [
      { x: 80, y: 440, w: 640, h: 480, rx: 15 },
      { x: 80, y: 980, w: 640, h: 480, rx: 15 },
      { x: 80, y: 1520, w: 640, h: 480, rx: 15 }
    ],
    style: { type: 'cute_mascot' }
  },
  // 21. Cute Mint Dots — 4 slots vertical
  {
    id: "cute-mint-4",
    width: 800, height: 3000,
    slots: [
      { x: 70, y: 80, w: 660, h: 500, rx: 18 },
      { x: 70, y: 630, w: 660, h: 500, rx: 18 },
      { x: 70, y: 1180, w: 660, h: 500, rx: 18 },
      { x: 70, y: 1730, w: 660, h: 500, rx: 18 }
    ],
    style: { type: 'cute', bgColor: '#F0FFF8', borderColor: '#7ECFB3', accentColor: '#3DAB8A', pattern: 'dots' }
  },
  // 22. Cute Lavender Hearts — 2 slots
  {
    id: "cute-lavender-2",
    width: 1200, height: 1400,
    slots: [
      { x: 80, y: 80, w: 490, h: 900, rx: 20 },
      { x: 630, y: 80, w: 490, h: 900, rx: 20 }
    ],
    style: { type: 'cute', bgColor: '#F5F0FF', borderColor: '#C4A8E0', accentColor: '#A07CCF', pattern: 'hearts' }
  },
  // 23. Cute Lemon Stars — 6 slots (2x3)
  {
    id: "cute-lemon-6",
    width: 1200, height: 1800,
    slots: [
      { x: 65, y: 65, w: 510, h: 400, rx: 18 },
      { x: 625, y: 65, w: 510, h: 400, rx: 18 },
      { x: 65, y: 515, w: 510, h: 400, rx: 18 },
      { x: 625, y: 515, w: 510, h: 400, rx: 18 },
      { x: 65, y: 965, w: 510, h: 400, rx: 18 },
      { x: 625, y: 965, w: 510, h: 400, rx: 18 }
    ],
    style: { type: 'cute', bgColor: '#FFFDE7', borderColor: '#FFD54F', accentColor: '#FFA726', pattern: 'stars' }
  },
  // 24. Cute Cotton Candy — 8 slots (2x4) (Y2K Neon Star Cyber style)
  {
    id: "cute-cotton-8",
    width: 1200, height: 2000,
    slots: [
      { x: 60, y: 60, w: 510, h: 340, rx: 15 },
      { x: 630, y: 60, w: 510, h: 340, rx: 15 },
      { x: 60, y: 450, w: 510, h: 340, rx: 15 },
      { x: 630, y: 450, w: 510, h: 340, rx: 15 },
      { x: 60, y: 840, w: 510, h: 340, rx: 15 },
      { x: 630, y: 840, w: 510, h: 340, rx: 15 },
      { x: 60, y: 1230, w: 510, h: 340, rx: 15 },
      { x: 630, y: 1230, w: 510, h: 340, rx: 15 }
    ],
    style: { type: 'y2k_baddie' }
  },
  // 24b. Cozy Knit Felt — 1 slot
  {
    id: "cute-knit-1",
    width: 800, height: 1400,
    slots: [
      { x: 140, y: 260, w: 520, h: 580, rx: 40 }
    ],
    style: { type: 'cozy_knit' }
  },

  // ============================================
  // RETRO / AESTHETIC (6 templates)
  // ============================================

  // 25. Retro Vintage — 1 slot
  {
    id: "retro-vintage-1",
    width: 1200, height: 1500,
    slots: [{ x: 100, y: 90, w: 1000, h: 1050, rx: 6 }],
    style: { type: 'retro', bgColor: '#F5EDE0', borderColor: '#8B7355', accentColor: '#C9A66B', pattern: 'crosshatch' }
  },
  // 26. Retro Ticket — 2 slots horizontal
  {
    id: "retro-ticket-2",
    width: 1200, height: 1000,
    slots: [
      { x: 80, y: 80, w: 490, h: 580, rx: 4 },
      { x: 630, y: 80, w: 490, h: 580, rx: 4 }
    ],
    style: { type: 'retro', bgColor: '#FFF8EE', borderColor: '#A0845C', accentColor: '#D4B882', pattern: 'dotgrid' }
  },
  // 27. Retro Sage — 3 slots vertical (Breaking News layout)
  {
    id: "retro-sage-3",
    width: 800, height: 2400,
    slots: [
      { x: 80, y: 230, w: 640, h: 500 },
      { x: 80, y: 770, w: 640, h: 500 },
      { x: 80, y: 1310, w: 640, h: 500 }
    ],
    style: { type: 'breaking_news' }
  },
  // 28. Retro Rose — 4 slots vertical (Cinema Ticket layout)
  {
    id: "retro-rose-4",
    width: 800, height: 3000,
    slots: [
      { x: 80, y: 320, w: 640, h: 500 },
      { x: 80, y: 880, w: 640, h: 500 },
      { x: 80, y: 1440, w: 640, h: 500 },
      { x: 80, y: 2000, w: 640, h: 500 }
    ],
    style: { type: 'cinema_ticket' }
  },
  // 29. Retro Caramel — 6 slots (2x3 cathode-ray TV set layout)
  {
    id: "retro-caramel-6",
    width: 1200, height: 1800,
    slots: [
      { x: 70, y: 70, w: 420, h: 420 },
      { x: 670, y: 70, w: 420, h: 420 },
      { x: 70, y: 590, w: 420, h: 420 },
      { x: 670, y: 590, w: 420, h: 420 },
      { x: 70, y: 1110, w: 420, h: 420 },
      { x: 670, y: 1110, w: 420, h: 420 }
    ],
    style: { type: 'retro_tv' }
  },
  // 30. Retro Mosaic — 8 shots (2x4)
  {
    id: "retro-mosaic-8",
    width: 1200, height: 2000,
    slots: [
      { x: 65, y: 55, w: 510, h: 340, rx: 4 },
      { x: 625, y: 55, w: 510, h: 340, rx: 4 },
      { x: 65, y: 445, w: 510, h: 340, rx: 4 },
      { x: 625, y: 445, w: 510, h: 340, rx: 4 },
      { x: 65, y: 835, w: 510, h: 340, rx: 4 },
      { x: 625, y: 835, w: 510, h: 340, rx: 4 },
      { x: 65, y: 1225, w: 510, h: 340, rx: 4 },
      { x: 625, y: 1225, w: 510, h: 340, rx: 4 }
    ],
    style: { type: 'retro', bgColor: '#F8F0E0', borderColor: '#6B5B3D', accentColor: '#A08B60', pattern: 'dotgrid' }
  }
];

// Frame display names for metadata
const frameNames = {
  "film-classic-1": "Classic Film",
  "film-strip-3": "Film Strip Trio",
  "film-strip-4": "Film Strip 4-Cut",
  "film-contact-2x2": "Contact Sheet",
  "film-contact-6": "Film Proof 6",
  "film-mini-8": "Film Mini Roll",
  "korean-pink-3": "K-Pink Strip",
  "korean-lavender-4": "K-Lavender 4-Cut",
  "korean-mint-2": "K-Mint Duo",
  "korean-maroon-3": "Classic Maroon",
  "korean-blue-1": "K-Blue Portrait",
  "korean-cream-6": "K-Cream Grid",
  "polaroid-single": "Polaroid Classic",
  "polaroid-double": "Polaroid Duo",
  "polaroid-triple": "Polaroid Triple",
  "polaroid-grid-4": "Polaroid Grid",
  "polaroid-collection-6": "Polaroid Collection",
  "polaroid-wall-8": "Polaroid Wall",
  "cute-hearts-1": "Pink Hearts",
  "cute-peach-3": "Peaking Mascot",
  "cute-mint-4": "Mint Dots",
  "cute-lavender-2": "Lavender Duo",
  "cute-lemon-6": "Lemon Stars",
  "cute-cotton-8": "Y2K Cyber Star",
  "cute-knit-1": "Cozy Knit Felt",
  "retro-vintage-1": "Vintage Classic",
  "retro-ticket-2": "Retro Ticket",
  "retro-sage-3": "Breaking News",
  "retro-rose-4": "Cinema Ticket",
  "retro-mosaic-8": "Vintage Mosaic"
};

// Write all frame SVGs
frameConfigs.forEach(config => {
  const content = generateFrame(config);
  const filePath = path.join(templatesDir, `${config.id}.svg`);
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log(`Generated ${frameConfigs.length} SVG Frame Templates successfully.`);
console.log('Frame names:', Object.keys(frameNames).join(', '));


// ==========================================
// 2. STICKER GENERATOR (unchanged — keep existing stickers)
// ==========================================

const stickerData = [
  // CUTE / KAWAII
  {
    id: "cute-bear", name: "Cute Bear", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="60" r="30" fill="#CD853F" />
    <circle cx="150" cy="60" r="30" fill="#CD853F" />
    <circle cx="50" cy="60" r="15" fill="#FFA07A" />
    <circle cx="150" cy="60" r="15" fill="#FFA07A" />
    <circle cx="100" cy="110" r="65" fill="#CD853F" />
    <ellipse cx="100" cy="125" rx="25" ry="18" fill="#FFF" />
    <circle cx="75" cy="100" r="8" fill="#000" />
    <circle cx="125" cy="100" r="8" fill="#000" />
    <ellipse cx="100" cy="118" rx="8" ry="5" fill="#000" />
    <path d="M 90,130 Q 100,140 110,130" stroke="#000" stroke-width="3" fill="none" />
    <circle cx="60" cy="115" r="10" fill="#FFB6C1" />
    <circle cx="140" cy="115" r="10" fill="#FFB6C1" />
  </svg>` },
  {
    id: "cute-bunny", name: "Cute Bunny", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="65" cy="60" rx="20" ry="50" fill="#FFC0CB" transform="rotate(-15 65 60)" />
    <ellipse cx="135" cy="60" rx="20" ry="50" fill="#FFC0CB" transform="rotate(15 135 60)" />
    <ellipse cx="65" cy="60" rx="10" ry="35" fill="#FFF" transform="rotate(-15 65 60)" />
    <ellipse cx="135" cy="60" rx="10" ry="35" fill="#FFF" transform="rotate(15 135 60)" />
    <circle cx="100" cy="120" r="55" fill="#FFF" stroke="#FFC0CB" stroke-width="4" />
    <circle cx="80" cy="115" r="6" fill="#2E2620" />
    <circle cx="120" cy="115" r="6" fill="#2E2620" />
    <polygon points="100,123 94,117 106,117" fill="#FF69B4" />
    <path d="M 90,132 Q 100,140 110,132" stroke="#FF69B4" stroke-width="3" fill="none" />
    <circle cx="70" cy="125" r="8" fill="#FFCCD5" />
    <circle cx="130" cy="125" r="8" fill="#FFCCD5" />
  </svg>` },
  {
    id: "cute-cloud", name: "Fluffy Cloud", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <g fill="#E0F2FE" stroke="#38BDF8" stroke-width="4">
      <circle cx="60" cy="100" r="35" />
      <circle cx="100" cy="80" r="45" />
      <circle cx="140" cy="100" r="35" />
      <rect x="60" y="80" width="80" height="55" fill="#E0F2FE" stroke="none" />
      <line x1="60" y1="135" x2="140" y2="135" stroke="#38BDF8" stroke-width="4" />
    </g>
    <circle cx="80" cy="105" r="4" fill="#0369A1" />
    <circle cx="120" cy="105" r="4" fill="#0369A1" />
    <path d="M 95,115 Q 100,120 105,115" stroke="#0369A1" stroke-width="2.5" fill="none" />
    <circle cx="68" cy="112" r="6" fill="#FCA5A5" opacity="0.7" />
    <circle cx="132" cy="112" r="6" fill="#FCA5A5" opacity="0.7" />
  </svg>` },
  {
    id: "cute-rainbow", name: "Magic Rainbow", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 30,130 A 70,70 0 0,1 170,130" stroke="#F43F5E" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M 45,130 A 55,55 0 0,1 155,130" stroke="#F59E0B" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M 60,130 A 40,40 0 0,1 140,130" stroke="#10B981" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M 75,130 A 25,25 0 0,1 125,130" stroke="#3B82F6" stroke-width="12" fill="none" stroke-linecap="round" />
    <circle cx="30" cy="130" r="18" fill="#FFF" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" />
    <circle cx="170" cy="130" r="18" fill="#FFF" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" />
  </svg>` },
  {
    id: "sparkle-gold", name: "Golden Star", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,10 125,70 190,100 125,130 100,190 75,130 10,100 75,70" fill="#FBBF24" stroke="#D97706" stroke-width="4" />
    <polygon points="100,45 112,88 155,100 112,112 100,155 88,112 45,100 88,88" fill="#FFF" opacity="0.6" />
  </svg>` },
  {
    id: "sparkle-pink", name: "Glitter Pink", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,20 120,80 180,100 120,120 100,180 80,120 20,100 80,80" fill="#F472B6" stroke="#DB2777" stroke-width="4" />
    <polygon points="100,50 110,90 150,100 110,110 100,150 90,110 50,100 90,90" fill="#FFF" opacity="0.7" />
  </svg>` },
  {
    id: "cute-heart", name: "Love Pink", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 100,60 C 80,20 20,30 20,80 C 20,130 80,170 100,180 C 120,170 180,130 180,80 C 180,30 120,20 100,60 Z" fill="#FB7185" stroke="#E11D48" stroke-width="5" />
    <ellipse cx="60" cy="70" rx="15" ry="8" fill="#FFF" opacity="0.5" transform="rotate(-30 60 70)" />
  </svg>` },
  // TEXT BUBBLES
  {
    id: "bubble-bestie", name: "Best Friends", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="40" width="170" height="100" rx="30" fill="#FFE4E6" stroke="#F43F5E" stroke-width="4" />
    <polygon points="70,140 85,165 100,140" fill="#FFE4E6" stroke="#F43F5E" stroke-width="4" />
    <polygon points="72,138 85,160 98,138" fill="#FFE4E6" />
    <text x="100" y="98" font-family="'Caveat', cursive, sans-serif" font-size="28" font-weight="bold" fill="#E11D48" text-anchor="middle">Best Friends</text>
  </svg>` },
  {
    id: "bubble-love", name: "Love You Bubble", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="45" width="150" height="90" rx="25" fill="#F3E8FF" stroke="#A855F7" stroke-width="4" />
    <polygon points="120,135 130,160 140,135" fill="#F3E8FF" stroke="#A855F7" stroke-width="4" />
    <polygon points="122,133 130,155 138,133" fill="#F3E8FF" />
    <text x="100" y="98" font-family="'Caveat', cursive, sans-serif" font-size="34" font-weight="bold" fill="#7E22CE" text-anchor="middle">LOVE</text>
  </svg>` },
  {
    id: "bubble-ootd", name: "OOTD Text", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="35" y="55" width="130" height="80" rx="10" fill="#2E2620" stroke="#C9A66B" stroke-width="4" />
    <polygon points="50,135 60,155 70,135" fill="#2E2620" stroke="#C9A66B" stroke-width="4" />
    <polygon points="52,133 60,150 68,133" fill="#2E2620" />
    <text x="100" y="103" font-family="'Poppins', sans-serif" font-size="28" font-weight="900" fill="#C9A66B" text-anchor="middle" letter-spacing="2">OOTD</text>
  </svg>` },
  {
    id: "bubble-happy", name: "Happy Day", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="50" width="160" height="90" rx="45" fill="#FEF3C7" stroke="#D97706" stroke-width="4" />
    <polygon points="100,140 100,165 115,140" fill="#FEF3C7" stroke="#D97706" stroke-width="4" />
    <polygon points="100,138 102,158 113,138" fill="#FEF3C7" />
    <text x="100" y="104" font-family="'Caveat', cursive, sans-serif" font-size="30" font-weight="bold" fill="#B45309" text-anchor="middle">Happy Day!</text>
  </svg>` },
  {
    id: "bubble-empty", name: "Speech Bubble", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="50" width="160" height="90" rx="20" fill="#FFF" stroke="#2E2620" stroke-width="4" />
    <polygon points="40,140 30,165 55,140" fill="#FFF" stroke="#2E2620" stroke-width="4" />
    <polygon points="38,138 32,158 52,138" fill="#FFF" />
  </svg>` },
  // EMOJIS & ICONS
  {
    id: "emoji-smiley", name: "Smiley Face", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#FBBF24" stroke="#D97706" stroke-width="5" />
    <circle cx="70" cy="85" r="10" fill="#2E2620" />
    <circle cx="130" cy="85" r="10" fill="#2E2620" />
    <path d="M 55,115 Q 100,160 145,115" stroke="#2E2620" stroke-width="6" fill="none" stroke-linecap="round" />
  </svg>` },
  {
    id: "emoji-flower", name: "Cute Blossom", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <g fill="#FBCFE8" stroke="#EC4899" stroke-width="4">
      <circle cx="100" cy="55" r="30" />
      <circle cx="145" cy="80" r="30" />
      <circle cx="130" cy="140" r="30" />
      <circle cx="70" cy="140" r="30" />
      <circle cx="55" cy="80" r="30" />
    </g>
    <circle cx="100" cy="100" r="35" fill="#FCD34D" stroke="#F59E0B" stroke-width="4" />
  </svg>` },
  {
    id: "emoji-cherry", name: "Sweet Cherries", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 120,40 Q 100,20 70,50 Q 80,105 65,130" stroke="#10B981" stroke-width="6" fill="none" stroke-linecap="round" />
    <path d="M 120,40 Q 120,80 135,120" stroke="#10B981" stroke-width="6" fill="none" stroke-linecap="round" />
    <path d="M 120,40 L 150,25" stroke="#10B981" stroke-width="6" fill="none" />
    <path d="M 80,30 Q 110,20 100,45 Q 80,45 80,30 Z" fill="#059669" />
    <circle cx="60" cy="140" r="35" fill="#EF4444" stroke="#B91C1C" stroke-width="4" />
    <circle cx="140" cy="130" r="35" fill="#EF4444" stroke="#B91C1C" stroke-width="4" />
    <circle cx="45" cy="130" r="8" fill="#FFF" opacity="0.6" />
    <circle cx="125" cy="120" r="8" fill="#FFF" opacity="0.6" />
  </svg>` },
  {
    id: "emoji-sun", name: "Cool Sun", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="55" fill="#FBBF24" stroke="#D97706" stroke-width="4" />
    <g stroke="#D97706" stroke-width="6" stroke-linecap="round">
      <line x1="100" y1="15" x2="100" y2="35" />
      <line x1="100" y1="165" x2="100" y2="185" />
      <line x1="15" y1="100" x2="35" y2="100" />
      <line x1="165" y1="100" x2="185" y2="100" />
      <line x1="40" y1="40" x2="55" y2="55" />
      <line x1="145" y1="145" x2="160" y2="160" />
      <line x1="160" y1="40" x2="145" y2="55" />
      <line x1="55" y1="145" x2="40" y2="160" />
    </g>
    <rect x="60" y="85" width="32" height="24" rx="10" fill="#2E2620" />
    <rect x="108" y="85" width="32" height="24" rx="10" fill="#2E2620" />
    <line x1="92" y1="93" x2="108" y2="93" stroke="#2E2620" stroke-width="5" />
    <path d="M 85,120 Q 100,135 115,120" stroke="#D97706" stroke-width="4" fill="none" />
  </svg>` },
  // WASHI TAPES
  {
    id: "tape-mint", name: "Mint Tape", svg: `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15,10 L 185,10 L 180,20 L 185,30 L 180,40 L 185,50 L 15,50 L 20,40 L 15,30 L 20,20 Z" fill="#A7F3D0" fill-opacity="0.75" stroke="#34D399" stroke-dasharray="4,4" stroke-width="2" />
  </svg>` },
  {
    id: "tape-pink", name: "Pink Tape", svg: `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15,10 L 185,10 L 180,20 L 185,30 L 180,40 L 185,50 L 15,50 L 20,40 L 15,30 L 20,20 Z" fill="#FBCFE8" fill-opacity="0.75" stroke="#F43F5E" stroke-dasharray="4,4" stroke-width="2" />
  </svg>` },
  {
    id: "tape-gold", name: "Gold Tape", svg: `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15,10 L 185,10 L 180,20 L 185,30 L 180,40 L 185,50 L 15,50 L 20,40 L 15,30 L 20,20 Z" fill="#FEF3C7" fill-opacity="0.8" stroke="#D97706" stroke-dasharray="4,4" stroke-width="2" />
  </svg>` },
  {
    id: "tape-purple", name: "Lavender Tape", svg: `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15,10 L 185,10 L 180,20 L 185,30 L 180,40 L 185,50 L 15,50 L 20,40 L 15,30 L 20,20 Z" fill="#E9D5FF" fill-opacity="0.75" stroke="#A855F7" stroke-dasharray="4,4" stroke-width="2" />
  </svg>` },
  // BADGES & SEASONAL
  {
    id: "badge-ribbon", name: "Winner Ribbon", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M 70,110 L 50,180 L 85,160 L 100,180 L 100,110" fill="#EF4444" />
    <path d="M 130,110 L 150,180 L 115,160 L 100,180 L 100,110" fill="#EF4444" />
    <circle cx="100" cy="80" r="50" fill="#FBBF24" stroke="#D97706" stroke-width="4" />
    <circle cx="100" cy="80" r="38" fill="#FFF" />
    <text x="100" y="90" font-family="'Poppins', sans-serif" font-size="28" font-weight="900" fill="#D97706" text-anchor="middle">N°1</text>
  </svg>` },
  {
    id: "badge-cake", name: "Birthday Cake", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="160" rx="70" ry="15" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3" />
    <rect x="50" y="100" width="100" height="50" fill="#F472B6" rx="8" />
    <path d="M 50,105 Q 60,115 70,105 Q 80,115 90,105 Q 100,115 110,105 Q 120,115 130,105 Q 140,115 150,105 L 150,95 L 50,95 Z" fill="#FFF" />
    <rect x="95" y="60" width="10" height="35" fill="#3B82F6" />
    <ellipse cx="100" cy="55" rx="10" ry="14" fill="#FBBF24" />
    <ellipse cx="100" cy="50" rx="5" ry="8" fill="#FFF" opacity="0.6" />
  </svg>` },
  {
    id: "emoji-camera", name: "Photo Camera", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="70" width="140" height="100" rx="15" fill="#475569" stroke="#334155" stroke-width="4"/>
    <path d="M65,70 L80,45 L120,45 L135,70" fill="#475569" stroke="#334155" stroke-width="4"/>
    <circle cx="100" cy="120" r="30" fill="#1E293B" stroke="#64748B" stroke-width="3"/>
    <circle cx="100" cy="120" r="20" fill="#334155"/>
    <circle cx="90" cy="112" r="6" fill="#FFF" opacity="0.4"/>
    <circle cx="150" cy="85" r="6" fill="#EF4444"/>
  </svg>` },
  {
    id: "disco-ball", name: "Disco Ball", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <line x1="100" y1="10" x2="100" y2="35" stroke="#999" stroke-width="3"/>
    <circle cx="100" cy="110" r="65" fill="#C0C0C0" stroke="#A0A0A0" stroke-width="2"/>
    <g opacity="0.4">
      <rect x="60" y="60" width="18" height="14" rx="2" fill="#E8E8E8" transform="rotate(-10 69 67)"/>
      <rect x="90" y="55" width="18" height="14" rx="2" fill="#FFF" transform="rotate(5 99 62)"/>
      <rect x="120" y="65" width="18" height="14" rx="2" fill="#E8E8E8" transform="rotate(10 129 72)"/>
      <rect x="55" y="90" width="18" height="14" rx="2" fill="#FFF" transform="rotate(-5 64 97)"/>
      <rect x="85" y="85" width="18" height="14" rx="2" fill="#D8D8D8"/>
      <rect x="115" y="88" width="18" height="14" rx="2" fill="#FFF" transform="rotate(8 124 95)"/>
      <rect x="65" y="115" width="18" height="14" rx="2" fill="#E8E8E8" transform="rotate(-8 74 122)"/>
      <rect x="95" y="112" width="18" height="14" rx="2" fill="#FFF"/>
      <rect x="125" y="118" width="18" height="14" rx="2" fill="#D8D8D8" transform="rotate(5 134 125)"/>
      <rect x="75" y="140" width="18" height="14" rx="2" fill="#FFF" transform="rotate(-3 84 147)"/>
      <rect x="105" y="138" width="18" height="14" rx="2" fill="#E8E8E8" transform="rotate(6 114 145)"/>
    </g>
    <circle cx="80" cy="80" r="12" fill="#FFF" opacity="0.3"/>
  </svg>` },
  {
    id: "vinyl-record", name: "Vinyl Record", svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="85" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#333" stroke-width="0.5"/>
    <circle cx="100" cy="100" r="55" fill="none" stroke="#333" stroke-width="0.5"/>
    <circle cx="100" cy="100" r="40" fill="none" stroke="#333" stroke-width="0.5"/>
    <circle cx="100" cy="100" r="25" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
    <circle cx="100" cy="100" r="6" fill="#1a1a1a"/>
    <circle cx="85" cy="95" r="4" fill="#FFF" opacity="0.15"/>
  </svg>` },
];

// Write sticker SVGs
stickerData.forEach(sticker => {
  const filePath = path.join(stickersDir, `${sticker.id}.svg`);
  fs.writeFileSync(filePath, sticker.svg, 'utf8');
});

console.log(`Generated ${stickerData.length} SVG Stickers successfully.`);
