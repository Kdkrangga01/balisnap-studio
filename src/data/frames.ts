export interface SlotCoord {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
}

export interface FrameTemplate {
  id: string;
  name: string;
  slots: number;
  category: 'filmstrip' | 'korean' | 'polaroid' | 'cute' | 'retro' | 'custom';
  src: string;
  width: number;
  height: number;
  slotCoords: SlotCoord[];
}

export const frames: FrameTemplate[] = [

  // ============================================
  // FILM STRIP (6 templates)
  // ============================================
  {
    id: "film-classic-1",
    name: "Classic Film",
    slots: 1,
    category: "filmstrip",
    src: "/templates/film-classic-1.png",
    width: 1200, height: 1500,
    slotCoords: [{ x: 65, y: 60, w: 1070, h: 1070 }]
  },
  {
    id: "film-strip-3",
    name: "Film Strip Trio",
    slots: 3,
    category: "filmstrip",
    src: "/templates/film-strip-3.png",
    width: 800, height: 2400,
    slotCoords: [
      { x: 65, y: 60, w: 670, h: 500 },
      { x: 65, y: 610, w: 670, h: 500 },
      { x: 65, y: 1160, w: 670, h: 500 }
    ]
  },
  {
    id: "film-strip-4",
    name: "Film Strip 4-Cut",
    slots: 4,
    category: "filmstrip",
    src: "/templates/film-strip-4.png",
    width: 800, height: 3000,
    slotCoords: [
      { x: 65, y: 60, w: 670, h: 500 },
      { x: 65, y: 610, w: 670, h: 500 },
      { x: 65, y: 1160, w: 670, h: 500 },
      { x: 65, y: 1710, w: 670, h: 500 }
    ]
  },
  {
    id: "film-contact-2x2",
    name: "Contact Sheet",
    slots: 4,
    category: "filmstrip",
    src: "/templates/film-contact-2x2.png",
    width: 1200, height: 1200,
    slotCoords: [
      { x: 65, y: 55, w: 510, h: 420 },
      { x: 625, y: 55, w: 510, h: 420 },
      { x: 65, y: 525, w: 510, h: 420 },
      { x: 625, y: 525, w: 510, h: 420 }
    ]
  },
  {
    id: "film-contact-6",
    name: "Film Proof 6",
    slots: 6,
    category: "filmstrip",
    src: "/templates/film-contact-6.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 65, y: 55, w: 510, h: 370 },
      { x: 625, y: 55, w: 510, h: 370 },
      { x: 65, y: 475, w: 510, h: 370 },
      { x: 625, y: 475, w: 510, h: 370 },
      { x: 65, y: 895, w: 510, h: 370 },
      { x: 625, y: 895, w: 510, h: 370 }
    ]
  },
  {
    id: "film-mini-8",
    name: "Film Mini Roll",
    slots: 8,
    category: "filmstrip",
    src: "/templates/film-mini-8.png",
    width: 1200, height: 2000,
    slotCoords: [
      { x: 65, y: 55, w: 510, h: 340 },
      { x: 625, y: 55, w: 510, h: 340 },
      { x: 65, y: 445, w: 510, h: 340 },
      { x: 625, y: 445, w: 510, h: 340 },
      { x: 65, y: 835, w: 510, h: 340 },
      { x: 625, y: 835, w: 510, h: 340 },
      { x: 65, y: 1225, w: 510, h: 340 },
      { x: 625, y: 1225, w: 510, h: 340 }
    ]
  },

  // ============================================
  // KOREAN 4-CUT (6 templates)
  // ============================================
  {
    id: "korean-pink-3",
    name: "K-Pink Strip",
    slots: 3,
    category: "korean",
    src: "/templates/korean-pink-3.png",
    width: 800, height: 2400,
    slotCoords: [
      { x: 80, y: 80, w: 640, h: 500, rx: 10 },
      { x: 80, y: 630, w: 640, h: 500, rx: 10 },
      { x: 80, y: 1180, w: 640, h: 500, rx: 10 }
    ]
  },
  {
    id: "korean-lavender-4",
    name: "K-Lavender 4-Cut",
    slots: 4,
    category: "korean",
    src: "/templates/korean-lavender-4.png",
    width: 800, height: 3000,
    slotCoords: [
      { x: 80, y: 80, w: 640, h: 500, rx: 10 },
      { x: 80, y: 630, w: 640, h: 500, rx: 10 },
      { x: 80, y: 1180, w: 640, h: 500, rx: 10 },
      { x: 80, y: 1730, w: 640, h: 500, rx: 10 }
    ]
  },
  {
    id: "korean-mint-2",
    name: "K-Mint Duo",
    slots: 2,
    category: "korean",
    src: "/templates/korean-mint-2.png",
    width: 800, height: 1600,
    slotCoords: [
      { x: 80, y: 80, w: 640, h: 540, rx: 10 },
      { x: 80, y: 670, w: 640, h: 540, rx: 10 }
    ]
  },
  {
    id: "korean-maroon-3",
    name: "Classic Maroon",
    slots: 3,
    category: "korean",
    src: "/templates/korean-maroon-3.png",
    width: 800, height: 2400,
    slotCoords: [
      { x: 80, y: 440, w: 640, h: 480 },
      { x: 80, y: 980, w: 640, h: 480 },
      { x: 80, y: 1520, w: 640, h: 480 }
    ]
  },
  {
    id: "korean-blue-1",
    name: "K-Blue Portrait",
    slots: 1,
    category: "korean",
    src: "/templates/korean-blue-1.png",
    width: 800, height: 1200,
    slotCoords: [
      { x: 80, y: 80, w: 640, h: 800, rx: 12 }
    ]
  },
  {
    id: "korean-cream-6",
    name: "K-Cream Grid",
    slots: 6,
    category: "korean",
    src: "/templates/korean-cream-6.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 65, y: 65, w: 510, h: 400, rx: 10 },
      { x: 625, y: 65, w: 510, h: 400, rx: 10 },
      { x: 65, y: 515, w: 510, h: 400, rx: 10 },
      { x: 625, y: 515, w: 510, h: 400, rx: 10 },
      { x: 65, y: 965, w: 510, h: 400, rx: 10 },
      { x: 625, y: 965, w: 510, h: 400, rx: 10 }
    ]
  },

  // ============================================
  // POLAROID (6 templates)
  // ============================================
  {
    id: "polaroid-single",
    name: "Polaroid Classic",
    slots: 1,
    category: "polaroid",
    src: "/templates/polaroid-single.png",
    width: 1200, height: 1500,
    slotCoords: [{ x: 80, y: 80, w: 1040, h: 1040 }]
  },
  {
    id: "polaroid-double",
    name: "Polaroid Duo",
    slots: 2,
    category: "polaroid",
    src: "/templates/polaroid-double.png",
    width: 1200, height: 1000,
    slotCoords: [
      { x: 60, y: 60, w: 510, h: 600 },
      { x: 630, y: 60, w: 510, h: 600 }
    ]
  },
  {
    id: "polaroid-triple",
    name: "Polaroid Triple",
    slots: 3,
    category: "polaroid",
    src: "/templates/polaroid-triple.png",
    width: 800, height: 2200,
    slotCoords: [
      { x: 80, y: 80, w: 640, h: 460 },
      { x: 80, y: 590, w: 640, h: 460 },
      { x: 80, y: 1100, w: 640, h: 460 }
    ]
  },
  {
    id: "polaroid-grid-4",
    name: "Polaroid Grid",
    slots: 4,
    category: "polaroid",
    src: "/templates/polaroid-grid-4.png",
    width: 1200, height: 1500,
    slotCoords: [
      { x: 60, y: 60, w: 510, h: 510 },
      { x: 630, y: 60, w: 510, h: 510 },
      { x: 60, y: 620, w: 510, h: 510 },
      { x: 630, y: 620, w: 510, h: 510 }
    ]
  },
  {
    id: "polaroid-collection-6",
    name: "Polaroid Collection",
    slots: 6,
    category: "polaroid",
    src: "/templates/polaroid-collection-6.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 60, y: 60, w: 350, h: 500 },
      { x: 425, y: 60, w: 350, h: 500 },
      { x: 790, y: 60, w: 350, h: 500 },
      { x: 60, y: 620, w: 350, h: 500 },
      { x: 425, y: 620, w: 350, h: 500 },
      { x: 790, y: 620, w: 350, h: 500 }
    ]
  },
  {
    id: "polaroid-wall-8",
    name: "Polaroid Wall",
    slots: 8,
    category: "polaroid",
    src: "/templates/polaroid-wall-8.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 50, y: 50, w: 250, h: 300 },
      { x: 330, y: 50, w: 250, h: 300 },
      { x: 610, y: 50, w: 250, h: 300 },
      { x: 890, y: 50, w: 250, h: 300 },
      { x: 50, y: 420, w: 250, h: 300 },
      { x: 330, y: 420, w: 250, h: 300 },
      { x: 610, y: 420, w: 250, h: 300 },
      { x: 890, y: 420, w: 250, h: 300 }
    ]
  },

  // ============================================
  // CUTE / KAWAII (6 templates)
  // ============================================
  {
    id: "cute-hearts-1",
    name: "Pink Hearts",
    slots: 1,
    category: "cute",
    src: "/templates/cute-hearts-1.png",
    width: 1200, height: 1500,
    slotCoords: [{ x: 90, y: 90, w: 1020, h: 1020, rx: 25 }]
  },
  {
    id: "cute-peach-3",
    name: "Peaking Mascot",
    slots: 3,
    category: "cute",
    src: "/templates/cute-peach-3.png",
    width: 800, height: 2400,
    slotCoords: [
      { x: 80, y: 440, w: 640, h: 480, rx: 15 },
      { x: 80, y: 980, w: 640, h: 480, rx: 15 },
      { x: 80, y: 1520, w: 640, h: 480, rx: 15 }
    ]
  },
  {
    id: "cute-mint-4",
    name: "Mint Dots",
    slots: 4,
    category: "cute",
    src: "/templates/cute-mint-4.png",
    width: 800, height: 3000,
    slotCoords: [
      { x: 70, y: 80, w: 660, h: 500, rx: 18 },
      { x: 70, y: 630, w: 660, h: 500, rx: 18 },
      { x: 70, y: 1180, w: 660, h: 500, rx: 18 },
      { x: 70, y: 1730, w: 660, h: 500, rx: 18 }
    ]
  },
  {
    id: "cute-lavender-2",
    name: "Lavender Duo",
    slots: 2,
    category: "cute",
    src: "/templates/cute-lavender-2.png",
    width: 1200, height: 1400,
    slotCoords: [
      { x: 80, y: 80, w: 490, h: 900, rx: 20 },
      { x: 630, y: 80, w: 490, h: 900, rx: 20 }
    ]
  },
  {
    id: "cute-lemon-6",
    name: "Lemon Stars",
    slots: 6,
    category: "cute",
    src: "/templates/cute-lemon-6.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 65, y: 65, w: 510, h: 400, rx: 18 },
      { x: 625, y: 65, w: 510, h: 400, rx: 18 },
      { x: 65, y: 515, w: 510, h: 400, rx: 18 },
      { x: 625, y: 515, w: 510, h: 400, rx: 18 },
      { x: 65, y: 965, w: 510, h: 400, rx: 18 },
      { x: 625, y: 965, w: 510, h: 400, rx: 18 }
    ]
  },
  {
    id: "cute-cotton-8",
    name: "Y2K Cyber Star",
    slots: 8,
    category: "cute",
    src: "/templates/cute-cotton-8.png",
    width: 1200, height: 2000,
    slotCoords: [
      { x: 60, y: 60, w: 510, h: 340, rx: 15 },
      { x: 630, y: 60, w: 510, h: 340, rx: 15 },
      { x: 60, y: 450, w: 510, h: 340, rx: 15 },
      { x: 630, y: 450, w: 510, h: 340, rx: 15 },
      { x: 60, y: 840, w: 510, h: 340, rx: 15 },
      { x: 630, y: 840, w: 510, h: 340, rx: 15 },
      { x: 60, y: 1230, w: 510, h: 340, rx: 15 },
      { x: 630, y: 1230, w: 510, h: 340, rx: 15 }
    ]
  },
  {
    id: "cute-knit-1",
    name: "Cozy Knit Felt",
    slots: 1,
    category: "cute",
    src: "/templates/cute-knit-1.png",
    width: 800, height: 1400,
    slotCoords: [
      { x: 140, y: 260, w: 520, h: 580, rx: 40 }
    ]
  },

  // ============================================
  // RETRO / AESTHETIC (6 templates)
  // ============================================
  {
    id: "retro-vintage-1",
    name: "Vintage Classic",
    slots: 1,
    category: "retro",
    src: "/templates/retro-vintage-1.png",
    width: 1200, height: 1500,
    slotCoords: [{ x: 100, y: 90, w: 1000, h: 1050, rx: 6 }]
  },
  {
    id: "retro-ticket-2",
    name: "Retro Ticket",
    slots: 2,
    category: "retro",
    src: "/templates/retro-ticket-2.png",
    width: 1200, height: 1000,
    slotCoords: [
      { x: 80, y: 80, w: 490, h: 580, rx: 4 },
      { x: 630, y: 80, w: 490, h: 580, rx: 4 }
    ]
  },
  {
    id: "retro-sage-3",
    name: "Breaking News",
    slots: 3,
    category: "retro",
    src: "/templates/retro-sage-3.png",
    width: 800, height: 2400,
    slotCoords: [
      { x: 80, y: 230, w: 640, h: 500 },
      { x: 80, y: 770, w: 640, h: 500 },
      { x: 80, y: 1310, w: 640, h: 500 }
    ]
  },
  {
    id: "retro-rose-4",
    name: "Cinema Ticket",
    slots: 4,
    category: "retro",
    src: "/templates/retro-rose-4.png",
    width: 800, height: 3000,
    slotCoords: [
      { x: 80, y: 320, w: 640, h: 500 },
      { x: 80, y: 880, w: 640, h: 500 },
      { x: 80, y: 1440, w: 640, h: 500 },
      { x: 80, y: 2000, w: 640, h: 500 }
    ]
  },

  {
    id: "retro-mosaic-8",
    name: "Vintage Mosaic",
    slots: 8,
    category: "retro",
    src: "/templates/retro-mosaic-8.png",
    width: 1200, height: 2000,
    slotCoords: [
      { x: 65, y: 55, w: 510, h: 340, rx: 4 },
      { x: 625, y: 55, w: 510, h: 340, rx: 4 },
      { x: 65, y: 445, w: 510, h: 340, rx: 4 },
      { x: 625, y: 445, w: 510, h: 340, rx: 4 },
      { x: 65, y: 835, w: 510, h: 340, rx: 4 },
      { x: 625, y: 835, w: 510, h: 340, rx: 4 },
      { x: 65, y: 1225, w: 510, h: 340, rx: 4 },
      { x: 625, y: 1225, w: 510, h: 340, rx: 4 }
    ]
  },
  {
    id: "elegant-gold-1",
    name: "Elegant Gold 1",
    slots: 1,
    category: "cute",
    src: "/templates/elegant-gold-1.png",
    width: 1200, height: 1500,
    slotCoords: [
      { x: 104, y: 104, w: 992, h: 1092, rx: 10 }
    ]
  },
  {
    id: "filmstrip-classic-3",
    name: "Filmstrip Classic 3",
    slots: 3,
    category: "filmstrip",
    src: "/templates/filmstrip-classic-3.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 154, y: 84, w: 892, h: 452 },
      { x: 154, y: 584, w: 892, h: 452 },
      { x: 154, y: 1084, w: 892, h: 452 }
    ]
  },
  {
    id: "filmstrip-double-6",
    name: "Filmstrip Double 6",
    slots: 6,
    category: "filmstrip",
    src: "/templates/filmstrip-double-6.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 104, y: 84, w: 462, h: 342 },
      { x: 634, y: 84, w: 462, h: 342 },
      { x: 104, y: 474, w: 462, h: 342 },
      { x: 634, y: 474, w: 462, h: 342 },
      { x: 104, y: 864, w: 462, h: 342 },
      { x: 634, y: 864, w: 462, h: 342 }
    ]
  },
  {
    id: "grand-group-8",
    name: "Grand Group 8",
    slots: 8,
    category: "cute",
    src: "/templates/grand-group-8.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 312, rx: 10 },
      { x: 634, y: 84, w: 482, h: 312, rx: 10 },
      { x: 84, y: 434, w: 482, h: 312, rx: 10 },
      { x: 634, y: 434, w: 482, h: 312, rx: 10 },
      { x: 84, y: 784, w: 482, h: 312, rx: 10 },
      { x: 634, y: 784, w: 482, h: 312, rx: 10 },
      { x: 84, y: 1134, w: 482, h: 312, rx: 10 },
      { x: 634, y: 1134, w: 482, h: 312, rx: 10 }
    ]
  },
  {
    id: "grid-classic-6",
    name: "Grid Classic 6",
    slots: 6,
    category: "cute",
    src: "/templates/grid-classic-6.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 352, rx: 10 },
      { x: 634, y: 84, w: 482, h: 352, rx: 10 },
      { x: 84, y: 484, w: 482, h: 352, rx: 10 },
      { x: 634, y: 484, w: 482, h: 352, rx: 10 },
      { x: 84, y: 884, w: 482, h: 352, rx: 10 },
      { x: 634, y: 884, w: 482, h: 352, rx: 10 }
    ]
  },
  {
    id: "grid-mint-2",
    name: "Grid Mint 2",
    slots: 2,
    category: "cute",
    src: "/templates/grid-mint-2.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 104, y: 104, w: 992, h: 552, rx: 10 },
      { x: 104, y: 724, w: 992, h: 552, rx: 10 }
    ]
  },
  {
    id: "grid-peach-2x2",
    name: "Grid Peach 2x2",
    slots: 4,
    category: "cute",
    src: "/templates/grid-peach-2x2.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 94, y: 94, w: 472, h: 512, rx: 10 },
      { x: 634, y: 94, w: 472, h: 512, rx: 10 },
      { x: 94, y: 664, w: 472, h: 512, rx: 10 },
      { x: 634, y: 664, w: 472, h: 512, rx: 10 }
    ]
  },
  {
    id: "korean-4cut-lavender",
    name: "Korean 4-Cut Lavender",
    slots: 4,
    category: "korean",
    src: "/templates/korean-4cut-lavender.png",
    width: 1000, height: 3000,
    slotCoords: [
      { x: 84, y: 84, w: 832, h: 552, rx: 10 },
      { x: 84, y: 704, w: 832, h: 552, rx: 10 },
      { x: 84, y: 1324, w: 832, h: 552, rx: 10 },
      { x: 84, y: 1944, w: 832, h: 552, rx: 10 }
    ]
  },
  {
    id: "korean-maroon-4",
    name: "Korean Maroon 4",
    slots: 4,
    category: "korean",
    src: "/templates/korean-maroon-4.png",
    width: 800, height: 3000,
    slotCoords: [
      { x: 82, y: 82, w: 636, h: 496, rx: 10 },
      { x: 82, y: 632, w: 636, h: 496, rx: 10 },
      { x: 82, y: 1182, w: 636, h: 496, rx: 10 },
      { x: 82, y: 1732, w: 636, h: 496, rx: 10 }
    ]
  },
  {
    id: "mini-polaroid-8",
    name: "Mini Polaroid 8",
    slots: 8,
    category: "polaroid",
    src: "/templates/mini-polaroid-8.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 84, w: 222, h: 532 },
      { x: 354, y: 84, w: 222, h: 532 },
      { x: 624, y: 84, w: 222, h: 532 },
      { x: 894, y: 84, w: 222, h: 532 },
      { x: 84, y: 724, w: 222, h: 532 },
      { x: 354, y: 724, w: 222, h: 532 },
      { x: 624, y: 724, w: 222, h: 532 },
      { x: 894, y: 724, w: 222, h: 532 }
    ]
  },
  {
    id: "minimalist-lines-1",
    name: "Minimalist Lines 1",
    slots: 1,
    category: "cute",
    src: "/templates/minimalist-lines-1.png",
    width: 1200, height: 1500,
    slotCoords: [
      { x: 104, y: 104, w: 992, h: 1092, rx: 10 }
    ]
  },
  {
    id: "party-style-8",
    name: "Party Style 8",
    slots: 8,
    category: "cute",
    src: "/templates/party-style-8.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 302, rx: 10 },
      { x: 634, y: 84, w: 482, h: 302, rx: 10 },
      { x: 84, y: 424, w: 482, h: 302, rx: 10 },
      { x: 634, y: 424, w: 482, h: 302, rx: 10 },
      { x: 84, y: 764, w: 482, h: 302, rx: 10 },
      { x: 634, y: 764, w: 482, h: 302, rx: 10 },
      { x: 84, y: 1104, w: 482, h: 302, rx: 10 },
      { x: 634, y: 1104, w: 482, h: 302, rx: 10 }
    ]
  },
  {
    id: "polaroid-classic-1",
    name: "Polaroid Classic 1",
    slots: 1,
    category: "polaroid",
    src: "/templates/polaroid-classic-1.png",
    width: 1200, height: 1500,
    slotCoords: [
      { x: 84, y: 84, w: 1032, h: 1032 }
    ]
  },
  {
    id: "polaroid-trio-3",
    name: "Polaroid Trio 3",
    slots: 3,
    category: "polaroid",
    src: "/templates/polaroid-trio-3.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 104, y: 104, w: 992, h: 392 },
      { x: 104, y: 544, w: 992, h: 392 },
      { x: 104, y: 984, w: 992, h: 392 }
    ]
  },
  {
    id: "rainbow-pastel-6",
    name: "Rainbow Pastel 6",
    slots: 6,
    category: "cute",
    src: "/templates/rainbow-pastel-6.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 372, rx: 10 },
      { x: 634, y: 84, w: 482, h: 372, rx: 10 },
      { x: 84, y: 504, w: 482, h: 372, rx: 10 },
      { x: 634, y: 504, w: 482, h: 372, rx: 10 },
      { x: 84, y: 924, w: 482, h: 372, rx: 10 },
      { x: 634, y: 924, w: 482, h: 372, rx: 10 }
    ]
  },
  {
    id: "retro-caramel-6",
    name: "Retro Caramel 6",
    slots: 6,
    category: "retro",
    src: "/templates/retro-caramel-6.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 372, rx: 10 },
      { x: 634, y: 84, w: 482, h: 372, rx: 10 },
      { x: 84, y: 504, w: 482, h: 372, rx: 10 },
      { x: 634, y: 504, w: 482, h: 372, rx: 10 },
      { x: 84, y: 924, w: 482, h: 372, rx: 10 },
      { x: 634, y: 924, w: 482, h: 372, rx: 10 }
    ]
  },
  {
    id: "sakura-yellow-3",
    name: "Sakura Yellow 3",
    slots: 3,
    category: "cute",
    src: "/templates/sakura-yellow-3.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 104, w: 312, h: 1092, rx: 10 },
      { x: 444, y: 104, w: 312, h: 1092, rx: 10 },
      { x: 804, y: 104, w: 312, h: 1092, rx: 10 }
    ]
  },
  {
    id: "split-cute-2",
    name: "Split Cute 2",
    slots: 2,
    category: "cute",
    src: "/templates/split-cute-2.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 94, y: 104, w: 472, h: 1092, rx: 10 },
      { x: 634, y: 104, w: 472, h: 1092, rx: 10 }
    ]
  },
  {
    id: "vintage-paper-1",
    name: "Vintage Paper 1",
    slots: 1,
    category: "retro",
    src: "/templates/vintage-paper-1.png",
    width: 1200, height: 1500,
    slotCoords: [
      { x: 104, y: 104, w: 992, h: 1092, rx: 10 }
    ]
  },
  {
    id: "vintage-retro-6",
    name: "Vintage Retro 6",
    slots: 6,
    category: "retro",
    src: "/templates/vintage-retro-6.png",
    width: 1200, height: 1800,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 372, rx: 10 },
      { x: 634, y: 84, w: 482, h: 372, rx: 10 },
      { x: 84, y: 504, w: 482, h: 372, rx: 10 },
      { x: 634, y: 504, w: 482, h: 372, rx: 10 },
      { x: 84, y: 924, w: 482, h: 372, rx: 10 },
      { x: 634, y: 924, w: 482, h: 372, rx: 10 }
    ]
  },
  {
    id: "y2k-retro-6",
    name: "Y2K Retro 6",
    slots: 6,
    category: "retro",
    src: "/templates/y2k-retro-6.png",
    width: 1200, height: 1600,
    slotCoords: [
      { x: 84, y: 84, w: 482, h: 352, rx: 10 },
      { x: 634, y: 84, w: 482, h: 352, rx: 10 },
      { x: 84, y: 484, w: 482, h: 352, rx: 10 },
      { x: 634, y: 484, w: 482, h: 352, rx: 10 },
      { x: 84, y: 884, w: 482, h: 352, rx: 10 },
      { x: 634, y: 884, w: 482, h: 352, rx: 10 }
    ]
  },
  {
    id: "y2k-stars-4cut",
    name: "Y2K Stars 4-Cut",
    slots: 4,
    category: "retro",
    src: "/templates/y2k-stars-4cut.png",
    width: 1000, height: 3000,
    slotCoords: [
      { x: 84, y: 84, w: 832, h: 552, rx: 10 },
      { x: 84, y: 704, w: 832, h: 552, rx: 10 },
      { x: 84, y: 1324, w: 832, h: 552, rx: 10 },
      { x: 84, y: 1944, w: 832, h: 552, rx: 10 }
    ]
  },
  {
    id: "custom-1784424710599-i4k0",
    name: "Frame Aestetik",
    slots: 6,
    category: "korean",
    src: "/templates/custom-1784424710599-i4k0.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 29, y: 134, w: 453, h: 348, rx: 10 },
      { x: 553, y: 134, w: 447, h: 349, rx: 10 },
      { x: 29, y: 500, w: 453, h: 349, rx: 10 },
      { x: 553, y: 500, w: 447, h: 349, rx: 10 },
      { x: 29, y: 866, w: 453, h: 357, rx: 11 },
      { x: 553, y: 867, w: 447, h: 356, rx: 11 }
    ]
  },
  {
    id: "custom-1784427621408-sjjs",
    name: "Frame Bintang",
    slots: 6,
    category: "korean",
    src: "/templates/custom-1784427621408-sjjs.png",
    width: 1036, height: 1519,
    slotCoords: [
      { x: 188, y: 259, w: 188, h: 213, rx: 6 },
      { x: 699, y: 313, w: 153, h: 172, rx: 5 },
      { x: 89, y: 606, w: 359, h: 347, rx: 10 },
      { x: 688, y: 693, w: 193, h: 239, rx: 6 },
      { x: 183, y: 1056, w: 195, h: 235, rx: 6 },
      { x: 683, y: 1125, w: 183, h: 225, rx: 5 }
    ]
  },
  {
    id: "custom-1784427858645-l97f",
    name: "Frame Bunga",
    slots: 6,
    category: "korean",
    src: "/templates/custom-1784427858645-l97f.png",
    width: 1037, height: 1516,
    slotCoords: [
      { x: 205, y: 130, w: 188, h: 220, rx: 6 },
      { x: 602, y: 160, w: 378, h: 386, rx: 11 },
      { x: 210, y: 608, w: 170, h: 209, rx: 5 },
      { x: 735, y: 683, w: 163, h: 233, rx: 5 },
      { x: 143, y: 1035, w: 273, h: 321, rx: 8 },
      { x: 593, y: 1114, w: 376, h: 372, rx: 11 }
    ]
  },
  {
    id: "custom-1784428020314-mq4y",
    name: "Frame 4 Grid",
    slots: 4,
    category: "retro",
    src: "/templates/custom-1784428020314-mq4y.png",
    width: 1086, height: 1448,
    slotCoords: [
      { x: 45, y: 82, w: 477, h: 586, rx: 14 },
      { x: 566, y: 82, w: 473, h: 586, rx: 14 },
      { x: 566, y: 790, w: 473, h: 585, rx: 14 },
      { x: 47, y: 791, w: 473, h: 582, rx: 14 }
    ]
  },
  {
    id: "custom-1784428172316-tz5k",
    name: "Frame Klasik",
    slots: 8,
    category: "korean",
    src: "/templates/custom-1784428172316-tz5k.png",
    width: 1068, height: 1473,
    slotCoords: [
      { x: 139, y: 122, w: 319, h: 272, rx: 8 },
      { x: 676, y: 126, w: 317, h: 271, rx: 8 },
      { x: 141, y: 457, w: 321, h: 282, rx: 8 },
      { x: 675, y: 459, w: 318, h: 281, rx: 8 },
      { x: 154, y: 797, w: 304, h: 279, rx: 8 },
      { x: 685, y: 801, w: 305, h: 277, rx: 8 },
      { x: 170, y: 1133, w: 305, h: 235, rx: 7 },
      { x: 706, y: 1133, w: 305, h: 235, rx: 7 }
    ]
  },
  {
    id: "custom-1784433846432-eq88",
    name: "testing",
    slots: 8,
    category: "custom",
    src: "/templates/custom-1784433846432-eq88.png",
    width: 1543, height: 1019,
    slotCoords: [
      { x: 27, y: 50, w: 359, h: 369, rx: 11 },
      { x: 404, y: 50, w: 359, h: 369, rx: 11 },
      { x: 781, y: 50, w: 358, h: 369, rx: 11 },
      { x: 1157, y: 50, w: 358, h: 369, rx: 11 },
      { x: 28, y: 563, w: 358, h: 367, rx: 11 },
      { x: 404, y: 563, w: 359, h: 367, rx: 11 },
      { x: 781, y: 563, w: 358, h: 367, rx: 11 },
      { x: 1157, y: 563, w: 359, h: 367, rx: 11 }
    ]
  },
  {
    id: "custom-1784436488484-wz1f",
    name: "Frame Special",
    slots: 6,
    category: "retro",
    src: "/templates/custom-1784436488484-wz1f.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 53, y: 468, w: 259, h: 303, rx: 8 },
      { x: 708, y: 468, w: 264, h: 303, rx: 8 },
      { x: 329, y: 527, w: 358, h: 240, rx: 7 },
      { x: 330, y: 785, w: 358, h: 425, rx: 11 },
      { x: 706, y: 1228, w: 265, h: 222, rx: 7 },
      { x: 52, y: 1229, w: 260, h: 221, rx: 7 }
    ]
  },
  {
    id: "custom-1784531563394-m5uc",
    name: "Frame Vintage",
    slots: 8,
    category: "retro",
    src: "/templates/custom-1784531563394-m5uc.png",
    width: 1028, height: 1530,
    slotCoords: [
      { x: 52, y: 113, w: 456, h: 441, rx: 13 },
      { x: 525, y: 128, w: 456, h: 441, rx: 13 },
      { x: 42, y: 570, w: 457, h: 441, rx: 13 },
      { x: 515, y: 586, w: 456, h: 441, rx: 13 },
      { x: 49, y: 1028, w: 457, h: 447, rx: 13 },
      { x: 522, y: 1045, w: 456, h: 441, rx: 13 },
      { x: 525, y: 128, w: 456, h: 441, rx: 13 },
      { x: 525, y: 128, w: 456, h: 441, rx: 13 }
    ]
  },
  {
    id: "custom-1784531653783-vt9t",
    name: "Bali Clasic Frame",
    slots: 6,
    category: "custom",
    src: "/templates/custom-1784531653783-vt9t.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 83, y: 122, w: 416, h: 444, rx: 12 },
      { x: 518, y: 123, w: 410, h: 446, rx: 12 },
      { x: 78, y: 582, w: 410, h: 443, rx: 12 },
      { x: 505, y: 587, w: 419, h: 446, rx: 13 },
      { x: 86, y: 1042, w: 408, h: 431, rx: 12 },
      { x: 510, y: 1050, w: 425, h: 425, rx: 13 }
    ]
  },
  {
    id: "custom-1784531815035-r66x",
    name: "Cute Frame",
    slots: 8,
    category: "cute",
    src: "/templates/custom-1784531815035-r66x.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 48, y: 174, w: 447, h: 330, rx: 10 },
      { x: 519, y: 175, w: 450, h: 329, rx: 10 },
      { x: 30, y: 528, w: 465, h: 329, rx: 10 },
      { x: 519, y: 528, w: 449, h: 329, rx: 10 },
      { x: 48, y: 881, w: 448, h: 235, rx: 7 },
      { x: 518, y: 882, w: 451, h: 235, rx: 7 },
      { x: 23, y: 1142, w: 471, h: 352, rx: 11 },
      { x: 515, y: 1142, w: 453, h: 353, rx: 11 }
    ]
  },
  {
    id: "custom-1784543722837-eopz",
    name: "Frame White Maroon",
    slots: 6,
    category: "korean",
    src: "/templates/custom-1784543722837-eopz.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 86, y: 73, w: 388, h: 397, rx: 12 },
      { x: 85, y: 502, w: 389, h: 395, rx: 12 },
      { x: 86, y: 929, w: 388, h: 396, rx: 12 },
      { x: 586, y: 74, w: 391, h: 396, rx: 12 },
      { x: 586, y: 503, w: 391, h: 394, rx: 12 },
      { x: 586, y: 931, w: 391, h: 394, rx: 12 }
    ]
  },
  {
    id: "custom-1784544196068-ee8i",
    name: "Frame Kucing Kawai",
    slots: 6,
    category: "cute",
    src: "/templates/custom-1784544196068-ee8i.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 61, y: 108, w: 430, h: 432, rx: 9 },
      { x: 61, y: 568, w: 430, h: 432, rx: 9 },
      { x: 61, y: 1028, w: 430, h: 432, rx: 9 },
      { x: 532, y: 108, w: 430, h: 432, rx: 9 },
      { x: 532, y: 568, w: 430, h: 432, rx: 9 },
      { x: 532, y: 1028, w: 430, h: 432, rx: 9 }
    ]
  },
  {
    id: "custom-1784544609075-p55w",
    name: "Frame Vintage astetik",
    slots: 8,
    category: "retro",
    src: "/templates/custom-1784544609075-p55w.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 54, y: 33, w: 428, h: 321, rx: 10 },
      { x: 54, y: 370, w: 427, h: 316, rx: 9 },
      { x: 54, y: 702, w: 428, h: 317, rx: 10 },
      { x: 54, y: 1035, w: 427, h: 316, rx: 9 },
      { x: 561, y: 33, w: 423, h: 321, rx: 10 },
      { x: 561, y: 370, w: 423, h: 316, rx: 9 },
      { x: 561, y: 702, w: 423, h: 317, rx: 10 },
      { x: 561, y: 1035, w: 423, h: 316, rx: 9 }
    ]
  },
  {
    id: "custom-1784544974710-o4wr",
    name: "Frame Aestetik coklat",
    slots: 6,
    category: "filmstrip",
    src: "/templates/custom-1784544974710-o4wr.png",
    width: 1023, height: 1537,
    slotCoords: [
      { x: 42, y: 143, w: 432, h: 359, rx: 11 },
      { x: 45, y: 541, w: 429, h: 357, rx: 11 },
      { x: 45, y: 938, w: 429, h: 358, rx: 11 },
      { x: 547, y: 143, w: 429, h: 359, rx: 11 },
      { x: 547, y: 540, w: 429, h: 358, rx: 11 },
      { x: 547, y: 938, w: 429, h: 358, rx: 11 }
    ]
  },
  {
    id: "custom-1784636333576-2jx9",
    name: "Frame Cute Lucu",
    slots: 2,
    category: "cute",
    src: "/templates/custom-1784636333576-2jx9.png",
    width: 675, height: 1200,
    slotCoords: [
      { x: 91, y: 101, w: 323, h: 330, rx: 10 },
      { x: 250, y: 648, w: 344, h: 348, rx: 10 }
    ]
  },
  {
    id: "custom-1784636378328-yt0t",
    name: "Frame Kawai",
    slots: 4,
    category: "cute",
    src: "/templates/custom-1784636378328-yt0t.png",
    width: 736, height: 1308,
    slotCoords: [
      { x: 342, y: 115, w: 342, h: 347, rx: 10 },
      { x: 83, y: 878, w: 344, h: 350, rx: 10 },
      { x: 379, y: 562, w: 333, h: 339, rx: 10 },
      { x: 658, y: 933, w: 48, h: 116, rx: 1 }
    ]
  },
  {
    id: "custom-1784636423699-6r8i",
    name: "Frame pink cute",
    slots: 4,
    category: "cute",
    src: "/templates/custom-1784636423699-6r8i.png",
    width: 736, height: 1308,
    slotCoords: [
      { x: 69, y: 40, w: 392, h: 278, rx: 8 },
      { x: 61, y: 680, w: 412, h: 294, rx: 9 },
      { x: 62, y: 1005, w: 412, h: 294, rx: 9 },
      { x: 480, y: 688, w: 89, h: 73, rx: 2 }
    ]
  },
  {
    id: "custom-1784636485498-kxdl",
    name: "Aestetik abstrak",
    slots: 1,
    category: "retro",
    src: "/templates/custom-1784636485498-kxdl.png",
    width: 736, height: 1308,
    slotCoords: [
      { x: 36, y: 1005, w: 287, h: 219, rx: 7 }
    ]
  },
  {
    id: "custom-1784636523212-9oxx",
    name: "Frame vintage kamera",
    slots: 2,
    category: "retro",
    src: "/templates/custom-1784636523212-9oxx.png",
    width: 736, height: 1308,
    slotCoords: [
      { x: 218, y: 175, w: 383, h: 305, rx: 9 },
      { x: 216, y: 537, w: 368, h: 305, rx: 9 }
    ]
  },
  {
    id: "custom-1784636560610-nzx9",
    name: "Frame vintage kamera koran",
    slots: 2,
    category: "retro",
    src: "/templates/custom-1784636560610-nzx9.png",
    width: 736, height: 1308,
    slotCoords: [
      { x: 10, y: 42, w: 432, h: 421, rx: 13 },
      { x: 264, y: 668, w: 436, h: 431, rx: 13 }
    ]
  }
];
