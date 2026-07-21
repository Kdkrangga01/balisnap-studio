export interface StickerItem {
  id: string;
  name: string;
  src: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge';
}

export interface StickerPack {
  id: string;
  name: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge';
  icon: string;
  stickers: string[];
}

// ============================================================================
// DATA URL STIKER TRANSPARAN VECTOR ESTETIK & MODERN (100% ANTI BROKEN)
// ============================================================================

// 1. NAILONG KUNING FULL BADAN (Melet & Tangan Terbuka)
const STICKER_NAILONG_FULL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><path d="M35 125 C35 132 48 132 48 125 L48 115 L35 115 Z" fill="%23eab308"/><path d="M72 125 C72 132 85 132 85 125 L85 115 L72 115 Z" fill="%23eab308"/><ellipse cx="60" cy="85" rx="35" ry="38" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><ellipse cx="60" cy="88" rx="22" ry="25" fill="%23fef08a"/><path d="M25 75 Q15 65 20 85 Q28 85 30 80 Z" fill="%23facc15"/><path d="M95 75 Q105 65 100 85 Q92 85 90 80 Z" fill="%23facc15"/><ellipse cx="60" cy="48" rx="30" ry="28" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><circle cx="48" cy="42" r="6" fill="%23ffffff"/><circle cx="72" cy="42" r="6" fill="%23ffffff"/><circle cx="48" cy="42" r="3" fill="%2315803d"/><circle cx="72" cy="42" r="3" fill="%2315803d"/><path d="M42 58 Q60 76 78 58 Z" fill="%23dc2626"/><ellipse cx="60" cy="65" rx="9" ry="7" fill="%23f43f5e"/></svg>`;

// 2. KUCING PITA BIRU & PAUS (Coquette Style)
const STICKER_CAT_BLUE_RIBBON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%233b82f6" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%2393c5fd"/><polygon points="85,35 72,55 95,58" fill="%2393c5fd"/><circle cx="48" cy="60" r="5" fill="%231e3a8a"/><circle cx="72" cy="60" r="5" fill="%231e3a8a"/><ellipse cx="60" cy="70" rx="4" ry="3" fill="%23f43f5e"/><path d="M52 76 Q60 82 68 76" fill="none" stroke="%231e3a8a" stroke-width="3"/><path d="M25 25 Q40 15 50 30 Q35 35 25 25 Z" fill="%2360a5fa"/><path d="M75 25 Q60 15 50 30 Q65 35 75 25 Z" fill="%2360a5fa"/><circle cx="50" cy="28" r="6" fill="%232563eb"/><path d="M75 92 Q85 85 95 90 Q90 100 80 98 Z" fill="%233b82f6"/></svg>`;

// 3. KUCING PITA PINK
const STICKER_CAT_PINK_RIBBON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%23f43f5e" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%23fb7185"/><polygon points="85,35 72,55 95,58" fill="%23fb7185"/><circle cx="48" cy="60" r="5" fill="%23881337"/><circle cx="72" cy="60" r="5" fill="%23881337"/><ellipse cx="60" cy="68" rx="5" ry="3" fill="%23f43f5e"/><path d="M50 74 Q60 82 70 74" fill="none" stroke="%23881337" stroke-width="3"/><path d="M70 30 Q80 20 88 30 Q80 38 70 30 Z" fill="%23f43f5e"/><path d="M88 30 Q98 20 106 30 Q98 38 88 30 Z" fill="%23f43f5e"/><circle cx="88" cy="32" r="4" fill="%23be123c"/></svg>`;

// 4. KUCING HIPSTER TOPI LA
const STICKER_CAT_HIPSTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%23d97706" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%23f59e0b"/><polygon points="85,35 72,55 95,58" fill="%23f59e0b"/><path d="M30 35 C30 15 90 15 90 35 Z" fill="%23991b1b"/><rect x="25" y="32" width="70" height="8" fill="%237f1d1d" rx="2"/><circle cx="45" cy="62" r="12" fill="none" stroke="%2318181b" stroke-width="3"/><circle cx="75" cy="62" r="12" fill="none" stroke="%2318181b" stroke-width="3"/><line x1="57" y1="62" x2="63" y2="62" stroke="%2318181b" stroke-width="3"/><circle cx="45" cy="62" r="4" fill="%2318181b"/><circle cx="75" cy="62" r="4" fill="%2318181b"/><path d="M54 75 Q60 80 66 75" fill="none" stroke="%2318181b" stroke-width="3"/></svg>`;

