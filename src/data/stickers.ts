export interface StickerItem {
  id: string;
  name: string;
  src: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge' | 'cat' | 'nailong' | 'aesthetic';
}

export interface StickerPack {
  id: string;
  name: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge' | 'cat' | 'nailong' | 'aesthetic';
  icon: string;
  stickers: string[];
}

// ============================================================================
// STIKER FOTO REAL CUTOUT
// ============================================================================
const STICKER_REAL_ANGRY_CAT = "/stickers/cute-angry-cat.png";
const STICKER_REAL_HELMET_CAT = "/stickers/cute-helmet-cat.png";
const STICKER_REAL_HIPSTER_CAT = "/stickers/cat-hipster.png";
const STICKER_REAL_BLUE_RIBBON_CAT = "/stickers/cat-blue-ribbon.png";
const STICKER_REAL_PINK_RIBBON_CAT = "/stickers/cat-pink-ribbon.png";
const STICKER_REAL_DINO_YELLOW = "/stickers/dino-yellow.png";
const STICKER_NAILONG_FULL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><path d="M35 125 C35 132 48 132 48 125 L48 115 L35 115 Z" fill="%23eab308"/><path d="M72 125 C72 132 85 132 85 125 L85 115 L72 115 Z" fill="%23eab308"/><ellipse cx="60" cy="85" rx="35" ry="38" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><ellipse cx="60" cy="88" rx="22" ry="25" fill="%23fef08a"/><path d="M25 75 Q15 65 20 85 Q28 85 30 80 Z" fill="%23facc15"/><path d="M95 75 Q105 65 100 85 Q92 85 90 80 Z" fill="%23facc15"/><ellipse cx="60" cy="48" rx="30" ry="28" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><circle cx="48" cy="42" r="6" fill="%23ffffff"/><circle cx="72" cy="42" r="6" fill="%23ffffff"/><circle cx="48" cy="42" r="3" fill="%2315803d"/><circle cx="72" cy="42" r="3" fill="%2315803d"/><path d="M42 58 Q60 76 78 58 Z" fill="%23dc2626"/><ellipse cx="60" cy="65" rx="9" ry="7" fill="%23f43f5e"/></svg>`;

// 1. KUCING GREY WINKING WAVING PAW (Kucing Abu-Abu Kedip & Heart)
const STICKER_GREY_TABBY_WINK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><path d="M35 30 L55 52 M95 30 L75 52" stroke="%23f8fafc" stroke-width="8" stroke-linecap="round"/><path d="M35 30 L55 52 L30 58 Z" fill="%23f43f5e"/><path d="M95 30 L75 52 L100 58 Z" fill="%23f43f5e"/><ellipse cx="65" cy="70" rx="38" ry="34" fill="%2364748b" stroke="%23f8fafc" stroke-width="4"/><path d="M65 42 Q80 42 85 58 Q65 65 45 58 Q50 42 65 42 Z" fill="%23ffffff"/><circle cx="50" cy="62" r="8" fill="%231e293b"/><circle cx="52" cy="60" r="3" fill="%23ffffff"/><path d="M72 62 Q82 58 84 65" fill="none" stroke="%231e293b" stroke-width="3" stroke-linecap="round"/><ellipse cx="65" cy="70" rx="4" ry="2.5" fill="%23f43f5e"/><path d="M58 75 Q65 82 72 75" fill="%23dc2626" stroke="%231e293b" stroke-width="2"/><ellipse cx="65" cy="98" rx="30" ry="24" fill="%23ffffff" stroke="%23f8fafc" stroke-width="4"/><ellipse cx="32" cy="65" rx="12" ry="10" fill="%23ffffff" stroke="%23f8fafc" stroke-width="3"/><circle cx="28" cy="62" r="3" fill="%23f43f5e"/><circle cx="34" cy="60" r="2.5" fill="%23f43f5e"/><circle cx="37" cy="66" r="2.5" fill="%23f43f5e"/><path d="M110 40 C100 25 80 40 110 58 C140 40 120 25 110 40 Z" fill="%23f43f5e" transform="scale(0.35) translate(220, 100)"/><path d="M110 40 C100 25 80 40 110 58 C140 40 120 25 110 40 Z" fill="%23f43f5e" transform="scale(0.3) translate(260, 280)"/></svg>`;

// 2. SPIDERMAN TERBALIK (Hanging Upside Down)
const STICKER_SPIDERMAN_HANGING = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 140"><line x1="55" y1="0" x2="55" y2="40" stroke="%23f8fafc" stroke-width="3"/><ellipse cx="55" cy="70" rx="28" ry="32" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><path d="M55 38 L55 102 M27 70 L83 70 M35 48 L75 92 M35 92 L75 48" stroke="%237f1d1d" stroke-width="1.5"/><ellipse cx="43" cy="74" rx="8" ry="14" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(15 43 74)"/><ellipse cx="67" cy="74" rx="8" ry="14" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(-15 67 74)"/><path d="M55 102 C35 110 25 125 35 135 M55 102 C75 110 85 125 75 135" fill="none" stroke="%23dc2626" stroke-width="8" stroke-linecap="round"/></svg>`;

// 3. SPIDERMAN FOTO KAMERA (Spiderman Taking Photo)
const STICKER_SPIDERMAN_CAMERA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="55" r="35" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><path d="M60 20 L60 90 M25 55 L95 55 M35 30 L85 80 M35 80 L85 30" stroke="%237f1d1d" stroke-width="1.5"/><ellipse cx="45" cy="48" rx="9" ry="15" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(-12 45 48)"/><ellipse cx="75" cy="48" rx="9" ry="15" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(12 75 48)"/><rect x="35" y="65" width="50" height="32" rx="6" fill="%233f3f46" stroke="%23f8fafc" stroke-width="3"/><circle cx="60" cy="81" r="10" fill="%2318181b" stroke="%23e4e4e7" stroke-width="2"/><circle cx="60" cy="81" r="5" fill="%2338bdf8"/><path d="M20 85 Q35 70 40 85 M100 85 Q85 70 80 85" stroke="%23dc2626" stroke-width="10" stroke-linecap="round"/></svg>`;

// 4. SPIDERMAN HEADPHONES MUSIC (Spiderman Beats)
const STICKER_SPIDERMAN_HEADPHONES = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M25 60 C25 20 95 20 95 60" fill="none" stroke="%2318181b" stroke-width="10" stroke-linecap="round"/><circle cx="60" cy="65" r="34" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><path d="M60 31 L60 99 M26 65 L94 65 M36 41 L84 89 M36 89 L84 41" stroke="%237f1d1d" stroke-width="1.5"/><ellipse cx="46" cy="60" rx="8" ry="14" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(-10 46 60)"/><ellipse cx="74" cy="60" rx="8" ry="14" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(10 74 60)"/><rect x="15" y="48" width="18" height="32" rx="6" fill="%2318181b" stroke="%23f8fafc" stroke-width="2"/><rect x="87" y="48" width="18" height="32" rx="6" fill="%2318181b" stroke="%23f8fafc" stroke-width="2"/></svg>`;

// 5. SPIDERMAN MASK HEART (Topeng Hati Spiderman)
const STICKER_SPIDERMAN_HEART_MASK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><path d="M60 28 C40 0 5 25 60 95 C115 25 80 0 60 28 Z" fill="%23dc2626" stroke="%23be123c" stroke-width="4"/><path d="M60 10 L60 95 M15 45 L105 45 M25 25 L95 75 M25 75 L95 25" stroke="%23881337" stroke-width="1.5"/><ellipse cx="42" cy="40" rx="10" ry="16" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(-15 42 40)"/><ellipse cx="78" cy="40" rx="10" ry="16" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(15 78 40)"/></svg>`;

// 6. MARVEL LOGO RED BOX (Logo Marvel Merah Klasik)
const STICKER_MARVEL_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 60"><rect x="5" y="10" width="120" height="40" rx="4" fill="%23dc2626" stroke="%23ffffff" stroke-width="3"/><text x="65" y="38" font-family="Impact, sans-serif" font-size="28" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="-1">MARVEL</text></svg>`;

// 7. SPIDER WEBS HEART Y2K (Jaring Laba-Laba Bentuk Hati)
const STICKER_SPIDER_WEB_HEART = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><path d="M60 25 C40 0 5 25 60 95 C115 25 80 0 60 25 Z" fill="none" stroke="%2318181b" stroke-width="3"/><line x1="60" y1="25" x2="60" y2="95" stroke="%2318181b" stroke-width="2"/><line x1="20" y1="20" x2="100" y2="80" stroke="%2318181b" stroke-width="2"/><line x1="100" y1="20" x2="20" y2="80" stroke="%2318181b" stroke-width="2"/><path d="M45 35 Q60 42 75 35 M35 50 Q60 60 85 50 M45 68 Q60 76 75 68" fill="none" stroke="%2318181b" stroke-width="2"/></svg>`;

// 8. CHIBI SPIDERMAN MINI (Spiderman Imut Duduk)
const STICKER_SPIDERMAN_CHIBI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><circle cx="50" cy="45" r="30" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><ellipse cx="38" cy="42" rx="8" ry="13" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(-10 38 42)"/><ellipse cx="62" cy="42" rx="8" ry="13" fill="%23ffffff" stroke="%2318181b" stroke-width="3" transform="rotate(10 62 42)"/><path d="M35 75 L65 75 L60 105 L40 105 Z" fill="%232563eb" stroke="%231e3a8a" stroke-width="3"/><rect x="42" y="75" width="16" height="25" fill="%23dc2626"/><path d="M25 80 L35 75 L30 100 Z" fill="%23dc2626"/><path d="M75 80 L65 75 L70 100 Z" fill="%23dc2626"/></svg>`;

