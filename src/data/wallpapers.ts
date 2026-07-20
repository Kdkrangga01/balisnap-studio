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
      // Draw a small heart
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
    id: 'cute-peach-grid',
    name: 'Peach Plaid',
    category: 'cute',
    previewCss: 'repeating-linear-gradient(45deg, #ffedd5 0, #ffedd5 4px, #fff 4px, #fff 8px)',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#ffedd5';
      tctx.fillRect(0, 0, size, size);
      tctx.strokeStyle = '#fdbb2d22';
      tctx.lineWidth = 1;
      tctx.strokeRect(0, 0, size, size);
    }, 16)
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

  // 🌿 Nature / Floral
  {
    id: 'floral-daisy',
    name: 'Summer Daisy',
    category: 'floral',
    previewCss: 'radial-gradient(circle, #fef08a 15%, transparent 16%), #ecfdf5',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#ecfdf5';
      tctx.fillRect(0, 0, size, size);
      
      // Draw white daisy petals with yellow center
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

  // ✨ Glitter / Marble / Glass
  {
    id: 'glitter-gold',
    name: 'Golden Dust',
    category: 'glitter',
    previewCss: 'radial-gradient(circle, #fef08a 5%, transparent 6%), #1e293b',
    getFill: tilePattern((tctx, size) => {
      tctx.fillStyle = '#1e293b';
      tctx.fillRect(0, 0, size, size);
      tctx.fillStyle = '#fef08a';
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        tctx.beginPath(); tctx.arc(x, y, 0.7, 0, Math.PI * 2); tctx.fill();
      }
    }, 20)
  },

  // 🟣 Gradient Collections (Purple, Blue, Green, Yellow, Orange, Red, Dark Theme)
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
      
      // Draw stems
      tctx.strokeStyle = '#10b981';
      tctx.lineWidth = 1;
      tctx.beginPath();
      tctx.moveTo(cx1, cy1);
      tctx.quadraticCurveTo(size * 0.55, size * 0.35, size * 0.6, size * 0.25);
      tctx.moveTo(cx2, cy2);
      tctx.quadraticCurveTo(size * 0.65, size * 0.35, size * 0.6, size * 0.25);
      tctx.stroke();
      
      // Draw red cherries
      tctx.fillStyle = '#ef4444';
      tctx.beginPath(); tctx.arc(cx1, cy1, 3.5, 0, Math.PI * 2); tctx.fill();
      tctx.beginPath(); tctx.arc(cx2, cy2, 3.5, 0, Math.PI * 2); tctx.fill();
    }, 32)
  }
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
  { id: 'pixel', name: 'Retro & Y2K', emoji: '🎮' }
];
