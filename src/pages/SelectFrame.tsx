import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { frames } from '../data/frames';
import type { FrameTemplate } from '../data/frames';
import {
  ArrowLeft, Palette, Sparkles, Search, X, Filter, Grid3x3, Images, Clock, RefreshCw, Heart, Upload, Trash2, RotateCcw, CheckCircle2, ScanSearch, EyeOff, Eye, Pencil,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';

type SlotCoord = FrameTemplate['slotCoords'][number];

const HIDDEN_FRAMES_STORAGE_KEY = 'balisnap-hidden-frames';
const FRAME_NAME_OVERRIDES_STORAGE_KEY = 'balisnap-frame-name-overrides';

// Component khusus dengan Algoritma Flood-Fill Removal yang presisi
const TransparentLogo: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const visited = new Uint8Array(width * height);
      const queue: number[] = [];

      for (let x = 0; x < width; x++) {
        queue.push(x, 0);
        queue.push(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        queue.push(0, y);
        queue.push(width - 1, y);
      }

      while (queue.length > 0) {
        const cy = queue.pop()!;
        const cx = queue.pop()!;
        const idx = cy * width + cx;

        if (visited[idx]) continue;
        visited[idx] = 1;

        const pIdx = idx * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];

        const isBackground = (r > 160 && g > 145 && b > 120) || (r > 200 && g > 200 && b > 200);

        if (isBackground) {
          data[pIdx + 3] = 0;

          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!visited[nIdx]) {
                queue.push(nx, ny);
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setTransparentSrc(canvas.toDataURL('image/png'));
    };
  }, [src]);

  return (
    <motion.img
      src={transparentSrc || src}
      alt="BaliSnap Studio Logo"
      className={className}
      animate={{
        scale: [1, 1.03, 1],
        rotate: [0, 1.5, -1.5, 0],
      }}
      transition={{
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }}
      whileHover={{ scale: 1.05 }}
    />
  );
};

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

