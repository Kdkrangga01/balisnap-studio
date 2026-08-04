import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth, DEFAULT_PHOTO_ZOOM, MAX_PHOTO_ZOOM, CUSTOM_MIN_PHOTO_ZOOM } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { FilterPanel } from '../components/editor/FilterPanel';
import { RetouchPanel } from '../components/editor/RetouchPanel';
import { FrameColorPanel } from '../components/editor/FrameColorPanel';
import { StickerPanel } from '../components/editor/StickerPanel';
import { TextPanel } from '../components/editor/TextPanel';
import { getFrame4Corners, getStickerCornerPosition } from '../lib/stickerPlacement';
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  Eye,
  Sliders,
  Palette,
  Smile,
  Type,
  Copy,
  Layers,
  CheckCircle,
  AlertCircle,
  X,
  Grid3x3,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ImageIcon,
  Wand2,
  Maximize,
  Scan,
  Lock,
  MapPin,
  Edit3,
  MoveUpLeft,
  MoveUpRight,
  MoveDownLeft,
  MoveDownRight,
  LayoutGrid,
  Sparkle
} from 'lucide-react';

export const Editor: React.FC = () => {
  const {
    selectedFrame,
    setStep,
    selectedId,
    setSelectedId,
    removeSticker,
    removeText,
    addSticker,
    addText,
    stickers: canvasStickers,
    texts: canvasTexts,
    photos,
    photoTransforms,
    updatePhotoTransform,
    resetPhotoTransform,
    customHeadline,
    setCustomHeadline,
  } = usePhotobooth();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(400);
  const [activeTab, setActiveTab] = useState<'filter' | 'retouch' | 'frame' | 'sticker' | 'text'>('filter');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);

  // Responsive canvas width
  useEffect(() => {
    if (containerRef.current) {
      const handleResize = () => {
        const parentWidth = containerRef.current?.offsetWidth || 400;
        const maxWidth = window.innerWidth < 768 ? 350 : 450;
        const targetWidth = Math.min(parentWidth, maxWidth);
        setCanvasWidth(targetWidth);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!selectedFrame) return null;

  const totalSlots = selectedFrame.slots;
  const filledSlots = photos.filter((p) => p !== null).length;
  const totalElements = canvasStickers.length + canvasTexts.length;

  const handleDeleteSelected = () => {
    if (!selectedId || selectedId.startsWith('photo-')) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!selectedId) return;
    if (selectedId.startsWith('sticker-')) {
      removeSticker(selectedId);
    } else if (selectedId.startsWith('text-')) {
      removeText(selectedId);
    }
    setShowDeleteConfirm(false);
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedId || selectedId.startsWith('photo-')) return;
    if (selectedId.startsWith('sticker-')) {
      const sticker = canvasStickers.find((s) => s.id === selectedId);
      if (sticker) {
        addSticker(sticker.stickerId, { x: sticker.x + 20, y: sticker.y + 20 });
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      }
    } else if (selectedId.startsWith('text-')) {
      const textEl = canvasTexts.find((t) => t.id === selectedId);
      if (textEl) {
        addText(textEl.text, textEl.fill, textEl.fontFamily, {
          x: textEl.x + 20,
          y: textEl.y + 20,
          fontSize: textEl.fontSize,
        });
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, canvasStickers, canvasTexts]);

  const hasSelectedElement = selectedId !== null && !selectedId.startsWith('photo-');

  const selectedPhotoIndex = selectedId?.startsWith('photo-')
    ? parseInt(selectedId.replace('photo-', ''), 10)
    : null;
  const selectedPhotoZoom = selectedPhotoIndex !== null
    ? (photoTransforms[selectedPhotoIndex]?.zoom ?? DEFAULT_PHOTO_ZOOM)
    : DEFAULT_PHOTO_ZOOM;
  const PHOTO_ZOOM_BUTTON_STEP = 0.15;

  // Handler Zoom Perkecil / Perbesar tanpa merusak/menggeser bingkai
  const handlePhotoZoom = (direction: 1 | -1) => {
    if (selectedPhotoIndex === null) return;
    const nextZoom = Math.max(
      CUSTOM_MIN_PHOTO_ZOOM,
      Math.min(MAX_PHOTO_ZOOM, selectedPhotoZoom + direction * PHOTO_ZOOM_BUTTON_STEP)
    );
    updatePhotoTransform(selectedPhotoIndex, { zoom: nextZoom });
  };

  // Fit foto agar PAS 100% PENUH dalam slot bingkai (tanpa celah)
  const handlePhotoFitToFrame = () => {
    if (selectedPhotoIndex === null || !selectedFrame) return;

    const slot = selectedFrame.slotCoords[selectedPhotoIndex % selectedFrame.slotCoords.length];
    if (!slot) return;

    const photoSrc = photos[selectedPhotoIndex];
    if (!photoSrc) {
      updatePhotoTransform(selectedPhotoIndex, { zoom: DEFAULT_PHOTO_ZOOM, x: 0, y: 0 });
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = photoSrc;
    img.onload = () => {
      const imgW = img.naturalWidth || img.width || 800;
      const imgH = img.naturalHeight || img.height || 800;

      const containScale = Math.min(slot.w / imgW, slot.h / imgH);
      const coverScale = Math.max(slot.w / imgW, slot.h / imgH);
      const idealCoverZoom = Math.max(1.0, Number((coverScale / containScale).toFixed(2)));

      updatePhotoTransform(selectedPhotoIndex, { zoom: idealCoverZoom, x: 0, y: 0 });
    };

    const containScale = Math.min(slot.w / 800, slot.h / 800);
    const coverScale = Math.max(slot.w / 800, slot.h / 800);
    const fallbackZoom = Math.max(1.0, Number((coverScale / containScale).toFixed(2)));
    updatePhotoTransform(selectedPhotoIndex, { zoom: fallbackZoom, x: 0, y: 0 });
  };

  const handlePhotoZoomReset = () => {
    if (selectedPhotoIndex === null) return;
    resetPhotoTransform(selectedPhotoIndex);
  };

  // Cek apakah bingkai saat ini berjenis Newspaper / Frame Special
  const isNewspaperFrame = selectedFrame.id.includes('newspaper') ||
    selectedFrame.name.toLowerCase().includes('special') ||
    selectedFrame.name.toLowerCase().includes('retro') ||
    selectedFrame.name.toLowerCase().includes('newspaper');



  // Pindahkan stiker terpilih ke sudut bingkai (Pojok Kiri-Atas, Kanan-Atas, Kanan-Bawah, Kiri-Bawah)
  const moveStickerToSlotCorner = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!selectedId || !selectedId.startsWith('sticker-') || !selectedFrame) return;
    const targetSticker = canvasStickers.find((s) => s.id === selectedId);
    if (!targetSticker) return;

    const renderW = canvasWidth || 400;
    const corners = getFrame4Corners(selectedFrame, renderW, 44, 44);
    const targetCorner = corners.find((c) => c.cornerName === corner) || corners[0];

    targetSticker.x = targetCorner.x;
    targetSticker.y = targetCorner.y;

    // Refresh penanda elemen
    setSelectedId(null);
    setTimeout(() => setSelectedId(selectedId), 30);
  };

  // PAKET AUTO SPREAD: Menyebarkan SELURUH stiker yang ada secara seragam khusus di 4 POJOK LUAR BINGKAI
  const autoSpreadStickersEqually = () => {
    if (canvasStickers.length === 0 || !selectedFrame) return;

    const renderW = canvasWidth || 400;

    canvasStickers.forEach((stk, index) => {
      const pos = getStickerCornerPosition(selectedFrame, renderW, index, 44, 44);
      stk.x = pos.x;
      stk.y = pos.y;
    });

    setSelectedId(null);
  };

  // Menyimpan jumlah stiker sebelumnya, untuk mendeteksi kapan ada stiker BARU ditambahkan
  return (
    <div
      className="min-h-screen py-5 px-3 md:py-8 md:px-6 relative overflow-hidden text-slate-800 selection:bg-pink-200"
      style={{
        background: 'linear-gradient(135deg, #FAF7F2 0%, #F3EBE1 50%, #FAF0E6 100%)'
      }}
    >
      {/* Google Font Import untuk Condensed Headline Koran */}
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* 1. SOFT BRIGHT AMBIENT BLURS */}
      <div
        className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-[100px] opacity-60"
        style={{ background: '#FFD1DC' }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[550px] h-[550px] rounded-full pointer-events-none z-0 blur-[120px] opacity-50"
        style={{ background: '#E2D5F8' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full pointer-events-none z-0 blur-[130px] opacity-40"
        style={{ background: '#FFE5B4' }}
      />

      {/* Aesthetic Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-25"
        style={{
          backgroundImage: `linear-gradient(to right, #D6C7B2 1px, transparent 1px), linear-gradient(to bottom, #D6C7B2 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* FLOATING DECORATIONS */}
      <div className="absolute top-16 left-10 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block drop-shadow-sm" style={{ animationDuration: '3.5s' }}>🎀</div>
      <div className="absolute top-1/2 left-8 text-2xl animate-pulse pointer-events-none text-pink-400 hidden xl:block"><Sparkles className="w-7 h-7" /></div>
      <div className="absolute bottom-24 left-12 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block drop-shadow-sm" style={{ animationDuration: '4.5s' }}>🌸</div>
      <div className="absolute top-28 right-10 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block drop-shadow-sm" style={{ animationDuration: '4s' }}>💖</div>
      <div className="absolute bottom-20 right-14 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block drop-shadow-sm" style={{ animationDuration: '5s' }}>✨</div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <button
              onClick={() => setStep('capture')}
              className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase mb-2 text-rose-500 hover:text-rose-700 transition-all group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Kamera
            </button>
            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight text-slate-800 flex items-center gap-2.5">
              <span className="bg-gradient-to-r from-rose-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                BaliSnap Studio
              </span>{' '}
              Editor
              <Wand2 className="w-5 h-5 text-rose-400 animate-spin" style={{ animationDuration: '10s' }} />
            </h1>
            <p className="text-slate-500 text-xs flex items-center gap-2 mt-1 font-medium">
              <Layers className="w-4 h-4 text-rose-400" />
              {totalElements} elemen terpasang •{' '}
              <span className="text-rose-600 font-bold">{filledSlots}/{totalSlots}</span> foto terisi
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStep('preview')}
              className="relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all flex items-center gap-2 overflow-hidden group border border-white/50 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Eye className="w-4 h-4" />
              <span className="hidden xs:inline">Pratinjau</span>
              <span className="xs:hidden">👁</span>
            </button>
          </div>
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

          {/* LEFT: Canvas Area */}
          <div className="lg:col-span-7 flex flex-col items-center" ref={containerRef}>
            <div
              className="w-full rounded-3xl p-3 md:p-5 relative border backdrop-blur-xl transition-all shadow-xl shadow-stone-200/50"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                borderColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {/* Aesthetic Header Ribbon */}
              <div
                className="absolute top-[2px] left-1/2 -translate-x-1/2 w-44 h-6 rounded-full border z-20 pointer-events-none flex items-center justify-center text-[9px] font-bold tracking-widest uppercase text-rose-600 shadow-sm"
                style={{
                  background: 'linear-gradient(90deg, #FFE4E6, #F3E8FF)',
                  borderColor: '#FECDD3',
                }}
              >
                ✨ BALISNAP STUDIO ✨
              </div>

              {/* CANVAS CONTAINER */}
              <div className="flex justify-center relative overflow-hidden rounded-2xl border border-stone-200/60 mt-2 bg-white/50">
                <PhotoCanvas stageRef={stageRef} containerWidth={canvasWidth} />
              </div>
            </div>

            {/* Shortcut hints */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-4 text-[10px] text-slate-500 font-semibold tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Klik foto/elemen
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Klik &amp; geser foto
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Scroll zoom foto
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-white text-slate-700 rounded text-[9px] border border-slate-200 shadow-sm">Del</kbd> hapus
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-white text-slate-700 rounded text-[9px] border border-slate-200 shadow-sm">Ctrl+D</kbd> duplikat
              </span>
            </div>
          </div>

          {/* RIGHT: Control Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div
              className="p-5 rounded-3xl border backdrop-blur-xl flex flex-col gap-5 shadow-xl shadow-stone-200/50"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >

              {/* ===== FITUR CUSTOM NAMA DAERAH (DIPAKAI JIKA isNewspaperFrame AKTIF) ===== */}
              {(selectedFrame && isNewspaperFrame) && (
                <div className="bg-gradient-to-r from-stone-900 via-zinc-900 to-black p-4 rounded-2xl border border-amber-500/30 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs shadow-sm">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Custom Nama Daerah / Kota
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Font Bawaan Koran
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 mb-3">
                    Ketik nama daerah kamu untuk mengganti teks utama pada header bingkai koran ini. Kosongkan untuk memakai teks bawaan "DENPASAR".
                  </p>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={customHeadline}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (setCustomHeadline) {
                          setCustomHeadline(val);
                        }
                      }}
                      placeholder="DENPASAR"
                      maxLength={18}
                      className="w-full bg-zinc-800/90 border border-amber-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 rounded-xl px-3.5 py-2.5 text-amber-200 font-extrabold uppercase tracking-widest text-base shadow-inner transition-all outline-none placeholder:text-zinc-500 placeholder:font-extrabold"
                      style={{
                        fontFamily: "'Oswald', 'Impact', 'Bebas Neue', sans-serif",
                        letterSpacing: '0.08em',
                      }}
                    />
                    <Edit3 className="w-4 h-4 text-amber-400 absolute right-3 pointer-events-none opacity-80" />
                  </div>

                  {/* Font Style Preview Badge */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                    <span>Preview Font Style:</span>
                    <span
                      className="text-amber-300 font-black tracking-widest uppercase bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-700"
                      style={{ fontFamily: "'Oswald', 'Impact', sans-serif" }}
                    >
                      {customHeadline || 'DENPASAR'}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Select Slot Foto Bar */}
              <div className="bg-purple-50/80 border border-purple-100 p-2.5 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
                    Pilih Foto Untuk Disesuaikan:
                  </span>
                  <span className="text-slate-400 font-bold">{totalSlots} Slot</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1">
                  {Array.from({ length: totalSlots }).map((_, idx) => {
                    const isSelected = selectedPhotoIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedId(`photo-${idx}`)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isSelected
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105'
                          : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-100/60'
                          }`}
                      >
                        <Scan className="w-3 h-3" />
                        <span>Foto #{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tool Tabs */}
              <div
                className="grid grid-cols-5 gap-1 p-1.5 rounded-2xl border"
                style={{
                  background: '#F8F1E7',
                  borderColor: '#EFE5D8'
                }}
              >
                {[
                  { key: 'filter', icon: Sliders, label: 'Filter' },
                  { key: 'retouch', icon: Wand2, label: 'Retouch', isPremium: true },
                  { key: 'frame', icon: Palette, label: 'Frame' },
                  { key: 'sticker', icon: Smile, label: 'Stiker' },
                  { key: 'text', icon: Type, label: 'Teks' },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  const isLocked = false;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key as typeof activeTab);
                        setSelectedId(null);
                      }}
                      className="relative py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)'
                          : 'transparent',
                        color: isActive ? '#ffffff' : '#64748B',
                        boxShadow: isActive ? '0 4px 12px rgba(225,29,72,0.25)' : 'none'
                      }}
                    >
                      {isLocked && <Lock className="w-3 h-3 text-pink-500 shrink-0" />}
                      <tab.icon className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* BAR TOMBOL AUTO SPREAD / OTOMATIS PAS SUDUT BINGKAI */}
              {canvasStickers.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-300/60 p-2.5 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                      Ratakan Otomatis
                    </span>
                  </div>
                  <button
                    onClick={autoSpreadStickersEqually}
                    className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    ✨ Pas Ke Sudut Bingkai
                  </button>
                </div>
              )}

              {/* Selected Element Quick Actions & Auto-Corner Positioner */}
              <AnimatePresence mode="wait">
                {hasSelectedElement ? (
                  <motion.div
                    key="selected-actions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden flex flex-col gap-2"
                  >
                    <div
                      className="flex items-center justify-between p-3 rounded-2xl border transition-all"
                      style={{
                        background: '#FFF1F2',
                        borderColor: '#FECDD3'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200">
                          {selectedId?.startsWith('sticker-') ? (
                            <Smile className="w-5 h-5 text-rose-500" />
                          ) : (
                            <Type className="w-5 h-5 text-rose-500" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800">
                            {selectedId?.startsWith('sticker-') ? 'Stiker' : 'Teks'}
                          </span>
                          <p className="text-[10px] text-slate-500">Terpilih</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDuplicate}
                          className="p-2 bg-white hover:bg-rose-50 rounded-xl text-slate-700 border border-slate-200 transition-all shadow-sm cursor-pointer"
                          title="Duplikat (Ctrl+D)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 border border-red-200 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* BAR OTOMATIS PENEMPATAN STIKER DI POJOK SLOT FOTO */}
                    {selectedId?.startsWith('sticker-') && (
                      <div className="bg-rose-50/80 border border-rose-200/80 p-2.5 rounded-2xl flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-rose-700">
                          <span>Tempel Otomatis Ke Sudut Foto #{selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 1}:</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 mt-0.5">
                          <button
                            onClick={() => moveStickerToSlotCorner('top-left')}
                            className="p-2 bg-white hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Tempel di Kiri Atas Bingkai Foto"
                          >
                            <MoveUpLeft className="w-4 h-4 text-rose-500" />
                            <span>Kiri Atas</span>
                          </button>
                          <button
                            onClick={() => moveStickerToSlotCorner('top-right')}
                            className="p-2 bg-white hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Tempel di Kanan Atas Bingkai Foto"
                          >
                            <MoveUpRight className="w-4 h-4 text-rose-500" />
                            <span>Kanan Atas</span>
                          </button>
                          <button
                            onClick={() => moveStickerToSlotCorner('bottom-left')}
                            className="p-2 bg-white hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Tempel di Kiri Bawah Bingkai Foto"
                          >
                            <MoveDownLeft className="w-4 h-4 text-rose-500" />
                            <span>Kiri Bawah</span>
                          </button>
                          <button
                            onClick={() => moveStickerToSlotCorner('bottom-right')}
                            className="p-2 bg-white hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-sm transition-all cursor-pointer"
                            title="Tempel di Kanan Bawah Bingkai Foto"
                          >
                            <MoveDownRight className="w-4 h-4 text-rose-500" />
                            <span>Kanan Bawah</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : selectedPhotoIndex !== null ? (
                  <motion.div
                    key="selected-photo-zoom"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-3.5 rounded-2xl border transition-all shadow-sm"
                      style={{
                        background: '#F3E8FF',
                        borderColor: '#E9D5FF'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                          <ImageIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800">
                            Foto #{selectedPhotoIndex + 1}
                          </span>
                          <p className="text-[10px] text-purple-700 font-semibold">
                            Zoom {Math.round(selectedPhotoZoom * 100)}% • Geser Foto
                          </p>
                        </div>
                      </div>

                      {/* Tombol Kontrol Zoom Perkecil, Perbesar, Fit Frame & Reset */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePhotoZoom(-1)}
                          disabled={selectedPhotoZoom <= CUSTOM_MIN_PHOTO_ZOOM}
                          className="p-2 bg-white hover:bg-purple-100/80 rounded-xl text-slate-700 border border-purple-200 transition-all disabled:opacity-30 shadow-sm cursor-pointer"
                          title="Perkecil foto (Zoom Out) agar latar belakang tidak terpotong"
                        >
                          <ZoomOut className="w-4 h-4 text-purple-700" />
                        </button>
                        <button
                          onClick={() => handlePhotoZoom(1)}
                          disabled={selectedPhotoZoom >= MAX_PHOTO_ZOOM}
                          className="p-2 bg-white hover:bg-purple-100/80 rounded-xl text-slate-700 border border-purple-200 transition-all disabled:opacity-30 shadow-sm cursor-pointer"
                          title="Perbesar foto (Zoom In)"
                        >
                          <ZoomIn className="w-4 h-4 text-purple-700" />
                        </button>
                        <button
                          onClick={handlePhotoFitToFrame}
                          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                          title="Otomatis paskan foto 100% penuh dalam bingkai (tanpa celah)"
                        >
                          <Maximize className="w-3.5 h-3.5 shrink-0" />
                          <span className="whitespace-nowrap">Pas Bingkai</span>
                        </button>
                        <button
                          onClick={handlePhotoZoomReset}
                          className="p-2 bg-white hover:bg-purple-100/80 rounded-xl text-slate-700 border border-purple-200 transition-all shadow-sm cursor-pointer"
                          title="Reset posisi & zoom"
                        >
                          <RotateCcw className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800 text-left">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      Klik stiker atau foto pada bingkai untuk mengaktifkan pengaturan cepat
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Sub-Panel Area */}
              <div className="min-h-[220px] md:min-h-[260px] relative text-slate-800">
                {activeTab === 'filter' && <FilterPanel />}
                {activeTab === 'retouch' && <RetouchPanel />}
                {activeTab === 'frame' && <FrameColorPanel />}
                {activeTab === 'sticker' && <StickerPanel />}
                {activeTab === 'text' && <TextPanel />}
              </div>

              {/* Info footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/60 text-[10px] text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <Grid3x3 className="w-3.5 h-3.5 text-rose-500" />
                  {totalElements} elemen
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {filledSlots}/{totalSlots} foto
                </span>
                <span className="flex items-center gap-1.5 truncate max-w-[130px]">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">{selectedFrame.name}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== DELETE CONFIRMATION POPUP ===== */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4 text-left">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Hapus Elemen?</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {selectedId?.startsWith('sticker-') ? 'Stiker' : 'Teks'} akan dihapus permanen.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== COPY TOAST ===== */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20"
          >
            <Copy className="w-4 h-4 text-pink-300" />
            <span className="text-xs font-bold">Elemen berhasil diduplikasi!</span>
            <button onClick={() => setShowCopiedToast(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #FB7185;
          border-radius: 20px;
        }
        @media (min-width: 480px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }
        @media (max-width: 479px) {
          .xs\\:inline { display: none; }
          .xs\\:hidden { display: inline; }
        }
      `}</style>
    </div>
  );
};