// 5. SNOOPY PELUK HATI
const STICKER_SNOOPY_HEARTS = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="50" cy="50" rx="25" ry="30" fill="%23ffffff" stroke="%23111827" stroke-width="4"/><ellipse cx="30" cy="55" rx="8" ry="18" fill="%23111827"/><circle cx="58" cy="45" r="3" fill="%23111827"/><ellipse cx="70" cy="52" rx="6" ry="4" fill="%23111827"/><path d="M45 65 Q55 72 65 65" fill="none" stroke="%23111827" stroke-width="3"/><path d="M70 65 C60 50 90 40 100 55 C110 70 80 80 70 65 Z" fill="%23dc2626"/></svg>`;

// 6. BUNGA LILY PINK
const STICKER_FLOWER_LILY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 20 C50 45 30 50 10 60 C35 70 50 85 60 110 C70 85 85 70 110 60 C90 50 70 45 60 20 Z" fill="%23ec4899"/><path d="M60 35 C53 50 40 55 25 60 C40 65 53 75 60 90 C67 75 80 65 95 60 C80 55 67 50 60 35 Z" fill="%23f472b6"/><circle cx="60" cy="60" r="8" fill="%23facc15"/></svg>`;

// 7. BUNGA KAMBOJA PLUMERIA
const STICKER_FLOWER_PLUMERIA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="60" cy="35" rx="14" ry="25" fill="%23f472b6"/><ellipse cx="85" cy="52" rx="14" ry="25" fill="%23f472b6" transform="rotate(72 85 52)"/><ellipse cx="75" cy="82" rx="14" ry="25" fill="%23f472b6" transform="rotate(144 75 82)"/><ellipse cx="45" cy="82" rx="14" ry="25" fill="%23f472b6" transform="rotate(216 45 82)"/><ellipse cx="35" cy="52" rx="14" ry="25" fill="%23f472b6" transform="rotate(288 35 52)"/><circle cx="60" cy="60" r="12" fill="%23fbe0e9"/><circle cx="60" cy="60" r="7" fill="%23facc15"/></svg>`;

// 8. SPIDERMAN MARVEL SET
const STICKER_SPIDERMAN_SET = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="38" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><path d="M60 22 L60 98 M22 60 L98 60 M33 33 L87 87 M33 87 L87 33" stroke="%237f1d1d" stroke-width="2"/><ellipse cx="45" cy="55" rx="10" ry="16" fill="%23ffffff" stroke="%23111827" stroke-width="4" transform="rotate(-15 45 55)"/><ellipse cx="75" cy="55" rx="10" ry="16" fill="%23ffffff" stroke="%23111827" stroke-width="4" transform="rotate(15 75 55)"/></svg>`;

// ============================================================================
// STIKER-STIKER BARU AESTHETIC PINTEREST & MODERN (100% VECTOR TRANSPARAN)
// ============================================================================