// 9. SPIDERMAN WEB SHOOTER HAND (Tangan Pose Jaring)
const STICKER_SPIDERMAN_HAND_SIGN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 120"><path d="M40 110 L40 60 L20 40 L30 35 L45 52 L45 20 L58 20 L58 52 L68 52 L68 25 L80 25 L80 55 L95 45 L100 55 L80 75 L70 110 Z" fill="%23dc2626" stroke="%23f8fafc" stroke-width="3"/><path d="M58 20 L58 55 M68 25 L68 55" stroke="%237f1d1d" stroke-width="2"/><line x1="58" y1="52" x2="58" y2="5" stroke="%23ffffff" stroke-width="3"/></svg>`;

// KUCING & NAILONG VARIASI BARU
const STICKER_CAT_FLIRTY_WINK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M30 35 L48 55 M90 35 L72 55" stroke="%23f8fafc" stroke-width="4"/><polygon points="30,35 48,55 25,58" fill="%23f472b6"/><polygon points="90,35 72,55 95,58" fill="%23f472b6"/><circle cx="60" cy="65" r="34" fill="%23ffffff" stroke="%23f43f5e" stroke-width="4"/><circle cx="46" cy="60" r="5" fill="%231e293b"/><path d="M68 60 Q76 54 78 62" fill="none" stroke="%231e293b" stroke-width="3" stroke-linecap="round"/><ellipse cx="60" cy="68" rx="4" ry="2.5" fill="%23f43f5e"/><path d="M52 74 Q60 80 68 74" fill="none" stroke="%231e293b" stroke-width="2.5"/><ellipse cx="38" cy="68" rx="5" ry="3" fill="%23fbcfe8"/><ellipse cx="82" cy="68" rx="5" ry="3" fill="%23fbcfe8"/><path d="M92 42 C85 30 70 42 92 56 C114 42 99 30 92 42 Z" fill="%23f43f5e"/></svg>`;
const STICKER_CAT_ANGRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><polygon points="28,32 46,52 22,55" fill="%23dc2626"/><polygon points="92,32 74,52 98,55" fill="%23dc2626"/><circle cx="60" cy="65" r="34" fill="%23fef2f2" stroke="%23dc2626" stroke-width="4"/><line x1="38" y1="52" x2="52" y2="58" stroke="%23991b1b" stroke-width="3" stroke-linecap="round"/><line x1="82" y1="52" x2="68" y2="58" stroke="%23991b1b" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="62" r="4" fill="%23991b1b"/><circle cx="75" cy="62" r="4" fill="%23991b1b"/><ellipse cx="60" cy="70" rx="3.5" ry="2.5" fill="%23dc2626"/><path d="M52 78 Q60 72 68 78" fill="none" stroke="%23991b1b" stroke-width="3"/><path d="M85 32 L95 22 M90 20 L100 30 M88 28 L98 28" stroke="%23ef4444" stroke-width="3"/></svg>`;
const STICKER_CAT_BOBA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130"><polygon points="32,25 48,45 25,48" fill="%23fb7185"/><polygon points="88,25 72,45 95,48" fill="%23fb7185"/><circle cx="60" cy="55" r="32" fill="%23ffffff" stroke="%23fb7185" stroke-width="3.5"/><circle cx="48" cy="50" r="4" fill="%231e293b"/><circle cx="72" cy="50" r="4" fill="%231e293b"/><ellipse cx="60" cy="57" rx="3.5" ry="2" fill="%23f43f5e"/><rect x="42" y="70" width="36" height="48" rx="8" fill="%23fef3c7" stroke="%2378350f" stroke-width="2.5"/><path d="M44 82 L76 82 L74 114 L46 114 Z" fill="%23d97706" opacity="0.7"/><line x1="60" y1="58" x2="60" y2="70" stroke="%23ef4444" stroke-width="4"/><circle cx="52" cy="100" r="3" fill="%231e293b"/><circle cx="60" cy="106" r="3" fill="%231e293b"/><circle cx="66" cy="100" r="3" fill="%231e293b"/></svg>`;
const STICKER_CAT_SLEEPY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 110"><path d="M20 70 C20 40 110 40 110 70 C110 95 20 95 20 70 Z" fill="%23e0f2fe"/><polygon points="30,45 42,60 25,62" fill="%2393c5fd"/><polygon points="75,45 62,60 80,62" fill="%2393c5fd"/><ellipse cx="50" cy="65" rx="28" ry="22" fill="%23ffffff" stroke="%233b82f6" stroke-width="3"/><path d="M38 64 Q44 70 50 64" fill="none" stroke="%231e3a8a" stroke-width="2.5"/><path d="M56 64 Q62 70 68 64" fill="none" stroke="%231e3a8a" stroke-width="2.5"/><text x="88" y="45" font-family="sans-serif" font-weight="900" font-size="18" fill="%233b82f6">Zzz</text></svg>`;
const STICKER_CAT_GAMER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M25 55 C25 20 95 20 95 55" fill="none" stroke="%23ec4899" stroke-width="8" stroke-linecap="round"/><circle cx="60" cy="62" r="33" fill="%23ffffff" stroke="%23ec4899" stroke-width="3.5"/><polygon points="34,32 46,50 25,52" fill="%23f472b6"/><polygon points="86,32 74,50 95,52" fill="%23f472b6"/><circle cx="48" cy="58" r="4.5" fill="%231e293b"/><circle cx="72" cy="58" r="4.5" fill="%231e293b"/><path d="M52 68 Q60 74 68 68" fill="none" stroke="%231e293b" stroke-width="2.5"/><rect x="16" y="46" width="16" height="28" rx="6" fill="%23ec4899" stroke="%23ffffff" stroke-width="2"/><rect x="88" y="46" width="16" height="28" rx="6" fill="%23ec4899" stroke="%23ffffff" stroke-width="2"/></svg>`;

const STICKER_NAILONG_BOBA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130"><ellipse cx="60" cy="65" rx="34" ry="36" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><circle cx="48" cy="52" r="5" fill="%23ffffff"/><circle cx="72" cy="52" r="5" fill="%23ffffff"/><circle cx="48" cy="52" r="2.5" fill="%2315803d"/><circle cx="72" cy="52" r="2.5" fill="%2315803d"/><rect x="42" y="75" width="36" height="42" rx="6" fill="%23fef3c7" stroke="%2378350f" stroke-width="2.5"/><line x1="60" y1="58" x2="60" y2="75" stroke="%23ef4444" stroke-width="4"/><path d="M44 88 L76 88 L74 114 L46 114 Z" fill="%23d97706" opacity="0.8"/></svg>`;
const STICKER_NAILONG_LAUGH = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="60" cy="60" rx="36" ry="34" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><path d="M42 48 Q48 42 54 48" fill="none" stroke="%2315803d" stroke-width="3.5" stroke-linecap="round"/><path d="M66 48 Q72 42 78 48" fill="none" stroke="%2315803d" stroke-width="3.5" stroke-linecap="round"/><path d="M44 60 Q60 82 76 60 Z" fill="%23dc2626" stroke="%23ca8a04" stroke-width="2"/><ellipse cx="60" cy="70" rx="8" ry="6" fill="%23f43f5e"/><ellipse cx="36" cy="62" rx="6" ry="4" fill="%23f87171"/><ellipse cx="84" cy="62" rx="6" ry="4" fill="%23f87171"/></svg>`;
const STICKER_NAILONG_ANGRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="60" cy="62" rx="36" ry="34" fill="%23eab308" stroke="%23ca8a04" stroke-width="3.5"/><line x1="40" y1="44" x2="54" y2="50" stroke="%23991b1b" stroke-width="3.5" stroke-linecap="round"/><line x1="80" y1="44" x2="66" y2="50" stroke="%23991b1b" stroke-width="3.5" stroke-linecap="round"/><circle cx="48" cy="54" r="3.5" fill="%23991b1b"/><circle cx="72" cy="54" r="3.5" fill="%23991b1b"/><path d="M48 68 Q60 62 72 68" fill="none" stroke="%23991b1b" stroke-width="3.5" stroke-linecap="round"/><path d="M85 30 L95 20 M90 18 L100 28" stroke="%23ef4444" stroke-width="3"/></svg>`;
const STICKER_NAILONG_HEART = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130"><ellipse cx="60" cy="55" rx="34" ry="32" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><circle cx="48" cy="48" r="5" fill="%23ffffff"/><circle cx="72" cy="48" r="5" fill="%23ffffff"/><circle cx="48" cy="48" r="2.5" fill="%2315803d"/><circle cx="72" cy="48" r="2.5" fill="%2315803d"/><path d="M60 75 C42 55 25 78 60 102 C95 78 78 55 60 75 Z" fill="%23f43f5e" stroke="%23be123c" stroke-width="3"/></svg>`;

const STICKER_AESTHETIC_CHROME_STAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 5 C63 42 82 60 115 60 C82 60 63 78 60 115 C57 78 38 60 5 60 C38 60 57 42 60 5 Z" fill="url(%23chromeGrad)" stroke="%23e2e8f0" stroke-width="2"/><defs><linearGradient id="chromeGrad" x1="0%25" y1="0%" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23ffffff"/><stop offset="35%25" stop-color="%23cbd5e1"/><stop offset="70%25" stop-color="%2364748b"/><stop offset="100%25" stop-color="%231e293b"/></linearGradient></defs></svg>`;
const STICKER_AESTHETIC_CYBER_HEART = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><path d="M60 25 C40 0 5 25 60 95 C115 25 80 0 60 25 Z" fill="url(%23cyberGrad)" stroke="%23f472b6" stroke-width="3"/><defs><linearGradient id="cyberGrad" x1="0%25" y1="0%" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23fbcfe8"/><stop offset="50%25" stop-color="%23a5f3fc"/><stop offset="100%25" stop-color="%23c084fc"/></linearGradient></defs></svg>`;
const STICKER_AESTHETIC_DAISY_FLOWER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"><circle cx="60" cy="30" r="14"/><circle cx="90" cy="60" r="14"/><circle cx="60" cy="90" r="14"/><circle cx="30" cy="60" r="14"/><circle cx="39" cy="39" r="14"/><circle cx="81" cy="39" r="14"/><circle cx="81" cy="81" r="14"/><circle cx="39" cy="81" r="14"/></g><circle cx="60" cy="60" r="14" fill="%23facc15" stroke="%23ca8a04" stroke-width="2"/></svg>`;

