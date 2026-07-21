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

// Data URL Gambar Valid (Pasti Muncul Tanpa Broken Image)
const STICKER_CAT_PITA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23dbeaff"/><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%233b82f6" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%2393c5fd"/><polygon points="85,35 72,55 95,58" fill="%2393c5fd"/><circle cx="48" cy="60" r="5" fill="%231e3a8a"/><circle cx="72" cy="60" r="5" fill="%231e3a8a"/><ellipse cx="60" cy="70" rx="4" ry="3" fill="%23f43f5e"/><path d="M52 76 Q60 82 68 76" fill="none" stroke="%231e3a8a" stroke-width="3"/><path d="M25 25 Q40 15 50 30 Q35 35 25 25 Z" fill="%2360a5fa"/><path d="M75 25 Q60 15 50 30 Q65 35 75 25 Z" fill="%2360a5fa"/><circle cx="50" cy="28" r="6" fill="%232563eb"/></svg>`;

const STICKER_CAT_HIPSTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23fef3c7"/><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%23d97706" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%23f59e0b"/><polygon points="85,35 72,55 95,58" fill="%23f59e0b"/><path d="M30 35 C30 15 90 15 90 35 Z" fill="%23991b1b"/><rect x="25" y="32" width="70" height="8" fill="%237f1d1d" rx="2"/><circle cx="45" cy="62" r="12" fill="none" stroke="%2318181b" stroke-width="3"/><circle cx="75" cy="62" r="12" fill="none" stroke="%2318181b" stroke-width="3"/><line x1="57" y1="62" x2="63" y2="62" stroke="%2318181b" stroke-width="3"/><circle cx="45" cy="62" r="4" fill="%2318181b"/><circle cx="75" cy="62" r="4" fill="%2318181b"/><path d="M54 75 Q60 80 66 75" fill="none" stroke="%2318181b" stroke-width="3"/></svg>`;

const STICKER_CAT_PINK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23ffe4e6"/><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%23f43f5e" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%23fb7185"/><polygon points="85,35 72,55 95,58" fill="%23fb7185"/><circle cx="48" cy="60" r="5" fill="%23881337"/><circle cx="72" cy="60" r="5" fill="%23881337"/><ellipse cx="60" cy="68" rx="5" ry="3" fill="%23f43f5e"/><path d="M50 74 Q60 82 70 74" fill="none" stroke="%23881337" stroke-width="3"/><path d="M70 30 Q80 20 88 30 Q80 38 70 30 Z" fill="%23f43f5e"/><path d="M88 30 Q98 20 106 30 Q98 38 88 30 Z" fill="%23f43f5e"/><circle cx="88" cy="32" r="4" fill="%23be123c"/></svg>`;

const STICKER_FLOWER_LILY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23fce7f3"/><path d="M60 20 C50 45 30 50 10 60 C35 70 50 85 60 110 C70 85 85 70 110 60 C90 50 70 45 60 20 Z" fill="%23ec4899"/><path d="M60 35 C53 50 40 55 25 60 C40 65 53 75 60 90 C67 75 80 65 95 60 C80 55 67 50 60 35 Z" fill="%23f472b6"/><circle cx="60" cy="60" r="8" fill="%23facc15"/></svg>`;

const STICKER_FLOWER_KAMBOJA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23fdf2f8"/><ellipse cx="60" cy="35" rx="14" ry="25" fill="%23f472b6"/><ellipse cx="85" cy="52" rx="14" ry="25" fill="%23f472b6" transform="rotate(72 85 52)"/><ellipse cx="75" cy="82" rx="14" ry="25" fill="%23f472b6" transform="rotate(144 75 82)"/><ellipse cx="45" cy="82" rx="14" ry="25" fill="%23f472b6" transform="rotate(216 45 82)"/><ellipse cx="35" cy="52" rx="14" ry="25" fill="%23f472b6" transform="rotate(288 35 52)"/><circle cx="60" cy="60" r="12" fill="%23fbe0e9"/><circle cx="60" cy="60" r="7" fill="%23facc15"/></svg>`;