// 9. COQUETTE PINK BOW (Pita Pink Estetik)
const STICKER_COQUETTE_BOW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="M60 45 C45 15 15 20 15 45 C15 65 45 60 60 52 C75 60 105 65 105 45 C105 20 75 15 60 45 Z" fill="%23f43f5e" stroke="%23be123c" stroke-width="3"/><circle cx="60" cy="48" r="9" fill="%23e11d48"/><path d="M52 52 L30 90 L42 92 L60 58 Z" fill="%23fb7185"/><path d="M68 52 L90 90 L78 92 L60 58 Z" fill="%23fb7185"/></svg>`;

// 10. MATCHA LATTE BOBA (Minuman Estetik Cafe)
const STICKER_MATCHA_BOBA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><rect x="25" y="35" width="50" height="75" rx="12" fill="%23bbf7d0" stroke="%2316a34a" stroke-width="3"/><path d="M30 40 L70 40 L65 100 L35 100 Z" fill="%2386efac"/><line x1="50" y1="10" x2="50" y2="40" stroke="%23ef4444" stroke-width="6" stroke-linecap="round"/><ellipse cx="50" cy="35" rx="27" ry="6" fill="%23ffffff" stroke="%2316a34a" stroke-width="2"/><circle cx="40" cy="85" r="4" fill="%231e293b"/><circle cx="50" cy="92" r="4" fill="%231e293b"/><circle cx="60" cy="85" r="4" fill="%231e293b"/><circle cx="45" cy="60" r="3" fill="%231e293b"/><circle cx="55" cy="60" r="3" fill="%231e293b"/><path d="M47 66 Q50 70 53 66" fill="none" stroke="%231e293b" stroke-width="2"/></svg>`;

// 11. Y2K CHROME SILVER STAR (Bintang Perak Y2K Cyber)
const STICKER_Y2K_CHROME_STAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 5 C62 40 80 58 115 60 C80 62 62 80 60 115 C58 80 40 62 5 60 C40 58 58 40 60 5 Z" fill="url(%23grad)" stroke="%2364748b" stroke-width="2"/><defs><linearGradient id="grad" x1="0%25" y1="0%" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23f8fafc"/><stop offset="50%25" stop-color="%2394a3b8"/><stop offset="100%25" stop-color="%23334155"/></linearGradient></defs></svg>`;

// 12. CHERRY TWIN CHARM (Buah Ceri Estetik)
const STICKER_CHERRY_CHARM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M35 70 C15 35 60 15 60 20 M85 70 C105 35 60 15 60 20" fill="none" stroke="%2315803d" stroke-width="4" stroke-linecap="round"/><path d="M60 20 C75 10 85 25 60 20 Z" fill="%2322c55e"/><circle cx="35" cy="75" r="22" fill="%23e11d48" stroke="%239f1239" stroke-width="3"/><circle cx="85" cy="75" r="22" fill="%23e11d48" stroke="%239f1239" stroke-width="3"/><circle cx="28" cy="68" r="6" fill="%23fda4af"/><circle cx="78" cy="68" r="6" fill="%23fda4af"/></svg>`;

// 13. PASTEL BUTTERFLY (Kupu-kupu Lavender Estetik)
const STICKER_PASTEL_BUTTERFLY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="M60 50 C40 10 5 15 15 50 C25 70 50 60 60 50 Z" fill="%23e9d5ff" stroke="%23a855f7" stroke-width="3"/><path d="M60 50 C80 10 115 15 105 50 C95 70 70 60 60 50 Z" fill="%23e9d5ff" stroke="%23a855f7" stroke-width="3"/><path d="M60 50 C45 60 20 85 35 95 C50 100 55 70 60 50 Z" fill="%23f472b6"/><path d="M60 50 C75 60 100 85 85 95 C70 100 65 70 60 50 Z" fill="%23f472b6"/><line x1="60" y1="35" x2="60" y2="65" stroke="%23581c87" stroke-width="4" stroke-linecap="round"/><circle cx="52" cy="22" r="2" fill="%23581c87"/><circle cx="68" cy="22" r="2" fill="%23581c87"/></svg>`;

// 14. VINTAGE POSTAGE STAMP (Perangko Retro "SPECIAL DAY")
const STICKER_VINTAGE_STAMP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 130"><rect x="5" y="5" width="100" height="120" rx="4" fill="%23fef3c7" stroke="%23d97706" stroke-width="4" stroke-dasharray="8 6"/><rect x="15" y="15" width="80" height="85" fill="%23f1f5f9" stroke="%2394a3b8" stroke-width="2"/><circle cx="55" cy="55" r="25" fill="%23fda4af"/><path d="M55 35 C40 35 40 60 55 70 C70 60 70 35 55 35 Z" fill="%23e11d48"/><text x="55" y="115" font-family="monospace" font-size="11" font-weight="bold" fill="%2378350f" text-anchor="middle">★ SPECIAL DAY ★</text></svg>`;


