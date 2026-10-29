import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { usePhotobooth, isFrameLocked, type PackageTier } from '../context/PhotoboothContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { frames } from '../data/frames';
import type { FrameTemplate } from '../data/frames';
import { removeCustomFrame } from '../lib/frameDb';
import {
  ArrowLeft, Search, X, Images, Clock, Heart, Upload, CheckCircle2, ScanSearch, Eye, SlidersHorizontal, LayoutGrid, Grid2X2, BookmarkCheck, Sliders,
  Camera, Check, Crown, UploadCloud, Lock, Film, Gift, LockOpen, ShieldCheck, Ticket, Layers, Smile, Trash2, Key, Download
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';

type SlotCoord = FrameTemplate['slotCoords'][number];

const FRAME_NAME_OVERRIDES_STORAGE_KEY = 'balisnap-frame-name-overrides';

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

const REMOVED_FRAME_IDS = new Set([
'studio-photobooth-1',
  'studio-photobooth-2',
  'studio-photobooth-4',
  'studio-photobooth-6',
  'studio-photobooth-8',
  'filmstrip-classic-3',
  'polaroid-classic-1',
  'polaroid-trio-3',
  'retro-caramel-6',
  'custom-1784433846432-eq88',
  'custom-1784638039985-r0ku',
  'polaroid-double',
  'polaroid-triple',
  'polaroid-grid-4',
  'polaroid-collection-6',
  'polaroid-wall-8',
  'cute-lavender-2',
  'cute-lemon-6',
  'retro-ticket-2',
  'retro-mosaic-8',
  'elegant-gold-1',
  'filmstrip-double-6',
  'grand-group-8',
  'grid-classic-6',
  'grid-mint-2',
  'grid-peach-2x2',
  'korean-4cut-lavender',
  'korean-maroon-4',
  'mini-polaroid-8',
  'minimalist-lines-1',
  'party-style-8',
  'rainbow-pastel-6',
  'sakura-yellow-3',
  'split-cute-2',
  'vintage-paper-1',
  'vintage-retro-6',
  'y2k-retro-6',
  'y2k-stars-4cut',
]);

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

const CursorTrail: React.FC = () => {
  return null; 
};

const getCategoryBgGradient = (_cat: string) => {
  return 'bg-[#FAFAFA] border-zinc-200/80';
};

const FrameCard: React.FC<{
  frame: FrameTemplate;
  idx: number;
  isTrending: boolean;
  isFavorite: boolean;
  isCustom: boolean;
  categoryStyle: any;
  currentTier: PackageTier;
  completedTrialSessions: number;
  onFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
  isOwner?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
}> = ({ frame, idx: _idx, isTrending, isFavorite, isCustom: _isCustom, categoryStyle: _categoryStyle, currentTier, completedTrialSessions, onFavorite, onClick, isOwner, onDelete }) => {
  const requiredTier = frame.id.startsWith('custom-') || frame.slots > 4 ? 'premium' : 'basic';
  const isLocked = isFrameLocked(frame, currentTier, completedTrialSessions);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.94 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const } }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative bg-white hover:bg-white border border-zinc-200 hover:border-blue-200 rounded-[20px] p-3 sm:p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden text-left select-none h-full"
    >
      <div className="flex justify-between items-center w-full mb-2 sm:mb-2.5 z-10 min-h-[28px]">
        <div>
          {isTrending && (
            <span className="bg-[#2563EB] text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-2xs">
              Populer
            </span> 
          )} 
        </div> 

        <div className="flex items-center gap-1.5 z-20">
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(e);
              }}
              className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Hapus Frame Ini (Khusus Owner)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(e); }}
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
            title="Favorit"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'fill-[#2563EB] text-[#2563EB]' : 'text-zinc-400 hover:text-[#2563EB]'}`} />
          </button>
        </div>
      </div>

      <div className={`relative aspect-[3/4] w-full ${getCategoryBgGradient(frame.category)} rounded-xl p-2 sm:p-2.5 flex items-center justify-center border shadow-inner overflow-hidden mb-2.5 transition-all duration-300 z-10`}>
        <div className="relative w-full h-full bg-white rounded-lg shadow-sm border border-zinc-200/80 p-1.5 sm:p-2 flex items-center justify-center overflow-hidden">
          <img src={frame.src} alt={frame.name} className="max-w-full max-h-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
        </div>

        {/* Lock Overlay Badge for Locked Frames */}
        {isLocked ? (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-2 sm:p-3 text-center z-30 transition-all">
            <div className={`p-1.5 sm:p-2 rounded-xl mb-1 sm:mb-1.5 border shadow-sm ${requiredTier === 'premium' ? 'bg-zinc-900 border-amber-500/50 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-white'}`}>
              {requiredTier === 'premium' ? <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-200" />}
            </div>
            <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm border flex items-center gap-1 ${requiredTier === 'premium' ? 'bg-amber-900/80 text-amber-200 border-amber-600/50' : 'bg-zinc-900/90 text-zinc-200 border-zinc-700'}`}>
              {currentTier === 'free' && completedTrialSessions >= 2 ? (
                <>
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />
                  <span>KUOTA TERPAKAI</span>
                </> 
              ) : requiredTier === 'premium' ? (
                <>
                  <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                  <span>VIP (135k)</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />
                  <span>BASIC (25k)</span>
                </>
              )} 
            </span>
            <span className="text-[8px] sm:text-[9px] text-zinc-300 font-medium mt-1 flex items-center justify-center gap-1">
              <LockOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> Buka
            </span>
          </div> 
        ) : (
          <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
            <span className="px-3.5 sm:px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" /> Pilih Frame
            </span>
          </div>
        )}
      </div>

      <div className="w-full pt-2 sm:pt-2.5 border-t border-zinc-200/80 z-10">
        <h3 className="font-sans font-bold text-zinc-800 text-xs sm:text-sm line-clamp-1 group-hover:text-blue-700 transition-colors">{frame.name}</h3>
        <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-semibold text-zinc-500">
          <span className="flex items-center gap-1 text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 shrink-0 font-medium">
            <Images className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#2563EB]" /> {frame.slots} Slot
          </span>
          <span className="bg-zinc-100 text-zinc-600 border border-zinc-200/80 px-1.5 sm:px-2 py-0.5 rounded-md capitalize truncate max-w-[80px] sm:max-w-none text-right">
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
  const {
    selectFrame,
    setStep,
    customFrames,
    addCustomFrame,
    deleteFrame,
    deletedFrameIds,
    isOwnerAuthenticated,
    verifyOwnerPasscode,
    packageTier,
    setPackageTier,
    completedTrialSessions,
    getRemainingTrialSessions,
    hasCompletedAllTrialSessions
  } = context;

  // Upgrade & Checkout Modal State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalTier, setUpgradeModalTier] = useState<PackageTier>('basic');
  const [upgradeModalFrame, setUpgradeModalFrame] = useState<FrameTemplate | null>(null);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | undefined>(undefined);

  // OWNER FRAME DELETE STATES
  const [ownerDeleteMode, setOwnerDeleteMode] = useState(false);
  const [frameToDelete, setFrameToDelete] = useState<FrameTemplate | null>(null);
  const [showOwnerAuthPrompt, setShowOwnerAuthPrompt] = useState(false);
  const [ownerPassInput, setOwnerPassInput] = useState('');
  const [ownerPassError, setOwnerPassError] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  const handleRequestDelete = (frame: FrameTemplate) => {
    if (!isOwnerAuthenticated) {
      setShowOwnerAuthPrompt(true);
      return;
    }
    setFrameToDelete(frame);
  };

  const handleConfirmDelete = () => {
    if (!frameToDelete) return;
    const success = deleteFrame(frameToDelete.id);
    if (success) {
      setDeleteSuccessMessage(`Frame "${frameToDelete.name}" berhasil dihapus.`);
      setTimeout(() => setDeleteSuccessMessage(null), 3000);
    }
    setFrameToDelete(null);
  };

  const handleVerifyOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOwnerPasscode(ownerPassInput)) {
      setOwnerDeleteMode(true);
      setShowOwnerAuthPrompt(false);
      setOwnerPassInput('');
      setOwnerPassError('');
    } else {
      setOwnerPassError('Passcode Owner salah! Silakan coba lagi.');
    }
  };

  const handleExportCustomFrames = useCallback(() => {
    if (!customFrames || customFrames.length === 0) return;
    const jsonStr = JSON.stringify(customFrames, null, 2);
    try {
      navigator.clipboard.writeText(jsonStr);
    } catch { }
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balisnap-custom-frames-${customFrames.length}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`File balisnap-custom-frames-${customFrames.length}.json berhasil diunduh dan disalin ke clipboard! Silakan kirimkan datanya agar dapat digabung ke kode website secara permanen.`);
  }, [customFrames]);

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

  const spotlightBackground = useMotionTemplate`radial-gradient(600px circle at ${bX}px ${bY}px, rgba(148,163,184,0.07), transparent 70%)`;

  const [frameNameOverrides, setFrameNameOverrides] = useState<Record<string, string>>(() => loadFrameNameOverrides());

  useEffect(() => {
    try {
      localStorage.setItem(FRAME_NAME_OVERRIDES_STORAGE_KEY, JSON.stringify(frameNameOverrides));
    } catch { }
  }, [frameNameOverrides]);

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

  useEffect(() => {
    // Bersihkan frame yang dihapus jika masih tersimpan di IndexedDB
    for (const id of REMOVED_FRAME_IDS) {
      removeCustomFrame(id).catch(() => {});
    }
  }, []);

  const rawAllFrames = useMemo(() => {
    const seenIds = new Set<string>();
    const seenSrcs = new Set<string>();
    const result: FrameTemplate[] = [];

    const deletedSet = new Set([...REMOVED_FRAME_IDS, ...deletedFrameIds]);

    for (const f of [...customFrames, ...frames]) {
      if (deletedSet.has(f.id)) continue;
      if (seenIds.has(f.id)) continue;

      const normalizedSrc = (f.src || '').toLowerCase().trim();
      if (normalizedSrc && seenSrcs.has(normalizedSrc)) continue;

      seenIds.add(f.id);
      if (normalizedSrc) seenSrcs.add(normalizedSrc);
      result.push(f);
    }
    return result;
  }, [customFrames, deletedFrameIds]);

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

  const categoryStyles: Record<string, { bg: string; border: string; icon: React.ComponentType<{ className?: string }>; accent: string }> = {
    filmstrip: { bg: 'bg-white', border: 'border-pink-100', icon: Film, accent: 'text-pink-500' },
    korean: { bg: 'bg-white', border: 'border-pink-100', icon: Smile, accent: 'text-indigo-500' },
    polaroid: { bg: 'bg-white', border: 'border-pink-100', icon: Camera, accent: 'text-amber-500' },
    cute: { bg: 'bg-white', border: 'border-pink-100', icon: Heart, accent: 'text-rose-500' },
    retro: { bg: 'bg-white', border: 'border-pink-100', icon: Ticket, accent: 'text-amber-600' },
    custom: { bg: 'bg-white', border: 'border-pink-100', icon: UploadCloud, accent: 'text-purple-500' },
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
    { label: 'Semua Style', value: 'all', icon: Layers },
    { label: 'Film Strip', value: 'filmstrip', icon: Film },
    { label: 'Korean Style', value: 'korean', icon: Smile },
    { label: 'Polaroid', value: 'polaroid', icon: Camera },
    { label: 'Cute Kawaii', value: 'cute', icon: Heart },
    { label: 'Retro Vintage', value: 'retro', icon: Ticket },
    { label: 'Custom Upload', value: 'custom', icon: UploadCloud },
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
    const locked = isFrameLocked(frame, packageTier, completedTrialSessions);
    if (locked) {
      const req = frame.id.startsWith('custom-') || frame.slots > 4 ? 'premium' : 'basic';
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
        color: ['#ec4899', '#a855f7', '#3b82f6', '#f43f5e', '#10b981', '#f59e0b'][i % 6],
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

  return (
    <>
      <CursorTrail />

      <div
        onMouseMove={handleKawaiiMouseMove}
        className="min-h-screen bg-[#F8FAFC] text-zinc-800 selection:bg-blue-100 selection:text-blue-900 py-4 sm:py-6 px-3 sm:px-6 lg:px-12 relative overflow-x-hidden antialiased font-sans flex flex-col items-center w-full"
      >
        {/* Subtle atmospheric ambient glow to eliminate 'polos banget' feel */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(219,234,254,0.45),rgba(255,255,255,0))] pointer-events-none z-0" />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

        <motion.div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{ background: spotlightBackground }}
        />

        <div className="max-w-7xl w-full relative z-10 flex flex-col gap-4 sm:gap-6">

          {/* Header Banner Utama */}
          <header className="flex flex-col md:flex-row justify-between items-center text-center md:text-left bg-white/95 backdrop-blur-md border border-zinc-200/90 p-5 sm:p-7 md:p-8 rounded-[24px] shadow-[0_4px_24px_rgba(37,99,235,0.03)] gap-5 sm:gap-6 w-full relative overflow-hidden">
            <div className="flex flex-col items-center md:items-start z-10 w-full md:w-auto">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2 sm:mb-3">
                <button
                  onClick={() => setStep('landing')}
                  className="inline-flex items-center gap-2 text-zinc-700 hover:text-blue-600 font-semibold text-xs tracking-wider uppercase transition-colors group px-3.5 py-1.5 bg-zinc-100 hover:bg-blue-50 rounded-lg border border-zinc-200 hover:border-blue-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Kembali
                </button>  
            
                {/* Active Package Pill Badge */}
                <button 
                  onClick={() => { 
                    const el = document.getElementById('paket-harga');
                    if (el) el.scrollIntoView({ behavior: 'smooth' }); 
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer shadow-2xs ${
                    packageTier === 'premium'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'
                      : packageTier === 'basic'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
                  }`}
                  title="Klik untuk lihat rincian paket" 
                >
                  {packageTier === 'premium' ? (
                    <>
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span>VIP Premium Pass</span>
                    </>
                  ) : packageTier === 'basic' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      <span>Basic Pass</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Free Pass</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                Pilih{' '}
                <span className="relative inline-block text-[#1D63FF]">
                  Bingkai Foto
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blue-300 pointer-events-none"
                    viewBox="0 0 120 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M3 8.5C35 2.5 70 2.5 117 8.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 11C40 6 75 6 112 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                </span>{' '}
                Favorit Kamu
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 sm:mt-2 font-normal max-w-xl">
                Temukan <span className="font-bold text-[#1D63FF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">{allFrames.length}</span> koleksi layout foto studio siap pakai.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto z-10">

              <button
                onClick={() => {
                  if (packageTier === 'free' || packageTier === 'basic') {
                    handleOpenUpgradeModal('premium', null, 'Unggah Frame Kustom');
                    return;
                  }
                  setIsUploadModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>Upload Frame Sendiri</span>
              </button>

              {/* Tombol Ekspor Frame Kustom (jika ada frame kustom lokal yang belum masuk kode) */}
              {customFrames && customFrames.length > 0 && ( 
                <button
                  onClick={handleExportCustomFrames} 
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 w-full sm:w-auto"
                  title="Ekspor frame kustom dari browser ini ke file JSON agar bisa disinkronkan permanen ke kode website"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Ekspor {customFrames.length} Frame Kustom</span>
                </button>
              )}
            </div> 
          </header>

          {/* Banner Kuota Mode Coba Gratis */} 
          {packageTier === 'free' && (
            <div className="w-full bg-gradient-to-r from-blue-50/60 to-white border border-blue-200/80 rounded-2xl p-4 sm:p-5 mb-1 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#1D63FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                  <Gift className="w-5 h-5 text-white" /> 
                </div> 
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans font-bold text-sm sm:text-base text-zinc-900 tracking-tight">
                      Mode Coba Gratis (Free Trial)
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${hasCompletedAllTrialSessions() ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-blue-100/90 text-[#1D63FF] border-blue-200'}`}>
                      Kuota: {getRemainingTrialSessions()}/2 Sesi Foto Tersisa
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-normal mt-1 leading-normal">
                    Nikmati <strong className="font-semibold text-zinc-700">2 sesi foto gratis (proses foto + unduh HD 2x)</strong> lengkap dengan 100% fitur studio!
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenCheckoutModal('basic')}
                className="px-5 py-2.5 sm:py-3 bg-[#1D63FF] hover:bg-[#1550D6] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm shadow-blue-600/20 active:scale-95 transition-all shrink-0 cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2"
              >
                <LockOpen className="w-3.5 h-3.5" />
                <span>Unlock All Frame (25k)</span>
              </button>
            </div>
          )}

          {/* Master Control Deck & Filter Bar */}
          <div className="w-full bg-white border border-zinc-200/90 p-5 md:p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col gap-5 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
              <div className="relative md:col-span-6 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text" 
                  placeholder="Cari kata kunci bingkai atau style..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-11 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white rounded-xl text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none transition-all font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer">
                    <X className="w-4 h-4" /> 
                  </button>
                )}
              </div>

              <div className="md:col-span-6 w-full flex flex-wrap sm:flex-nowrap gap-2">
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 w-full hover:border-zinc-300 transition-colors">
                  <Clock className="w-4 h-4 text-zinc-500 mr-2 flex-shrink-0" /> 
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs sm:text-sm font-semibold text-zinc-700 focus:outline-none cursor-pointer w-full"
                  >
                    <option value="popular">Paling Populer</option>
                    <option value="newest">Koleksi Terbaru</option> 
                    <option value="name">Abjad A - Z</option> 
                  </select> 
                </div>

                <button
                  onClick={() => setOnlyFavoritesFilter(!onlyFavoritesFilter)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border font-semibold text-xs transition-colors flex-shrink-0 cursor-pointer ${onlyFavoritesFilter
                    ? 'bg-[#1D63FF] border-[#1D63FF] text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50'
                    }`}
                  title="Filter Hanya Favorit"
                >
                  <Heart className={`w-4 h-4 ${onlyFavoritesFilter ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">Favorit ({favorites.size})</span>
                </button>

                <div className="flex bg-zinc-100 border border-zinc-200 rounded-xl p-1 gap-1 flex-shrink-0">
                  <button
                    onClick={() => setGridColsLayout('standard')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${gridColsLayout === 'standard' ? 'bg-white text-blue-600 shadow-xs border border-zinc-200' : 'text-zinc-400 hover:text-zinc-700'}`}
                    title="Tampilan Standar"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridColsLayout('compact')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${gridColsLayout === 'compact' ? 'bg-white text-blue-600 shadow-xs border border-zinc-200' : 'text-zinc-400 hover:text-zinc-700'}`}
                    title="Tampilan Rapat / Padat"
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Slot Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D63FF]"></span>
                <span>Jumlah Slot Foto</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {slotFilters.map((sf) => (
                  <button
                    key={sf.value}
                    onClick={() => setSlotFilter(sf.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 border ${slotFilter === sf.value
                      ? 'bg-[#1D63FF] text-white border-[#1D63FF] shadow-sm shadow-blue-500/25'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/40'
                      }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Kategori Tema */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D63FF]"></span>
                <span>Kategori Tema Estetika</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((cf) => {
                  const isActive = categoryFilter === cf.value;
                  const count = getCategoryCount(cf.value);
                  return (
                    <button
                      key={cf.value}
                      onClick={() => setCategoryFilter(cf.value)}
                      className={`group px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 border cursor-pointer whitespace-nowrap shrink-0 ${isActive
                        ? 'bg-[#1D63FF] text-white border-[#1D63FF] shadow-sm shadow-blue-500/25'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/40'
                        }`}
                    >
                      <span>{cf.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
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
                      completedTrialSessions={completedTrialSessions}
                      onFavorite={(e) => toggleFavorite(frame.id, e)}
                      onClick={() => handleFrameClick(frame)}
                      isOwner={isOwnerAuthenticated && ownerDeleteMode}
                      onDelete={() => handleRequestDelete(frame)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white border border-zinc-200 rounded-2xl w-full p-6 shadow-xs"
              >
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-zinc-500 border border-zinc-200">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-zinc-800">Tidak ada bingkai yang cocok</h3>
                <p className="text-zinc-500 text-xs mt-1 max-w-sm mx-auto font-normal">Coba ubah kata kunci pencarian atau setel ulang filter.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-5 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-medium uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Setel Ulang Filter
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 bg-white border border-zinc-200 px-5 py-2.5 rounded-xl w-full">
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Ready & Filter Active
            </span>
            <span className="flex items-center gap-1 text-zinc-600">
              <BookmarkCheck className="w-3.5 h-3.5 text-zinc-500" /> Auto-Sync Active
            </span>
          </div>

          {/* ===== SECTION PAKET & HARGA PHOTOBOOTH STUDIO ===== */}
          {/* PRICING TABLE / PAKET AKSES PHOTOBOOTH */}
          <section id="paket-harga" className="relative border border-stone-200/70 py-12 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white backdrop-blur-2xl rounded-3xl shadow-xs my-4 text-center w-full">
            <div className="max-w-5xl mx-auto relative z-10">

              {/* Section Header */}
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-[11px] font-medium tracking-widest text-[#71717A] uppercase bg-[#F4F4F5] px-3 py-1 rounded-full border border-[#E4E4E7]">
                  Pilihan Akses Studio
                </span>
                <h2 className="!font-sans font-bold text-2xl sm:text-4xl text-[#18181B] mt-3 mb-3">
                  Paket Akses Studio
                </h2>
                <p className="text-sm text-[#52525B] leading-relaxed">
                  Mulai dengan sesi percobaan gratis atau pilih paket akses penuh untuk berfoto tanpa watermark.
                </p>
              </div>

              {/* 3 Pricing Cards Grid (Exact Match to User Reference Design) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4 text-center max-w-6xl mx-auto">

                {/* 1. Basic / Paket Gratis */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-center"
                >
                  <div>
                    {/* Title */}
                    <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                      Paket Gratis
                    </h3>

                    {/* Price & Period */}
                    <div className="pb-5 mb-5 border-b border-gray-100">
                      <div className="flex items-center justify-center">
                        <span className="!font-sans font-bold text-4xl sm:text-5xl text-gray-900 tracking-tight">
                          Rp 0
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium block mt-2">
                        / 2 sesi foto
                      </span>
                    </div>

                    {/* Features List with Blue Circled Checkmarks */}
                    <div className="space-y-3 mb-8 text-left">
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Akses coba 2 sesi foto lengkap (foto, edit, dan unduh)</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Buka seluruh filter warna foto (Normal, B&W, Vintage, Cool, Vivid, Sepia)</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Koleksi stiker dekorasi studio lengkap (Panda, Cute, Y2K, dsb.)</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Fitur hitung mundur otomatis dan foto ulang (retake) per slot</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Tambah teks estetik dengan beragam pilihan gaya font studio</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Unduh hasil foto jernih format HD (tersedia 2 kali)</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Menyertakan tanda air (watermark) halus studio</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button (Blue Outline) */}
                  <button
                    onClick={() => handleOpenCheckoutModal('free')}
                    className="w-full py-3.5 px-5 bg-white hover:bg-blue-50/60 text-[#2563EB] font-bold text-sm rounded-xl border-2 border-[#2563EB] transition-colors cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {packageTier === 'free' ? 'Paket Aktif (Coba Gratis)' : 'Coba Gratis'}
                  </button>
                </motion.div>

                {/* 2. Standard / Paket Basic (Most Popular with Blue Top Bar) */}
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border-2 border-[#2563EB] rounded-3xl shadow-xl hover:shadow-2xl transition-all text-center flex flex-col justify-between overflow-hidden relative"
                >
                  {/* Integrated Blue Top Bar */}
                  <div className="bg-[#2563EB] text-white text-xs font-bold tracking-widest uppercase py-2.5 text-center">
                    PALING POPULER
                  </div>

                  <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                    <div>
                      {/* Title */}
                      <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                        Paket Basic
                      </h3>

                      {/* Price & Period (Blue Price) */}
                      <div className="pb-5 mb-5 border-b border-gray-100">
                        <div className="flex items-center justify-center">
                          <span className="!font-sans font-bold text-4xl sm:text-5xl text-[#2563EB] tracking-tight">
                            Rp 25.000
                          </span>
                        </div>
                        <span className="text-sm text-gray-400 font-medium block mt-2">
                          / akses 24 jam penuh
                        </span>
                      </div>

                      {/* Features List with Blue Circled Checkmarks */}
                      <div className="space-y-3 mb-8 text-left">
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>Akses penuh bebas foto &amp; unduh sepuasnya selama 24 jam</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>100% hasil foto bersih tanpa watermark studio</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>Buka seluruh koleksi bingkai studio (Korean, Polaroid, Filmstrip, Retro)</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>Bebas foto ulang (retake) per slot tanpa batasan sesi</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>Buka seluruh filter warna foto &amp; semua paket stiker studio</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>Bebas atur posisi foto (geser posisi, perbesar / zoom) sesuai keinginan</span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span>Unduh hasil foto kualitas tinggi format HD</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button (Blue Solid) */}
                    <button
                      onClick={() => handleOpenCheckoutModal('basic')}
                      className="w-full py-3.5 px-5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md"
                    >
                      {packageTier === 'basic' ? 'Paket Aktif (Basic 24 Jam)' : 'Pilih Paket Basic'}
                    </button>
                  </div>
                </motion.div>

                {/* 3. Premium / Paket Premium VIP */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-center"
                >
                  <div>
                    {/* Title */}
                    <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                      Paket Premium VIP
                    </h3>

                    {/* Price & Period */}
                    <div className="pb-5 mb-5 border-b border-gray-100">
                      <div className="flex items-center justify-center">
                        <span className="!font-sans font-bold text-4xl sm:text-5xl text-gray-900 tracking-tight">
                          Rp 135.000
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium block mt-2">
                        / akses 60 hari (2 bulan)
                      </span>
                    </div>

                    {/* Features List with Blue Circled Checkmarks - BALANCED & COMPLETE */}
                    <div className="space-y-3 mb-8 text-left">
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span><strong>Masa aktif panjang 60 hari penuh (2 bulan)</strong> bebas foto kapan saja</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Termasuk seluruh fitur Paket Basic (bebas watermark &amp; unduh sepuasnya)</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span><strong>Unggah bingkai sendiri tanpa batas</strong> (desain Canva / PNG / SVG &amp; auto-deteksi)</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span><strong>Buka bingkai rombongan (grid 6 &amp; 8 slot)</strong> khusus foto ramai-ramai</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Kustomisasi penuh: Color picker HEX, wallpaper latar, &amp; fine-tuning foto</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Ekspor Boomerang GIF bergerak &amp; efek partikel kilau / sakura estetik</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                        <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>Kado amplop digital 3D via WhatsApp &amp; ekspor Ultra HD siap cetak</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button (Blue Outline) */}
                  <button
                    onClick={() => handleOpenCheckoutModal('premium')}
                    className="w-full py-3.5 px-5 bg-white hover:bg-blue-50/60 text-[#2563EB] font-bold text-sm rounded-xl border-2 border-[#2563EB] transition-colors cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {packageTier === 'premium' ? 'Paket Aktif (VIP Premium)' : 'Pilih Premium VIP'}
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
            className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={closePreview}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-sm w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-center max-h-[92vh] my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closePreview} className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              <div className="p-4 sm:p-6 pt-6 sm:pt-8 overflow-y-auto flex-1">
                <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mb-2 sm:mb-3 block">Pratinjau Bingkai</span>

                <div className={`relative rounded-2xl border ${getCategoryBgGradient(previewFrame.category)} p-3 sm:p-4 aspect-[3/4] max-h-[40vh] mx-auto flex items-center justify-center shadow-inner overflow-hidden`}>
                  <div className="relative w-full h-full bg-white rounded-xl shadow-sm border border-zinc-200 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                    <img src={previewFrame.src} alt={previewFrame.name} className="max-w-full max-h-full object-contain filter drop-shadow-md" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
                  <h3 className="font-bold text-lg sm:text-xl text-zinc-900 leading-tight">{previewFrame.name}</h3>
                </div>

                <div className="flex items-center justify-center gap-2 mt-1.5 sm:mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <span className="bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md text-[10px] text-zinc-700 capitalize">
                    {previewFrame.category}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-600"><Images className="w-3.5 h-3.5 text-zinc-500" /> {previewFrame.slots} Slots</span>
                </div> 
              </div> 

              <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 flex gap-2.5 sm:gap-3 relative shrink-0">
                <button
                  onClick={closePreview} 
                  disabled={isConfirmingSelection}
                  className="flex-1 py-3 bg-white border border-zinc-200 rounded-xl font-medium text-xs text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Batal
                </button> 
                <button
                  onClick={handleConfirmSelectFrame} 
                  disabled={isConfirmingSelection}
                  className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isConfirmingSelection ? 'Memuat...' : 'Mulai Foto'}</span> 
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
                            animate={{ x, y, opacity: 0, scale: 1.2, rotate: p.angle }}
                            transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
                            className="absolute w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: p.color }}
                          />
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



      {/* UPLOAD STUDIO MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 cursor-pointer hover:bg-zinc-200 transition-colors">
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex-1 custom-scroll">
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-zinc-200">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-xs">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-zinc-900">Unggah Frame Kustom</h2>
                    <p className="text-[11px] text-zinc-500 font-normal">Nama frame unik estetik otomatis dibuatkan secara eksklusif</p>
                  </div>
                </div>

                {uploadSuccess ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <div className="w-14 h-14 bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-800">Berhasil Terdaftar!</h3>
                    <p className="text-xs text-zinc-500 mt-1">Nama estetik unik diterapkan</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {uploadError && (
                      <div className="bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs px-4 py-2.5 rounded-xl font-medium">
                        {uploadError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Style Rupa</label>
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-700 font-semibold focus:outline-none cursor-pointer shadow-xs"
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
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Grid Slot</label>
                        <select
                          value={uploadSlots}
                          onChange={(e) => handleSlotsChange(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-700 font-semibold focus:outline-none cursor-pointer shadow-xs"
                        >
                          {[1, 2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} Slot Placeholder</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">File Gambar *</label>
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
                          className={`w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${isDraggingFile
                            ? 'border-zinc-800 bg-zinc-100'
                            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100/60'
                            }`}
                        >
                          <Upload className="w-5 h-5 text-zinc-600" />
                          <span className="text-xs font-semibold text-zinc-700">Pilih / Drag &amp; Drop berkas gambar</span>
                          <span className="text-[10px] text-zinc-400">PNG, JPG, WEBP maks 15 MB</span>
                        </div>
                      ) : (
                        <div className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-mono text-zinc-600 font-semibold">{uploadImageDims && `${uploadImageDims.w} × ${uploadImageDims.h} px`}</span>
                          <div className="flex gap-3 font-semibold">
                            <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600 hover:text-zinc-900 cursor-pointer">Ganti</button>
                            <button onClick={handleRemoveImage} className="text-zinc-500 hover:text-zinc-900 cursor-pointer">Buang</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {previewSrc && uploadImageDims && (
                      <div className="space-y-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold ${isAutoDetecting ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-100 text-zinc-800'}`}>
                          {isAutoDetecting ? (
                            <>
                              <ScanSearch className="w-3.5 h-3.5 animate-pulse" />
                              Membuat area foto transparan secara otomatis...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Semua {uploadSlots} area foto otomatis transparan &amp; pas! Siap didaftarkan.
                            </>
                          )}
                        </div>

                        {/* Control Slider Sensitivitas Pemotong */}
                        <div className="bg-white border border-zinc-200 p-2.5 rounded-xl flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold text-zinc-600 uppercase flex items-center gap-1.5 flex-shrink-0">
                            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                            Sensitivitas Pemotong:
                          </span>
                          <input
                            type="range"
                            min="10"
                            max="150"
                            value={detectionTolerance}
                            onChange={(e) => handleToleranceChange(Number(e.target.value))}
                            className="w-full accent-zinc-900 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                          />
                          <span className="text-[10px] font-mono font-bold text-zinc-800 w-8 text-right">{detectionTolerance}</span>
                        </div>

                        <span className="text-[10px] font-semibold uppercase text-zinc-400 block">Pratinjau Bingkai Diterapkan</span>

                        <div
                          className="relative border border-zinc-200 rounded-xl overflow-hidden mx-auto bg-white flex items-center justify-center shadow-xs"
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
                                  className="absolute border-2 border-dashed border-zinc-800 bg-zinc-900/10 rounded-xs flex items-center justify-center"
                                  style={{
                                    left: `${leftPercent}%`,
                                    top: `${topPercent}%`,
                                    width: `${widthPercent}%`,
                                    height: `${heightPercent}%`,
                                  }}
                                >
                                  <span className="text-[8px] font-bold text-zinc-900 bg-white px-1 py-0.2 rounded shadow-xs">
                                    #{idx + 1}
                                  </span>
                                </div>
                              ); 
                            })}
                          </div>
                        </div> 

                        <div className="flex justify-end items-center text-[10px] font-semibold">
                          <button onClick={_handleResetAll} className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
                            Deteksi Ulang
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!uploadSuccess && (
                <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 flex gap-3">
                  <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer">Batal</button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!previewSrc || isAutoDetecting}
                    className="flex-1 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Daftarkan Frame</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFIKASI BERHASIL HAPUS FRAME */}
      <AnimatePresence>
        {deleteSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{deleteSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS FRAME (KHUSUS OWNER) */}
      <AnimatePresence>
        {frameToDelete && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-zinc-200 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-zinc-900 mb-1">Hapus Frame?</h3>
              <p className="text-xs text-zinc-600 mb-2">
                Apakah Anda yakin ingin menghapus frame berikut?
              </p>
              <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl mb-3 text-xs font-bold text-zinc-800 truncate">
                {frameToDelete.name}
              </div>
              <p className="text-[11px] text-zinc-400 mb-5 leading-relaxed">
                Frame ini akan disembunyikan permanen dari katalog pilihan pelanggan.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setFrameToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-500/20"
                >
                  Ya, Hapus Frame
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL INPUT PASSCODE OWNER UNTUK HAPUS FRAME */}
      <AnimatePresence>
        {showOwnerAuthPrompt && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-zinc-200 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1D63FF] mx-auto flex items-center justify-center mb-3">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-zinc-900 mb-1">Verifikasi Akses Owner</h3>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                Fitur hapus frame hanya dapat diakses oleh Owner. Silakan masukkan Passcode Owner Anda:
              </p>
              <form onSubmit={handleVerifyOwner} className="space-y-3">
                <input
                  type="password"
                  value={ownerPassInput}
                  onChange={(e) => setOwnerPassInput(e.target.value)}
                  placeholder="Masukkan Passcode Owner..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-800 font-mono text-center focus:outline-none focus:border-[#1D63FF]"
                  autoFocus
                />
                {ownerPassError && (
                  <p className="text-[11px] text-rose-500 font-semibold">{ownerPassError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOwnerAuthPrompt(false);
                      setOwnerPassInput('');
                      setOwnerPassError('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#1D63FF] hover:bg-[#1550D6] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Aktifkan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};