// ============================================================================
// STIKER KUCING REAL PINTEREST (FULL BADAN DIE-CUT PHOTO STYLE)
// ============================================================================
const STICKER_CAT_SCOOTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 150"><filter id="shadow1"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.2"/></filter><g filter="url(%23shadow1)"><circle cx="40" cy="45" r="22" fill="%23f1f5f9"/><polygon points="22,30 35,45 18,48" fill="%23cbd5e1"/><polygon points="58,30 45,45 62,48" fill="%23cbd5e1"/><ellipse cx="40" cy="48" rx="20" ry="17" fill="%23ffffff"/><circle cx="32" cy="45" r="4" fill="%230f172a"/><circle cx="48" cy="45" r="4" fill="%230f172a"/><circle cx="33" cy="43" r="1.5" fill="%23ffffff"/><circle cx="49" cy="43" r="1.5" fill="%23ffffff"/><polygon points="40,51 38,53 42,53" fill="%23f43f5e"/><ellipse cx="28" cy="50" rx="3.5" ry="2" fill="%23fda4af"/><ellipse cx="52" cy="50" rx="3.5" ry="2" fill="%23fda4af"/><rect x="25" y="65" width="30" height="35" rx="10" fill="%23fda4af"/><rect x="28" y="98" width="8" height="24" rx="4" fill="%23ffffff"/><rect x="44" y="98" width="8" height="24" rx="4" fill="%23ffffff"/><circle cx="35" cy="128" r="12" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><circle cx="85" cy="128" r="12" fill="%23dc2626" stroke="%23991b1b" stroke-width="3"/><rect x="30" y="118" width="60" height="7" rx="3" fill="%23dc2626"/><line x1="75" y1="120" x2="75" y2="70" stroke="%23dc2626" stroke-width="5" stroke-linecap="round"/><rect x="62" y="66" width="26" height="8" rx="4" fill="%23dc2626"/></g></svg>`;
const STICKER_CAT_SUNFLOWER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 150"><filter id="s1"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23s1)"><g fill="%23fde047" stroke="%23ca8a04" stroke-width="2"><circle cx="70" cy="20" r="18"/><circle cx="105" cy="35" r="18"/><circle cx="118" cy="70" r="18"/><circle cx="105" cy="105" r="18"/><circle cx="70" cy="120" r="18"/><circle cx="35" cy="105" r="18"/><circle cx="22" cy="70" r="18"/><circle cx="35" cy="35" r="18"/></g><circle cx="70" cy="70" r="40" fill="%23fed7aa" stroke="%23f97316" stroke-width="3"/><ellipse cx="70" cy="70" rx="28" ry="24" fill="%23ffffff"/><polygon points="48,48 58,60 42,62" fill="%23cbd5e1"/><polygon points="92,48 82,60 98,62" fill="%23cbd5e1"/><circle cx="56" cy="66" r="5" fill="%230284c7"/><circle cx="84" cy="66" r="5" fill="%230284c7"/><circle cx="57" cy="64" r="1.5" fill="%23ffffff"/><circle cx="85" cy="64" r="1.5" fill="%23ffffff"/><polygon points="70,72 68,74 72,74" fill="%23f43f5e"/><path d="M64 78 Q70 82 76 78" fill="none" stroke="%23334155" stroke-width="2"/><ellipse cx="50" cy="73" rx="4" ry="2" fill="%23fbcfe8"/><ellipse cx="90" cy="73" rx="4" ry="2" fill="%23fbcfe8"/></g></svg>`;
const STICKER_CAT_BANANA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 160"><filter id="s2"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23s2)"><path d="M55 15 C35 35 20 80 40 140 C65 148 80 125 85 80 C90 45 72 25 55 15 Z" fill="%23facc15" stroke="%23eab308" stroke-width="3"/><path d="M42 45 C42 35 68 35 68 45 C68 75 42 75 42 45 Z" fill="%23ffffff"/><ellipse cx="55" cy="52" rx="16" ry="14" fill="%23fde047"/><circle cx="48" cy="50" r="3" fill="%230f172a"/><circle cx="62" cy="50" r="3" fill="%230f172a"/><polygon points="55,54 53,56 57,56" fill="%23f43f5e"/><path d="M42 62 C32 62 25 78 30 82 C35 82 40 72 44 68 Z" fill="%23eab308"/><path d="M68 62 C78 62 85 78 80 82 C75 82 70 72 66 68 Z" fill="%23eab308"/><ellipse cx="44" cy="138" rx="5" ry="8" fill="%23ffffff"/><ellipse cx="66" cy="138" rx="5" ry="8" fill="%23ffffff"/></g></svg>`;
const STICKER_CAT_POTATO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120"><filter id="s3"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23s3)"><ellipse cx="70" cy="62" rx="52" ry="42" fill="%23d97706" stroke="%23b45309" stroke-width="3"/><ellipse cx="45" cy="45" rx="8" ry="4" fill="%2392400e" opacity="0.4"/><ellipse cx="95" cy="75" rx="10" ry="5" fill="%2392400e" opacity="0.4"/><ellipse cx="70" cy="52" rx="26" ry="22" fill="%23ffffff" stroke="%23f8fafc" stroke-width="2"/><ellipse cx="60" cy="50" rx="4" ry="5" fill="%230f172a"/><ellipse cx="80" cy="50" rx="4" ry="5" fill="%230f172a"/><polygon points="70,55 68,57 72,57" fill="%23f43f5e"/><path d="M64 60 Q70 65 76 60" fill="none" stroke="%23334155" stroke-width="2"/><ellipse cx="52" cy="56" rx="4" ry="2.5" fill="%23fbcfe8"/><ellipse cx="88" cy="56" rx="4" ry="2.5" fill="%23fbcfe8"/><ellipse cx="40" cy="85" rx="8" ry="6" fill="%23ffffff"/><ellipse cx="100" cy="85" rx="8" ry="6" fill="%23ffffff"/></g></svg>`;
const STICKER_CAT_MATCHA_CUP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150"><filter id="s4"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23s4)"><path d="M28 50 L92 50 L83 136 L37 136 Z" fill="%2386efac" stroke="%2316a34a" stroke-width="3"/><ellipse cx="60" cy="45" rx="38" ry="10" fill="%23dcfce7" stroke="%2316a34a" stroke-width="2"/><ellipse cx="60" cy="40" rx="22" ry="18" fill="%23ffffff"/><polygon points="42,28 50,38 38,40" fill="%23cbd5e1"/><polygon points="78,28 70,38 82,40" fill="%23cbd5e1"/><circle cx="52" cy="38" r="3" fill="%230f172a"/><circle cx="68" cy="38" r="3" fill="%230f172a"/><polygon points="60,42 58,44 62,44" fill="%23f43f5e"/><line x1="75" y1="15" x2="65" y2="50" stroke="%23ef4444" stroke-width="6" stroke-linecap="round"/><circle cx="48" cy="110" r="4" fill="%2314532d"/><circle cx="60" cy="118" r="4" fill="%2314532d"/><circle cx="72" cy="110" r="4" fill="%2314532d"/><circle cx="55" cy="98" r="4" fill="%2314532d"/><circle cx="66" cy="98" r="4" fill="%2314532d"/></g></svg>`;
const STICKER_CAT_NY_CAP_CASH = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 150"><filter id="s5"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23s5)"><path d="M35 30 Q65 15 95 30 L105 45 L25 45 Z" fill="%230f172a"/><path d="M15 42 L80 42 L85 52 L20 52 Z" fill="%230f172a"/><text x="65" y="36" font-family="sans-serif" font-weight="900" font-size="14" fill="%23ffffff" text-anchor="middle">NY</text><ellipse cx="65" cy="72" rx="30" ry="25" fill="%23cbd5e1"/><ellipse cx="65" cy="75" rx="22" ry="18" fill="%23ffffff"/><circle cx="53" cy="70" r="4" fill="%230f172a"/><circle cx="77" cy="70" r="4" fill="%230f172a"/><polygon points="65,75 63,77 67,77" fill="%23f43f5e"/><ellipse cx="44" cy="74" rx="4" ry="2" fill="%23fbcfe8"/><ellipse cx="86" cy="74" rx="4" ry="2" fill="%23fbcfe8"/><rect x="85" y="75" width="30" height="18" rx="2" fill="%2322c55e" stroke="%2315803d" stroke-width="2" transform="rotate(-15 85 75)"/><text x="96" y="88" font-family="sans-serif" font-weight="900" font-size="10" fill="%23ffffff" transform="rotate(-15 85 75)">$100</text></g></svg>`;
const STICKER_CAT_TULIP_BOUQUET = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 150"><filter id="s6"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23s6)"><polygon points="35,30 48,48 25,50" fill="%23cbd5e1"/><polygon points="95,30 82,48 105,50" fill="%23cbd5e1"/><circle cx="85" cy="32" r="8" fill="%23f43f5e"/><path d="M75 32 Q85 24 95 32" fill="%23f43f5e"/><ellipse cx="65" cy="62" rx="30" ry="24" fill="%23ffffff"/><circle cx="53" cy="58" r="4" fill="%230f172a"/><circle cx="77" cy="58" r="4" fill="%230f172a"/><polygon points="65,63 63,65 67,65" fill="%23f43f5e"/><path d="M57 68 Q65 74 73 68" fill="none" stroke="%23334155" stroke-width="2"/><ellipse cx="44" cy="62" rx="4" ry="2" fill="%23fbcfe8"/><ellipse cx="86" cy="62" rx="4" ry="2" fill="%23fbcfe8"/><g transform="translate(15, 65)"><path d="M20 30 C10 10 30 0 35 25 C40 0 60 10 50 30 Z" fill="%23f472b6" stroke="%23db2777" stroke-width="2"/><path d="M40 35 C30 15 50 5 55 30 C60 5 80 15 70 35 Z" fill="%23fb7185" stroke="%23e11d48" stroke-width="2"/><rect x="25" y="32" width="30" height="25" fill="%23fbcfe8" stroke="%23f43f5e" stroke-width="2" transform="rotate(15 25 32)"/></g></g></svg>`;

// ============================================================================
// STIKER NAILONG 3D COSTUME PINTEREST (FULL BADAN DIE-CUT PHOTO STYLE)
// ============================================================================
const STICKER_NAILONG_KITTY_STRAWBERRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 140"><filter id="n1"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23n1)"><path d="M25 40 Q65 10 105 40 L105 75 L25 75 Z" fill="%23ef4444" stroke="%23b91c1c" stroke-width="3"/><polygon points="30,22 42,38 22,40" fill="%23ffffff"/><polygon points="100,22 88,38 108,40" fill="%23ffffff"/><circle cx="95" cy="35" r="7" fill="%23ef4444"/><ellipse cx="65" cy="75" rx="34" ry="32" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><circle cx="53" cy="68" r="4.5" fill="%23ffffff"/><circle cx="77" cy="68" r="4.5" fill="%23ffffff"/><circle cx="53" cy="68" r="2.5" fill="%2315803d"/><circle cx="77" cy="68" r="2.5" fill="%2315803d"/><path d="M50 78 Q65 92 80 78 Z" fill="%23dc2626"/><path d="M65 92 C55 80 40 95 65 115 C90 95 75 80 65 92 Z" fill="%23ef4444" stroke="%23b91c1c" stroke-width="2"/><polygon points="65,92 61,88 69,88" fill="%2322c55e"/></g></svg>`;
const STICKER_NAILONG_MYMELODY_PEACH = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 140"><filter id="n2"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23n2)"><path d="M20 50 C20 15 110 15 110 50 L110 75 L20 75 Z" fill="%23f472b6" stroke="%23db2777" stroke-width="3"/><ellipse cx="28" cy="25" rx="10" ry="24" fill="%23f472b6" transform="rotate(-15 28 25)"/><ellipse cx="102" cy="25" rx="10" ry="24" fill="%23f472b6" transform="rotate(15 102 25)"/><ellipse cx="65" cy="75" rx="34" ry="32" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><circle cx="53" cy="68" r="4.5" fill="%23ffffff"/><circle cx="77" cy="68" r="4.5" fill="%23ffffff"/><circle cx="53" cy="68" r="2.5" fill="%2315803d"/><circle cx="77" cy="68" r="2.5" fill="%2315803d"/><path d="M54 78 Q65 86 76 78" fill="none" stroke="%2315803d" stroke-width="3"/><circle cx="65" cy="102" r="16" fill="%23fdba74" stroke="%23fb923c" stroke-width="2"/><path d="M65 86 C63 92 65 102 65 118" stroke="%23f97316" stroke-width="1.5"/></g></svg>`;
const STICKER_NAILONG_CHICKEN_HOODIE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 140"><filter id="n3"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23n3)"><path d="M25 45 C25 15 105 15 105 45 L105 80 L25 80 Z" fill="%23fde047" stroke="%23eab308" stroke-width="3"/><polygon points="65,12 55,28 75,28" fill="%23ef4444"/><ellipse cx="65" cy="75" rx="34" ry="32" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><circle cx="53" cy="68" r="4.5" fill="%23ffffff"/><circle cx="77" cy="68" r="4.5" fill="%23ffffff"/><circle cx="53" cy="68" r="2.5" fill="%2315803d"/><circle cx="77" cy="68" r="2.5" fill="%2315803d"/><path d="M52 78 Q65 88 78 78" fill="none" stroke="%2315803d" stroke-width="3"/><ellipse cx="40" cy="72" rx="4" ry="2.5" fill="%23f87171"/><ellipse cx="90" cy="72" rx="4" ry="2.5" fill="%23f87171"/></g></svg>`;
const STICKER_NAILONG_SUNFLOWER_HAT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"><filter id="n4"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23n4)"><g fill="%23facc15" stroke="%23ca8a04" stroke-width="2"><circle cx="70" cy="22" r="16"/><circle cx="102" cy="35" r="16"/><circle cx="115" cy="68" r="16"/><circle cx="102" cy="100" r="16"/><circle cx="70" cy="112" r="16"/><circle cx="38" cy="100" r="16"/><circle cx="25" cy="68" r="16"/><circle cx="38" cy="35" r="16"/></g><ellipse cx="70" cy="68" rx="36" ry="34" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><circle cx="58" cy="62" r="5" fill="%23ffffff"/><circle cx="82" cy="62" r="5" fill="%23ffffff"/><circle cx="58" cy="62" r="2.5" fill="%2315803d"/><circle cx="82" cy="62" r="2.5" fill="%2315803d"/><ellipse cx="70" cy="72" rx="6" ry="4" fill="%23dc2626"/></g></svg>`;

const STICKER_NAILONG_WATERMELON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><filter id="nw1"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23nw1)"><ellipse cx="60" cy="65" rx="34" ry="36" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><circle cx="48" cy="52" r="5" fill="%23ffffff"/><circle cx="72" cy="52" r="5" fill="%23ffffff"/><circle cx="48" cy="52" r="2.5" fill="%2315803d"/><circle cx="72" cy="52" r="2.5" fill="%2315803d"/><path d="M30 85 C30 115 90 115 90 85 Z" fill="%23ef4444" stroke="%2316a34a" stroke-width="3"/><path d="M30 85 C30 110 90 110 90 85 Z" fill="%23f87171"/><path d="M26 83 L94 83 L90 88 L30 88 Z" fill="%2322c55e"/><circle cx="45" cy="95" r="2" fill="%2318181b"/><circle cx="60" cy="98" r="2" fill="%2318181b"/><circle cx="75" cy="95" r="2" fill="%2318181b"/><circle cx="52" cy="90" r="1.5" fill="%2318181b"/><circle cx="68" cy="90" r="1.5" fill="%2318181b"/></g></svg>`;
const STICKER_NAILONG_CHEF = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><filter id="nw2"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23nw2)"><ellipse cx="60" cy="70" rx="34" ry="36" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><path d="M35 35 C30 15 90 15 85 35 L88 45 L32 45 Z" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><rect x="32" y="45" width="56" height="8" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><circle cx="48" cy="62" r="5" fill="%23ffffff"/><circle cx="72" cy="62" r="5" fill="%23ffffff"/><circle cx="48" cy="62" r="2.5" fill="%2315803d"/><circle cx="72" cy="62" r="2.5" fill="%2315803d"/><path d="M48 74 Q60 84 72 74" fill="none" stroke="%2315803d" stroke-width="3"/><rect x="85" y="60" width="8" height="40" rx="4" fill="%23d97706" transform="rotate(25 85 60)"/><ellipse cx="102" cy="60" rx="7" ry="12" fill="%23d97706" transform="rotate(25 102 60)"/></g></svg>`;
const STICKER_NAILONG_CRYING = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130"><filter id="nw3"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23nw3)"><ellipse cx="60" cy="60" rx="36" ry="34" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><path d="M42 50 Q48 44 54 50" fill="none" stroke="%2315803d" stroke-width="3"/><path d="M66 50 Q72 44 78 50" fill="none" stroke="%2315803d" stroke-width="3"/><path d="M46 64 Q60 56 74 64" fill="none" stroke="%23ca8a04" stroke-width="3.5"/><path d="M38 52 C30 65 35 90 40 92 C45 90 42 65 42 52 Z" fill="%2338bdf8" opacity="0.8"/><path d="M82 52 C74 65 79 90 84 92 C89 90 86 65 86 52 Z" fill="%2338bdf8" opacity="0.8"/><ellipse cx="60" cy="100" rx="30" ry="8" fill="%2338bdf8" opacity="0.5"/></g></svg>`;
const STICKER_NAILONG_COOL_SUNGLASSES = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><filter id="nw4"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23nw4)"><ellipse cx="60" cy="60" rx="36" ry="34" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><rect x="25" y="48" width="32" height="20" rx="4" fill="%230f172a"/><rect x="63" y="48" width="32" height="20" rx="4" fill="%230f172a"/><line x1="57" y1="55" x2="63" y2="55" stroke="%230f172a" stroke-width="4"/><line x1="28" y1="52" x2="54" y2="64" stroke="%23ffffff" stroke-width="2" opacity="0.6"/><line x1="66" y1="52" x2="92" y2="64" stroke="%23ffffff" stroke-width="2" opacity="0.6"/><path d="M48 76 Q60 84 72 76" fill="none" stroke="%2315803d" stroke-width="3.5"/><circle cx="60" cy="90" r="10" fill="none" stroke="%23eab308" stroke-width="3.5"/></g></svg>`;
const STICKER_NAILONG_SLEEPY_PILLOW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 110"><filter id="nw5"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23nw5)"><rect x="15" y="55" width="100" height="40" rx="15" fill="%2393c5fd" stroke="%233b82f6" stroke-width="3"/><ellipse cx="50" cy="55" rx="30" ry="24" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><path d="M38 52 Q44 58 50 52" fill="none" stroke="%2315803d" stroke-width="3"/><path d="M56 52 Q62 58 68 52" fill="none" stroke="%2315803d" stroke-width="3"/><ellipse cx="60" cy="62" rx="4" ry="2.5" fill="%23f87171"/><text x="92" y="42" font-family="sans-serif" font-weight="900" font-size="20" fill="%233b82f6">Zzz</text></g></svg>`;
const STICKER_NAILONG_DANCE_PARTY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><filter id="nw6"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="%23000000" flood-opacity="0.15"/></filter><g filter="url(%23nw6)"><polygon points="60,15 45,45 75,45" fill="%23ec4899" stroke="%23be123c" stroke-width="2"/><ellipse cx="60" cy="75" rx="34" ry="36" fill="%23facc15" stroke="%23ca8a04" stroke-width="3.5"/><circle cx="48" cy="68" r="5" fill="%23ffffff"/><circle cx="72" cy="68" r="5" fill="%23ffffff"/><circle cx="48" cy="68" r="2.5" fill="%2315803d"/><circle cx="72" cy="68" r="2.5" fill="%2315803d"/><path d="M44 80 Q60 98 76 80 Z" fill="%23dc2626"/><rect x="12" y="65" width="20" height="6" rx="3" fill="%23a855f7" transform="rotate(-30 12 65)"/><rect x="88" y="55" width="20" height="6" rx="3" fill="%2322c55e" transform="rotate(30 88 55)"/></g></svg>`;