export const stickers: StickerItem[] = [
  // ==========================================
  // 1. STIKER BARU & ESTETIK MODERN (PINTEREST STYLE)
  // ==========================================
  { id: "coquette-bow", name: "Coquette Pink Bow", src: STICKER_COQUETTE_BOW, category: "cute" },
  { id: "matcha-boba", name: "Matcha Latte Boba", src: STICKER_MATCHA_BOBA, category: "cute" },
  { id: "y2k-chrome-star", name: "Y2K Chrome Star", src: STICKER_Y2K_CHROME_STAR, category: "emoji" },
  { id: "cherry-charm", name: "Cherry Twin Charm", src: STICKER_CHERRY_CHARM, category: "cute" },
  { id: "pastel-butterfly", name: "Pastel Butterfly", src: STICKER_PASTEL_BUTTERFLY, category: "emoji" },
  { id: "vintage-stamp", name: "Special Day Stamp", src: STICKER_VINTAGE_STAMP, category: "badge" },

  // STIKER UTAMA
  { id: "dino-yellow-full", name: "Nailong Full Badan", src: STICKER_NAILONG_FULL, category: "cute" },
  { id: "cat-blue-ribbon", name: "Kucing Pita Biru & Paus", src: STICKER_CAT_BLUE_RIBBON, category: "cute" },
  { id: "cat-pink-ribbon", name: "Kucing Pita Pink Ribbon", src: STICKER_CAT_PINK_RIBBON, category: "cute" },
  { id: "cat-hipster", name: "Kucing Topi LA & Kamera", src: STICKER_CAT_HIPSTER, category: "cute" },
  { id: "snoopy-hearts", name: "Snoopy Peluk Hati", src: STICKER_SNOOPY_HEARTS, category: "cute" },
  { id: "spiderman-set", name: "Spiderman Marvel Set", src: STICKER_SPIDERMAN_SET, category: "badge" },
  { id: "flower-lily", name: "Bunga Lily Pink", src: STICKER_FLOWER_LILY, category: "emoji" },
  { id: "flower-plumeria", name: "Bunga Kamboja Bali", src: STICKER_FLOWER_PLUMERIA, category: "emoji" },

  // ==========================================
  // 2. STIKER ASLI BAWAAN UTUH (TETAP LENGKAP)
  // ==========================================
  { id: "cute-bear", name: "Teddy Bear", src: "/stickers/cute-bear.svg", category: "cute" },
  { id: "cute-bunny", name: "Fluffy Bunny", src: "/stickers/cute-bunny.svg", category: "cute" },
  { id: "cute-cloud", name: "Friendly Cloud", src: "/stickers/cute-cloud.svg", category: "cute" },
  { id: "cute-rainbow", name: "Sweet Rainbow", src: "/stickers/cute-rainbow.svg", category: "cute" },
  { id: "cute-heart", name: "Love Pink", src: "/stickers/cute-heart.svg", category: "cute" },
  { id: "cute-cat", name: "Cute Kitten", src: "/stickers/cute-cat.svg", category: "cute" },
  { id: "cute-star", name: "Star Face", src: "/stickers/cute-star.svg", category: "cute" },
  { id: "cute-ghost", name: "Cute Ghost", src: "/stickers/cute-ghost.svg", category: "cute" },
  { id: "cute-angry-cat", name: "Angry Ragdoll", src: "/stickers/cute-angry-cat.jpg", category: "cute" },
  { id: "cute-helmet-cat", name: "Helmet Kitten", src: "/stickers/cute-helmet-cat.jpg", category: "cute" },

  // TEXT BUBBLES
  { id: "bubble-bestie", name: "Best Friends Bubble", src: "/stickers/bubble-bestie.svg", category: "text" },
  { id: "bubble-love", name: "Love Bubble", src: "/stickers/bubble-love.svg", category: "text" },
  { id: "bubble-ootd", name: "OOTD Tag", src: "/stickers/bubble-ootd.svg", category: "text" },
  { id: "bubble-happy", name: "Happy Day Speech", src: "/stickers/bubble-happy.svg", category: "text" },
  { id: "bubble-empty", name: "Blank Bubble", src: "/stickers/bubble-empty.svg", category: "text" },
  { id: "bubble-together", name: "Together Bubble", src: "/stickers/bubble-together.svg", category: "text" },

  // SPARKLES / EMOJIS
  { id: "sparkle-gold", name: "Sparkle Gold", src: "/stickers/sparkle-gold.svg", category: "emoji" },
  { id: "sparkle-pink", name: "Sparkle Pink", src: "/stickers/sparkle-pink.svg", category: "emoji" },
  { id: "sparkle-blue", name: "Sparkle Blue", src: "/stickers/sparkle-blue.svg", category: "emoji" },
  { id: "emoji-smiley", name: "Smiley Emoji", src: "/stickers/emoji-smiley.svg", category: "emoji" },
  { id: "emoji-flower", name: "Sakura Flower", src: "/stickers/emoji-flower.svg", category: "emoji" },
  { id: "emoji-cherry", name: "Cherry Twins", src: "/stickers/emoji-cherry.svg", category: "emoji" },
  { id: "emoji-sun", name: "Cool Sun", src: "/stickers/emoji-sun.svg", category: "emoji" },

  // WASHI TAPES
  { id: "tape-mint", name: "Washi Mint", src: "/stickers/tape-mint.svg", category: "washi" },
  { id: "tape-pink", name: "Washi Pink", src: "/stickers/tape-pink.svg", category: "washi" },
  { id: "tape-gold", name: "Washi Gold", src: "/stickers/tape-gold.svg", category: "washi" },
  { id: "tape-purple", name: "Washi Purple", src: "/stickers/tape-purple.svg", category: "washi" },
  { id: "tape-blue", name: "Washi Blue", src: "/stickers/tape-blue.svg", category: "washi" },

  // BADGES & CELEBRATION
  { id: "badge-ribbon", name: "Gold Ribbon Medal", src: "/stickers/badge-ribbon.svg", category: "badge" },
  { id: "badge-cake", name: "Birthday Cake", src: "/stickers/badge-cake.svg", category: "badge" },
  { id: "badge-balloon", name: "Party Balloon", src: "/stickers/badge-balloon.svg", category: "badge" },
  { id: "badge-star", name: "Star Badge Medal", src: "/stickers/badge-star.svg", category: "badge" },
  { id: "emoji-camera", name: "Photo Camera", src: "/stickers/emoji-camera.svg", category: "emoji" },
  { id: "disco-ball", name: "Disco Ball", src: "/stickers/disco-ball.svg", category: "badge" },
  { id: "vinyl-record", name: "Vinyl Record", src: "/stickers/vinyl-record.svg", category: "badge" }
];