const STICKER_SNOOPY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23f3f4f6"/><ellipse cx="50" cy="50" rx="25" ry="30" fill="%23ffffff" stroke="%23111827" stroke-width="4"/><ellipse cx="30" cy="55" rx="8" ry="18" fill="%23111827"/><circle cx="58" cy="45" r="3" fill="%23111827"/><ellipse cx="70" cy="52" rx="6" ry="4" fill="%23111827"/><path d="M45 65 Q55 72 65 65" fill="none" stroke="%23111827" stroke-width="3"/><path d="M70 65 C60 50 90 40 100 55 C110 70 80 80 70 65 Z" fill="%23dc2626"/></svg>`;

const STICKER_SPIDERMAN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23fee2e2"/><circle cx="60" cy="60" r="38" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><path d="M60 22 L60 98 M22 60 L98 60 M33 33 L87 87 M33 87 L87 33" stroke="%237f1d1d" stroke-width="2"/><ellipse cx="45" cy="55" rx="10" ry="16" fill="%23ffffff" stroke="%23111827" stroke-width="4" transform="rotate(-15 45 55)"/><ellipse cx="75" cy="55" rx="10" ry="16" fill="%23ffffff" stroke="%23111827" stroke-width="4" transform="rotate(15 75 55)"/></svg>`;

const STICKER_NAILONG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="%23fef9c3"/><circle cx="60" cy="65" r="35" fill="%23eab308" stroke="%23ca8a04" stroke-width="3"/><circle cx="45" cy="55" r="5" fill="%2315803d"/><circle cx="75" cy="55" r="5" fill="%2315803d"/><path d="M45 72 Q60 88 75 72 Z" fill="%23dc2626"/><ellipse cx="60" cy="80" rx="8" ry="6" fill="%23f43f5e"/></svg>`;

export const stickers: StickerItem[] = [
  // NAILONG & DINO
  { id: "nailong-yellow", name: "Dino Nailong Kuning", src: STICKER_NAILONG, category: "cute" },

  // KUCING GEMOY & ESTETIK
  { id: "cat-blue-ribbon", name: "Kucing Pita Biru", src: STICKER_CAT_PITA, category: "cute" },
  { id: "cat-pink-ribbon", name: "Kucing Pita Pink", src: STICKER_CAT_PINK, category: "cute" },
  { id: "cat-hipster", name: "Kucing Topi LA", src: STICKER_CAT_HIPSTER, category: "cute" },

  // CHARACTERS & FLOWERS
  { id: "snoopy-hearts", name: "Snoopy Love", src: STICKER_SNOOPY, category: "cute" },
  { id: "spiderman-set", name: "Spiderman Set", src: STICKER_SPIDERMAN, category: "badge" },
  { id: "flower-lily", name: "Bunga Lily Pink", src: STICKER_FLOWER_LILY, category: "emoji" },
  { id: "flower-plumeria", name: "Bunga Kamboja", src: STICKER_FLOWER_KAMBOJA, category: "emoji" },

  // STIKER BAWAAN UTUH
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

// PAKET AUTO-SPREAD UNTUK TIAP JENIS STIKER
export const stickerPacks: StickerPack[] = [
  {
    id: "pack-cats-aesthetic",
    name: "Kucing Estetik Pack",
    category: "cute",
    icon: STICKER_CAT_PITA,
    stickers: [
      STICKER_CAT_PITA,
      STICKER_CAT_PINK,
      STICKER_CAT_HIPSTER,
      STICKER_CAT_PITA
    ]
  },
  {
    id: "pack-nailong-snoopy",
    name: "Nailong & Snoopy",
    category: "cute",
    icon: STICKER_NAILONG,
    stickers: [
      STICKER_NAILONG,
      STICKER_SNOOPY,
      STICKER_NAILONG,
      STICKER_SNOOPY
    ]
  },
  {
    id: "pack-flowers",
    name: "Bunga & Floral",
    category: "emoji",
    icon: STICKER_FLOWER_LILY,
    stickers: [
      STICKER_FLOWER_LILY,
      STICKER_FLOWER_KAMBOJA,
      STICKER_FLOWER_LILY,
      STICKER_FLOWER_KAMBOJA
    ]
  },
  {
    id: "pack-spiderman",
    name: "Spiderman Set",
    category: "badge",
    icon: STICKER_SPIDERMAN,
    stickers: [
      STICKER_SPIDERMAN,
      STICKER_SPIDERMAN,
      STICKER_SPIDERMAN,
      STICKER_SPIDERMAN
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
    name: "Sparkle Magic",
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
    name: "Washi Tape Set",
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
    name: "Text Bubbles",
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