// ============================================================================
// KOLEKSI STIKER LAMA (KAWAII PINTEREST, NAILONG, COQUETTE, CATS, FLOWERS)
// ============================================================================

const STICKER_PINTEREST_BLACK_CAT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M30 35 L48 55 C48 55 35 60 30 35 Z M90 35 L72 55 C72 55 85 60 90 35 Z" fill="%2318181b" stroke="%23fef3c7" stroke-width="3"/><circle cx="60" cy="65" r="32" fill="%2318181b" stroke="%23fef3c7" stroke-width="3"/><ellipse cx="48" cy="60" rx="5" ry="7" fill="%23facc15"/><ellipse cx="72" cy="60" rx="5" ry="7" fill="%23facc15"/><circle cx="48" cy="60" r="2.5" fill="%2318181b"/><circle cx="72" cy="60" r="2.5" fill="%2318181b"/><polygon points="60,67 57,71 63,71" fill="%23f43f5e"/><path d="M54 74 Q60 78 66 74" fill="none" stroke="%23fef3c7" stroke-width="2"/><ellipse cx="60" cy="92" rx="26" ry="22" fill="%2318181b" stroke="%23fef3c7" stroke-width="3"/><path d="M28 95 C15 90 10 70 20 65 C22 75 28 85 32 90 Z" fill="%2318181b" stroke="%23fef3c7" stroke-width="2"/><path d="M50 82 Q42 78 50 86 Q60 88 50 82 Z" fill="%23fbcfe8"/><path d="M70 82 Q78 78 70 86 Q60 88 70 82 Z" fill="%23fbcfe8"/><circle cx="60" cy="83" r="4" fill="%23f43f5e"/></svg>`;
const STICKER_PINTEREST_BEAR_HEART = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="35" cy="35" r="14" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><circle cx="85" cy="35" r="14" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><circle cx="35" cy="35" r="7" fill="%23fef3c7"/><circle cx="85" cy="35" r="7" fill="%23fef3c7"/><ellipse cx="60" cy="55" rx="32" ry="28" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><ellipse cx="60" cy="60" rx="12" ry="9" fill="%23fef3c7"/><ellipse cx="60" cy="56" rx="5" ry="3.5" fill="%23451a03"/><line x1="60" y1="59.5" x2="60" y2="64" stroke="%23451a03" stroke-width="2"/><circle cx="45" cy="50" r="3.5" fill="%23451a03"/><circle cx="75" cy="50" r="3.5" fill="%23451a03"/><ellipse cx="60" cy="90" rx="28" ry="24" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><path d="M60 70 C45 55 35 75 60 92 C85 75 75 55 60 70 Z" fill="%2378350f" stroke="%23fef3c7" stroke-width="2"/><circle cx="35" cy="85" r="8" fill="%23d97706" stroke="%23fef3c7" stroke-width="2"/><circle cx="85" cy="85" r="8" fill="%23fef3c7" stroke="%23fef3c7" stroke-width="2"/></svg>`;
const STICKER_PINTEREST_BOBA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><path d="M25 40 L75 40 L70 115 L30 115 Z" fill="%23fef3c7" stroke="%2378350f" stroke-width="3"/><path d="M27 55 L73 55 L70 115 L30 115 Z" fill="%23d97706" opacity="0.8"/><ellipse cx="50" cy="40" rx="27" ry="8" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><path d="M23 40 C23 20 77 20 77 40 Z" fill="%23ffffff" opacity="0.6" stroke="%2378350f" stroke-width="2"/><line x1="50" y1="8" x2="50" y2="40" stroke="%23f43f5e" stroke-width="7" stroke-linecap="round"/><path d="M50 72 C42 62 38 75 50 84 C62 75 58 62 50 72 Z" fill="%2318181b"/><circle cx="40" cy="98" r="4.5" fill="%2318181b"/><circle cx="50" cy="104" r="4.5" fill="%2318181b"/><circle cx="60" cy="98" r="4.5" fill="%2318181b"/><circle cx="45" cy="90" r="4" fill="%2318181b"/><circle cx="55" cy="90" r="4" fill="%2318181b"/></svg>`;
const STICKER_PINTEREST_CAKE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><ellipse cx="60" cy="85" rx="52" ry="18" fill="%23fef3c7" stroke="%2378350f" stroke-width="3"/><path d="M20 50 L100 50 L100 80 C100 92 20 92 20 80 Z" fill="%23451a03" stroke="%2378350f" stroke-width="3"/><rect x="20" y="62" width="80" height="6" fill="%23fef3c7"/><ellipse cx="60" cy="50" rx="40" ry="14" fill="%2378350f" stroke="%2378350f" stroke-width="2"/><circle cx="50" cy="30" r="5" fill="%23d97706"/><circle cx="70" cy="30" r="5" fill="%23d97706"/><ellipse cx="60" cy="36" rx="14" ry="11" fill="%23d97706" stroke="%2378350f" stroke-width="2"/><circle cx="55" cy="34" r="1.5" fill="%2318181b"/><circle cx="65" cy="34" r="1.5" fill="%2318181b"/><ellipse cx="60" cy="38" rx="3" ry="2" fill="%23fef3c7"/></svg>`;
const STICKER_PINTEREST_PUPPY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="25" cy="55" rx="12" ry="24" fill="%2378350f" transform="rotate(15 25 55)"/><ellipse cx="95" cy="55" rx="12" ry="24" fill="%2378350f" transform="rotate(-15 95 55)"/><ellipse cx="60" cy="58" rx="34" ry="28" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><circle cx="46" cy="52" r="3.5" fill="%2318181b"/><circle cx="74" cy="52" r="3.5" fill="%2318181b"/><ellipse cx="60" cy="58" rx="6" ry="4" fill="%2378350f"/><path d="M56 63 Q60 67 64 63" fill="none" stroke="%2318181b" stroke-width="2"/><ellipse cx="60" cy="92" rx="28" ry="22" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><ellipse cx="60" cy="88" rx="14" ry="12" fill="%23d97706" stroke="%2378350f" stroke-width="2"/><circle cx="55" cy="86" r="1.5" fill="%2318181b"/><circle cx="65" cy="86" r="1.5" fill="%2318181b"/></svg>`;
const STICKER_PINTEREST_BUNNY_STAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="42" cy="30" rx="10" ry="25" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><ellipse cx="78" cy="30" rx="10" ry="25" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><ellipse cx="42" cy="32" rx="5" ry="16" fill="%23fbcfe8"/><ellipse cx="78" cy="32" rx="5" ry="16" fill="%23fbcfe8"/><ellipse cx="60" cy="65" rx="32" ry="28" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><circle cx="45" cy="60" r="3.5" fill="%2318181b"/><path d="M70 60 Q76 56 78 62" fill="none" stroke="%2318181b" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="60" cy="66" rx="3" ry="2" fill="%23f43f5e"/><ellipse cx="38" cy="68" rx="5" ry="3" fill="%23fbcfe8"/><ellipse cx="82" cy="68" rx="5" ry="3" fill="%23fbcfe8"/><polygon points="60,72 65,85 78,85 67,93 71,106 60,97 49,106 53,93 42,85 55,85" fill="%23facc15" stroke="%2378350f" stroke-width="2"/></svg>`;
const STICKER_CAT_BLUE_RIBBON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%233b82f6" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%2393c5fd"/><polygon points="85,35 72,55 95,58" fill="%2393c5fd"/><circle cx="48" cy="60" r="5" fill="%231e3a8a"/><circle cx="72" cy="60" r="5" fill="%231e3a8a"/><ellipse cx="60" cy="70" rx="4" ry="3" fill="%23f43f5e"/><path d="M52 76 Q60 82 68 76" fill="none" stroke="%231e3a8a" stroke-width="3"/><path d="M25 25 Q40 15 50 30 Q35 35 25 25 Z" fill="%2360a5fa"/><path d="M75 25 Q60 15 50 30 Q65 35 75 25 Z" fill="%2360a5fa"/><circle cx="50" cy="28" r="6" fill="%232563eb"/><path d="M75 92 Q85 85 95 90 Q90 100 80 98 Z" fill="%233b82f6"/></svg>`;
const STICKER_CAT_PINK_RIBBON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="65" r="35" fill="%23ffffff" stroke="%23f43f5e" stroke-width="4"/><polygon points="35,35 48,55 25,58" fill="%23fb7185"/><polygon points="85,35 72,55 95,58" fill="%23fb7185"/><circle cx="48" cy="60" r="5" fill="%23881337"/><circle cx="72" cy="60" r="5" fill="%23881337"/><ellipse cx="60" cy="68" rx="5" ry="3" fill="%23f43f5e"/><path d="M50 74 Q60 82 70 74" fill="none" stroke="%23881337" stroke-width="3"/><path d="M70 30 Q80 20 88 30 Q80 38 70 30 Z" fill="%23f43f5e"/><path d="M88 30 Q98 20 106 30 Q98 38 88 30 Z" fill="%23f43f5e"/><circle cx="88" cy="32" r="4" fill="%23be123c"/></svg>`;
const STICKER_SNOOPY_HEARTS = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="50" cy="50" rx="25" ry="30" fill="%23ffffff" stroke="%23111827" stroke-width="4"/><ellipse cx="30" cy="55" rx="8" ry="18" fill="%23111827"/><circle cx="58" cy="45" r="3" fill="%23111827"/><ellipse cx="70" cy="52" rx="6" ry="4" fill="%23111827"/><path d="M45 65 Q55 72 65 65" fill="none" stroke="%23111827" stroke-width="3"/><path d="M70 65 C60 50 90 40 100 55 C110 70 80 80 70 65 Z" fill="%23dc2626"/></svg>`;
const STICKER_FLOWER_LILY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 20 C50 45 30 50 10 60 C35 70 50 85 60 110 C70 85 85 70 110 60 C90 50 70 45 60 20 Z" fill="%23ec4899"/><path d="M60 35 C53 50 40 55 25 60 C40 65 53 75 60 90 C67 75 80 65 95 60 C80 55 67 50 60 35 Z" fill="%23f472b6"/><circle cx="60" cy="60" r="8" fill="%23facc15"/></svg>`;
const STICKER_FLOWER_PLUMERIA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="60" cy="35" rx="14" ry="25" fill="%23f472b6"/><ellipse cx="85" cy="52" rx="14" ry="25" fill="%23f472b6" transform="rotate(72 85 52)"/><ellipse cx="75" cy="82" rx="14" ry="25" fill="%23f472b6" transform="rotate(144 75 82)"/><ellipse cx="45" cy="82" rx="14" ry="25" fill="%23f472b6" transform="rotate(216 45 82)"/><ellipse cx="35" cy="52" rx="14" ry="25" fill="%23f472b6" transform="rotate(288 35 52)"/><circle cx="60" cy="60" r="12" fill="%23fbe0e9"/><circle cx="60" cy="60" r="7" fill="%23facc15"/></svg>`;
const STICKER_COQUETTE_BOW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="M60 45 C45 15 15 20 15 45 C15 65 45 60 60 52 C75 60 105 65 105 45 C105 20 75 15 60 45 Z" fill="%23f43f5e" stroke="%23be123c" stroke-width="3"/><circle cx="60" cy="48" r="9" fill="%23e11d48"/><path d="M52 52 L30 90 L42 92 L60 58 Z" fill="%23fb7185"/><path d="M68 52 L90 90 L78 92 L60 58 Z" fill="%23fb7185"/></svg>`;
const STICKER_MATCHA_BOBA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><rect x="25" y="35" width="50" height="75" rx="12" fill="%23bbf7d0" stroke="%2316a34a" stroke-width="3"/><path d="M30 40 L70 40 L65 100 L35 100 Z" fill="%2386efac"/><line x1="50" y1="10" x2="50" y2="40" stroke="%23ef4444" stroke-width="6" stroke-linecap="round"/><ellipse cx="50" cy="35" rx="27" ry="6" fill="%23ffffff" stroke="%2316a34a" stroke-width="2"/><circle cx="40" cy="85" r="4" fill="%231e293b"/><circle cx="50" cy="92" r="4" fill="%231e293b"/><circle cx="60" cy="85" r="4" fill="%231e293b"/><circle cx="45" cy="60" r="3" fill="%231e293b"/><circle cx="55" cy="60" r="3" fill="%231e293b"/><path d="M47 66 Q50 70 53 66" fill="none" stroke="%231e293b" stroke-width="2"/></svg>`;
const STICKER_Y2K_CHROME_STAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 5 C62 40 80 58 115 60 C80 62 62 80 60 115 C58 80 40 62 5 60 C40 58 58 40 60 5 Z" fill="url(%23grad)" stroke="%2364748b" stroke-width="2"/><defs><linearGradient id="grad" x1="0%25" y1="0%" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23f8fafc"/><stop offset="50%25" stop-color="%2394a3b8"/><stop offset="100%25" stop-color="%23334155"/></linearGradient></defs></svg>`;