function autoDetectPhotoSlots(
  canvas: HTMLCanvasElement,
  numSlots: number,
  tolerance: number = 42
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
  const maxAreaFrac = numSlots <= 1 ? 0.90 : Math.min(0.85, 2.0 / numSlots);

  stats.forEach((s, label) => {
    if (s.touchesBorder) return;
    const areaFrac = s.area / totalPixels;
    if (areaFrac < minAreaFrac || areaFrac > maxAreaFrac) return;

    const bboxW = s.maxX - s.minX + 1;
    const bboxH = s.maxY - s.minY + 1;
    const bboxArea = bboxW * bboxH;
    const fillRatio = s.area / bboxArea;
    const isTransparent = s.transparentPixels > s.opaquePixels;

    if (!isTransparent && fillRatio < 0.50) return;

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

  for (const c of chosen) {
    for (let yy = c.y; yy < c.y + c.h; yy++) {
      const rowBase = yy * width;
      for (let xx = c.x; xx < c.x + c.w; xx++) {
        data[(rowBase + xx) * 4 + 3] = 0;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);

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

const CURSOR_TRAIL_EMOJIS = ['✨', '💖', '🩷', '⭐', '🎀'];

const CursorTrail: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const lastAddRef = useRef(0);
  const idCounterRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastAddRef.current < 90) return;
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
            initial={{ opacity: 0.9, scale: 0.6, x: p.x, y: p.y }}
            animate={{ opacity: 0, scale: 1.15, y: p.y - 34 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            onAnimationComplete={() => setParticles((prev) => prev.filter((pp) => pp.id !== p.id))}
            className="absolute text-base select-none"
            style={{ left: 0, top: 0 }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

const FrameCard: React.FC<{
  frame: FrameTemplate;
  idx: number;
  isTrending: boolean;
  isFavorite: boolean;
  isCustom: boolean;
  categoryStyle: any;
  onFavorite: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onClick: () => void;
}> = ({ frame, idx, isTrending, isFavorite, isCustom: _isCustom, categoryStyle, onFavorite, onDelete, onEdit, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02, rotate: idx % 2 === 0 ? 0.5 : -0.5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-white border-4 border-rose-100 rounded-[32px] p-5 flex flex-col justify-between shadow-[0_12px_30px_rgba(253,244,245,0.8)] overflow-hidden text-left cursor-pointer group select-none h-full transition-shadow duration-300 animate-fade-in"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/20 via-transparent to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start w-full mb-4 z-10">
        <div className="flex flex-col gap-1.5 items-start">
          <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)] transform group-hover:scale-125 transition-transform duration-300">{categoryStyle.icon}</span>
          {isTrending && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5 animate-spin" /> Populer
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onFavorite} className="w-9 h-9 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-center hover:bg-rose-100 shadow-sm transition-transform active:scale-90">
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-rose-300'}`} />
          </button>
          <button onClick={onEdit} className="w-9 h-9 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-500 hover:text-white shadow-sm active:scale-90">
            <Pencil className="w-4 h-4 text-sky-400 group-hover:text-sky-400 hover:!text-white" />
          </button>
          <button onClick={onDelete} className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-100 text-purple-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500 hover:text-white">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-rose-50/30 to-purple-50/30 rounded-2xl p-4 flex items-center justify-center border border-rose-100/40 overflow-hidden mb-4 shadow-inner group-hover:bg-white transition-colors duration-300">
        <img src={frame.src} alt={frame.name} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_25px_rgba(255,182,193,0.2)] group-hover:scale-[1.06] transition-transform duration-500 ease-out" loading="lazy" />
        <div className="absolute inset-0 bg-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <span className="px-4 py-2 rounded-full bg-white text-pink-500 font-black text-[10px] tracking-widest uppercase shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="w-4 h-4" /> Intip Frame
          </span>
        </div>
      </div>

      <div className="w-full pt-3 border-t-2 border-dashed border-rose-100/60">
        <h3 className="font-serif font-black text-zinc-800 text-base line-clamp-1 group-hover:text-pink-500 transition-colors">{frame.name}</h3>
        <div className="flex items-center justify-between mt-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1 text-pink-500 bg-pink-50 px-2 py-0.5 rounded-md">
            <Images className="w-3.5 h-3.5" /> {frame.slots} Slot Foto
          </span>
          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-medium text-[9px] capitalize">
            🎀 {frame.category}
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
  const { selectFrame, setStep, customFrames, addCustomFrame, deleteCustomFrame } = context;
  const [slotFilter, setSlotFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('popular');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  const spotlightBackground = useMotionTemplate`radial-gradient(600px circle at ${bX}px ${bY}px, rgba(244,114,182,0.16), rgba(168,85,247,0.08) 40%, transparent 70%)`;

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

  const handleDeleteFrame = useCallback((frame: FrameTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenFrameIds((prev) => {
      const next = new Set(prev);
      next.add(frame.id);
      return next;
    });

    if (frame.id.startsWith('custom-')) {
      deleteCustomFrame(frame.id);
      fetch('/api/delete-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: frame.id }),
      }).catch((err) => {
        console.warn('Permanent file deletion failed:', err);
      });
    }
  }, [deleteCustomFrame]);

  const handleRestoreHiddenFrames = useCallback(() => {
    setHiddenFrameIds(new Set());
  }, []);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<FrameTemplate['category']>('custom');
  const [uploadSlots, setUploadSlots] = useState(1);
  const [uploadImageDims, setUploadImageDims] = useState<{ w: number; h: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const [customSlotCoords, setCustomSlotCoords] = useState<(SlotCoord | null)[]>([null]);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const rawAllFrames = useMemo(
    () => [...frames, ...customFrames].filter((f) => !hiddenFrameIds.has(f.id)),
    [customFrames, hiddenFrameIds]
  );

  const allFrames = useMemo(
    () => rawAllFrames.map((f) => (frameNameOverrides[f.id] ? { ...f, name: frameNameOverrides[f.id] } : f)),
    [rawAllFrames, frameNameOverrides]
  );

  const AUTO_DETECT_TOLERANCE_STEPS = [42, 60, 80, 105, 135];

  const runAutoDetect = useCallback((slots: number) => {
    const original = originalCanvasRef.current;
    if (!original) return;

    setIsAutoDetecting(true);
    setUploadError(null);

    setTimeout(() => {
      let bestCanvas: HTMLCanvasElement | null = null;
      let bestDetected: (SlotCoord | null)[] = [];
      let bestFound = -1;

      for (const tolerance of AUTO_DETECT_TOLERANCE_STEPS) {
        const canvas = document.createElement('canvas');
        canvas.width = original.width;
        canvas.height = original.height;
        const realCtx = canvas.getContext('2d');
        if (!realCtx) continue;
        realCtx.drawImage(original, 0, 0);

        const detected = autoDetectPhotoSlots(canvas, slots, tolerance);
        const foundCount = detected.filter((s) => s !== null).length;

        if (foundCount > bestFound) {
          bestFound = foundCount;
          bestCanvas = canvas;
          bestDetected = detected;
        }

        if (foundCount >= slots) break;
      }

      if (bestFound < slots || bestDetected.some(s => s === null)) {
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = original.width;
        gridCanvas.height = original.height;
        const gridCtx = gridCanvas.getContext('2d');
        if (gridCtx) {
          gridCtx.drawImage(original, 0, 0);
          const gridSlots = generateGridSlots(original.width, original.height, slots);
          gridSlots.forEach((s) => gridCtx.clearRect(s.x, s.y, s.w, s.h));
          bestCanvas = gridCanvas;
          bestDetected = gridSlots;
          bestFound = slots;
        }
      }

      if (!bestCanvas) { setIsAutoDetecting(false); return; }

      workingCanvasRef.current = bestCanvas;
      setPreviewSrc(bestCanvas.toDataURL('image/png'));
      setCustomSlotCoords(bestDetected);
      setUploadError(null);
      setIsAutoDetecting(false);
    }, 30);
  }, []);

  const initWorkingCanvas = useCallback((dataUrl: string) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const originalCopy = document.createElement('canvas');
      originalCopy.width = canvas.width;
      originalCopy.height = canvas.height;
      originalCopy.getContext('2d')?.drawImage(canvas, 0, 0);

      workingCanvasRef.current = canvas;
      originalCanvasRef.current = originalCopy;

      setUploadImageDims({ w: canvas.width, h: canvas.height });
      setPreviewSrc(canvas.toDataURL('image/png'));
      setCustomSlotCoords(Array(uploadSlots).fill(null));
      runAutoDetect(uploadSlots);
    };
    img.src = dataUrl;
  }, [uploadSlots, runAutoDetect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Ekstensi tidak valid.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Maksimal ukuran file 10 MB.'); return; }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      initWorkingCanvas(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [initWorkingCanvas]);

  const _handleResetAll = useCallback(() => {
    runAutoDetect(uploadSlots);
  }, [uploadSlots, runAutoDetect]);

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
      runAutoDetect(slots);
    } else {
      setCustomSlotCoords(Array(slots).fill(null));
    }
  }, [runAutoDetect]);

  const allSlotsFilled = customSlotCoords.length === uploadSlots && customSlotCoords.every((s) => s !== null);

  const handleUploadSubmit = useCallback(() => {
    if (!uploadName.trim()) { setUploadError('Nama frame harus diisi.'); return; }
    if (!workingCanvasRef.current || !uploadImageDims) { setUploadError('Pilih file gambar frame.'); return; }
    if (!allSlotsFilled) { setUploadError(`Konfigurasi belum lengkap (${customSlotCoords.filter(s => s).length}/${uploadSlots} selesai).`); return; }

    const finalSrc = workingCanvasRef.current.toDataURL('image/png');
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFrame: FrameTemplate = {
      id,
      name: uploadName.trim(),
      slots: uploadSlots,
      category: uploadCategory,
      src: finalSrc,
      width: uploadImageDims.w,
      height: uploadImageDims.h,
      slotCoords: customSlotCoords.filter((s): s is NonNullable<typeof s> => s !== null),
    };
    addCustomFrame(newFrame);

    fetch('/api/save-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFrame),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          deleteCustomFrame(id);
        }
      })
      .catch((err) => {
        console.warn('Permanent file save failed:', err);
      });

    setUploadSuccess(true);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadSuccess(false);
      setUploadName('');
      setUploadCategory('custom');
      setUploadSlots(1);
      workingCanvasRef.current = null;
      originalCanvasRef.current = null;
      setPreviewSrc(null);
      setUploadImageDims(null);
      setUploadError(null);
      setCustomSlotCoords([null]);
    }, 1200);
  }, [uploadName, uploadImageDims, uploadSlots, uploadCategory, customSlotCoords, allSlotsFilled, addCustomFrame, deleteCustomFrame]);

  const trendingIds = ['film-classic-1', 'polaroid-single', 'korean-pink-3', 'cute-hearts-1', 'retro-vintage-1'];

  const categoryStyles: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
    filmstrip: { bg: 'from-pink-50/20 via-purple-50/20 to-transparent', border: 'border-pink-100', icon: '🎞️', accent: 'text-pink-500' },
    korean: { bg: 'from-pink-50/20 via-purple-50/20 to-transparent', border: 'border-pink-100', icon: '🇰🇷', accent: 'text-pink-600' },
    polaroid: { bg: 'from-pink-50/20 via-purple-50/20 to-transparent', border: 'border-pink-100', icon: '📸', accent: 'text-pink-600' },
    cute: { bg: 'from-pink-50/20 via-pink-50/20 to-transparent', border: 'border-pink-100', icon: '🎀', accent: 'text-pink-500' },
    retro: { bg: 'from-pink-50/20 via-purple-50/20 to-transparent', border: 'border-pink-100', icon: '🎫', accent: 'text-pink-600' },
    custom: { bg: 'from-pink-50/20 via-purple-50/20 to-transparent', border: 'border-pink-100', icon: '📁', accent: 'text-pink-600' },
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

  const categoryFilters = [
    { label: 'Semua Style', value: 'all', emoji: '✨' },
    { label: 'Film Strip', value: 'filmstrip', emoji: '🎞️' },
    { label: 'Korean Style', value: 'korean', emoji: '🇰🇷' },
    { label: 'Polaroid', value: 'polaroid', emoji: '📸' },
    { label: 'Cute Kawaii', value: 'cute', emoji: '🎀' },
    { label: 'Retro Vintage', value: 'retro', emoji: '🎫' },
    ...(customFrames.length > 0 ? [{ label: 'Custom Upload', value: 'custom', emoji: '📁' }] : []),
  ];

  const filteredFrames = useMemo(() => {
    let result = allFrames.filter((frame) => {
      const matchesSlot = slotFilter === 'all' || frame.slots === slotFilter;
      const matchesCat = categoryFilter === 'all' || frame.category === categoryFilter;
      const matchesSearch =
        frame.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        frame.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSlot && matchesCat && matchesSearch;
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
  }, [slotFilter, categoryFilter, searchQuery, sortBy, allFrames]);

  const getCategoryCount = (category: string) => {
    if (category === 'all') return allFrames.length;
    return allFrames.filter((f) => f.category === category).length;
  };

  const handleFrameClick = (frame: FrameTemplate) => {
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
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        angle: (i / 26) * 360 + Math.random() * 12,
        distance: 90 + Math.random() * 150,
        emoji: ['✨', '💖', '🎀', '⭐', '💫', '🩷'][i % 6],
        delay: Math.random() * 0.12,
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
    visible: { opacity: 1, transition: { staggerChildren: 0.02 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 20 } },
    exit: { opacity: 0, scale: 0.92, y: 15, transition: { duration: 0.15 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <>
      <CursorTrail />

      <div
        onMouseMove={handleKawaiiMouseMove}
        className="min-h-screen bg-[#FFFDF6] text-zinc-800 selection:bg-pink-100/60 py-6 px-4 sm:px-8 lg:py-12 lg:px-16 relative overflow-x-hidden antialiased font-sans flex flex-col items-center w-full"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFEBE2_1px,transparent_1px),linear-gradient(to_bottom,#EFEBE2_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.9] pointer-events-none z-0" />

        <motion.div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: spotlightBackground }}
        />

        <div className="max-w-7xl w-full relative z-10 flex flex-col gap-8">

          {/* Heading Layout */}
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left border-b-4 border-dashed border-rose-200 pb-8 gap-6 w-full">
            <div className="flex flex-col items-center md:items-start">
              <button
                onClick={() => setStep('landing')}
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-600 font-black text-[10px] tracking-[0.25em] uppercase mb-3 transition-colors group px-3 py-1.5 bg-pink-50 rounded-full border border-pink-100/40"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Kembali
              </button>
              <div className="flex items-center gap-4 mb-2">
                {/* LOGO DENGAN CLEAN FLOOD-FILL BACKGROUND REMOVER */}
                <TransparentLogo
                  src="/logo.png"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_8px_rgba(244,63,94,0.2)] shrink-0"
                />
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                  Pilih{' '}
                  <span className="font-sans font-black italic bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-[0_2px_6px_rgba(255,182,193,0.2)]">
                    Bingkai Lucu
                  </span>{' '}
                  Kamu! ✨
                </h1>
              </div>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 font-normal max-w-xl">
                Yuk, temukan <span className="font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">{allFrames.length}</span> pilihan layout gemas buat abadikan momen serumu!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
              {hiddenFrameIds.size > 0 && (
                <button
                  onClick={handleRestoreHiddenFrames}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-purple-100 text-[10px] font-black tracking-widest uppercase text-purple-400 hover:bg-purple-50 transition-all shadow-sm"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Membuka ({hiddenFrameIds.size})
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_6px_15px_rgba(244,63,94,0.15)] hover:opacity-90 transition-all w-full sm:w-auto"
              >
                <Upload className="w-3.5 h-3.5 text-white animate-bounce" />
                Upload Frame Sendiri 🎀
              </button>
            </div>
          </div>

          {/* Master Control Deck */}
          <div className="w-full bg-white border-2 border-rose-100 p-5 rounded-[24px] shadow-[0_8px_24px_rgba(253,244,245,0.4)] flex flex-col gap-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
              <div className="relative sm:col-span-8 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input
                  type="text"
                  placeholder="Cari nama bingkai, kategori cetak imut..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-rose-50/10 border border-rose-100/50 rounded-xl text-xs text-zinc-800 placeholder-rose-300 focus:outline-none focus:border-pink-300"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="sm:col-span-4 w-full flex gap-2">
                <div className="flex items-center bg-white border border-rose-100 rounded-xl px-3 py-2 w-full">
                  <Clock className="w-3.5 h-3.5 text-pink-400 mr-2" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs text-zinc-700 font-black focus:outline-none cursor-pointer w-full"
                  >
                    <option value="popular">Paling Favorit ⭐</option>
                    <option value="newest">Koleksi Terbaru</option>
                    <option value="name">Urutan Abjad A-Z</option>
                  </select>
                </div>
                <button
                  onClick={resetFilters}
                  className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-xl text-pink-400 hover:text-pink-600 flex-shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
                <Grid3x3 className="w-3.5 h-3.5" /> <span>Kuantitas Grid Slot</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {slotFilters.map((sf) => (
                  <button
                    key={sf.value}
                    onClick={() => setSlotFilter(sf.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${slotFilter === sf.value
                      ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-transparent shadow-sm'
                      : 'bg-white text-zinc-600 border border-rose-100 hover:border-pink-300'
                      }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 " /> <span>Kurasi Tema Estetika</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoryFilters.map((cf) => {
                  const isActive = categoryFilter === cf.value;
                  const count = getCategoryCount(cf.value);
                  return (
                    <button
                      key={cf.value}
                      onClick={() => setCategoryFilter(cf.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border transition-all ${isActive
                        ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white border-transparent shadow-sm'
                        : 'bg-white text-zinc-600 border border-rose-100 hover:border-pink-200'
                        }`}
                    >
                      <span>{cf.emoji}</span>
                      <span>{cf.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-rose-50 text-pink-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KATALOG */}
          <div className="w-full">
            {filteredFrames.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full"
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
                      onFavorite={(e) => toggleFavorite(frame.id, e)}
                      onDelete={(e) => handleDeleteFrame(frame, e)}
                      onEdit={(e) => handleOpenRename(frame, e)}
                      onClick={() => handleFrameClick(frame)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-28 bg-white border-2 border-dashed border-rose-100 rounded-[28px] w-full"
              >
                <Filter className="w-10 h-10 text-rose-200 mx-auto mb-3" />
                <h3 className="font-serif text-lg text-zinc-700">Tidak ada bingkai ditemukan</h3>
                <p className="text-zinc-400 text-xs mt-1">Coba sesuaikan kata saringan filter kamu di atas ya!</p>
                <button
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white text-[10px] font-black tracking-widest uppercase rounded-xl"
                >
                  Setel Ulang Filter
                </button>
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewVisible && previewFrame && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closePreview}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-sm w-full bg-white border-4 border-rose-100 rounded-[32px] shadow-2xl overflow-hidden flex flex-col text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closePreview} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-pink-400">
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 pt-10 overflow-y-auto">
                <span className="text-[9px] font-black tracking-widest text-pink-400 uppercase mb-4 block">✨ PRATINJAU BINGKAI ✨</span>

                {(() => {
                  const previewStyle = categoryStyles[previewFrame.category] || categoryStyles.filmstrip;
                  return (
                    <div className={`relative rounded-2xl border border-rose-100 bg-gradient-to-br ${previewStyle.bg} p-6 aspect-[3/4] flex items-center justify-center shadow-inner overflow-hidden`}>
                      <img src={previewFrame.src} alt={previewFrame.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                    </div>
                  );
                })()}

                <div className="flex items-center justify-center gap-2 mt-5">
                  <h3 className="font-serif text-xl font-bold text-zinc-950 leading-tight">{previewFrame.name}</h3>
                  <button
                    onClick={(e) => handleOpenRename(previewFrame, e)}
                    className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-400 hover:bg-sky-500 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <span className="bg-pink-50 border border-pink-100 px-2 py-0.5 rounded text-[10px] text-pink-500 capitalize">
                    {previewFrame.category}
                  </span>
                  <span className="flex items-center gap-1"><Images className="w-3.5 h-3.5 text-pink-400" /> {previewFrame.slots} Slots</span>
                </div>
              </div>

              <div className="p-6 border-t border-rose-100/60 bg-[#FFFDF9] flex gap-3 relative">
                <button
                  onClick={closePreview}
                  disabled={isConfirmingSelection}
                  className="flex-1 py-3 bg-white border-2 border-rose-100 rounded-xl font-bold text-xs text-zinc-500"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmSelectFrame}
                  disabled={isConfirmingSelection}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-md flex items-center justify-center gap-2"
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
                            animate={{ x, y, opacity: 0, scale: 1.2, rotate: p.angle }}
                            transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
                            className="absolute text-xl"
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
            className="fixed inset-0 z-[70] bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleCloseRename}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative max-w-sm w-full bg-white border-4 border-rose-100 rounded-[28px] shadow-2xl overflow-hidden flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseRename} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-pink-400">
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 flex-shrink-0">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-zinc-800">Ubah Nama Frame</h2>
                    <p className="text-[10px] text-zinc-400 font-light mt-0.5">Nama baru akan tampil di seluruh katalog.</p>
                  </div>
                </div>

                {renameError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-500 text-xs px-4 py-2.5 rounded-xl mb-4">
                    {renameError}
                  </div>
                )}

                <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">Nama Frame</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(); }}
                  autoFocus
                  placeholder="Masukkan nama frame..."
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-rose-100 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-pink-300"
                />
              </div>

              <div className="p-6 pt-0 flex flex-col gap-2">
                <div className="flex gap-3">
                  <button onClick={handleCloseRename} className="flex-1 py-2.5 bg-white border-2 border-rose-100 rounded-xl text-xs font-bold text-zinc-500">Batal</button>
                  <button onClick={handleSaveRename} className="flex-1 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-md">Simpan</button>
                </div>
                {frameNameOverrides[renameTarget.id] && (
                  <button onClick={handleResetRenameToDefault} className="text-[10px] font-bold text-zinc-400 hover:text-rose-500 self-center mt-1">Kembalikan ke nama asli</button>
                )}
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
            className="fixed inset-0 z-[60] bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white border-4 border-rose-100 rounded-[28px] shadow-xl overflow-hidden max-h-[92vh] flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-5 right-5 z-20 w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-pink-500">
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto p-6 md:p-8 flex-1">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-rose-100">
                  <div className="w-11 h-11 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-zinc-800">Unggah Frame Kustom</h2>
                    <p className="text-[11px] text-zinc-400 font-light mt-0.5">Sistem otomatis mendeteksi transparansi lubang cetakan piksel.</p>
                  </div>
                </div>

                {uploadSuccess ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-serif font-black text-zinc-800">Berhasil Terdaftar!</h3>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    {uploadError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-500 text-xs px-4 py-2.5 rounded-xl">
                        {uploadError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">Nama Aset *</label>
                        <input
                          type="text"
                          value={uploadName}
                          onChange={(e) => setUploadName(e.target.value)}
                          placeholder="Ex: My Frame"
                          className="w-full px-3 py-2.5 bg-zinc-50 border border-rose-100 rounded-xl text-xs text-zinc-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">Style Rupa</label>
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-zinc-50 border border-rose-100 rounded-xl text-xs text-zinc-700 font-bold focus:outline-none cursor-pointer"
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
                        <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">Kuantitas Grid</label>
                        <select
                          value={uploadSlots}
                          onChange={(e) => handleSlotsChange(Number(e.target.value))}
                          className="w-full px-3 py-2.5 bg-zinc-50 border border-rose-100 rounded-xl text-xs text-zinc-700 font-black focus:outline-none cursor-pointer"
                        >
                          {[1, 2, 3, 4, 6, 8].map(n => <option key={n} value={n}>{n} Slot Placeholder</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">File Gambar *</label>
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />

                      {!previewSrc ? (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-rose-100 rounded-xl bg-zinc-50 flex flex-col items-center justify-center gap-1 cursor-pointer">
                          <Upload className="w-5 h-5 text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-700">Pilih berkas kompilasi gambar</span>
                          <span className="text-[9px] text-zinc-400">PNG, JPG, WEBP maks 10 MB</span>
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-zinc-50 border border-rose-100 rounded-xl flex justify-between items-center text-[10px]">
                          <span className="font-mono text-zinc-400 font-bold">{uploadImageDims && `${uploadImageDims.w} × ${uploadImageDims.h} px`}</span>
                          <div className="flex gap-4 font-bold">
                            <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600">Ganti</button>
                            <button onClick={handleRemoveImage} className="text-rose-500">Buang</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {previewSrc && uploadImageDims && (
                      <div className="space-y-3 bg-zinc-50 border border-rose-100 rounded-xl p-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black ${isAutoDetecting ? 'bg-sky-50 border border-sky-100 text-sky-500' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
                          {isAutoDetecting ? (
                            <>
                              <ScanSearch className="w-3.5 h-3.5 animate-pulse" />
                              Membuat area foto transparan secara otomatis...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Semua {uploadSlots} area foto otomatis transparan & pas — bingkai aslinya tetap sama. Siap didaftarkan!
                            </>
                          )}
                        </div>

                        <span className="text-[9px] font-black uppercase text-zinc-400 block">Pratinjau Bingkai</span>

                        <div
                          className="relative border border-rose-100 rounded-xl overflow-hidden mx-auto bg-white flex items-center justify-center shadow-sm"
                          style={{
                            maxHeight: '180px',
                            aspectRatio: `${uploadImageDims.w} / ${uploadImageDims.h}`,
                            backgroundImage: 'linear-gradient(45deg, #EEEEEE 25%, transparent 25%), linear-gradient(-45deg, #EEEEEE 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EEEEEE 75%), linear-gradient(-45deg, transparent 75%, #EEEEEE 75%)',
                            backgroundSize: '12px 14px',
                          }}
                        >
                          <img src={previewSrc} alt="Workspace" className="max-w-full max-h-full object-contain" />
                        </div>

                        <div className="flex justify-end items-center text-[10px] font-bold">
                          <button onClick={_handleResetAll} className="text-zinc-500 hover:text-pink-500 transition-colors">
                            Deteksi Ulang
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!uploadSuccess && (
                <div className="p-6 border-t border-rose-100/60 bg-[#FFFDF9] flex gap-3">
                  <button onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2.5 bg-white border-2 border-rose-100 rounded-xl text-xs font-bold text-zinc-500">Batal</button>
                  <button onClick={handleUploadSubmit} disabled={!allSlotsFilled} className="flex-1 py-2.5 bg-zinc-950 text-white text-xs font-black tracking-widest uppercase rounded-xl disabled:opacity-35">Daftarkan Frame</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};