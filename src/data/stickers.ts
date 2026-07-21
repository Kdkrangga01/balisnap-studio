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
// DATA URL STIKER SPIDERMAN MARVEL & KUCING WINKING (100% TRANSPARAN DIE-CUT)
// ============================================================================

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


// ============================================================================
// KOLEKSI STIKER LAMA (KAWAII PINTEREST, NAILONG, COQUETTE, CATS, FLOWERS)
// ============================================================================

const STICKER_PINTEREST_BLACK_CAT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M30 35 L48 55 C48 55 35 60 30 35 Z M90 35 L72 55 C72 55 85 60 90 35 Z" fill="%2318181b" stroke="%23fef3c7" stroke-width="3"/><circle cx="60" cy="65" r="32" fill="%2318181b" stroke="%23fef3c7" stroke-width="3"/><ellipse cx="48" cy="60" rx="5" ry="7" fill="%23facc15"/><ellipse cx="72" cy="60" rx="5" ry="7" fill="%23facc15"/><circle cx="48" cy="60" r="2.5" fill="%2318181b"/><circle cx="72" cy="60" r="2.5" fill="%2318181b"/><polygon points="60,67 57,71 63,71" fill="%23f43f5e"/><path d="M54 74 Q60 78 66 74" fill="none" stroke="%23fef3c7" stroke-width="2"/><ellipse cx="60" cy="92" rx="26" ry="22" fill="%2318181b" stroke="%23fef3c7" stroke-width="3"/><path d="M28 95 C15 90 10 70 20 65 C22 75 28 85 32 90 Z" fill="%2318181b" stroke="%23fef3c7" stroke-width="2"/><path d="M50 82 Q42 78 50 86 Q60 88 50 82 Z" fill="%23fbcfe8"/><path d="M70 82 Q78 78 70 86 Q60 88 70 82 Z" fill="%23fbcfe8"/><circle cx="60" cy="83" r="4" fill="%23f43f5e"/></svg>`;
const STICKER_PINTEREST_BEAR_HEART = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="35" cy="35" r="14" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><circle cx="85" cy="35" r="14" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><circle cx="35" cy="35" r="7" fill="%23fef3c7"/><circle cx="85" cy="35" r="7" fill="%23fef3c7"/><ellipse cx="60" cy="55" rx="32" ry="28" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><ellipse cx="60" cy="60" rx="12" ry="9" fill="%23fef3c7"/><ellipse cx="60" cy="56" rx="5" ry="3.5" fill="%23451a03"/><line x1="60" y1="59.5" x2="60" y2="64" stroke="%23451a03" stroke-width="2"/><circle cx="45" cy="50" r="3.5" fill="%23451a03"/><circle cx="75" cy="50" r="3.5" fill="%23451a03"/><ellipse cx="60" cy="90" rx="28" ry="24" fill="%23d97706" stroke="%23fef3c7" stroke-width="3"/><path d="M60 70 C45 55 35 75 60 92 C85 75 75 55 60 70 Z" fill="%2378350f" stroke="%23fef3c7" stroke-width="2"/><circle cx="35" cy="85" r="8" fill="%23d97706" stroke="%23fef3c7" stroke-width="2"/><circle cx="85" cy="85" r="8" fill="%23d97706" stroke="%23fef3c7" stroke-width="2"/></svg>`;
const STICKER_PINTEREST_BOBA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><path d="M25 40 L75 40 L70 115 L30 115 Z" fill="%23fef3c7" stroke="%2378350f" stroke-width="3"/><path d="M27 55 L73 55 L70 115 L30 115 Z" fill="%23d97706" opacity="0.8"/><ellipse cx="50" cy="40" rx="27" ry="8" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><path d="M23 40 C23 20 77 20 77 40 Z" fill="%23ffffff" opacity="0.6" stroke="%2378350f" stroke-width="2"/><line x1="50" y1="8" x2="50" y2="40" stroke="%23f43f5e" stroke-width="7" stroke-linecap="round"/><path d="M50 72 C42 62 38 75 50 84 C62 75 58 62 50 72 Z" fill="%2318181b"/><circle cx="40" cy="98" r="4.5" fill="%2318181b"/><circle cx="50" cy="104" r="4.5" fill="%2318181b"/><circle cx="60" cy="98" r="4.5" fill="%2318181b"/><circle cx="45" cy="90" r="4" fill="%2318181b"/><circle cx="55" cy="90" r="4" fill="%2318181b"/></svg>`;
const STICKER_PINTEREST_CAKE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><ellipse cx="60" cy="85" rx="52" ry="18" fill="%23fef3c7" stroke="%2378350f" stroke-width="3"/><path d="M20 50 L100 50 L100 80 C100 92 20 92 20 80 Z" fill="%23451a03" stroke="%2378350f" stroke-width="3"/><rect x="20" y="62" width="80" height="6" fill="%23fef3c7"/><ellipse cx="60" cy="50" rx="40" ry="14" fill="%2378350f" stroke="%2378350f" stroke-width="2"/><circle cx="50" cy="30" r="5" fill="%23d97706"/><circle cx="70" cy="30" r="5" fill="%23d97706"/><ellipse cx="60" cy="36" rx="14" ry="11" fill="%23d97706" stroke="%2378350f" stroke-width="2"/><circle cx="55" cy="34" r="1.5" fill="%2318181b"/><circle cx="65" cy="34" r="1.5" fill="%2318181b"/><ellipse cx="60" cy="38" rx="3" ry="2" fill="%23fef3c7"/></svg>`;
const STICKER_PINTEREST_PUPPY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="25" cy="55" rx="12" ry="24" fill="%2378350f" transform="rotate(15 25 55)"/><ellipse cx="95" cy="55" rx="12" ry="24" fill="%2378350f" transform="rotate(-15 95 55)"/><ellipse cx="60" cy="58" rx="34" ry="28" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><circle cx="46" cy="52" r="3.5" fill="%2318181b"/><circle cx="74" cy="52" r="3.5" fill="%2318181b"/><ellipse cx="60" cy="58" rx="6" ry="4" fill="%2378350f"/><path d="M56 63 Q60 67 64 63" fill="none" stroke="%2318181b" stroke-width="2"/><ellipse cx="60" cy="92" rx="28" ry="22" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><ellipse cx="60" cy="88" rx="14" ry="12" fill="%23d97706" stroke="%2378350f" stroke-width="2"/><circle cx="55" cy="86" r="1.5" fill="%2318181b"/><circle cx="65" cy="86" r="1.5" fill="%2318181b"/></svg>`;
const STICKER_PINTEREST_BUNNY_STAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><ellipse cx="42" cy="30" rx="10" ry="25" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><ellipse cx="78" cy="30" rx="10" ry="25" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><ellipse cx="42" cy="32" rx="5" ry="16" fill="%23fbcfe8"/><ellipse cx="78" cy="32" rx="5" ry="16" fill="%23fbcfe8"/><ellipse cx="60" cy="65" rx="32" ry="28" fill="%23ffffff" stroke="%2378350f" stroke-width="3"/><circle cx="45" cy="60" r="3.5" fill="%2318181b"/><path d="M70 60 Q76 56 78 62" fill="none" stroke="%2318181b" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="60" cy="66" rx="3" ry="2" fill="%23f43f5e"/><ellipse cx="38" cy="68" rx="5" ry="3" fill="%23fbcfe8"/><ellipse cx="82" cy="68" rx="5" ry="3" fill="%23fbcfe8"/><polygon points="60,72 65,85 78,85 67,93 71,106 60,97 49,106 53,93 42,85 55,85" fill="%23facc15" stroke="%2378350f" stroke-width="2"/></svg>`;
const STICKER_NAILONG_FULL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><path d="M35 125 C35 132 48 132 48 125 L48 115 L35 115 Z" fill="%23eab308"/><path d="M72 125 C72 132 85 132 85 125 L85 115 L72 115 Z" fill="%23eab308"/><ellipse cx="60" cy="85" rx="35" ry="38" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><ellipse cx="60" cy="88" rx="22" ry="25" fill="%23fef08a"/><path d="M25 75 Q15 65 20 85 Q28 85 30 80 Z" fill="%23facc15"/><path d="M95 75 Q105 65 100 85 Q92 85 90 80 Z" fill="%23facc15"/><ellipse cx="60" cy="48" rx="30" ry="28" fill="%23facc15" stroke="%23ca8a04" stroke-width="3"/><circle cx="48" cy="42" r="6" fill="%23ffffff"/><circle cx="72" cy="42" r="6" fill="%23ffffff"/><circle cx="48" cy="42" r="3" fill="%2315803d"/><circle cx="72" cy="42" r="3" fill="%2315803d"/><path d="M42 58 Q60 76 78 58 Z" fill="%23dc2626"/><ellipse cx="60" cy="65" rx="9" ry="7" fill="%23f43f5e"/></svg>`;
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
  // 1. KOLEKSI BARU SPIDERMAN MARVEL & KUCING WINK
  // ==========================================
  { id: "grey-tabby-wink", name: "Cute Grey Cat Winking", src: STICKER_GREY_TABBY_WINK, category: "cute" },
  { id: "spiderman-hanging", name: "Spiderman Hanging Upside Down", src: STICKER_SPIDERMAN_HANGING, category: "badge" },
  { id: "spiderman-camera", name: "Spiderman Taking Photo", src: STICKER_SPIDERMAN_CAMERA, category: "badge" },
  { id: "spiderman-headphones", name: "Spiderman Beats Headphones", src: STICKER_SPIDERMAN_HEADPHONES, category: "badge" },
  { id: "spiderman-heart-mask", name: "Spiderman Heart Mask", src: STICKER_SPIDERMAN_HEART_MASK, category: "badge" },
  { id: "marvel-logo-box", name: "Marvel Red Logo Box", src: STICKER_MARVEL_LOGO, category: "badge" },
  { id: "spider-web-heart", name: "Spider Web Heart Y2K", src: STICKER_SPIDER_WEB_HEART, category: "emoji" },
  { id: "spiderman-chibi", name: "Chibi Spiderman Mini", src: STICKER_SPIDERMAN_CHIBI, category: "cute" },
  { id: "spiderman-hand-sign", name: "Spiderman Web Shooter Hand", src: STICKER_SPIDERMAN_HAND_SIGN, category: "badge" },

  // ==========================================
  // 2. KOLEKSI PINTEREST KAWAII BLACK & CREAM
  // ==========================================
  { id: "pinterest-black-cat", name: "Cute Black Cat & Bow", src: STICKER_PINTEREST_BLACK_CAT, category: "cute" },
  { id: "pinterest-bear-heart", name: "Teddy Bear Holding Heart", src: STICKER_PINTEREST_BEAR_HEART, category: "cute" },
  { id: "pinterest-boba-tea", name: "Boba Milk Tea Heart", src: STICKER_PINTEREST_BOBA, category: "cute" },
  { id: "pinterest-choco-cake", name: "Bear Chocolate Cake", src: STICKER_PINTEREST_CAKE, category: "cute" },
  { id: "pinterest-puppy-bear", name: "Fluffy Puppy & Bear", src: STICKER_PINTEREST_PUPPY, category: "cute" },
  { id: "pinterest-bunny-star", name: "Winking Bunny Star", src: STICKER_PINTEREST_BUNNY_STAR, category: "cute" },

  // STIKER LAINNYA
  { id: "coquette-bow", name: "Coquette Pink Bow", src: STICKER_COQUETTE_BOW, category: "cute" },
  { id: "matcha-boba", name: "Matcha Latte Boba", src: STICKER_MATCHA_BOBA, category: "cute" },
  { id: "y2k-chrome-star", name: "Y2K Chrome Star", src: STICKER_Y2K_CHROME_STAR, category: "emoji" },
  { id: "dino-yellow-full", name: "Nailong Full Badan", src: STICKER_NAILONG_FULL, category: "cute" },
  { id: "cat-blue-ribbon", name: "Kucing Pita Biru & Paus", src: STICKER_CAT_BLUE_RIBBON, category: "cute" },
  { id: "cat-pink-ribbon", name: "Kucing Pita Pink Ribbon", src: STICKER_CAT_PINK_RIBBON, category: "cute" },
  { id: "snoopy-hearts", name: "Snoopy Peluk Hati", src: STICKER_SNOOPY_HEARTS, category: "cute" },
  { id: "flower-lily", name: "Bunga Lily Pink", src: STICKER_FLOWER_LILY, category: "emoji" },
  { id: "flower-plumeria", name: "Bunga Kamboja Bali", src: STICKER_FLOWER_PLUMERIA, category: "emoji" },

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

