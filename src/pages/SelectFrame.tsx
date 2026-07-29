import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { usePhotobooth, getFrameRequiredTier, isFrameLocked, type PackageTier } from '../context/PhotoboothContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { frames } from '../data/frames';
import type { FrameTemplate } from '../data/frames';
import {
  ArrowLeft, Palette, Sparkles, Search, X, Grid3x3, Images, Clock, RefreshCw, Heart, Upload, Trash2, CheckCircle2, ScanSearch, Eye, Pencil, SlidersHorizontal, LayoutGrid, Grid2X2, BookmarkCheck, Zap, Sliders,
  Camera, Check, Crown, Wand2, UploadCloud, Download, Star, Lock, Film
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, type Variants } from 'framer-motion';

type SlotCoord = FrameTemplate['slotCoords'][number];

const HIDDEN_FRAMES_STORAGE_KEY = 'balisnap-hidden-frames';
const FRAME_NAME_OVERRIDES_STORAGE_KEY = 'balisnap-frame-name-overrides';

function loadHiddenFrameIds(): Set<string> {
  try {
    const stored = localStorage.getItem(HIDDEN_FRAMES_STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) return new Set(parsed);
    return new Set();
  } catch {
    return new Set();
  }
}

function loadFrameNameOverrides(): Record<string, string> {
  try {
    const stored = localStorage.getItem(FRAME_NAME_OVERRIDES_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return {};
  } catch {
    return {};
  }
}

// PUSTAKA KATA-KATA ESTETIK UNTUK KOMBINASI NAMA UNIK (TANPA ANGKA / SIMBOL)
const FIRST_WORDS: Record<string, string[]> = {
  cute: ['Pink', 'Honey', 'Sweet', 'Fluffy', 'Rosy', 'Peach', 'Vanilla', 'Baby', 'Cotton', 'Jelly', 'Blush', 'Daisy', 'Sugar', 'Butter', 'Pastel', 'Berry', 'Chubby', 'Cozy'],
  korean: ['Seoul', 'Minimal', 'Satin', 'Chiffon', 'Linen', 'Pale', 'Pure', 'Soft', 'Velvet', 'Dewy', 'Silent', 'Blue', 'Ivory', 'Monochrome', 'Calm', 'Breeze', 'Urban'],
  polaroid: ['Golden', 'Faded', 'Sunlit', 'Warm', 'Instant', 'Amber', 'Timeless', 'Vintage', 'Dusty', 'Sepia', 'Cozy', 'Retro', 'Analog', 'Solitary', 'Rustic', 'Memoir'],
  retro: ['Groovy', 'Vinyl', 'Cassette', 'Disco', 'Analogue', 'Classic', 'Sunset', 'Oldschool', 'Radiant', 'Nostalgic', 'Neon', 'Vintage', 'Midcentury', 'Vibrant', 'Retro'],
  filmstrip: ['Cinema', 'Silver', 'Kodak', 'Monochrome', 'Analog', 'Cine', 'Midnight', 'Ethereal', 'Shadow', 'Reel', 'Halide', 'Noir', 'Grainy', 'Darkroom', 'Strip'],
  custom: ['Velvet', 'Ethereal', 'Aura', 'Luminous', 'Celestial', 'Opalline', 'Radiant', 'Studio', 'Aesthetic', 'Urban', 'Cosmic', 'Serene', 'Chic', 'Solace', 'Mirage']
};

const SECOND_WORDS: Record<string, string[]> = {
  cute: ['Serenade', 'Blossom', 'Kiss', 'Haze', 'Pop', 'Cloud', 'Milkshake', 'Sunday', 'Melody', 'Cheeks', 'Bunny', 'Parfait', 'Petal', 'Charm', 'Giggle', 'Dream'],
  korean: ['Journal', 'Whisper', 'Radiance', 'Vibe', 'Dew', 'Muse', 'Linen', 'Atmosphere', 'Echo', 'Hour', 'Solace', 'Essence', 'Poem', 'Aura', 'Canvas', 'Breeze'],
  polaroid: ['Memory', 'Nostalgia', 'Snapshots', 'Glow', 'Journal', 'Chronicle', 'Frame', 'Memoir', 'Echo', 'Haven', 'Vista', 'Impression', 'Reminiscence', 'Archive'],
  retro: ['Romance', 'Era', 'Scrapbook', 'Boulevard', 'Symphony', 'Velour', 'Serenade', 'Tune', 'Club', 'Melody', 'Vibe', 'Cassette', 'Jukebox', 'Groove', 'Rhythm'],
  filmstrip: ['Halide', 'Chronicle', 'Moments', 'Echo', 'Reel', 'Frame', 'Strip', 'Cinema', 'Archive', 'Motion', 'Exposition', 'Negatives', 'Capture', 'Perspective'],
  custom: ['Archive', 'Aura', 'Essence', 'Canvas', 'Dreams', 'Glitch', 'Edit', 'Exclusive', 'Mirage', 'Cascade', 'Elegance', 'Spectrum', 'Visage', 'Illusion']
};

// GENERATOR DENGAN SISTEM PENGECEKAN KEUNIKAN AGAR TIDAK BISA KEMBAR
function generateUniqueAestheticName(category: string, existingNames: string[]): string {
  const firsts = FIRST_WORDS[category] || FIRST_WORDS.custom;
  const seconds = SECOND_WORDS[category] || SECOND_WORDS.custom;

  const existingSet = new Set(existingNames.map((n) => n.toLowerCase().trim()));

  for (let i = 0; i < 150; i++) {
    const f = firsts[Math.floor(Math.random() * firsts.length)];
    const s = seconds[Math.floor(Math.random() * seconds.length)];
    const candidate = `${f} ${s}`;

    if (!existingSet.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  const f = firsts[Math.floor(Math.random() * firsts.length)];
  const s = seconds[Math.floor(Math.random() * seconds.length)];
  return `${f} ${s} Edit`;
}

function autoDetectPhotoSlots(
  canvas: HTMLCanvasElement,
  numSlots: number,
  tolerance: number = 60
): (SlotCoord | null)[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return Array(numSlots).fill(null);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  const labels = new Int32Array(totalPixels).fill(-1);

  interface CompStats {
    area: number;
    minX: number; maxX: number; minY: number; maxY: number;
    touchesBorder: boolean;
    transparentPixels: number;
    opaquePixels: number;
  }
  const stats: CompStats[] = [];
  const stack: number[] = [];

  for (let start = 0; start < totalPixels; start++) {
    if (labels[start] !== -1) continue;

    const startIdx = start * 4;
    const seedA = data[startIdx + 3];
    const seedIsTransparent = seedA < 10;
    const seedR = data[startIdx];
    const seedG = data[startIdx + 1];
    const seedB = data[startIdx + 2];

    const label = stats.length;
    const s: CompStats = {
      area: 0,
      minX: width, maxX: 0, minY: height, maxY: 0,
      touchesBorder: false,
      transparentPixels: 0,
      opaquePixels: 0,
    };

    stack.length = 0;
    stack.push(start);
    labels[start] = label;

    while (stack.length) {
      const p = stack.pop() as number;
      const px = p % width;
      const py = (p - px) / width;
      const idx = p * 4;

      const a = data[idx + 3];
      const isTransparent = a < 10;

      s.area++;
      if (px < s.minX) s.minX = px;
      if (px > s.maxX) s.maxX = px;
      if (py < s.minY) s.minY = py;
      if (py > s.maxY) s.maxY = py;
      if (px === 0 || py === 0 || px === width - 1 || py === height - 1) {
        s.touchesBorder = true;
      }
      if (isTransparent) s.transparentPixels++; else s.opaquePixels++;

      const neighbors: [number, number][] = [
        [px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (labels[ni] !== -1) continue;
        const nIdx = ni * 4;
        const nA = data[nIdx + 3];
        const nIsTransparent = nA < 10;
        let nMatch: boolean;
        if (seedIsTransparent) {
          nMatch = nIsTransparent;
        } else {
          if (nIsTransparent) {
            nMatch = false;
          } else {
            const dr = data[nIdx] - seedR;
            const dg = data[nIdx + 1] - seedG;
            const db = data[nIdx + 2] - seedB;
            nMatch = Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance;
          }
        }
        if (!nMatch) continue;
        labels[ni] = label;
        stack.push(ni);
      }
    }
    stats.push(s);
  }

  interface Candidate {
    label: number;
    x: number; y: number; w: number; h: number;
    area: number;
    isTransparent: boolean;
  }
  const candidates: Candidate[] = [];
  const minAreaFrac = 0.002;
  const maxAreaFrac = numSlots <= 1 ? 0.95 : Math.min(0.88, 2.2 / numSlots);

  stats.forEach((s, label) => {
    if (s.touchesBorder) return;
    const areaFrac = s.area / totalPixels;
    if (areaFrac < minAreaFrac || areaFrac > maxAreaFrac) return;

    const bboxW = s.maxX - s.minX + 1;
    const bboxH = s.maxY - s.minY + 1;
    const bboxArea = bboxW * bboxH;
    const fillRatio = s.area / bboxArea;
    const isTransparent = s.transparentPixels > s.opaquePixels;

    if (!isTransparent && fillRatio < 0.45) return;

    candidates.push({
      label,
      x: s.minX, y: s.minY, w: bboxW, h: bboxH,
      area: s.area,
      isTransparent,
    });
  });

  candidates.sort((a, b) => {
    if (a.isTransparent !== b.isTransparent) return a.isTransparent ? -1 : 1;
    return b.area - a.area;
  });

  const chosen: Candidate[] = [];
  const overlapsChosen = (c: Candidate) => {
    for (const picked of chosen) {
      const ix1 = Math.max(c.x, picked.x);
      const iy1 = Math.max(c.y, picked.y);
      const ix2 = Math.min(c.x + c.w, picked.x + picked.w);
      const iy2 = Math.min(c.y + c.h, picked.y + picked.h);
      if (ix2 <= ix1 || iy2 <= iy1) continue;
      const overlapArea = (ix2 - ix1) * (iy2 - iy1);
      const overlapFrac = overlapArea / Math.min(c.w * c.h, picked.w * picked.h);
      if (overlapFrac > 0.15) return true;
    }
    return false;
  };

  for (const c of candidates) {
    if (chosen.length >= numSlots) break;
    if (overlapsChosen(c)) continue;
    chosen.push(c);
  }

  chosen.sort((a, b) => {
    const colA = Math.floor(a.x / (width / 2));
    const colB = Math.floor(b.x / (width / 2));
    if (colA !== colB) return colA - colB;
    return a.y - b.y;
  });

  const result: (SlotCoord | null)[] = chosen.map((c) => ({
    x: c.x, y: c.y, w: c.w, h: c.h,
    rx: Math.round(Math.min(c.w, c.h) * 0.03),
  }));
  while (result.length < numSlots) result.push(null);

  return result;
}

const SLOT_GRID_LAYOUTS: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  3: { cols: 1, rows: 3 },
  4: { cols: 1, rows: 4 },
  6: { cols: 2, rows: 3 },
  8: { cols: 2, rows: 4 },
};

function generateGridSlots(width: number, height: number, numSlots: number): SlotCoord[] {
  const layout = SLOT_GRID_LAYOUTS[numSlots] || { cols: 1, rows: numSlots };
  const { cols, rows } = layout;

  const slots: SlotCoord[] = [];

  if (cols === 2) {
    const framePaddingX = width * 0.06;
    const centerDividerW = width * 0.04;
    const usableW = width - (framePaddingX * 2) - centerDividerW;
    const cellW = usableW / 2;

    const framePaddingTop = height * 0.07;
    const framePaddingBottom = height * 0.05;
    const gutterY = height * 0.018;
    const usableH = height - framePaddingTop - framePaddingBottom - (gutterY * (rows - 1));
    const cellH = usableH / rows;

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = Math.round(col === 0 ? framePaddingX : framePaddingX + cellW + centerDividerW);
        const y = Math.round(framePaddingTop + row * (cellH + gutterY));
        slots.push({ x, y, w: Math.round(cellW), h: Math.round(cellH), rx: Math.round(Math.min(cellW, cellH) * 0.02) });
      }
    }
  } else {
    const marginX = width * 0.08;
    const marginY = height * 0.08;
    const gutterY = rows > 1 ? height * 0.02 : 0;

    const usableW = Math.max(1, width - marginX * 2);
    const usableH = Math.max(1, height - marginY * 2 - gutterY * (rows - 1));
    const cellW = usableW / cols;
    const cellH = usableH / rows;

    for (let i = 0; i < numSlots; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = Math.round(marginX + col * cellW);
      const y = Math.round(marginY + row * (cellH + gutterY));
      slots.push({ x, y, w: Math.round(cellW), h: Math.round(cellH), rx: Math.round(Math.min(cellW, cellH) * 0.02) });
    }
  }
  return slots;
}

const CURSOR_TRAIL_EMOJIS = ['✨', '💖', '🌸', '⭐', '🎀', '🦄', '💫'];

const CursorTrail: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const lastAddRef = useRef(0);
  const idCounterRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastAddRef.current < 60) return;
      lastAddRef.current = now;
      const id = idCounterRef.current++;
      const emoji = CURSOR_TRAIL_EMOJIS[Math.floor(Math.random() * CURSOR_TRAIL_EMOJIS.length)];
      setParticles((prev) => [...prev.slice(-14), { id, x: e.clientX, y: e.clientY, emoji }]);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, scale: 0.6, x: p.x, y: p.y }}
            animate={{ opacity: 0, scale: 1.4, y: p.y - 45, x: p.x + (Math.random() * 30 - 15) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            onAnimationComplete={() => setParticles((prev) => prev.filter((pp) => pp.id !== p.id))}
            className="absolute text-base select-none filter drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]"
            style={{ left: 0, top: 0 }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

const getCategoryBgGradient = (cat: string) => {
  switch (cat) {
    case 'polaroid':
      return 'bg-gradient-to-br from-[#FFFDF9] via-[#FDF6ED] to-[#F7EBD9] border-amber-300/40';
    case 'korean':
      return 'bg-gradient-to-br from-[#F5F8FF] via-[#EBF1FF] to-[#DCE6FF] border-indigo-300/40';
    case 'cute':
      return 'bg-gradient-to-br from-[#FFF5F8] via-[#FDE8F0] to-[#FBCFE0] border-pink-300/50';
    case 'retro':
      return 'bg-gradient-to-br from-[#FAF5EC] via-[#F3E8D3] to-[#E8D4B1] border-amber-400/40';
    case 'filmstrip':
      return 'bg-gradient-to-br from-[#F8F9FA] via-[#E9ECEF] to-[#DEE2E6] border-zinc-300/50';
    case 'custom':
      return 'bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] border-purple-300/50';
    default:
      return 'bg-gradient-to-br from-[#FFFFFF] via-[#F8F9FA] to-[#F1F3F5] border-zinc-200';
  }
};

const FrameCard: React.FC<{
  frame: FrameTemplate;
  idx: number;
  isTrending: boolean;
  isFavorite: boolean;
  isCustom: boolean;
  categoryStyle: any;
  currentTier: PackageTier;
  onFavorite: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onClick: () => void;
}> = ({ frame, idx: _idx, isTrending, isFavorite, isCustom: _isCustom, categoryStyle, currentTier, onFavorite, onDelete, onEdit, onClick }) => {
  const requiredTier = getFrameRequiredTier(frame);
  const isLocked = isFrameLocked(frame, currentTier);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.94 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const } }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative bg-white/70 hover:bg-white/95 backdrop-blur-xl border-2 border-pink-100/80 hover:border-pink-400/80 rounded-[32px] p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(244,114,182,0.08)] hover:shadow-[0_20px_45px_rgba(236,72,153,0.22)] transition-all duration-300 cursor-pointer overflow-hidden text-left select-none h-full"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

      <div className="flex justify-between items-start w-full mb-3 z-10">
        <div className="flex flex-col gap-1 items-start">
          <span className="text-3xl filter drop-shadow-md group-hover:scale-125 transition-transform duration-300">{categoryStyle.icon}</span>
          {isTrending && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-md shadow-pink-500/30">
              <Sparkles className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '3s' }} /> Hot 🔥
            </span>
          )}
        </div>

        <div className="flex gap-1.5 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(e); }}
            className="w-8 h-8 rounded-2xl bg-white/90 border border-rose-100 flex items-center justify-center hover:bg-rose-50 shadow-sm transition-all active:scale-90 cursor-pointer"
            title="Favorit"
          >
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-pink-500 text-pink-500 scale-110' : 'text-rose-300 hover:text-pink-400'}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(e); }}
            className="w-8 h-8 rounded-2xl bg-white/90 border border-sky-100 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-50 shadow-sm active:scale-90 cursor-pointer"
            title="Ubah Nama"
          >
            <Pencil className="w-3.5 h-3.5 text-sky-400 hover:text-sky-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className="w-8 h-8 rounded-2xl bg-white/90 border border-rose-100 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 shadow-sm active:scale-90 cursor-pointer"
            title="Hapus Frame"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400 hover:text-rose-600" />
          </button>
        </div>
      </div>

      <div className={`relative aspect-[3/4] w-full ${getCategoryBgGradient(frame.category)} rounded-2xl p-3 flex items-center justify-center border shadow-inner overflow-hidden mb-3.5 transition-all duration-300 z-10`}>
        <div className="relative w-full h-full bg-white/95 rounded-xl shadow-lg border border-white/90 p-2.5 flex items-center justify-center overflow-hidden">
          <img src={frame.src} alt={frame.name} className="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
        </div>

        {/* Lock Overlay Badge for Locked Frames */}
        {isLocked ? (
          <div className="absolute inset-0 bg-zinc-950/55 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center p-3 text-center z-30 transition-all">
            <div className={`p-2.5 rounded-2xl mb-2 border shadow-lg ${requiredTier === 'premium' ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 border-yellow-400/40 text-yellow-300' : 'bg-gradient-to-r from-pink-500 to-rose-500 border-white/40 text-white'}`}>
              {requiredTier === 'premium' ? <Crown className="w-5 h-5 animate-bounce fill-yellow-300" /> : <Lock className="w-5 h-5 text-white" />}
            </div>
            <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md border ${requiredTier === 'premium' ? 'bg-purple-900/90 text-yellow-300 border-yellow-400/40' : 'bg-pink-600/90 text-white border-pink-300/40'}`}>
              {requiredTier === 'premium' ? '👑 VIP PREMIUM (135k)' : '🔒 BASIC PASS (25k)'}
            </span>
            <span className="text-[9px] text-white/90 font-bold mt-1.5 drop-shadow-sm">
              Klik Untuk Buka 🔓
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-zinc-950/10 to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
            <span className="px-4 py-2 rounded-full bg-white text-zinc-900 font-extrabold text-[10px] tracking-wider uppercase shadow-xl flex items-center gap-1.5 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
              <Eye className="w-3.5 h-3.5 text-pink-500 animate-pulse" /> Intip Frame
            </span>
          </div>
        )}
      </div>

      <div className="w-full pt-2.5 border-t-2 border-dashed border-rose-100/90 z-10">
        <h3 className="font-sans font-extrabold text-zinc-800 text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">{frame.name}</h3>
        <div className="flex items-center justify-between mt-2 text-[10px] font-black text-zinc-400">
          <span className="flex items-center gap-1 text-pink-600 bg-pink-100/80 px-2.5 py-0.5 rounded-full border border-pink-200/50">
            <Images className="w-3 h-3 text-pink-500" /> {frame.slots} Slot
          </span>
          <span className="bg-purple-100/80 text-purple-700 border border-purple-200/50 px-2.5 py-0.5 rounded-full capitalize">
            {frame.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const SelectFrame: React.FC = () => {
  const context = usePhotobooth();
  if (!context) {
    throw new Error('SelectFrame must be used within a PhotoboothProvider');
  }
  const { selectFrame, setStep, customFrames, addCustomFrame, deleteCustomFrame, packageTier, setPackageTier } = context;

  // Upgrade & Checkout Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalTier, setUpgradeModalTier] = useState<PackageTier>('basic');
  const [upgradeModalFrame, setUpgradeModalFrame] = useState<FrameTemplate | null>(null);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | undefined>(undefined);

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutModalTier, setCheckoutModalTier] = useState<PackageTier>('basic');

  const handleOpenCheckoutModal = useCallback((tier: PackageTier) => {
    if (tier === 'free') {
      setPackageTier('free');
    } else {
      setCheckoutModalTier(tier);
      setCheckoutModalOpen(true);
    }
  }, [setPackageTier]);

  const handleOpenUpgradeModal = useCallback((tier: PackageTier, frame?: FrameTemplate | null, featureName?: string) => {
    setUpgradeModalTier(tier);
    setUpgradeModalFrame(frame || null);
    setUpgradeModalFeature(featureName);
    setUpgradeModalOpen(true);
  }, []);
  const [slotFilter, setSlotFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('popular');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [onlyFavoritesFilter, setOnlyFavoritesFilter] = useState(false);
  const [gridColsLayout, setGridColsLayout] = useState<'standard' | 'compact'>('standard');

  const [previewFrame, setPreviewFrame] = useState<FrameTemplate | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isConfirmingSelection, setIsConfirmingSelection] = useState(false);

  const bX = useMotionValue(0);
  const bY = useMotionValue(0);

  function handleKawaiiMouseMove({ clientX, clientY, currentTarget }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    bX.set(clientX - left);
    bY.set(clientY - top);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(800px circle at ${bX}px ${bY}px, rgba(236,72,153,0.15), rgba(168,85,247,0.08) 40%, transparent 80%)`;

  const [hiddenFrameIds, setHiddenFrameIds] = useState<Set<string>>(() => loadHiddenFrameIds());

  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_FRAMES_STORAGE_KEY, JSON.stringify(Array.from(hiddenFrameIds)));
    } catch { }
  }, [hiddenFrameIds]);

  const [frameNameOverrides, setFrameNameOverrides] = useState<Record<string, string>>(() => loadFrameNameOverrides());

  useEffect(() => {
    try {
      localStorage.setItem(FRAME_NAME_OVERRIDES_STORAGE_KEY, JSON.stringify(frameNameOverrides));
    } catch { }
  }, [frameNameOverrides]);

  const [renameTarget, setRenameTarget] = useState<FrameTemplate | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

  const handleOpenRename = useCallback((frame: FrameTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameTarget(frame);
    setRenameValue(frame.name);
    setRenameError(null);
  }, []);

  const handleCloseRename = useCallback(() => {
    setRenameTarget(null);
    setRenameValue('');
    setRenameError(null);
  }, []);

  const handleSaveRename = useCallback(() => {
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameError('Nama frame tidak boleh kosong.');
      return;
    }
    setFrameNameOverrides((prev) => ({ ...prev, [renameTarget.id]: trimmed }));
    handleCloseRename();
  }, [renameTarget, renameValue, handleCloseRename]);

  const handleResetRenameToDefault = useCallback(() => {
    if (!renameTarget) return;
    setFrameNameOverrides((prev) => {
      const next = { ...prev };
      delete next[renameTarget.id];
      return next;
    });
    handleCloseRename();
  }, [renameTarget, handleCloseRename]);

  const [deleteTarget, setDeleteTarget] = useState<FrameTemplate | null>(null);
  const [deleteToastMessage, setDeleteToastMessage] = useState<string | null>(null);

  const handleOpenDeleteConfirm = useCallback((frame: FrameTemplate, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setDeleteTarget(frame);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    const frameId = deleteTarget.id;
    const frameName = deleteTarget.name;

    setHiddenFrameIds((prev) => {
      const next = new Set(prev);
      next.add(frameId);
      return next;
    });

    if (frameId.startsWith('custom-') || customFrames.some((c) => c.id === frameId)) {
      deleteCustomFrame(frameId);
      fetch('/api/delete-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: frameId }),
      }).catch((err) => {
        console.warn('Permanent file deletion failed:', err);
      });
    }

    setDeleteTarget(null);
    setDeleteToastMessage(`Bingkai "${frameName}" berhasil dihapus ✨`);
    setTimeout(() => {
      setDeleteToastMessage(null);
    }, 3000);
  }, [deleteTarget, customFrames, deleteCustomFrame]);

  // STATE MODAL UPLOAD BINGKAI KUSTOM
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<FrameTemplate['category']>('custom');
  const [uploadSlots, setUploadSlots] = useState(1);
  const [uploadImageDims, setUploadImageDims] = useState<{ w: number; h: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [detectionTolerance, setDetectionTolerance] = useState<number>(60);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const [customSlotCoords, setCustomSlotCoords] = useState<(SlotCoord | null)[]>([null]);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const rawAllFrames = useMemo(() => {
    const seenIds = new Set<string>();
    const result: FrameTemplate[] = [];
    for (const f of [...customFrames, ...frames]) {
      if (!seenIds.has(f.id) && !hiddenFrameIds.has(f.id)) {
        seenIds.add(f.id);
        result.push(f);
      }
    }
    return result;
  }, [customFrames, hiddenFrameIds]);

  const allFrames = useMemo(
    () => rawAllFrames.map((f) => (frameNameOverrides[f.id] ? { ...f, name: frameNameOverrides[f.id] } : f)),
    [rawAllFrames, frameNameOverrides]
  );

  // AUTO-PERBAIKAN NAMA ANOMALI PADA SEMUA FRAME (LIBRARY BAWAAN MAUPUN KUSTOM UPLOAD)
  // (mis. "hem", "ahhh", dsb — nama singkat/asal-asalan yang bukan hasil generator estetik)
  // Nama tersebut otomatis diseleksi & diganti dengan nama estetik unik keren modern
  // sesuai tema/kategori frame-nya masing-masing (cute, korean, retro, polaroid, filmstrip, custom),
  // lalu disimpan permanen via frameNameOverrides supaya tidak diproses ulang & tidak berubah lagi
  // di kunjungan berikutnya (sekali fix, permanen).
  const anomalyFixRanRef = useRef(false);

  useEffect(() => {
    if (anomalyFixRanRef.current) return;
    if (rawAllFrames.length === 0) return;
    anomalyFixRanRef.current = true;

    // Nama dianggap "estetik" jika berupa 2 kata berawalan huruf kapital (huruf saja),
    // persis seperti pola hasil generateUniqueAestheticName. Selain itu dianggap anomali
    // (nama pendek/gado-gado seperti "hem", "ahhh", "tes", "asdf", dsb).
    const isAestheticName = (name: string): boolean => {
      const parts = name.trim().split(/\s+/);
      if (parts.length !== 2) return false;
      return parts.every((p) => /^[A-Z][a-zA-Z]*$/.test(p));
    };

    setFrameNameOverrides((prev) => {
      const next = { ...prev };
      const existingNames = allFrames.map((f) => (next[f.id] ? next[f.id] : f.name));
      let changed = false;

      // Berlaku untuk SEMUA frame yang tampil — bawaan library maupun kustom upload —
      // bukan hanya frame kustom, karena nama anomali bisa muncul di keduanya.
      for (const fr of rawAllFrames) {
        if (next[fr.id]) continue; // sudah punya nama override (manual/otomatis), jangan diutak-atik lagi
        if (isAestheticName(fr.name)) continue; // nama sudah estetik, biarkan apa adanya

        const newName = generateUniqueAestheticName(fr.category, existingNames);
        next[fr.id] = newName;
        existingNames.push(newName);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [rawAllFrames, allFrames]);

  const runAutoDetect = useCallback((slots: number, tolerance: number = 60) => {
    const original = originalCanvasRef.current;
    if (!original) return;

    setIsAutoDetecting(true);
    setUploadError(null);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = original.width;
      canvas.height = original.height;
      const realCtx = canvas.getContext('2d');
      if (!realCtx) return;
      realCtx.drawImage(original, 0, 0);

      const detected = autoDetectPhotoSlots(canvas, slots, tolerance);
      const gridSlots = generateGridSlots(original.width, original.height, slots);

      const finalSlots: SlotCoord[] = Array.from({ length: slots }).map((_, i) => {
        return detected[i] || gridSlots[i] || { x: 0, y: 0, w: original.width, h: original.height, rx: 10 };
      });

      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = original.width;
      resultCanvas.height = original.height;
      const resCtx = resultCanvas.getContext('2d');
      if (resCtx) {
        resCtx.drawImage(original, 0, 0);
        finalSlots.forEach((s) => {
          if (s) resCtx.clearRect(s.x, s.y, s.w, s.h);
        });
      }

      workingCanvasRef.current = resultCanvas;
      setPreviewSrc(resultCanvas.toDataURL('image/png'));
      setCustomSlotCoords(finalSlots);
      setUploadError(null);
      setIsAutoDetecting(false);
    }, 30);
  }, []);

  const initWorkingCanvas = useCallback((dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      const MAX_DIM = 2000;
      let targetW = img.naturalWidth;
      let targetH = img.naturalHeight;
      if (targetW > MAX_DIM || targetH > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / targetW, MAX_DIM / targetH);
        targetW = Math.round(targetW * ratio);
        targetH = Math.round(targetH * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const originalCopy = document.createElement('canvas');
      originalCopy.width = targetW;
      originalCopy.height = targetH;
      originalCopy.getContext('2d')?.drawImage(canvas, 0, 0);

      workingCanvasRef.current = canvas;
      originalCanvasRef.current = originalCopy;

      setUploadImageDims({ w: targetW, h: targetH });
      setPreviewSrc(canvas.toDataURL('image/png'));
      setCustomSlotCoords(Array(uploadSlots).fill(null));
      runAutoDetect(uploadSlots, detectionTolerance);
    };
    img.onerror = () => {
      setUploadError('Gagal memproses file gambar. Silakan gunakan format file gambar lain.');
    };
    img.src = dataUrl;
  }, [uploadSlots, runAutoDetect, detectionTolerance]);

  const processUploadedFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setUploadError('Ekstensi file tidak valid. Harap pilih gambar.'); return; }
    if (file.size > 15 * 1024 * 1024) { setUploadError('Ukuran file maksimal 15 MB.'); return; }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      initWorkingCanvas(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [initWorkingCanvas]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  }, [processUploadedFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  const _handleResetAll = useCallback(() => {
    runAutoDetect(uploadSlots, detectionTolerance);
  }, [uploadSlots, detectionTolerance, runAutoDetect]);

  const handleRemoveImage = useCallback(() => {
    workingCanvasRef.current = null;
    originalCanvasRef.current = null;
    setPreviewSrc(null);
    setUploadImageDims(null);
    setCustomSlotCoords(Array(uploadSlots).fill(null));
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadSlots]);

  const handleSlotsChange = useCallback((slots: number) => {
    setUploadSlots(slots);
    if (originalCanvasRef.current) {
      runAutoDetect(slots, detectionTolerance);
    } else {
      setCustomSlotCoords(Array(slots).fill(null));
    }
  }, [runAutoDetect, detectionTolerance]);

  const handleToleranceChange = useCallback((tol: number) => {
    setDetectionTolerance(tol);
    if (originalCanvasRef.current) {
      runAutoDetect(uploadSlots, tol);
    }
  }, [runAutoDetect, uploadSlots]);

  // SUBMIT PENDAFTARAN FRAME (DENGAN GENERATOR NAMA SANGAT VARIASI DAN 100% UNIK)
  const handleUploadSubmit = useCallback(() => {
    if (!workingCanvasRef.current || !uploadImageDims) { setUploadError('Pilih file gambar frame terlebih dahulu.'); return; }

    // Ambil daftar seluruh nama yang sudah ada untuk menjamin tidak ada nama kembar
    const existingNames = allFrames.map((f) => f.name);
    const autoGeneratedName = generateUniqueAestheticName(uploadCategory, existingNames);

    const validSlots = customSlotCoords.filter((s): s is NonNullable<typeof s> => s !== null);
    if (validSlots.length < uploadSlots) {
      const grid = generateGridSlots(uploadImageDims.w, uploadImageDims.h, uploadSlots);
      validSlots.push(...grid.slice(validSlots.length));
    }

    const finalSrc = workingCanvasRef.current.toDataURL('image/png');
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFrame: FrameTemplate = {
      id,
      name: autoGeneratedName,
      slots: uploadSlots,
      category: uploadCategory,
      src: finalSrc,
      width: uploadImageDims.w,
      height: uploadImageDims.h,
      slotCoords: validSlots,
    };

    addCustomFrame(newFrame);

    fetch('/api/save-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFrame),
    }).catch(() => { });

    setUploadSuccess(true);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadSuccess(false);
      setUploadCategory('custom');
      setUploadSlots(1);
      workingCanvasRef.current = null;
      originalCanvasRef.current = null;
      setPreviewSrc(null);
      setUploadImageDims(null);
      setUploadError(null);
      setCustomSlotCoords([null]);
    }, 1200);
  }, [uploadImageDims, uploadSlots, uploadCategory, customSlotCoords, addCustomFrame, allFrames]);

  const trendingIds = ['film-classic-1', 'polaroid-single', 'korean-pink-3', 'cute-hearts-1', 'retro-vintage-1'];

  const categoryStyles: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
    filmstrip: { bg: 'bg-white', border: 'border-pink-100', icon: '🎞️', accent: 'text-pink-500' },
    korean: { bg: 'bg-white', border: 'border-pink-100', icon: '🇰🇷', accent: 'text-indigo-500' },
    polaroid: { bg: 'bg-white', border: 'border-pink-100', icon: '📸', accent: 'text-amber-500' },
    cute: { bg: 'bg-white', border: 'border-pink-100', icon: '🎀', accent: 'text-rose-500' },
    retro: { bg: 'bg-white', border: 'border-pink-100', icon: '🎫', accent: 'text-amber-600' },
    custom: { bg: 'bg-white', border: 'border-pink-100', icon: '📁', accent: 'text-purple-500' },
  };

  const slotFilters = [
    { label: 'Semua Grid', value: 'all' as const },
    { label: '1 Slot', value: 1 },
    { label: '2 Slot', value: 2 },
    { label: '3 Slot', value: 3 },
    { label: '4 Slot', value: 4 },
    { label: '6 Slot', value: 6 },
    { label: '8 Slot', value: 8 },
  ];

  const categoryFilters = useMemo(() => [
    { label: 'Semua Style', value: 'all', emoji: '✨' },
    { label: 'Film Strip', value: 'filmstrip', emoji: '🎞️' },
    { label: 'Korean Style', value: 'korean', emoji: '🇰🇷' },
    { label: 'Polaroid', value: 'polaroid', emoji: '📸' },
    { label: 'Cute Kawaii', value: 'cute', emoji: '🎀' },
    { label: 'Retro Vintage', value: 'retro', emoji: '🎫' },
    { label: 'Custom Upload', value: 'custom', emoji: '📁' },
  ], []);

  const getCategoryCount = useCallback((category: string) => {
    if (category === 'all') return allFrames.length;
    if (category === 'custom') {
      return allFrames.filter((f) => f.category === 'custom' || f.id.startsWith('custom-')).length;
    }
    return allFrames.filter((f) => f.category === category).length;
  }, [allFrames]);

  const filteredFrames = useMemo(() => {
    let result = allFrames.filter((frame) => {
      const matchesSlot = slotFilter === 'all' || frame.slots === slotFilter;
      const matchesCat = categoryFilter === 'all'
        ? true
        : categoryFilter === 'custom'
          ? (frame.category === 'custom' || frame.id.startsWith('custom-'))
          : frame.category === categoryFilter;

      const matchesSearch =
        frame.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        frame.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = !onlyFavoritesFilter || favorites.has(frame.id);
      return matchesSlot && matchesCat && matchesSearch && matchesFav;
    });

    if (sortBy === 'popular') {
      result = result.sort((a, b) => {
        const aTrend = trendingIds.includes(a.id) ? 1 : 0;
        const bTrend = trendingIds.includes(b.id) ? 1 : 0;
        return bTrend - aTrend;
      });
    } else if (sortBy === 'newest') {
      result = result.sort((a, b) => a.id.localeCompare(b.id));
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [slotFilter, categoryFilter, searchQuery, sortBy, onlyFavoritesFilter, favorites, allFrames]);

  const handleFrameClick = (frame: FrameTemplate) => {
    const locked = isFrameLocked(frame, packageTier);
    if (locked) {
      const req = getFrameRequiredTier(frame);
      handleOpenUpgradeModal(req, frame);
      return;
    }
    setPreviewFrame(frame);
    setPreviewVisible(true);
    setIsConfirmingSelection(false);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setIsConfirmingSelection(false);
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, i) => ({
        id: i,
        angle: (i / 32) * 360 + Math.random() * 15,
        distance: 110 + Math.random() * 180,
        emoji: ['✨', '💖', '🎀', '⭐', '💫', '🌸', '🔮', '🦄'][i % 8],
        delay: Math.random() * 0.15,
      })),
    []
  );

  const handleConfirmSelectFrame = () => {
    if (!previewFrame) return;
    setIsConfirmingSelection(true);
    setShowConfetti(true);
    setTimeout(() => {
      selectFrame(previewFrame);
      setPreviewVisible(false);
      setIsConfirmingSelection(false);
      setShowConfetti(false);
    }, 700);
  };

  const resetFilters = () => {
    setSlotFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setSortBy('popular');
    setOnlyFavoritesFilter(false);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.88, y: 20, transition: { duration: 0.15 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const cardPopUpVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        delay: i * 0.1,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <>
      <CursorTrail />

      <div
        onMouseMove={handleKawaiiMouseMove}
        className="min-h-screen bg-[#FFF0F5] text-zinc-800 selection:bg-pink-300 py-6 px-4 sm:px-6 lg:px-12 relative overflow-x-hidden antialiased font-sans flex flex-col items-center w-full"
      >
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-200/70 via-purple-100/50 to-pink-100/40 pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#fbcfe8_1px,transparent_1px),linear-gradient(to_bottom,#fbcfe8_1px,transparent_1px)] bg-[size:36px_36px] opacity-30 pointer-events-none z-0" />

        <motion.div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{ background: spotlightBackground }}
        />

        <div className="max-w-7xl w-full relative z-10 flex flex-col gap-6">

          {/* Header Banner Utama */}
          <header className="flex flex-col md:flex-row justify-between items-center text-center md:text-left bg-white/80 backdrop-blur-2xl border-2 border-white p-6 md:p-8 rounded-[36px] shadow-[0_15px_35px_rgba(244,114,182,0.12)] gap-6 w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-300/30 to-purple-300/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col items-center md:items-start z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  onClick={() => setStep('landing')}
                  className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 font-extrabold text-xs tracking-widest uppercase transition-all group px-4 py-1.5 bg-rose-100/80 hover:bg-rose-200/80 rounded-full border border-rose-200 shadow-sm cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Kembali
                </button>

                {/* Active Package Pill Badge */}
                <button
                  onClick={() => {
                    const el = document.getElementById('paket-harga');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border transition-all cursor-pointer ${
                    packageTier === 'premium'
                      ? 'bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-950 text-yellow-300 border-yellow-400/40 shadow-purple-950/20'
                      : packageTier === 'basic'
                      ? 'bg-pink-500 text-white border-pink-300 shadow-pink-500/20'
                      : 'bg-zinc-800 text-white border-zinc-700'
                  }`}
                  title="Klik untuk lihat rincian paket"
                >
                  {packageTier === 'premium' ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-bounce" />
                      <span>👑 VIP Premium Pass</span>
                    </>
                  ) : packageTier === 'basic' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                      <span>💖 Basic Pass</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-pink-300" />
                      <span>🆓 Free Pass</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                Pilih{' '}
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-transparent bg-clip-text drop-shadow-sm">
                  Bingkai Lucu
                </span>{' '}
                Kamu! ✨
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-2 font-semibold max-w-xl">
                Temukan <span className="font-black text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">{allFrames.length}</span> koleksi layout foto tercantik &amp; paling kekinian!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto z-10">
              <button
                onClick={() => {
                  if (packageTier === 'free' || packageTier === 'basic') {
                    handleOpenUpgradeModal('premium', null, 'Unggah Frame Kustom');
                    return;
                  }
                  setIsUploadModalOpen(true);
                }}
                className="group relative flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer w-full sm:w-auto"
              >
                {packageTier !== 'premium' && <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />}
                <Upload className="w-4 h-4 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                Upload Frame Sendiri 🎀
              </button>
            </div>
          </header>

          {/* Master Control Deck & Filter Bar */}
          <div className="w-full bg-white/80 backdrop-blur-2xl border-2 border-white p-5 md:p-6 rounded-[36px] shadow-[0_12px_30px_rgba(244,114,182,0.1)] flex flex-col gap-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
              <div className="relative md:col-span-6 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="Cari kata kunci bingkai atau style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white/90 border-2 border-rose-100 focus:border-pink-400 rounded-2xl text-xs sm:text-sm text-zinc-800 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-semibold"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500 p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="md:col-span-6 w-full flex flex-wrap sm:flex-nowrap gap-2">
                <div className="flex items-center bg-white/90 border-2 border-rose-100 rounded-2xl px-3.5 py-2.5 w-full shadow-sm">
                  <Clock className="w-4 h-4 text-pink-500 mr-2 flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs sm:text-sm font-extrabold text-zinc-700 focus:outline-none cursor-pointer w-full"
                  >
                    <option value="popular">Paling Populer ⭐</option>
                    <option value="newest">Koleksi Terbaru</option>
                    <option value="name">Abjad A - Z</option>
                  </select>
                </div>

                <button
                  onClick={() => setOnlyFavoritesFilter(!onlyFavoritesFilter)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 font-black text-xs transition-all flex-shrink-0 cursor-pointer ${onlyFavoritesFilter
                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-white/90 border-rose-100 text-rose-400 hover:bg-rose-50'
                    }`}
                  title="Filter Hanya Favorit"
                >
                  <Heart className={`w-4 h-4 ${onlyFavoritesFilter ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">Favorit ({favorites.size})</span>
                </button>

                <div className="flex bg-white/90 border-2 border-rose-100 rounded-2xl p-1 gap-1 flex-shrink-0">
                  <button
                    onClick={() => setGridColsLayout('standard')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${gridColsLayout === 'standard' ? 'bg-pink-500 text-white shadow-sm' : 'text-zinc-400 hover:text-pink-500'}`}
                    title="Tampilan Standar"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridColsLayout('compact')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${gridColsLayout === 'compact' ? 'bg-pink-500 text-white shadow-sm' : 'text-zinc-400 hover:text-pink-500'}`}
                    title="Tampilan Rapat / Padat"
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={resetFilters}
                  className="p-3 bg-white/90 border-2 border-rose-100 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 shadow-sm transition-all flex-shrink-0 cursor-pointer"
                  title="Reset Semua Filter"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Slot Grid */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-pink-500 flex items-center gap-1.5">
                <Grid3x3 className="w-3.5 h-3.5" /> <span>Jumlah Slot Foto</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {slotFilters.map((sf) => (
                  <button
                    key={sf.value}
                    onClick={() => setSlotFilter(sf.value)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer ${slotFilter === sf.value
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-105'
                      : 'bg-white/80 text-zinc-600 border-2 border-rose-100 hover:border-pink-300 hover:bg-white'
                      }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Kategori Tema */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-pink-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> <span>Kategori Tema Estetika</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((cf) => {
                  const isActive = categoryFilter === cf.value;
                  const count = getCategoryCount(cf.value);
                  return (
                    <button
                      key={cf.value}
                      onClick={() => setCategoryFilter(cf.value)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all duration-200 border-2 cursor-pointer ${isActive
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white border-transparent shadow-md shadow-purple-500/25 scale-105'
                        : 'bg-white/80 text-zinc-600 border-rose-100 hover:border-purple-300 hover:bg-white'
                        }`}
                    >
                      <span>{cf.emoji}</span>
                      <span>{cf.label}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-rose-100 text-pink-600'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tampilan Katalog Bingkai */}
          <div className="w-full">
            {filteredFrames.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className={gridColsLayout === 'compact'
                  ? "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 w-full"
                  : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full"
                }
              >
                {filteredFrames.map((frame, idx) => {
                  const isTrending = trendingIds.includes(frame.id);
                  const isFavorite = favorites.has(frame.id);
                  const isCustom = frame.id.startsWith('custom-');
                  const style = categoryStyles[frame.category] || categoryStyles.filmstrip;

                  return (
                    <FrameCard
                      key={frame.id}
                      frame={frame}
                      idx={idx}
                      isTrending={isTrending}
                      isFavorite={isFavorite}
                      isCustom={isCustom}
                      categoryStyle={style}
                      currentTier={packageTier}
                      onFavorite={(e) => toggleFavorite(frame.id, e)}
                      onDelete={(e) => handleOpenDeleteConfirm(frame, e)}
                      onEdit={(e) => handleOpenRename(frame, e)}
                      onClick={() => handleFrameClick(frame)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white/80 backdrop-blur-2xl border-2 border-dashed border-rose-200 rounded-[36px] w-full p-6 shadow-sm"
              >
                <div className="w-16 h-16 bg-rose-100/80 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-lg text-zinc-800">Tidak ada bingkai yang cocok</h3>
                <p className="text-zinc-500 text-xs mt-1 max-w-sm mx-auto font-medium">Coba ubah kata kunci pencarian atau reset filter kamu ya!</p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Setel Ulang Filter
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 bg-white/60 backdrop-blur-md border border-white/60 px-5 py-2.5 rounded-full w-full">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" /> Live Ready &amp; Filter Active
            </span>
            <span className="flex items-center gap-1 text-pink-500">
              <BookmarkCheck className="w-3.5 h-3.5" /> Auto-Sync Active
            </span>
          </div>

          {/* ===== SECTION PAKET & HARGA PHOTOBOOTH STUDIO ===== */}
          <section id="paket-harga" className="relative border-t border-white/80 py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white/80 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-[0_15px_35px_rgba(244,114,182,0.12)] my-4 text-center overflow-hidden w-full">
            <div className="max-w-6xl mx-auto relative z-10">

              {/* Section Header */}
              <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-pink-500" />
                  <span>PILIHAN AKSES STUDIO</span>
                </div>
                <h2 className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-purple-950 tracking-tight leading-tight mb-4">
                  Pilih Paket Photobooth Studiomu! 📸
                </h2>
                <p className="text-purple-950/70 text-xs sm:text-base font-medium leading-relaxed">
                  Abadikan momen serumu bareng pacar, sahabat, atau diri sendiri langsung dari HP atau Laptop tanpa perlu antre ke studio mahal!
                </p>
              </div>

              {/* 3 Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4 sm:pt-6">

                {/* 1. PAKET GRATIS */}
                <motion.div
                  custom={0}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={cardPopUpVariants}
                  style={{ willChange: "transform, opacity" }}
                  className="bg-white/85 border border-white/90 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-md transition-transform duration-200 hover:-translate-y-2 relative text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">🆓</span>
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                        FREE PASS
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-purple-950 mb-1">Paket GRATIS</h3>
                    <p className="text-[11px] text-purple-900/60 font-medium mb-5 min-h-[32px]">
                      💡 Coba fitur dasar &amp; tes kamera langsung tanpa bayar.
                    </p>

                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-purple-950">Rp 0</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md inline-block mt-2">
                        ⏱️ Masa Aktif: 1x Sesi Foto
                      </span>
                    </div>

                    <ul className="space-y-3 text-xs text-purple-950/80 font-medium mb-8">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>🎨 Akses bingkai dasar polos &amp; 2-slot grid.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>🌈 Filter warna standar (Original &amp; B&amp;W).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>📱 Hasil foto pratinjau standar.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-amber-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100 text-[11px]">
                        <span>⚠️ Terdapat watermark logo kecil di sudut foto.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenCheckoutModal('free')}
                    className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 cursor-pointer ${packageTier === 'free' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-purple-950'}`}
                  >
                    {packageTier === 'free' ? '✓ Paket Aktif (Gratis)' : 'Coba Gratis Sekarang'}
                  </button>
                </motion.div>

                {/* 2. PAKET BASIC / SINGLE EVENT */}
                <motion.div
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={cardPopUpVariants}
                  style={{ willChange: "transform, opacity" }}
                  className="bg-white/95 border-2 border-pink-200/90 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-lg transition-transform duration-200 hover:-translate-y-2 relative text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">💖</span>
                      <span className="text-[10px] font-black tracking-widest text-pink-600 uppercase bg-pink-100/80 px-3 py-1 rounded-full">
                        DATE &amp; BESTIE PASS
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-purple-950 mb-1">Paket BASIC</h3>
                    <p className="text-[11px] text-purple-900/60 font-medium mb-5 min-h-[32px]">
                      💖 Pilihan favorit untuk Date Night, Anniversary, atau foto bareng Bestie.
                    </p>

                    <div className="mb-6 pb-6 border-b border-pink-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-purple-950">Rp 25.000</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md inline-block mt-2">
                        ⏱️ Masa Aktif: Pass 24 Jam (Foto Sepuasnya)
                      </span>
                    </div>

                    <ul className="space-y-3 text-xs text-purple-950/80 font-medium mb-8">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>✨ <strong>100% Bebas Watermark</strong> (Hasil bersih ala studio profesional).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>🎨 Akses Bingkai Estetik (Korean, Y2K, Polaroid, Cute, Retro, Filmstrip).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>📐 Pilihan Grid Foto (1, 2, 3, hingga 4 Slot Foto).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>🌈 Bebas Pakai Semua Filter Warna (Vintage, Cool, Vivid, Sepia, B&amp;W).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>🎀 <strong>Sticker Studio &amp; Text Overlay</strong> (Tambah stiker digital &amp; tulisan nama/tanggal).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>📱 Hasil Foto HD Jernih + Unduh Instant Ke HP.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenCheckoutModal('basic')}
                    className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer ${packageTier === 'basic' ? 'bg-emerald-500 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}`}
                  >
                    {packageTier === 'basic' ? '✓ Paket Aktif (Basic)' : 'Pilih Paket Basic'}
                  </button>
                </motion.div>

                {/* 3. PAKET PREMIUM / VIP CREATOR PASS */}
                <motion.div
                  custom={2}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={cardPopUpVariants}
                  style={{ willChange: "transform, opacity" }}
                  className="bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 border-2 border-pink-400 text-white rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-transform duration-200 hover:-translate-y-2 relative text-left"
                >
                  {/* Badge Populer */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap z-30 border border-white/30">
                    <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
                    <span>⭐ VIP UNLIMITED &amp; FULL ACCESS</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4 mt-2">
                      <span className="text-2xl">👑</span>
                      <span className="text-[10px] font-black tracking-widest text-pink-300 uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
                        VIP CREATOR &amp; EVENT PRO
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-white mb-1">Paket PREMIUM</h3>
                    <p className="text-[11px] text-pink-200/80 font-medium mb-5 min-h-[32px]">
                      👑 Solusi komplit! Bebas foto sepuasnya 60 Hari + Upload Canva Frame Sendiri &amp; Fitur Custom Pro.
                    </p>

                    <div className="mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-black text-white">Rp 135.000</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-pink-300 bg-white/10 px-2.5 py-1 rounded-md inline-block mt-2 border border-pink-400/30">
                        ⏱️ Masa Aktif: Pass 60 Hari (2 Bulan Bebas Foto)
                      </span>
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-wider text-pink-300 mb-3 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Semua Fitur Basic + Benefit VIP Eksklusif:
                    </div>

                    <ul className="space-y-2.5 text-xs text-white/90 font-medium mb-8">
                      <li className="flex items-start gap-2.5">
                        <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0 mt-0.5" />
                        <span>⭐ <strong>Semua Akses Paket Basic Included</strong> (Bebas Watermark, All Filters, QR Download).</span>
                      </li>

                      <li className="flex items-start gap-2.5 bg-pink-500/20 p-2.5 rounded-xl border border-pink-400/30">
                        <UploadCloud className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                        <span>🖼️ <strong>Unlimited Upload Custom Frame</strong> — Import bingkai karya sendiri (Canva/Photoshop PNG &amp; SVG) tanpa batas.</span>
                      </li>

                      <li className="flex items-start gap-2.5 bg-purple-500/20 p-2.5 rounded-xl border border-purple-400/30">
                        <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                        <span>📸 <strong>VIP Studio Extended Grid</strong> — Akses Grid Rame-rame 6-Cut &amp; 8-Cut khusus grup besar &amp; pesta.</span>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Palette className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                        <span>🎨 <strong>Full Custom Color &amp; Wallpaper Studio</strong> — Bebas atur Color Picker HEX, Border Thickness, Radius, Shadow &amp; Custom Backdrop.</span>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Wand2 className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                        <span>🪄 <strong>Photo Fine-Tuning &amp; Retouch Pro</strong> — Kontrol presisi Brightness, Contrast, Saturation &amp; Soft Focus.</span>
                      </li>

                      <li className="flex items-start gap-2.5 bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-400/30">
                        <Film className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                        <span>🎬 <strong>Unduh Animasi GIF (Boomerang Photobooth)</strong> — Ekspor foto bergerak beresolusi tinggi dengan pilihan kecepatan animasi.</span>
                      </li>

                      <li className="flex items-start gap-2.5 bg-pink-500/20 p-2.5 rounded-xl border border-pink-400/30">
                        <Sparkles className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                        <span>💌 <strong>Kirim Kado Amplop Digital 3D &amp; Voice Note</strong> — Kirim foto strip ucapan &amp; rekaman suara otomatis via WhatsApp.</span>
                      </li>

                      <li className="flex items-start gap-2.5 bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/30">
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span>🌟 <strong>Dynamic Sparkle &amp; Partikel Overlays</strong> — Efek glitter, sakura, love, &amp; partikel kilau estetik pada foto.</span>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Download className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                        <span>🚀 <strong>Export Super Ultra-HD 4K Print-Ready</strong> — Hasil cetak fisik kualitas studio tanpa terkompresi.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleOpenCheckoutModal('premium')}
                    className={`w-full py-4 px-4 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/20 cursor-pointer ${packageTier === 'premium' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 text-white'}`}
                  >
                    <span>{packageTier === 'premium' ? '✓ Paket Aktif (VIP Premium)' : 'Pilih Paket Premium 🔥'}</span>
                  </button>
                </motion.div>

              </div>

            </div>
          </section>

        </div>

        {/* Upgrade Modal Component */}
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          targetTier={upgradeModalTier}
          targetFrame={upgradeModalFrame}
          featureName={upgradeModalFeature}
        />

        {/* Checkout Simulator Modal Component */}
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          targetTier={checkoutModalTier}
        />
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewVisible && previewFrame && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-sm w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closePreview} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-rose-100/80 border border-rose-200 flex items-center justify-center text-pink-600 hover:bg-rose-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 pt-8 overflow-y-auto">
                <span className="text-[10px] font-black tracking-widest text-pink-500 uppercase mb-3 block">✨ PRATINJAU BINGKAI ✨</span>

                <div className={`relative rounded-3xl border-2 ${getCategoryBgGradient(previewFrame.category)} p-4 aspect-[3/4] flex items-center justify-center shadow-inner overflow-hidden`}>
                  <div className="relative w-full h-full bg-white rounded-2xl shadow-xl border border-white/90 p-3 flex items-center justify-center overflow-hidden">
                    <img src={previewFrame.src} alt={previewFrame.name} className="max-w-full max-h-full object-contain filter drop-shadow-md" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <h3 className="font-extrabold text-xl text-zinc-900 leading-tight">{previewFrame.name}</h3>
                  <button
                    onClick={(e) => handleOpenRename(previewFrame, e)}
                    className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                    title="Ubah Nama"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-2 text-xs font-black uppercase tracking-wider text-zinc-400">
                  <span className="bg-pink-100/80 border border-pink-200 px-3 py-0.5 rounded-full text-[10px] text-pink-600 capitalize">
                    {previewFrame.category}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-500"><Images className="w-3.5 h-3.5 text-pink-500" /> {previewFrame.slots} Slots</span>
                </div>
              </div>

              <div className="p-5 border-t border-rose-100 bg-rose-50/50 flex gap-3 relative">
                <button
                  onClick={closePreview}
                  disabled={isConfirmingSelection}
                  className="flex-1 py-3 bg-white border-2 border-rose-200 rounded-2xl font-bold text-xs text-zinc-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSelectFrame}
                  disabled={isConfirmingSelection}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isConfirmingSelection ? 'Memuat...' : 'Mulai Foto! ✨'}
                </button>

                <AnimatePresence>
                  {showConfetti && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                      {confettiPieces.map((p) => {
                        const rad = (p.angle * Math.PI) / 180;
                        const x = Math.cos(rad) * p.distance;
                        const y = Math.sin(rad) * p.distance;
                        return (
                          <motion.span
                            key={p.id}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                            animate={{ x, y, opacity: 0, scale: 1.4, rotate: p.angle }}
                            transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
                            className="absolute text-xl filter drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]"
                          >
                            {p.emoji}
                          </motion.span>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL UBAH NAMA */}
      <AnimatePresence>
        {renameTarget && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[70] bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleCloseRename}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-sm w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseRename} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-rose-100/80 border border-rose-200 flex items-center justify-center text-pink-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 flex-shrink-0">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg text-zinc-900">Ubah Nama Frame</h2>
                    <p className="text-[11px] text-zinc-400 font-semibold">Nama baru akan tampil di seluruh katalog.</p>
                  </div>
                </div>

                {renameError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-500 text-xs px-3.5 py-2 rounded-2xl mb-3 font-semibold">
                    {renameError}
                  </div>
                )}

                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Nama Baru</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(); }}
                  autoFocus
                  placeholder="Masukkan nama frame..."
                  className="w-full px-4 py-3 bg-white border-2 border-rose-100 focus:border-pink-400 rounded-2xl text-xs sm:text-sm text-zinc-800 focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all shadow-sm font-semibold"
                />
              </div>

              <div className="p-5 pt-0 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button onClick={handleCloseRename} className="flex-1 py-3 bg-white border-2 border-rose-200 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-rose-50 transition-colors cursor-pointer">Batal</button>
                  <button onClick={handleSaveRename} className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-md cursor-pointer">Simpan</button>
                </div>
                {frameNameOverrides[renameTarget.id] && (
                  <button onClick={handleResetRenameToDefault} className="text-[10px] font-bold text-zinc-400 hover:text-rose-500 self-center mt-1 cursor-pointer">Kembalikan ke nama awal</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS FRAME */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[80] bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4 select-none"
            onClick={handleCloseDeleteConfirm}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-sm w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-center p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseDeleteConfirm} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 bg-rose-100 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>

              <h2 className="font-extrabold text-xl text-zinc-900 mb-1">Hapus Bingkai Ini?</h2>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-medium">
                Apakah Anda yakin ingin menghapus bingkai <span className="font-extrabold text-zinc-800">"{deleteTarget.name}"</span>? Bingkai ini tidak akan lagi ditampilkan di katalog Anda.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseDeleteConfirm}
                  className="flex-1 py-3 bg-white border-2 border-rose-200 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Hapus Bingkai
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFIKASI SUKSES HAPUS */}
      <AnimatePresence>
        {deleteToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-zinc-900/90 backdrop-blur-md text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 pointer-events-none select-none"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            {deleteToastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD STUDIO MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-rose-100/80 border border-rose-200 flex items-center justify-center text-pink-600 cursor-pointer hover:bg-rose-200 transition-colors">
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto p-6 md:p-8 flex-1 custom-scroll">
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-rose-100">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl text-zinc-900">Unggah Frame Kustom</h2>
                    <p className="text-[11px] text-zinc-400 font-semibold">Nama frame unik estetik otomatis dibuatkan secara eksklusif ✨</p>
                  </div>
                </div>

                {uploadSuccess ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-extrabold text-zinc-800">Berhasil Terdaftar!</h3>
                    <p className="text-xs text-zinc-400 font-semibold mt-1">Nama estetik unik diterapkan ✨</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {uploadError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-500 text-xs px-4 py-2.5 rounded-2xl font-semibold">
                        {uploadError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Style Rupa</label>
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-white border border-rose-100 rounded-2xl text-xs text-zinc-700 font-black focus:outline-none cursor-pointer shadow-xs"
                        >
                          <option value="custom">Custom Canvas</option>
                          <option value="cute">Cute Kawaii</option>
                          <option value="korean">Korean Style</option>
                          <option value="retro">Vintage Retro</option>
                          <option value="polaroid">Polaroid Strip</option>
                          <option value="filmstrip">Classic Film</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Grid Slot</label>
                        <select
                          value={uploadSlots}
                          onChange={(e) => handleSlotsChange(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-white border border-rose-100 rounded-2xl text-xs text-zinc-700 font-black focus:outline-none cursor-pointer shadow-xs"
                        >
                          {[1, 2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} Slot Placeholder</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">File Gambar *</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {!previewSrc ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${isDraggingFile
                            ? 'border-pink-500 bg-pink-100/60 scale-[1.01]'
                            : 'border-rose-200 hover:border-pink-400 bg-rose-50/40 hover:bg-rose-50/70'
                            }`}
                        >
                          <Upload className="w-6 h-6 text-pink-500 animate-bounce" />
                          <span className="text-xs font-extrabold text-zinc-700">Pilih / Drag &amp; Drop berkas gambar</span>
                          <span className="text-[10px] text-zinc-400 font-semibold">PNG, JPG, WEBP maks 15 MB</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex justify-between items-center text-xs">
                          <span className="font-mono text-zinc-500 font-bold">{uploadImageDims && `${uploadImageDims.w} × ${uploadImageDims.h} px`}</span>
                          <div className="flex gap-3 font-extrabold">
                            <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600 hover:text-pink-600 cursor-pointer">Ganti</button>
                            <button onClick={handleRemoveImage} className="text-rose-500 hover:text-rose-700 cursor-pointer">Buang</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {previewSrc && uploadImageDims && (
                      <div className="space-y-3 bg-zinc-50 border border-rose-100 rounded-2xl p-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black ${isAutoDetecting ? 'bg-sky-50 border border-sky-100 text-sky-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
                          {isAutoDetecting ? (
                            <>
                              <ScanSearch className="w-3.5 h-3.5 animate-pulse" />
                              Membuat area foto transparan secara otomatis...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Semua {uploadSlots} area foto otomatis transparan &amp; pas! Siap didaftarkan.
                            </>
                          )}
                        </div>

                        {/* Control Slider Sensitivitas Pemotong */}
                        <div className="bg-white border border-rose-100 p-2.5 rounded-xl flex items-center justify-between gap-3">
                          <span className="text-[10px] font-extrabold text-zinc-600 uppercase flex items-center gap-1.5 flex-shrink-0">
                            <Sliders className="w-3.5 h-3.5 text-pink-500" />
                            Sensitivitas Pemotong:
                          </span>
                          <input
                            type="range"
                            min="10"
                            max="150"
                            value={detectionTolerance}
                            onChange={(e) => handleToleranceChange(Number(e.target.value))}
                            className="w-full accent-pink-500 cursor-pointer h-1.5 bg-rose-100 rounded-lg"
                          />
                          <span className="text-[10px] font-mono font-black text-pink-600 w-8 text-right">{detectionTolerance}</span>
                        </div>

                        <span className="text-[10px] font-black uppercase text-zinc-400 block">Pratinjau Bingkai Diterapkan</span>

                        <div
                          className="relative border border-rose-100 rounded-xl overflow-hidden mx-auto bg-white flex items-center justify-center shadow-sm"
                          style={{
                            maxHeight: '180px',
                            aspectRatio: `${uploadImageDims.w} / ${uploadImageDims.h}`,
                            backgroundImage: 'linear-gradient(45deg, #EEEEEE 25%, transparent 25%), linear-gradient(-45deg, #EEEEEE 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EEEEEE 75%), linear-gradient(-45deg, transparent 75%, #EEEEEE 75%)',
                            backgroundSize: '12px 14px',
                          }}
                        >
                          <img src={previewSrc} alt="Workspace" className="max-w-full max-h-full object-contain relative z-10" />

                          <div className="absolute inset-0 pointer-events-none z-20">
                            {customSlotCoords.map((s, idx) => {
                              if (!s) return null;
                              const leftPercent = (s.x / uploadImageDims.w) * 100;
                              const topPercent = (s.y / uploadImageDims.h) * 100;
                              const widthPercent = (s.w / uploadImageDims.w) * 100;
                              const heightPercent = (s.h / uploadImageDims.h) * 100;

                              return (
                                <div
                                  key={idx}
                                  className="absolute border-2 border-dashed border-pink-500/80 bg-pink-500/10 rounded-sm flex items-center justify-center"
                                  style={{
                                    left: `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: `${widthPercent}%`,
                                    height: `${heightPercent}%`,
                                  }}
                                >
                                  <span className="text-[8px] font-black text-pink-700 bg-white/90 px-1 py-0.2 rounded shadow-xs">
                                    #{idx + 1}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end items-center text-[10px] font-bold">
                          <button onClick={_handleResetAll} className="text-zinc-500 hover:text-pink-500 transition-colors cursor-pointer">
                            Deteksi Ulang
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!uploadSuccess && (
                <div className="p-5 border-t border-rose-100 bg-rose-50/50 flex gap-3">
                  <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 bg-white border-2 border-rose-200 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-rose-50 transition-colors cursor-pointer">Batal</button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!previewSrc || isAutoDetecting}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-lg shadow-pink-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Daftarkan Frame ✨
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};