// ============================================================================
// PAKET AUTO-SPREAD LENGKAP BERSERTA TEMA BARU PINTEREST AESTHETIC
// ============================================================================
export const stickerPacks: StickerPack[] = [
  {
    id: "pack-coquette-vibe",
    name: "Coquette Bow & Cherries",
    category: "cute",
    icon: STICKER_COQUETTE_BOW,
    stickers: [
      STICKER_COQUETTE_BOW,
      STICKER_CHERRY_CHARM,
      STICKER_CAT_PINK_RIBBON,
      STICKER_PASTEL_BUTTERFLY
    ]
  },
  {
    id: "pack-y2k-cyber",
    name: "Y2K Chrome & Metallic",
    category: "emoji",
    icon: STICKER_Y2K_CHROME_STAR,
    stickers: [
      STICKER_Y2K_CHROME_STAR,
      STICKER_SPIDERMAN_SET,
      STICKER_CAT_HIPSTER,
      STICKER_Y2K_CHROME_STAR
    ]
  },
  {
    id: "pack-cafe-sweets",
    name: "Matcha Cafe & Boba",
    category: "cute",
    icon: STICKER_MATCHA_BOBA,
    stickers: [
      STICKER_MATCHA_BOBA,
      STICKER_CHERRY_CHARM,
      STICKER_VINTAGE_STAMP,
      STICKER_MATCHA_BOBA
    ]
  },
  {
    id: "pack-nailong-snoopy",
    name: "Nailong Full Body & Snoopy",
    category: "cute",
    icon: STICKER_NAILONG_FULL,
    stickers: [
      STICKER_NAILONG_FULL,
      STICKER_SNOOPY_HEARTS,
      STICKER_NAILONG_FULL,
      STICKER_SNOOPY_HEARTS
    ]
  },
  {
    id: "pack-cats-aesthetic",
    name: "Kucing Coquette Ribbon",
    category: "cute",
    icon: STICKER_CAT_BLUE_RIBBON,
    stickers: [
      STICKER_CAT_BLUE_RIBBON,
      STICKER_CAT_PINK_RIBBON,
      STICKER_CAT_HIPSTER,
      STICKER_CAT_BLUE_RIBBON
    ]
  },
  {
    id: "pack-flowers",
    name: "Tropical Plumeria & Lily",
    category: "emoji",
    icon: STICKER_FLOWER_LILY,
    stickers: [
      STICKER_FLOWER_LILY,
      STICKER_FLOWER_PLUMERIA,
      STICKER_PASTEL_BUTTERFLY,
      STICKER_FLOWER_PLUMERIA
    ]
  },
  {
    id: "pack-spiderman",
    name: "Spiderman Y2K",
    category: "badge",
    icon: STICKER_SPIDERMAN_SET,
    stickers: [
      STICKER_SPIDERMAN_SET,
      STICKER_Y2K_CHROME_STAR,
      STICKER_SPIDERMAN_SET,
      STICKER_Y2K_CHROME_STAR
    ]
  },
  {
    id: "pack-cat-classic",
    name: "Kucing Cute Pack",
    category: "cute",
    icon: "/stickers/cute-cat.svg",
    stickers: [
      "/stickers/cute-cat.svg",
      "/stickers/cute-angry-cat.jpg",
      "/stickers/cute-helmet-cat.jpg",
      "/stickers/cute-heart.svg"
    ]
  },
  {
    id: "pack-kawaii",
    name: "Kawaii Friends",
    category: "cute",
    icon: "/stickers/cute-bunny.svg",
    stickers: [
      "/stickers/cute-bunny.svg",
      "/stickers/cute-bear.svg",
      "/stickers/cute-cloud.svg",
      "/stickers/cute-rainbow.svg"
    ]
  },
  {
    id: "pack-sparkles",
    name: "Sparkle Y2K Magic",
    category: "emoji",
    icon: "/stickers/sparkle-gold.svg",
    stickers: [
      "/stickers/sparkle-gold.svg",
      "/stickers/sparkle-pink.svg",
      "/stickers/sparkle-blue.svg",
      "/stickers/emoji-flower.svg"
    ]
  },
  {
    id: "pack-washi",
    name: "Scrapbook Washi Tape",
    category: "washi",
    icon: "/stickers/tape-pink.svg",
    stickers: [
      "/stickers/tape-pink.svg",
      "/stickers/tape-mint.svg",
      "/stickers/tape-gold.svg",
      "/stickers/tape-purple.svg"
    ]
  },
  {
    id: "pack-speech",
    name: "Cute Speech Bubbles",
    category: "text",
    icon: "/stickers/bubble-love.svg",
    stickers: [
      "/stickers/bubble-love.svg",
      "/stickers/bubble-bestie.svg",
      "/stickers/bubble-happy.svg",
      "/stickers/bubble-ootd.svg"
    ]
  }
];