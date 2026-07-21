export interface WallpaperOption {
  id: string;
  name: string;
  category: string;
  previewCss: string;
  getFill: (ctx: CanvasRenderingContext2D, width: number, height: number) => string | CanvasGradient | CanvasPattern;
}

function tilePattern(draw: (tctx: CanvasRenderingContext2D, size: number) => void, size = 32) {
  return (ctx: CanvasRenderingContext2D) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const tctx = canvas.getContext('2d');
    if (!tctx) return '#ffffff';
    draw(tctx, size);
    return ctx.createPattern(canvas, 'repeat') || '#ffffff';
  };
}

export const wallpapers: WallpaperOption[] = [
  // 🌸 Cute / Kawaii / Pink Aesthetic / Girly
  {
    id: 'cute-hearts',
    name: 'Kawaii Pink Hearts',
    category: 'cute',
    previewCss: 'radial-gradient(circle, #fbcfe8 10%, transparent 11%), radial-gradient(circle at 50% 50%, #f472b6 20%, transparent 21%), #fdf2f8',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#fdf2f8';
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#fbcfe8';
      tctx.beginPath(); tctx.arc(size * 0.25, size * 0.25, 2, 0, Math.PI * 2); tctx.fill();
      tctx.fillStyle = '#f472b6';
      const hx = size * 0.7;
      const hy = size * 0.7;
      tctx.beginPath();
      tctx.moveTo(hx, hy);
      tctx.bezierCurveTo(hx - 3, hy - 3, hx - 6, hy, hx, hy + 5);
      tctx.bezierCurveTo(hx + 6, hy, hx + 3, hy - 3, hx, hy);
      tctx.closePath();
      tctx.fill();
    }, 24)
  },
  {
    // FIX: getFill sebelumnya cuma solid + garis tepi tipis, tidak sama
    // dengan preview yang menampilkan garis diagonal peach/putih.
    // Sekarang digambar ulang agar swatch = hasil render di kanvas.
    id: 'cute-peach-grid',
    name: 'Peach Plaid',
    category: 'cute',
    previewCss: 'repeating-linear-gradient(45deg, #ffedd5 0, #ffedd5 4px, #fff 4px, #fff 8px)',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#ffffff';
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = '#ffedd5';
      tctx.lineWidth = 4;
      // Garis diagonal berulang, sama seperti pola preview CSS
      for (let i = -size; i < size * 2; i += 8) {
        tctx.beginPath();
        tctx.moveTo(i, 0);
        tctx.lineTo(i + size, size);
        tctx.stroke();
      }
    }, 16)
  },
  {
    id: 'cute-strawberry-milk',
    name: 'Strawberry Milk',
    category: 'cute',
    previewCss: 'radial-gradient(circle at 30% 30%, #fb7185 12%, transparent 13%), radial-gradient(circle at 70% 65%, #fb7185 10%, transparent 11%), #fff0f5',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#fff0f5';
      tctx.fillRect(0, 0, size, size);
      const drawStrawberry = (x: number, y: number, r: number) => {
        tctx.fillStyle = '#fb7185';
        tctx.beginPath();
        tctx.moveTo(x, y - r);
        tctx.quadraticCurveTo(x - r, y - r * 0.2, x, y + r);
        tctx.quadraticCurveTo(x + r, y - r * 0.2, x, y - r);
        tctx.fill();
        tctx.fillStyle = '#ffffff';
        tctx.beginPath(); tctx.arc(x - r * 0.3, y, r * 0.12, 0, Math.PI * 2); tctx.fill();
        tctx.beginPath(); tctx.arc(x + r * 0.3, y, r * 0.12, 0, Math.PI * 2); tctx.fill();
        tctx.fillStyle = '#4ade80';
        tctx.fillRect(x - r * 0.3, y - r - 1.5, r * 0.6, 2);
      };
      drawStrawberry(size * 0.3, size * 0.3, 3.2);
      drawStrawberry(size * 0.7, size * 0.65, 2.6);
    }, 26)
  },
  {
    id: 'cute-jelly-drops',
    name: 'Jelly Bear Drops',
    category: 'cute',
    previewCss: 'radial-gradient(circle at 25% 30%, #a5f3fc 10%, transparent 11%), radial-gradient(circle at 65% 25%, #fde68a 9%, transparent 10%), radial-gradient(circle at 45% 70%, #fbcfe8 10%, transparent 11%), #fffdf7',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#fffdf7';
      tctx.fillRect(0, 0, size, size);
      const dots: [number, number, number, string][] = [
        [0.25, 0.3, 2.6, '#a5f3fc'],
        [0.65, 0.25, 2.2, '#fde68a'],
        [0.45, 0.7, 2.6, '#fbcfe8'],
      ];
      dots.forEach(([dx, dy, r, color]) => {
        tctx.fillStyle = color;
        tctx.beginPath(); tctx.arc(size * dx, size * dy, r, 0, Math.PI * 2); tctx.fill();
      });
    }, 28)
  },

  // ☁ Sky / Clouds
  {
    id: 'sky-clouds',
    name: 'Daylight Sky',
    category: 'sky',
    previewCss: 'linear-gradient(to bottom, #7dd3fc, #bae6fd)',
    getFill: (ctx, _w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#7dd3fc');
      g.addColorStop(1, '#bae6fd');
      return g;
    }
  },
  {
    id: 'sky-sunset',
    name: 'Dreamy Sunset',
    category: 'sky',
    previewCss: 'linear-gradient(to bottom, #fdba74, #f472b6)',
    getFill: (ctx, _w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#fdba74');
      g.addColorStop(1, '#f472b6');
      return g;
    }
  },
  {
    id: 'sky-cotton-clouds',
    name: 'Cotton Cloud Lilac',
    category: 'sky',
    previewCss: 'radial-gradient(circle at 30% 60%, #ffffff 12%, transparent 13%), radial-gradient(circle at 60% 40%, #ffffff 14%, transparent 15%), linear-gradient(to bottom, #ddd6fe, #ede9fe)',
    getFill: tilePattern((tctx, size) => {
      const g = tctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, '#ddd6fe');
      g.addColorStop(1, '#ede9fe');
      tctx.fillStyle = g;
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#ffffff';
      tctx.beginPath(); tctx.ellipse(size * 0.3, size * 0.6, size * 0.16, size * 0.1, 0, 0, Math.PI * 2); tctx.fill();
      tctx.beginPath(); tctx.ellipse(size * 0.6, size * 0.4, size * 0.18, size * 0.11, 0, 0, Math.PI * 2); tctx.fill();
    }, 40)
  },

  // 🌿 Nature / Floral
  {
    // FIX: preview lama cuma nunjukin titik kuning, sekarang match kelopak
    // putih + putik kuning seperti hasil render aslinya.
    id: 'floral-daisy',
    name: 'Summer Daisy',
    category: 'floral',
    previewCss: 'radial-gradient(circle, #ffffff 14%, transparent 15%), radial-gradient(circle, #fef08a 5%, transparent 6%), #ecfdf5',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#ecfdf5';
      tctx.fillRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      tctx.fillStyle = '#ffffff';
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const px = cx + Math.cos(angle) * 4;
        const py = cy + Math.sin(angle) * 4;
        tctx.beginPath(); tctx.arc(px, py, 2.5, 0, Math.PI * 2); tctx.fill();
      }
      tctx.fillStyle = '#fef08a';
      tctx.beginPath(); tctx.arc(cx, cy, 2, 0, Math.PI * 2); tctx.fill();
    }, 28)
  },
  {
    id: 'floral-wildflower',
    name: 'Wildflower Meadow',
    category: 'floral',
    previewCss: 'radial-gradient(circle at 25% 25%, #f9a8d4 10%, transparent 11%), radial-gradient(circle at 70% 30%, #93c5fd 9%, transparent 10%), radial-gradient(circle at 45% 75%, #fde68a 10%, transparent 11%), #fefce8',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#fefce8';
      tctx.fillRect(0, 0, size, size);
      const flowers: [number, number, number, string][] = [
        [0.25, 0.25, 2.4, '#f9a8d4'],
        [0.7, 0.3, 2.2, '#93c5fd'],
        [0.45, 0.75, 2.4, '#fde68a'],
      ];
      flowers.forEach(([dx, dy, r, color]) => {
        tctx.fillStyle = color;
        tctx.beginPath(); tctx.arc(size * dx, size * dy, r, 0, Math.PI * 2); tctx.fill();
      });
    }, 30)
  },

  // 🌊 Ocean / Beach
  {
    id: 'ocean-calm',
    name: 'Teal Lagoon',
    category: 'ocean',
    previewCss: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
    getFill: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0d9488');
      g.addColorStop(1, '#2dd4bf');
      return g;
    }
  },
  {
    id: 'ocean-wave-line',
    name: 'Blue Wave Lines',
    category: 'ocean',
    previewCss: 'repeating-linear-gradient(0deg, #bae6fd 0, #bae6fd 2px, transparent 2px, transparent 10px), #e0f2fe',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#e0f2fe';
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = '#7dd3fc';
      tctx.lineWidth = 2;
      tctx.beginPath();
      tctx.moveTo(0, size * 0.5);
      tctx.quadraticCurveTo(size * 0.25, size * 0.3, size * 0.5, size * 0.5);
      tctx.quadraticCurveTo(size * 0.75, size * 0.7, size, size * 0.5);
      tctx.stroke();
    }, 24)
  },

  // ✨ Glitter / Marble / Glass
  {
    // FIX: posisi titik emas sebelumnya acak tiap render (Math.random),
    // bikin pattern "berkedip"/berubah tiap kali dipakai ulang.
    // Sekarang posisi tetap supaya stabil & sama persis dgn preview.
    id: 'glitter-gold',
    name: 'Golden Dust',
    category: 'glitter',
    previewCss: 'radial-gradient(circle, #fef08a 5%, transparent 6%), #1e293b',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#1e293b';
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#fef08a';
      const fixedDots = [
        [0.15, 0.2], [0.4, 0.6], [0.7, 0.15], [0.85, 0.5],
        [0.55, 0.85], [0.25, 0.75], [0.9, 0.9], [0.1, 0.5],
      ];
      fixedDots.forEach(([dx, dy]) => {
        tctx.beginPath(); tctx.arc(size * dx, size * dy, 0.7, 0, Math.PI * 2); tctx.fill();
      });
    }, 20)
  },
  {
    id: 'glitter-rose-gold',
    name: 'Rose Gold Shimmer',
    category: 'glitter',
    previewCss: 'radial-gradient(circle, #fbbf24 5%, transparent 6%), #4c1d3d',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#4c1d3d';
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#fbbf24';
      const fixedDots = [
        [0.2, 0.25], [0.5, 0.55], [0.75, 0.2], [0.85, 0.65],
        [0.35, 0.8], [0.6, 0.15],
      ];
      fixedDots.forEach(([dx, dy]) => {
        tctx.beginPath(); tctx.arc(size * dx, size * dy, 0.8, 0, Math.PI * 2); tctx.fill();
      });
    }, 20)
  },

  // 🟣 Gradient Collections
  {
    id: 'gradient-aurora',
    name: 'Northern Aurora',
    category: 'gradient',
    previewCss: 'linear-gradient(to right, #4ade80, #3b82f6, #a855f7)',
    getFill: (ctx, w, _h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#4ade80');
      g.addColorStop(0.5, '#3b82f6');
      g.addColorStop(1, '#a855f7');
      return g;
    }
  },
  {
    id: 'gradient-sakura',
    name: 'Pink Sakura Dream',
    category: 'gradient',
    previewCss: 'linear-gradient(to right, #ffe4e6, #fbcfe8)',
    getFill: (ctx, w, _h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#ffe4e6');
      g.addColorStop(1, '#fbcfe8');
      return g;
    }
  },
  {
    id: 'gradient-dark-forest',
    name: 'Dark Forest',
    category: 'gradient',
    previewCss: 'linear-gradient(135deg, #064e3b, #022c22)',
    getFill: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#064e3b');
      g.addColorStop(1, '#022c22');
      return g;
    }
  },
  {
    id: 'gradient-lilac-dream',
    name: 'Lilac Dream',
    category: 'gradient',
    previewCss: 'linear-gradient(135deg, #ede9fe, #fbcfe8)',
    getFill: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#ede9fe');
      g.addColorStop(1, '#fbcfe8');
      return g;
    }
  },
  {
    id: 'gradient-mint-fresh',
    name: 'Mint Fresh',
    category: 'gradient',
    previewCss: 'linear-gradient(135deg, #d1fae5, #5eead4)',
    getFill: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#d1fae5');
      g.addColorStop(1, '#5eead4');
      return g;
    }
  },

  // 🌌 Galaxy / Stars / Moon
  {
    id: 'galaxy-starry',
    name: 'Midnight Galaxy',
    category: 'galaxy',
    previewCss: 'radial-gradient(circle at 30% 20%, #312e81, #0f172a)',
    getFill: (ctx, w, h) => {
      const g = ctx.createRadialGradient(w * 0.3, h * 0.2, 50, w * 0.5, h * 0.5, Math.max(w, h));
      g.addColorStop(0, '#312e81');
      g.addColorStop(1, '#0f172a');
      return g;
    }
  },
  {
    id: 'galaxy-nebula-pink',
    name: 'Pink Nebula',
    category: 'galaxy',
    previewCss: 'radial-gradient(circle at 35% 30%, #a21caf, #1e1b4b)',
    getFill: (ctx, w, h) => {
      const g = ctx.createRadialGradient(w * 0.35, h * 0.3, 50, w * 0.5, h * 0.5, Math.max(w, h));
      g.addColorStop(0, '#a21caf');
      g.addColorStop(1, '#1e1b4b');
      return g;
    }
  },

  // 🎮 Pixel Art / Retro / Y2K
  {
    id: 'pixel-grid',
    name: 'Y2K Cyber Grid',
    category: 'pixel',
    previewCss: 'linear-gradient(transparent 95%, #ec4899 95%), linear-gradient(90deg, transparent 95%, #ec4899 95%), #111827',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#111827';
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = '#ec4899';
      tctx.lineWidth = 1;
      tctx.strokeRect(0, 0, size, size);
    }, 20)
  },
  {
    id: 'pixel-vaporwave',
    name: 'Vaporwave Grid',
    category: 'pixel',
    previewCss: 'linear-gradient(transparent 90%, #67e8f9 90%), linear-gradient(90deg, transparent 90%, #67e8f9 90%), linear-gradient(135deg, #4c1d95, #db2777)',
    getFill: tilePattern((tctx, size) => {
      const g = tctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, '#4c1d95');
      g.addColorStop(1, '#db2777');
      tctx.fillStyle = g;
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = '#67e8f9';
      tctx.lineWidth = 1;
      tctx.strokeRect(0, 0, size, size);
    }, 22)
  },

  // 🍒 Dessert / Strawberry / Cherry
  {
    id: 'cute-cherries',
    name: 'Juicy Cherries',
    category: 'cute',
    previewCss: 'radial-gradient(circle at 40% 40%, #ef4444 15%, transparent 16%), #fffbeb',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#fffbeb';
      tctx.fillRect(0, 0, size, size);
      const cx1 = size * 0.4;
      const cy1 = size * 0.6;
      const cx2 = size * 0.7;
      const cy2 = size * 0.65;
      tctx.strokeStyle = '#10b981';
      tctx.lineWidth = 1;
      tctx.beginPath();
      tctx.moveTo(cx1, cy1);
      tctx.quadraticCurveTo(size * 0.55, size * 0.35, size * 0.6, size * 0.25);
      tctx.moveTo(cx2, cy2);
      tctx.quadraticCurveTo(size * 0.65, size * 0.35, size * 0.6, size * 0.25);
      tctx.stroke();
      tctx.fillStyle = '#ef4444';
      tctx.beginPath(); tctx.arc(cx1, cy1, 3.5, 0, Math.PI * 2); tctx.fill();
      tctx.beginPath(); tctx.arc(cx2, cy2, 3.5, 0, Math.PI * 2); tctx.fill();
    }, 32)
  },

  // 🎀 Aesthetic / Modern / Kekinian (kategori baru)
  {
    id: 'aesthetic-checker-pastel',
    name: 'Pastel Checkerboard',
    category: 'aesthetic',
    previewCss: 'conic-gradient(#fbcfe8 0% 25%, #fff7ed 0% 50%, #fbcfe8 0% 75%, #fff7ed 0% 100%) 0 0/20px 20px',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#fff7ed';
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#fbcfe8';
      tctx.fillRect(0, 0, size / 2, size / 2);
      tctx.fillRect(size / 2, size / 2, size / 2, size / 2);
    }, 20)
  },
  {
    id: 'aesthetic-holographic',
    name: 'Holographic Pastel',
    category: 'aesthetic',
    previewCss: 'linear-gradient(120deg, #c4b5fd, #93c5fd, #99f6e4, #fbcfe8)',
    getFill: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#c4b5fd');
      g.addColorStop(0.35, '#93c5fd');
      g.addColorStop(0.7, '#99f6e4');
      g.addColorStop(1, '#fbcfe8');
      return g;
    }
  },
  {
    id: 'aesthetic-terracotta-dot',
    name: 'Terracotta Boho',
    category: 'aesthetic',
    previewCss: 'radial-gradient(circle, #fdba74 8%, transparent 9%), #c2703d',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#c2703d';
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#fdba74';
      tctx.beginPath(); tctx.arc(size / 2, size / 2, 2, 0, Math.PI * 2); tctx.fill();
    }, 14)
  },
  {
    id: 'aesthetic-sage-linen',
    name: 'Sage Linen',
    category: 'aesthetic',
    previewCss: 'repeating-linear-gradient(0deg, #c1cfc0 0, #c1cfc0 1px, #e7ece6 1px, #e7ece6 2px)',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#e7ece6';
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = '#c1cfc0';
      tctx.lineWidth = 0.6;
      for (let i = 0; i < size; i += 2) {
        tctx.beginPath(); tctx.moveTo(0, i); tctx.lineTo(size, i); tctx.stroke();
      }
    }, 10)
  },
];

export const wallpaperCategories = [
  { id: 'all', name: 'Semua', emoji: '✨' },
  { id: 'cute', name: 'Cute & Girly', emoji: '🌸' },
  { id: 'sky', name: 'Sky & Cloud', emoji: '☁' },
  { id: 'floral', name: 'Nature & Floral', emoji: '🌿' },
  { id: 'ocean', name: 'Ocean & Beach', emoji: '🌊' },
  { id: 'glitter', name: 'Glitter & Stars', emoji: '✨' },
  { id: 'gradient', name: 'Gradients', emoji: '🎨' },
  { id: 'galaxy', name: 'Galaxy & Moon', emoji: '🌌' },
  { id: 'pixel', name: 'Retro & Y2K', emoji: '🎮' },
  { id: 'aesthetic', name: 'Aesthetic & Kekinian', emoji: '🎀' }
];