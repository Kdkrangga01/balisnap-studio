import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth, DEFAULT_PHOTO_ZOOM, MAX_PHOTO_ZOOM, CUSTOM_MIN_PHOTO_ZOOM } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { FilterPanel } from '../components/editor/FilterPanel';
import { RetouchPanel } from '../components/editor/RetouchPanel';
import { FrameColorPanel } from '../components/editor/FrameColorPanel';
import { StickerPanel } from '../components/editor/StickerPanel';
import { TextPanel } from '../components/editor/TextPanel';
import { getSlotCornerPosition, findNextBestStickerPosition } from '../lib/stickerPlacement';
import {
  ArrowLeft,
  Camera,
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
  MoveUpLeft,
  MoveUpRight,
  MoveDownLeft,
  MoveDownRight,
  LayoutGrid
} from 'lucide-react';

export const Editor: React.FC = () => {
  const {
    selectedFrame,
    setStep,
    selectedId,
    setSelectedId,
    removeSticker,
    removeText,
    updateSticker,
    addSticker,
    addText,
    stickers: canvasStickers,
    texts: canvasTexts,
    photos,
    photoTransforms,
    updatePhotoTransform,
    resetPhotoTransform,
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

  // Paskan foto kembali ke penyesuaian otomatis bingkai
  const handlePhotoFitToFrame = () => {
    if (selectedPhotoIndex === null) return;
    updatePhotoTransform(selectedPhotoIndex, { zoom: DEFAULT_PHOTO_ZOOM, x: 0, y: 0 });
  };

  const handlePhotoZoomReset = () => { 
    if (selectedPhotoIndex === null) return;
    resetPhotoTransform(selectedPhotoIndex);
  };

  // Pindahkan stiker terpilih ke sudut bingkai foto (Pojok Kiri-Atas, Kanan-Atas, Kiri-Bawah, Kanan-Bawah)
  const moveStickerToSlotCorner = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!selectedId || !selectedId.startsWith('sticker-') || !selectedFrame) return;
    const targetSticker = canvasStickers.find((s) => s.id === selectedId);
    if (!targetSticker) return;

    const slotIdx = selectedPhotoIndex !== null ? selectedPhotoIndex : 0;
    const pos = getSlotCornerPosition(selectedFrame, slotIdx, corner);

    targetSticker.x = pos.x;
    targetSticker.y = pos.y;
    targetSticker.rotation = pos.rotation;

    // Refresh penanda elemen
    setSelectedId(null);
    setTimeout(() => setSelectedId(selectedId), 30);
  };

  // PAKET AUTO SPREAD: Menyebarkan SELURUH stiker yang ada secara seragam dan rapi di sudut bingkai
  const autoSpreadStickersEqually = () => {
    if (canvasStickers.length === 0 || !selectedFrame) return;

    const placed: Array<{ x: number; y: number }> = [];
    canvasStickers.forEach((stk) => {
      const pos = findNextBestStickerPosition(selectedFrame, placed);
      stk.x = pos.x;
      stk.y = pos.y;
      stk.rotation = pos.rotation;
      placed.push({ x: pos.x, y: pos.y });
    });

    setSelectedId(null);
  };

  // Menyimpan jumlah stiker sebelumnya, untuk mendeteksi kapan ada stiker BARU ditambahkan
  return (
    <div
      className="min-h-screen py-5 px-3 md:py-8 md:px-6 relative overflow-hidden text-zinc-800 selection:bg-zinc-200 bg-[#F8F9FA]"
    >
      {/* Google Font Import untuk Condensed Headline Koran */}
      <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* 1. SOFT AMBIENT LIGHTING */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/70 via-zinc-50/40 to-transparent pointer-events-none z-0" />
      <div
        className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none z-0 blur-[120px] opacity-30 bg-slate-200"
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[550px] h-[550px] rounded-full pointer-events-none z-0 blur-[130px] opacity-25 bg-zinc-200"
      />

      {/* Architectural Micro-Grid Pattern */} 
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.025) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <button
              onClick={() => setStep('capture')}
              className="flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase mb-2 text-stone-500 hover:text-[#1D63FF] transition-all group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Kamera
            </button>
            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-tight text-zinc-900">
              BaliSnap Studio{' '}
              <span className="text-[#1D63FF]">Editor</span>
            </h1>
            <p className="text-zinc-500 text-xs flex items-center gap-2 mt-1.5 font-medium"> 
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              {totalElements} elemen terpasang •{' '}
              <span className="text-[#1D63FF] font-bold">{filledSlots}/{totalSlots}</span> foto terisi
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStep('preview')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#1D63FF] hover:bg-[#1550D6] shadow-sm shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Pratinjau</span>
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
                className="absolute top-[2px] left-1/2 -translate-x-1/2 px-4 h-6 rounded-full border z-20 pointer-events-none flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-blue-700 bg-blue-50/90 border-blue-200/80 shadow-xs"
              >
                <Camera className="w-3 h-3 text-[#1D63FF] inline" />
                <span>BALISNAP STUDIO</span>
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
            <div className="p-5 md:p-6 rounded-[32px] border border-stone-200/80 bg-white/95 backdrop-blur-xl flex flex-col gap-4.5 shadow-[0_16px_40px_rgba(0,0,0,0.04)] text-left">

              {/* Quick Select Slot Foto Bar - Clean Minimalist Studio Look */}
              <div className="bg-stone-50/90 border border-stone-200/70 p-3 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-stone-500">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <Scan className="w-3.5 h-3.5 text-[#1D63FF]" />
                    Pilih Foto Untuk Disesuaikan:
                  </span>
                  <span className="text-[10px] bg-stone-200/60 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                    {totalSlots} Slot
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll pb-1"> 
                  {Array.from({ length: totalSlots }).map((_, idx) => { 
                    const isSelected = selectedPhotoIndex === idx; 
                    return ( 
                       <button 
                        key={idx} 
                        onClick={() => setSelectedId(`photo-${idx}`)}
                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#1D63FF] text-white shadow-xs font-bold ring-2 ring-blue-200/70' 
                            : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-100/80 hover:text-stone-900 font-semibold' 
                        }`}
                      >
                        <ImageIcon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                        <span>Foto #{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tool Tabs - Clean Segmented Control with Royal Blue Theme */}
              <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-stone-100/90 border border-stone-200/70 shadow-xs">
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
                      className={`relative py-2 px-0.5 rounded-xl text-[10.5px] tracking-tight uppercase transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-[#1D63FF] text-white shadow-sm shadow-blue-500/25 font-bold'
                          : 'text-stone-600 hover:text-[#1D63FF] hover:bg-white/60 font-semibold'
                      }`}
                    >
                      {isLocked && <Lock className="w-3 h-3 text-white shrink-0" />}
                      <tab.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* BAR TOMBOL AUTO SPREAD / OTOMATIS PAS SUDUT BINGKAI */}
              {canvasStickers.length > 0 && (
                <div className="bg-stone-50 border border-stone-200/90 p-2 sm:px-3 rounded-2xl flex items-center justify-between gap-2 shadow-2xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-stone-200/60 flex items-center justify-center text-stone-600">
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-stone-700 tracking-tight">
                      Ratakan Otomatis
                    </span>
                  </div>
                  <button
                    onClick={autoSpreadStickersEqually}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-semibold text-[10.5px] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LayoutGrid className="w-3 h-3 text-stone-300" />
                    <span>Pas Ke Sudut Bingkai</span>
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

                    {/* BAR KONTROL UKURAN & ZOOM STIKER */}
                    {selectedId?.startsWith('sticker-') && (() => {
                      const selectedStk = canvasStickers.find((s) => s.id === selectedId);
                      const currentScale = selectedStk?.scaleX ?? 1;
                      const scalePercent = Math.round(currentScale * 100);

                      return (
                        <div className="bg-rose-50/90 border border-rose-200/90 p-2.5 rounded-2xl flex flex-col gap-2 shadow-sm">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-rose-800">
                            <span className="flex items-center gap-1.5">
                              <Maximize className="w-3.5 h-3.5 text-rose-500" />
                              Ukuran Stiker: <span className="text-rose-600 font-extrabold">{scalePercent}%</span>
                            </span>
                            {scalePercent !== 100 && (
                              <button
                                onClick={() => {
                                  if (selectedStk) {
                                    updateSticker(selectedStk.id, { scaleX: 1, scaleY: 1 });
                                  }
                                }}
                                className="text-[10px] text-rose-500 hover:text-rose-700 underline font-semibold cursor-pointer"
                              >
                                Reset (100%)
                              </button>
                            )}
                          </div>

                          {/* Tombol Min, Slider, Tombol Plus */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (selectedStk) {
                                  const next = Math.max(0.3, Number((currentScale - 0.1).toFixed(2)));
                                  updateSticker(selectedStk.id, { scaleX: next, scaleY: next });
                                }
                              }}
                              className="p-1.5 bg-white hover:bg-rose-100 rounded-xl text-rose-700 border border-rose-200 shadow-sm transition-all cursor-pointer shrink-0"
                              title="Perkecil Stiker (-10%)"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </button>

                            <input
                              type="range"
                              min={30}
                              max={250}
                              step={5}
                              value={scalePercent}
                              onChange={(e) => {
                                if (selectedStk) {
                                  const val = Number(e.target.value) / 100;
                                  updateSticker(selectedStk.id, { scaleX: val, scaleY: val });
                                }
                              }}
                              className="flex-1 accent-rose-500 cursor-pointer h-2 bg-rose-200 rounded-lg appearance-none"
                            />

                            <button
                              onClick={() => {
                                if (selectedStk) {
                                  const next = Math.min(2.5, Number((currentScale + 0.1).toFixed(2)));
                                  updateSticker(selectedStk.id, { scaleX: next, scaleY: next });
                                }
                              }}
                              className="p-1.5 bg-white hover:bg-rose-100 rounded-xl text-rose-700 border border-rose-200 shadow-sm transition-all cursor-pointer shrink-0"
                              title="Perbesar Stiker (+10%)"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-rose-200/50">
                            <span>💡 Tarik sudut stiker di bingkai foto atau scroll mouse untuk ubah ukuran</span>
                          </div>
                        </div>
                      );
                    })()}

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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/90 shadow-2xs transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-stone-200/80 shadow-2xs text-[#1D63FF]">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-stone-900 block leading-tight">
                            Foto #{selectedPhotoIndex + 1}
                          </span>
                          <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                            Zoom {Math.round(selectedPhotoZoom * 100)}% • Geser Foto
                          </p>
                        </div> 
                      </div> 

                      {/* Tombol Kontrol Zoom Perkecil, Perbesar, Fit Frame & Reset */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePhotoZoom(-1)}
                          disabled={selectedPhotoZoom <= CUSTOM_MIN_PHOTO_ZOOM}
                          className="w-8 h-8 bg-white hover:bg-stone-100 rounded-xl text-stone-700 border border-stone-200/80 transition-all disabled:opacity-30 shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
                          title="Perkecil foto (Zoom Out)"
                        >
                          <ZoomOut className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <button
                          onClick={() => handlePhotoZoom(1)}
                          disabled={selectedPhotoZoom >= MAX_PHOTO_ZOOM}
                          className="w-8 h-8 bg-white hover:bg-stone-100 rounded-xl text-stone-700 border border-stone-200/80 transition-all disabled:opacity-30 shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
                          title="Perbesar foto (Zoom In)"
                        >
                          <ZoomIn className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <button
                          onClick={handlePhotoFitToFrame}
                          className="px-3 py-2 bg-[#1D63FF] hover:bg-[#1550D6] active:scale-95 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                          title="Kembalikan posisi pas bingkai otomatis"
                          aria-label="Pas Bingkai"
                        >
                          <Maximize className="w-3 h-3 shrink-0" />
                          <span className="whitespace-nowrap">Pas Bingkai</span>
                        </button>
                        <button
                          onClick={handlePhotoZoomReset}
                          className="w-8 h-8 bg-white hover:bg-stone-100 rounded-xl text-stone-600 border border-stone-200/80 transition-all shadow-2xs flex items-center justify-center cursor-pointer active:scale-95"
                          title="Reset posisi & zoom"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs text-stone-600 text-left font-medium">
                      <AlertCircle className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>Klik foto atau stiker pada bingkai untuk mengatur zoom &amp; posisi</span>
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