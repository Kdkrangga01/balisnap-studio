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

// Inline SVG Data URLs yang dijamin langsung muncul tanpa broken image
const SVG_PANDA_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="35" fill="%23ffffff" stroke="%23333333" stroke-width="4"/><circle cx="25" cy="28" r="14" fill="%23333333"/><circle cx="75" cy="28" r="14" fill="%23333333"/><ellipse cx="38" cy="50" rx="8" ry="11" fill="%23333333"/><ellipse cx="62" cy="50" rx="8" ry="11" fill="%23333333"/><circle cx="40" cy="48" r="3" fill="%23ffffff"/><circle cx="64" cy="48" r="3" fill="%23ffffff"/><ellipse cx="50" cy="62" rx="6" ry="4" fill="%23333333"/><path d="M45 68 Q50 72 55 68" fill="none" stroke="%23333333" stroke-width="3" stroke-linecap="round"/></svg>`;
const SVG_PANDA_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="35" fill="%23ffffff" stroke="%23333333" stroke-width="4"/><circle cx="25" cy="28" r="14" fill="%23ff85a1"/><circle cx="75" cy="28" r="14" fill="%23ff85a1"/><ellipse cx="38" cy="50" rx="8" ry="11" fill="%23333333"/><ellipse cx="62" cy="50" rx="8" ry="11" fill="%23333333"/><circle cx="40" cy="48" r="3" fill="%23ffffff"/><circle cx="64" cy="48" r="3" fill="%23ffffff"/><ellipse cx="50" cy="62" rx="6" ry="4" fill="%23ff85a1"/><path d="M43 68 Q50 75 57 68" fill="none" stroke="%23333333" stroke-width="3" stroke-linecap="round"/></svg>`;
const SVG_PANDA_3 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="35" fill="%23ffffff" stroke="%23333333" stroke-width="4"/><circle cx="25" cy="28" r="14" fill="%23333333"/><circle cx="75" cy="28" r="14" fill="%23333333"/><ellipse cx="38" cy="52" rx="8" ry="5" fill="%23333333"/><ellipse cx="62" cy="52" rx="8" ry="5" fill="%23333333"/><ellipse cx="50" cy="62" rx="5" ry="3" fill="%23333333"/><path d="M46 68 Q50 70 54 68" fill="none" stroke="%23333333" stroke-width="3"/></svg>`;
const SVG_PANDA_4 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="35" fill="%23ffffff" stroke="%23333333" stroke-width="4"/><circle cx="25" cy="28" r="14" fill="%23333333"/><circle cx="75" cy="28" r="14" fill="%23333333"/><ellipse cx="38" cy="50" rx="8" ry="11" fill="%23333333"/><ellipse cx="62" cy="50" rx="8" ry="11" fill="%23333333"/><circle cx="40" cy="48" r="3" fill="%23ffffff"/><circle cx="64" cy="48" r="3" fill="%23ffffff"/><path d="M20 70 Q50 90 80 70" fill="none" stroke="%23333333" stroke-width="6" stroke-linecap="round"/></svg>`;

const SVG_CAT_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="20,20 38,40 15,45" fill="%23ffb703"/><polygon points="80,20 62,40 85,45" fill="%23ffb703"/><circle cx="50" cy="55" r="35" fill="%23ffb703"/><circle cx="38" cy="48" r="5" fill="%23333333"/><circle cx="62" cy="48" r="5" fill="%23333333"/><ellipse cx="50" cy="58" rx="4" ry="3" fill="%23ff85a1"/><path d="M43 65 Q50 70 57 65" fill="none" stroke="%23333333" stroke-width="3"/></svg>`;
const SVG_CAT_2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="20,20 38,40 15,45" fill="%23fb8500"/><polygon points="80,20 62,40 85,45" fill="%23fb8500"/><circle cx="50" cy="55" r="35" fill="%23fb8500"/><line x1="32" y1="48" x2="44" y2="48" stroke="%23333333" stroke-width="4"/><line x1="56" y1="48" x2="68" y2="48" stroke="%23333333" stroke-width="4"/><ellipse cx="50" cy="58" rx="4" ry="3" fill="%23333333"/><path d="M45 68 Q50 63 55 68" fill="none" stroke="%23333333" stroke-width="3"/></svg>`;