export const stickers: StickerItem[] = [
  // ==========================================
  // 🐱 STIKER KUCING REAL PHOTO PINTEREST (DIE-CUT CUTOUT)
  // ==========================================
  { id: "cute-angry-cat", name: "Real Angry Ragdoll Cat (Doodle Outline)", src: "/stickers/cute-angry-cat.jpg", category: "cat" },
  { id: "cute-helmet-cat", name: "Real Kitten Wearing Helmet", src: "/stickers/cute-helmet-cat.jpg", category: "cat" },
  { id: "cat-hipster", name: "Real Hipster Cat Sunglasses", src: "/stickers/cat-hipster.png.jpg", category: "cat" },
  { id: "cat-blue-ribbon-real", name: "Real Cat Blue Ribbon", src: "/stickers/cat-blue-ribbon.png.jpg", category: "cat" },
  { id: "cat-pink-ribbon-real", name: "Real Cat Pink Ribbon", src: "/stickers/cat-pink-ribbon.png.jpg", category: "cat" },
  { id: "cat-scooter-red", name: "Real Cat Scooter Red", src: STICKER_CAT_SCOOTER, category: "cat" },
  { id: "cat-sunflower-hood", name: "Real Cat Sunflower Hood", src: STICKER_CAT_SUNFLOWER, category: "cat" },
  { id: "cat-banana-suit", name: "Real Cat Banana Suit", src: STICKER_CAT_BANANA, category: "cat" },
  { id: "cat-potato-suit", name: "Real Cat Potato Pouch", src: STICKER_CAT_POTATO, category: "cat" },
  { id: "cat-matcha-cup", name: "Real Cat Matcha Cup", src: STICKER_CAT_MATCHA_CUP, category: "cat" },
  { id: "cat-ny-cash", name: "Real Cat NY Cap & Cash", src: STICKER_CAT_NY_CAP_CASH, category: "cat" },
  { id: "cat-tulip-bouquet", name: "Real Cat Tulip Bouquet", src: STICKER_CAT_TULIP_BOUQUET, category: "cat" },
  { id: "grey-tabby-wink", name: "Kucing Genit Winking Paw", src: STICKER_GREY_TABBY_WINK, category: "cat" },
  { id: "cat-flirty-wink", name: "Kucing Genit Kiss Heart", src: STICKER_CAT_FLIRTY_WINK, category: "cat" },
  { id: "cat-angry-pout", name: "Kucing Marah Gemes", src: STICKER_CAT_ANGRY, category: "cat" },
  { id: "cat-boba-drink", name: "Kucing Minum Boba", src: STICKER_CAT_BOBA, category: "cat" },
  { id: "cat-sleepy-cloud", name: "Kucing Tidur Zzz Cloud", src: STICKER_CAT_SLEEPY, category: "cat" },
  { id: "cat-gamer-headphone", name: "Kucing Gamer Pink Headphones", src: STICKER_CAT_GAMER, category: "cat" },
  { id: "cat-blue-ribbon-svg", name: "Kucing Pita Biru SVG", src: STICKER_CAT_BLUE_RIBBON, category: "cat" },
  { id: "cute-cat", name: "Cute Kitten White", src: "/stickers/cute-cat.svg", category: "cat" },

  // ==========================================
  // 🐲 STIKER NAILONG 3D KOSTUM PINTEREST (REAL 3D CUTOUT FULL BODY)
  // ==========================================
  // ==========================================
  // 🐲 STIKER NAILONG 3D KOSTUM PINTEREST (REAL 3D CUTOUT FULL BODY)
  // ==========================================
  { id: "nailong-cat-costume", name: "Nailong Kostum Kucing Full Body", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-dance-stretch", name: "Nailong Joget Stretch Full Body", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "nailong-wave-happy", name: "Nailong Waving Happy Full Body", src: "/stickers/nailong-wave-happy.png", category: "nailong" },
  { id: "nailong-wave-face", name: "Nailong Intip Lucu Full Body", src: "/stickers/nailong-wave-face.png", category: "nailong" },
  { id: "nailong-silly-open", name: "Nailong Silly Lidah Melet Full Body", src: "/stickers/nailong-silly-open.png", category: "nailong" },
  { id: "nailong-shopping-bags", name: "Nailong Belanja Shopping Bags Full Body", src: "/stickers/nailong-shopping-bags.png", category: "nailong" },
  { id: "nailong-bear-shirt", name: "Nailong Kaos Beruang Full Body", src: "/stickers/nailong-bear-shirt.png", category: "nailong" },
  { id: "nailong-blep-derp", name: "Nailong Melet Gemes Full Body", src: "/stickers/nailong-blep-derp.png", category: "nailong" },
  { id: "nailong-curious", name: "Nailong Penasaran Gemes Full Body", src: "/stickers/nailong-curious.png", category: "nailong" },
  { id: "nailong-cheering", name: "Nailong Cheering Sorak Full Body", src: "/stickers/nailong-cheering.png", category: "nailong" },
  { id: "nailong-standing-scale", name: "Nailong Timbangan Berat Badan Full Body", src: "/stickers/nailong-standing-scale.png", category: "nailong" },
  { id: "nailong-sleepy-standing", name: "Nailong Ngantuk Tidur Full Body", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-angry-pointing", name: "Nailong Marah Menunjuk Full Body", src: "/stickers/nailong-angry-pointing.png", category: "nailong" },
  { id: "nailong-running-cute", name: "Nailong Lari Imut Full Body", src: "/stickers/nailong-running-cute.png", category: "nailong" },
  { id: "dino-yellow-real", name: "Real 3D Nailong Full Body", src: "/stickers/dino-yellow.png", category: "nailong" },
  { id: "nailong-kitty-strawberry", name: "Nailong 3D Hello Kitty Stroberi", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-mymelody-peach", name: "Nailong 3D My Melody Peach", src: "/stickers/nailong-curious.png", category: "nailong" },
  { id: "nailong-chicken-hoodie", name: "Nailong 3D Hoodie Ayam", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-sunflower-hat", name: "Nailong 3D Topi Bunga Matahari", src: "/stickers/nailong-wave-happy.png", category: "nailong" },
  { id: "nailong-watermelon", name: "Nailong Makan Semangka Segar", src: "/stickers/nailong-blep-derp.png", category: "nailong" },
  { id: "nailong-chef", name: "Nailong Chef Topi Koki", src: "/stickers/nailong-standing-scale.png", category: "nailong" },
  { id: "nailong-crying", name: "Nailong Menangis Gemes", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-cool-sunglasses", name: "Nailong Kacamata Hitam Cool", src: "/stickers/nailong-silly-open.png", category: "nailong" },
  { id: "nailong-sleepy-pillow", name: "Nailong Tidur Bantal Zzz", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-dance-party", name: "Nailong Joget Dance Party", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "dino-yellow-full", name: "Nailong Full Body Cute", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "nailong-boba-drink", name: "Nailong Minum Boba Tea", src: "/stickers/nailong-shopping-bags.png", category: "nailong" },
  { id: "nailong-laughing", name: "Nailong Ketawa Bahagia", src: "/stickers/nailong-cheering.png", category: "nailong" },
  { id: "nailong-angry-pout", name: "Nailong Marah Gemes", src: "/stickers/nailong-angry-pointing.png", category: "nailong" },
  { id: "nailong-hug-heart", name: "Nailong Peluk Hati Pink", src: "/stickers/nailong-curious.png", category: "nailong" },

  // ==========================================
  // ✨ STIKER AESTHETIC Y2K & COQUETTE (PINTEREST TREND)
  // ==========================================
  { id: "aesthetic-chrome-star", name: "Silver Chrome Y2K Star", src: STICKER_AESTHETIC_CHROME_STAR, category: "aesthetic" },
  { id: "aesthetic-cyber-heart", name: "Cyberpunk Gradient Heart", src: STICKER_AESTHETIC_CYBER_HEART, category: "aesthetic" },
  { id: "aesthetic-daisy-flower", name: "Cute Daisy Flower", src: STICKER_AESTHETIC_DAISY_FLOWER, category: "aesthetic" },
  { id: "pinterest-black-cat", name: "Cat Night Moon", src: STICKER_PINTEREST_BLACK_CAT, category: "aesthetic" },
  { id: "pinterest-bear-heart", name: "Teddy Hug Heart", src: STICKER_PINTEREST_BEAR_HEART, category: "aesthetic" },
  { id: "pinterest-boba", name: "Boba Creamy Drink", src: STICKER_PINTEREST_BOBA, category: "aesthetic" },
  { id: "pinterest-cake", name: "Choco Berry Cake", src: STICKER_PINTEREST_CAKE, category: "aesthetic" },
  { id: "pinterest-puppy", name: "Cute Puppy Fluffy", src: STICKER_PINTEREST_PUPPY, category: "aesthetic" },
  { id: "pinterest-bunny-star", name: "Bunny Star Yellow", src: STICKER_PINTEREST_BUNNY_STAR, category: "aesthetic" },

  { id: "cute-bear", name: "Teddy Bear", src: "/stickers/cute-bear.svg", category: "cute" },
  { id: "cute-bunny", name: "Fluffy Bunny", src: "/stickers/cute-bunny.svg", category: "cute" },
  { id: "cute-cloud", name: "Friendly Cloud", src: "/stickers/cute-cloud.svg", category: "cute" },
  { id: "cute-rainbow", name: "Sweet Rainbow", src: "/stickers/cute-rainbow.svg", category: "cute" },
  { id: "cute-heart", name: "Love Pink", src: "/stickers/cute-heart.svg", category: "cute" },
  { id: "cute-star", name: "Star Face", src: "/stickers/cute-star.svg", category: "cute" },
  { id: "cute-ghost", name: "Cute Ghost", src: "/stickers/cute-ghost.svg", category: "cute" },

  // Text & Speech Bubbles
  { id: "bubble-bestie", name: "Best Friends Bubble", src: "/stickers/bubble-bestie.svg", category: "text" },
  { id: "bubble-love", name: "Love Bubble", src: "/stickers/bubble-love.svg", category: "text" },
  { id: "bubble-ootd", name: "OOTD Tag", src: "/stickers/bubble-ootd.svg", category: "text" },
  { id: "bubble-happy", name: "Happy Day Speech", src: "/stickers/bubble-happy.svg", category: "text" },
  { id: "bubble-empty", name: "Blank Bubble", src: "/stickers/bubble-empty.svg", category: "text" },
  { id: "bubble-together", name: "Together Bubble", src: "/stickers/bubble-together.svg", category: "text" },

  // Emoji & Sparkles
  { id: "sparkle-gold", name: "Sparkle Gold", src: "/stickers/sparkle-gold.svg", category: "emoji" },
  { id: "sparkle-pink", name: "Sparkle Pink", src: "/stickers/sparkle-pink.svg", category: "emoji" },
  { id: "sparkle-blue", name: "Sparkle Blue", src: "/stickers/sparkle-blue.svg", category: "emoji" },
  { id: "emoji-smiley", name: "Smiley Emoji", src: "/stickers/emoji-smiley.svg", category: "emoji" },
  { id: "emoji-flower", name: "Sakura Flower", src: "/stickers/emoji-flower.svg", category: "emoji" },
  { id: "emoji-cherry", name: "Cherry Twins", src: "/stickers/emoji-cherry.svg", category: "emoji" },
  { id: "emoji-sun", name: "Cool Sun", src: "/stickers/emoji-sun.svg", category: "emoji" },

  { id: "cute-angry-cat", name: "Real Angry Ragdoll Cat (Doodle Outline)", src: STICKER_REAL_ANGRY_CAT, category: "cat" },
  { id: "cute-helmet-cat", name: "Real Kitten Wearing Helmet", src: STICKER_REAL_HELMET_CAT, category: "cat" },
  { id: "cat-hipster", name: "Real Hipster Cat Sunglasses", src: STICKER_REAL_HIPSTER_CAT, category: "cat" },
  { id: "cat-blue-ribbon-real", name: "Real Cat Blue Ribbon", src: STICKER_REAL_BLUE_RIBBON_CAT, category: "cat" },
  { id: "cat-pink-ribbon-real", name: "Real Cat Pink Ribbon", src: STICKER_REAL_PINK_RIBBON_CAT, category: "cat" },
  { id: "cat-scooter-red", name: "Real Cat Scooter Red", src: STICKER_CAT_SCOOTER, category: "cat" },
  { id: "cat-sunflower-hood", name: "Real Cat Sunflower Hood", src: STICKER_CAT_SUNFLOWER, category: "cat" },
  { id: "cat-banana-suit", name: "Real Cat Banana Suit", src: STICKER_CAT_BANANA, category: "cat" },
  { id: "cat-potato-suit", name: "Real Cat Potato Pouch", src: STICKER_CAT_POTATO, category: "cat" },
  { id: "cat-matcha-cup", name: "Real Cat Matcha Cup", src: STICKER_CAT_MATCHA_CUP, category: "cat" },
  { id: "cat-ny-cash", name: "Real Cat NY Cap & Cash", src: STICKER_CAT_NY_CAP_CASH, category: "cat" },
  { id: "cat-tulip-bouquet", name: "Real Cat Tulip Bouquet", src: STICKER_CAT_TULIP_BOUQUET, category: "cat" },
  { id: "grey-tabby-wink", name: "Kucing Genit Winking Paw", src: STICKER_GREY_TABBY_WINK, category: "cat" },
  { id: "cat-flirty-wink", name: "Kucing Genit Kiss Heart", src: STICKER_CAT_FLIRTY_WINK, category: "cat" },
  { id: "cat-angry-pout", name: "Kucing Marah Gemes", src: STICKER_CAT_ANGRY, category: "cat" },
  { id: "cat-boba-drink", name: "Kucing Minum Boba", src: STICKER_CAT_BOBA, category: "cat" },
  { id: "cat-sleepy-cloud", name: "Kucing Tidur Zzz Cloud", src: STICKER_CAT_SLEEPY, category: "cat" },
  { id: "cat-gamer-headphone", name: "Kucing Gamer Pink Headphones", src: STICKER_CAT_GAMER, category: "cat" },
  { id: "cat-blue-ribbon-svg", name: "Kucing Pita Biru SVG", src: STICKER_CAT_BLUE_RIBBON, category: "cat" },
  { id: "cute-cat", name: "Cute Kitten White", src: "/stickers/cute-cat.svg", category: "cat" },

  // ==========================================
  // 🐲 STIKER NAILONG 3D KOSTUM PINTEREST (REAL 3D CUTOUT)
  // ==========================================
  { id: "dino-yellow-real", name: "Real 3D Nailong Full Body", src: STICKER_REAL_DINO_YELLOW, category: "nailong" },
  { id: "nailong-kitty-strawberry", name: "Nailong 3D Hello Kitty Stroberi", src: STICKER_NAILONG_KITTY_STRAWBERRY, category: "nailong" },
  { id: "nailong-mymelody-peach", name: "Nailong 3D My Melody Peach", src: STICKER_NAILONG_MYMELODY_PEACH, category: "nailong" },
  { id: "nailong-chicken-hoodie", name: "Nailong 3D Hoodie Ayam", src: STICKER_NAILONG_CHICKEN_HOODIE, category: "nailong" },
  { id: "nailong-sunflower-hat", name: "Nailong 3D Topi Bunga Matahari", src: STICKER_NAILONG_SUNFLOWER_HAT, category: "nailong" },
  { id: "nailong-watermelon", name: "Nailong Makan Semangka Segar", src: STICKER_NAILONG_WATERMELON, category: "nailong" },
  { id: "nailong-chef", name: "Nailong Chef Topi Koki", src: STICKER_NAILONG_CHEF, category: "nailong" },
  { id: "nailong-crying", name: "Nailong Menangis Gemes", src: STICKER_NAILONG_CRYING, category: "nailong" },
  { id: "nailong-cool-sunglasses", name: "Nailong Kacamata Hitam Cool", src: STICKER_NAILONG_COOL_SUNGLASSES, category: "nailong" },
  { id: "nailong-sleepy-pillow", name: "Nailong Tidur Bantal Zzz", src: STICKER_NAILONG_SLEEPY_PILLOW, category: "nailong" },
  { id: "nailong-dance-party", name: "Nailong Joget Dance Party", src: STICKER_NAILONG_DANCE_PARTY, category: "nailong" },
  { id: "dino-yellow-full", name: "Nailong Full Body Cute", src: STICKER_NAILONG_FULL, category: "nailong" },
  { id: "nailong-boba-drink", name: "Nailong Minum Boba Tea", src: STICKER_NAILONG_BOBA, category: "nailong" },
  { id: "nailong-laughing", name: "Nailong Ketawa Bahagia", src: STICKER_NAILONG_LAUGH, category: "nailong" },
  { id: "nailong-angry-pout", name: "Nailong Marah Gemes", src: STICKER_NAILONG_ANGRY, category: "nailong" },
  { id: "nailong-hug-heart", name: "Nailong Peluk Hati Pink", src: STICKER_NAILONG_HEART, category: "nailong" },

  // ==========================================
  // ✨ STIKER AESTHETIC & MODERN
  // ==========================================
  { id: "aesthetic-chrome-star", name: "Y2K Metallic Chrome Starburst", src: STICKER_AESTHETIC_CHROME_STAR, category: "aesthetic" },
  { id: "aesthetic-cyber-heart", name: "Cyber Holographic Pink Heart", src: STICKER_AESTHETIC_CYBER_HEART, category: "aesthetic" },
  { id: "aesthetic-daisy-flower", name: "Modern Minimalist White Daisy", src: STICKER_AESTHETIC_DAISY_FLOWER, category: "aesthetic" },
  { id: "y2k-chrome-star", name: "Y2K Metallic Star Burst", src: STICKER_Y2K_CHROME_STAR, category: "aesthetic" },
  { id: "coquette-bow", name: "Coquette Pink Velvet Bow", src: STICKER_COQUETTE_BOW, category: "aesthetic" },
  { id: "matcha-boba", name: "Matcha Latte Boba Cup", src: STICKER_MATCHA_BOBA, category: "aesthetic" },
  { id: "flower-lily", name: "Aesthetic Lily Flower Pink", src: STICKER_FLOWER_LILY, category: "aesthetic" },
  { id: "flower-plumeria", name: "Bunga Kamboja Bali Aesthetic", src: STICKER_FLOWER_PLUMERIA, category: "aesthetic" },

  // ==========================================
  // 🦸 SPIDERMAN MARVEL & OTHER BADGES
  // ==========================================
  { id: "spiderman-hanging", name: "Spiderman Hanging Upside Down", src: STICKER_SPIDERMAN_HANGING, category: "badge" },
  { id: "spiderman-camera", name: "Spiderman Taking Photo", src: STICKER_SPIDERMAN_CAMERA, category: "badge" },
  { id: "spiderman-headphones", name: "Spiderman Beats Headphones", src: STICKER_SPIDERMAN_HEADPHONES, category: "badge" },
  { id: "spiderman-heart-mask", name: "Spiderman Heart Mask", src: STICKER_SPIDERMAN_HEART_MASK, category: "badge" },
  { id: "marvel-logo-box", name: "Marvel Red Logo Box", src: STICKER_MARVEL_LOGO, category: "badge" },
  { id: "spider-web-heart", name: "Spider Web Heart Y2K", src: STICKER_SPIDER_WEB_HEART, category: "emoji" },
  { id: "spiderman-chibi", name: "Chibi Spiderman Mini", src: STICKER_SPIDERMAN_CHIBI, category: "cute" },
  { id: "spiderman-hand-sign", name: "Spiderman Web Shooter Hand", src: STICKER_SPIDERMAN_HAND_SIGN, category: "badge" },

  // KOLEKSI KAWAII & PINTEREST
  { id: "pinterest-bear-heart", name: "Teddy Bear Holding Heart", src: STICKER_PINTEREST_BEAR_HEART, category: "cute" },
  { id: "pinterest-boba-tea", name: "Boba Milk Tea Heart", src: STICKER_PINTEREST_BOBA, category: "cute" },
  { id: "pinterest-choco-cake", name: "Bear Chocolate Cake", src: STICKER_PINTEREST_CAKE, category: "cute" },
  { id: "pinterest-puppy-bear", name: "Fluffy Puppy & Bear", src: STICKER_PINTEREST_PUPPY, category: "cute" },
  { id: "pinterest-bunny-star", name: "Winking Bunny Star", src: STICKER_PINTEREST_BUNNY_STAR, category: "cute" },
  { id: "snoopy-hearts", name: "Snoopy Peluk Hati", src: STICKER_SNOOPY_HEARTS, category: "cute" },
  { id: "cute-bear", name: "Teddy Bear", src: "/stickers/cute-bear.svg", category: "cute" },
  { id: "cute-bunny", name: "Fluffy Bunny", src: "/stickers/cute-bunny.svg", category: "cute" },
  { id: "cute-cloud", name: "Friendly Cloud", src: "/stickers/cute-cloud.svg", category: "cute" },
  { id: "cute-rainbow", name: "Sweet Rainbow", src: "/stickers/cute-rainbow.svg", category: "cute" },
  { id: "cute-heart", name: "Love Pink", src: "/stickers/cute-heart.svg", category: "cute" },
  { id: "cute-star", name: "Star Face", src: "/stickers/cute-star.svg", category: "cute" },
  { id: "cute-ghost", name: "Cute Ghost", src: "/stickers/cute-ghost.svg", category: "cute" },

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
// PAKET AUTO-SPREAD BARU (KUCING SQUAD, NAILONG PARTY, AESTHETIC Y2K & SPIDERMAN)
// ============================================================================
export const stickerPacks: StickerPack[] = [
  {
    id: "pack-cat-squad",
    name: "Real Cat Photo Pinterest 🐱",
    category: "cat",
    icon: STICKER_REAL_ANGRY_CAT,
    stickers: [
      STICKER_REAL_ANGRY_CAT,
      STICKER_REAL_HELMET_CAT,
      STICKER_REAL_HIPSTER_CAT,
      STICKER_REAL_PINK_RIBBON_CAT
    ]
  },
  {
    id: "pack-nailong-party",
    name: "Nailong 3D Real Photo 🐲",
    category: "nailong",
    icon: "/stickers/nailong-cat-costume.png",
    stickers: [
      "/stickers/nailong-cat-costume.png",
      "/stickers/nailong-shopping-bags.png",
      "/stickers/nailong-bear-shirt.png",
      "/stickers/nailong-silly-open.png",
      "/stickers/nailong-wave-happy.png",
      "/stickers/nailong-cheering.png"
    ]
  },
  {
    id: "pack-aesthetic-modern",
    name: "Aesthetic Y2K & Coquette ✨",
    category: "aesthetic",
    icon: STICKER_AESTHETIC_CHROME_STAR,
    stickers: [
      STICKER_AESTHETIC_CHROME_STAR,
      STICKER_AESTHETIC_CYBER_HEART,
      STICKER_COQUETTE_BOW,
      STICKER_AESTHETIC_DAISY_FLOWER
    ]
  },
  {
    id: "pack-spiderman-ultimate",
    name: "Spiderman Marvel Ultimate 🕷️",
    category: "badge",
    icon: STICKER_SPIDERMAN_HANGING,
    stickers: [
      STICKER_SPIDERMAN_HANGING,
      STICKER_SPIDERMAN_CAMERA,
      STICKER_SPIDERMAN_HEADPHONES,
      STICKER_SPIDERMAN_HEART_MASK
    ]
  },
  {
    id: "pack-spiderman-y2k",
    name: "Marvel Web & Beats 🎧",
    category: "badge",
    icon: STICKER_MARVEL_LOGO,
    stickers: [
      STICKER_MARVEL_LOGO,
      STICKER_SPIDER_WEB_HEART,
      STICKER_SPIDERMAN_CHIBI,
      STICKER_SPIDERMAN_HAND_SIGN
    ]
  },
  {
    id: "pack-pinterest-kawaii",
    name: "Cute Kawaii Collection 🎀",
    category: "cute",
    icon: STICKER_PINTEREST_BLACK_CAT,
    stickers: [
      STICKER_PINTEREST_BLACK_CAT,
      STICKER_PINTEREST_BEAR_HEART,
      STICKER_PINTEREST_BOBA,
      STICKER_PINTEREST_CAKE
    ]
  },
  {
    id: "pack-coquette-vibe",
    name: "Coquette Bow & Cherries 🌸",
    category: "cute",
    icon: STICKER_COQUETTE_BOW,
    stickers: [
      STICKER_COQUETTE_BOW,
      STICKER_GREY_TABBY_WINK,
      STICKER_CAT_PINK_RIBBON,
      STICKER_FLOWER_LILY
    ]
  },
  {
    id: "pack-nailong-snoopy",
    name: "Nailong Full Body & Snoopy 💛",
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
    id: "pack-cat-classic",
    name: "Kucing Cute Pack 🐾",
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
    name: "Kawaii Friends ☁️",
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
    name: "Sparkle Y2K Magic ✨",
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
    name: "Scrapbook Washi Tape 🎀",
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
    name: "Cute Speech Bubbles 💬",
    category: "text",
    icon: "/stickers/bubble-love.svg",
    stickers: [
      "/stickers/bubble-love.svg",
      "/stickers/bubble-bestie.svg",
      "/stickers/bubble-happy.svg",
      "/stickers/bubble-ootd.svg"
    ]
  }
]