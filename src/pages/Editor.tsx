import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { FilterPanel } from '../components/editor/FilterPanel';
import { FrameColorPanel } from '../components/editor/FrameColorPanel';
import { StickerPanel } from '../components/editor/StickerPanel';
import { TextPanel } from '../components/editor/TextPanel';
import { stickers } from '../data/stickers';
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
  } = usePhotobooth();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(400);
  const [activeTab, setActiveTab] = useState<'filter' | 'frame' | 'sticker' | 'text'>('filter');
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
    if (!selectedId) return;
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
    if (!selectedId) return;
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

  const handleShuffleStickers = () => {
    const count = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * stickers.length);
      const chosen = stickers[randomIndex];
      addSticker(chosen.src);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
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

  const hasSelectedElement = selectedId !== null;

  return (
    <div className="min-h-screen bg-[#FFFDF6] py-4 px-3 md:py-8 md:px-6 relative overflow-hidden selection:bg-gold-light/40">
      {/* 1. SEAMLESS BACKGROUND PATTERN: Grid Kotak-Kotak Cream Seperti Halaman Kamera */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFEBE2_1px,transparent_1px),linear-gradient(to_bottom,#EFEBE2_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.8] pointer-events-none z-0" />

      {/* 2. FLOATING CUTE SCRAPBOOK ELEMENTS */}
      <div className="absolute top-24 left-8 text-3xl animate-bounce pointer-events-none opacity-60 hidden xl:block" style={{ animationDuration: '3.2s' }}>🎀</div>
      <div className="absolute top-1/2 left-12 text-2xl animate-pulse pointer-events-none opacity-40 hidden xl:block text-pink-300"><Sparkles className="w-6 h-6 fill-current" /></div>
      <div className="absolute bottom-28 left-14 text-3xl animate-bounce pointer-events-none opacity-60 hidden xl:block" style={{ animationDuration: '4.2s' }}>🧸</div>
      <div className="absolute top-36 right-8 text-3xl animate-bounce pointer-events-none opacity-60 hidden xl:block" style={{ animationDuration: '3.8s' }}>💖</div>
      <div className="absolute bottom-20 right-12 text-3xl animate-bounce pointer-events-none opacity-60 hidden xl:block" style={{ animationDuration: '4.8s' }}>✨</div>

      {/* Decorative blobs asli tetap ada namun dibuat subtle transparan */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-mahogany/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ===== HEADER (100% Sesuai Asli) ===== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <button
              onClick={() => setStep('capture')}
              className="flex items-center gap-1.5 text-charcoal/40 hover:text-mahogany font-medium text-[10px] tracking-[0.12em] uppercase mb-1.5 transition-all group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Kamera
            </button>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
              <span className="bg-gradient-to-r from-mahogany via-gold to-mahogany bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_6s_ease-in-out_infinite]">
                Studio Editor
              </span>{' '}
              Hias
            </h1>
            <p className="text-charcoal/40 text-[11px] flex items-center gap-2 mt-0.5">
              <Layers className="w-3 h-3" />
              {totalElements} elemen terpasang •{' '}
              <span className="text-gold-dark font-medium">{filledSlots}/{totalSlots}</span> foto terisi
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={handleShuffleStickers}
              className="px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/70 backdrop-blur-sm hover:bg-white text-charcoal border border-cream/30 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="hidden xs:inline">Acak</span>
              <span className="xs:hidden">✨</span>
            </button>
            <button
              onClick={() => setStep('preview')}
              className="relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-mahogany to-mahogany-dark text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Pratinjau</span>
              <span className="xs:hidden">👁</span>
            </button>
          </div>
        </div>

        {/* ===== MAIN GRID (100% Sesuai Asli) ===== */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">

          {/* LEFT: Canvas Area */}
          <div className="lg:col-span-7 flex flex-col items-center" ref={containerRef}>
            <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white/40 backdrop-blur-sm p-2 md:p-3 relative">
              {/* WASHI TAPE OVERLAY GRAPHIC */}
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-24 h-4.5 bg-pink-200/20 backdrop-blur-sm border border-white/30 skew-x-[-10deg] z-20 pointer-events-none flex items-center justify-center text-[6px] text-pink-400 font-bold tracking-widest" />

              <div className="flex justify-center">
                <PhotoCanvas stageRef={stageRef} containerWidth={canvasWidth} />
              </div>
            </div>

            {/* Shortcut hints */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 text-[9px] text-charcoal/30 tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gold/40" />
                Klik elemen
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gold/40" />
                <kbd className="px-1 py-0.5 bg-white/50 rounded text-[8px] border border-cream/20">Del</kbd> hapus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gold/40" />
                <kbd className="px-1 py-0.5 bg-white/50 rounded text-[8px] border border-cream/20">Ctrl+D</kbd> duplikat
              </span>
            </div>
          </div>

          {/* RIGHT: Control Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white/60 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-cream/20 shadow-[0_8px_32px_rgba(107,74,58,0.06)] flex flex-col gap-4">

              {/* Tool Tabs (Kondisi String Dibuat 100% Klop dengan File Panel Anda) */}
              <div className="grid grid-cols-4 gap-1 bg-ivory-dark/50 p-1 rounded-xl border border-cream/20">
                {[
                  { key: 'filter', icon: Sliders, label: 'Filter' },
                  { key: 'frame', icon: Palette, label: 'Frame' },
                  { key: 'sticker', icon: Smile, label: 'Stiker' },
                  { key: 'text', icon: Type, label: 'Teks' },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key as typeof activeTab);
                        setSelectedId(null);
                      }}
                      className={`relative py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${isActive
                          ? 'bg-white text-mahogany shadow-sm ring-1 ring-gold/20'
                          : 'text-charcoal/50 hover:text-charcoal hover:bg-white/40'
                        }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Element Quick Actions */}
              <AnimatePresence mode="wait">
                {hasSelectedElement ? (
                  <motion.div
                    key="selected-actions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between bg-gradient-to-r from-gold-light/15 to-gold-light/5 border border-gold/30 p-2.5 rounded-xl transition-all">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                          {selectedId?.startsWith('sticker-') ? (
                            <Smile className="w-3.5 h-3.5 text-gold-dark" />
                          ) : (
                            <Type className="w-3.5 h-3.5 text-gold-dark" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-[11px] font-bold text-charcoal">
                            {selectedId?.startsWith('sticker-') ? 'Stiker' : 'Teks'}
                          </span>
                          <p className="text-[9px] text-charcoal/40">Terpilih</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={handleDuplicate}
                          className="p-1.5 bg-white/80 hover:bg-white rounded-lg text-charcoal/50 hover:text-mahogany border border-cream/20 transition-all shadow-sm"
                          title="Duplikat (Ctrl+D)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          className="p-1.5 bg-red-50/80 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-600 border border-red-200/50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-ivory-dark/30 border border-cream/20 rounded-lg text-[9px] text-charcoal/40 text-left">
                      <AlertCircle className="w-3 h-3" />
                      Pilih elemen di canvas untuk opsi cepat
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Sub-Panel Area (Render Kondisional Mengikuti Fungsi Asli) */}
              <div className="min-h-[220px] md:min-h-[260px] relative">
                {activeTab === 'filter' && <FilterPanel />}
                {activeTab === 'frame' && <FrameColorPanel />}
                {activeTab === 'sticker' && <StickerPanel />}
                {activeTab === 'text' && <TextPanel />}
              </div>

              {/* Info footer */}
              <div className="flex flex-wrap items-center justify-between gap-1 pt-2.5 border-t border-cream/20 text-[9px] text-charcoal/30">
                <span className="flex items-center gap-1">
                  <Grid3x3 className="w-3 h-3" />
                  {totalElements} elemen
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  {filledSlots}/{totalSlots} foto
                </span>
                <span className="flex items-center gap-1 truncate max-w-[100px]">
                  <Zap className="w-3 h-3 text-gold flex-shrink-0" />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-cream/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4 text-left">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">Hapus Elemen?</h3>
                  <p className="text-charcoal/50 text-sm">
                    {selectedId?.startsWith('sticker-') ? 'Stiker' : 'Teks'} akan dihapus permanen.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-ivory-dark/50 hover:bg-ivory-dark text-charcoal/60 font-bold text-[11px] uppercase tracking-wider transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal/80 backdrop-blur-md text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 border border-white/10"
          >
            <Copy className="w-3.5 h-3.5 text-gold" />
            <span className="text-sm font-medium">Elemen berhasil diduplikasi!</span>
            <button onClick={() => setShowCopiedToast(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #D8C3A5;
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #C9A66B;
        }
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
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