const SVG_RABBIT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="35" cy="25" rx="8" ry="22" fill="%23ffccd5"/><ellipse cx="65" cy="25" rx="8" ry="22" fill="%23ffccd5"/><circle cx="50" cy="60" r="30" fill="%23ffffff" stroke="%23ffb5a7" stroke-width="3"/><circle cx="40" cy="55" r="4" fill="%23333333"/><circle cx="60" cy="55" r="4" fill="%23333333"/><ellipse cx="50" cy="63" rx="3" ry="2" fill="%23ffb5a7"/></svg>`;
const SVG_BEAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="25" cy="30" r="12" fill="%23b08968"/><circle cx="75" cy="30" r="12" fill="%23b08968"/><circle cx="50" cy="55" r="32" fill="%23b08968"/><ellipse cx="50" cy="60" rx="14" ry="10" fill="%23ede0d4"/><circle cx="40" cy="48" r="4" fill="%23333333"/><circle cx="60" cy="48" r="4" fill="%23333333"/><ellipse cx="50" cy="57" rx="4" ry="3" fill="%23333333"/></svg>`;

const SVG_SPARKLE_GOLD = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="%23ffb703"/></svg>`;
const SVG_SPARKLE_PINK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="%23ff85a1"/></svg>`;

const SVG_STRAWBERRY = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 20 C20 20 10 50 25 80 C35 95 65 95 75 80 C90 50 80 20 50 20 Z" fill="%23ff4d6d"/><path d="M35 22 Q50 10 65 22 Q50 28 35 22 Z" fill="%2338b000"/><circle cx="35" cy="45" r="2" fill="%23ffccd5"/><circle cx="55" cy="40" r="2" fill="%23ffccd5"/><circle cx="45" cy="65" r="2" fill="%23ffccd5"/><circle cx="65" cy="60" r="2" fill="%23ffccd5"/></svg>`;

export const stickers: StickerItem[] = [
  { id: "panda-1", name: "Panda Imut", src: SVG_PANDA_1, category: "cute" },
  { id: "panda-2", name: "Panda Pink", src: SVG_PANDA_2, category: "cute" },
  { id: "panda-3", name: "Panda Tidur", src: SVG_PANDA_3, category: "cute" },
  { id: "panda-4", name: "Panda Senyum", src: SVG_PANDA_4, category: "cute" },
  { id: "cat-1", name: "Kucing Oranye", src: SVG_CAT_1, category: "cute" },
  { id: "cat-2", name: "Kucing Marah", src: SVG_CAT_2, category: "cute" },
  { id: "rabbit-1", name: "Kelinci Pink", src: SVG_RABBIT, category: "cute" },
  { id: "bear-1", name: "Beruang Cokelat", src: SVG_BEAR, category: "cute" },
  { id: "sparkle-1", name: "Sparkle Emas", src: SVG_SPARKLE_GOLD, category: "emoji" },
  { id: "sparkle-2", name: "Sparkle Pink", src: SVG_SPARKLE_PINK, category: "emoji" },
  { id: "strawberry-1", name: "Stroberi Manis", src: SVG_STRAWBERRY, category: "cute" },
];

export const stickerPacks: StickerPack[] = [
  {
    id: "pack-panda",
    name: "Panda Cute Pack",
    category: "cute",
    icon: SVG_PANDA_1,
    stickers: [SVG_PANDA_1, SVG_PANDA_2, SVG_PANDA_3, SVG_PANDA_4]
  },
  {
    id: "pack-cat",
    name: "Kucing Gemoy",
    category: "cute",
    icon: SVG_CAT_1,
    stickers: [SVG_CAT_1, SVG_CAT_2, SVG_PANDA_2, SVG_RABBIT]
  },
  {
    id: "pack-rabbit-bear",
    name: "Rabbit & Bear",
    category: "cute",
    icon: SVG_RABBIT,
    stickers: [SVG_RABBIT, SVG_BEAR, SVG_PANDA_1, SVG_STRAWBERRY]
  },
  {
    id: "pack-sparkle",
    name: "Sparkles Magic",
    category: "emoji",
    icon: SVG_SPARKLE_GOLD,
    stickers: [SVG_SPARKLE_GOLD, SVG_SPARKLE_PINK, SVG_STRAWBERRY, SVG_PANDA_2]
  }
];