// ============================================================================
// PAKET AUTO-SPREAD DENGAN TEMA SPIDERMAN MARVEL & CUTE CATS BARU
// ============================================================================
export const stickerPacks: StickerPack[] = [
  {
    id: "pack-spiderman-ultimate",
    name: "Spiderman Marvel Ultimate",
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
    name: "Marvel Web & Beats",
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
    id: "pack-grey-cat-love",
    name: "Grey Cat Winking & Hearts",
    category: "cute",
    icon: STICKER_GREY_TABBY_WINK,
    stickers: [
      STICKER_GREY_TABBY_WINK,
      STICKER_PINTEREST_BLACK_CAT,
      STICKER_GREY_TABBY_WINK,
      STICKER_CAT_PINK_RIBBON
    ]
  },
  {
    id: "pack-pinterest-kawaii",
    name: "Cute Kawaii Collection",
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
    name: "Coquette Bow & Cherries",
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
    id: "pack-flowers",
    name: "Tropical Plumeria & Lily",
    category: "emoji",
    icon: STICKER_FLOWER_LILY,
    stickers: [
      STICKER_FLOWER_LILY,
      STICKER_FLOWER_PLUMERIA,
      STICKER_FLOWER_LILY,
      STICKER_FLOWER_PLUMERIA
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