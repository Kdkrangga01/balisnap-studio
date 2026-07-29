import React, { useRef, useState, useEffect } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { exportHighResCanvas, saveOrShareImage, dataURItoBlob } from '../lib/exportImage';
import { generateBoomerangGif } from '../lib/gifExport';
import { DigitalEnvelopeModal } from '../components/DigitalEnvelopeModal';
import { UpgradeModal } from '../components/UpgradeModal';
import {
  ArrowLeft, Download, RotateCcw, Check, Share2, Sparkles, Heart, X,
  ExternalLink, Copy, CheckCircle2, Sliders, Zap, ShieldCheck, Crown,
  Film, Loader2, Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';

export const Preview: React.FC = () => {
  const {
    selectedFrame,
    setStep,
    resetAll,
    packageTier,
    photos,
    setPhotos
  } = usePhotobooth();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(450);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [downloadedImageUri, setDownloadedImageUri] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // NEW FEATURES STATE
  const [exportQuality, setExportQuality] = useState<'1080p' | '2k' | '4k'>('2k');

  // BOOMERANG GIF STATE
  const [showGifModal, setShowGifModal] = useState<boolean>(false);
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false);
  const [gifProgress, setGifProgress] = useState<number>(0);
  const [gifResult, setGifResult] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [gifInterval, setGifInterval] = useState<number>(0.35);

  // DIGITAL ENVELOPE GIFT STATE
  const [showEnvelopeModal, setShowEnvelopeModal] = useState<boolean>(false);
  const [activePresetFilter, setActivePresetFilter] = useState<'none' | 'vintage' | 'vivid' | 'bw'>('none');

  // Measure container for responsive stage sizing
  useEffect(() => {
    if (containerRef.current) {
      const handleResize = () => {
        const parentWidth = containerRef.current?.offsetWidth || 450;
        const targetWidth = Math.min(parentWidth, 450);
        setCanvasWidth(targetWidth);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSuccessModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger celebratory confetti on mount
  useEffect(() => {
    const duration = 1.8 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#FF2A85', '#FF73B3', '#FBBF24', '#38BDF8']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#FF2A85', '#FF73B3', '#FBBF24', '#38BDF8']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  if (!selectedFrame) return null;

  // Determine export dimension pixel multiplier based on selection
  const getQualityPixelSize = () => {
    switch (exportQuality) {
      case '1080p': return 1200;
      case '2k': return 1800;
      case '4k': return 2800;
      default: return 1800;
    }
  };

  // Handle Export high-res and trigger full confetti storm + show pop up modal
  const handleDownload = async () => {
    if (stageRef.current) {
      const exportPixelWidth = getQualityPixelSize();
      const dataUrl = exportHighResCanvas(stageRef.current, exportPixelWidth);
      if (dataUrl) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `balisnap-studio-${exportQuality}-${timestamp}.png`;
        setDownloadedImageUri(dataUrl);

        // Smart download or trigger native share sheet on mobile
        await saveOrShareImage(dataUrl, filename);

        confetti({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FF2A85', '#FF85C0', '#FBBF24', '#38BDF8', '#10B981', '#A855F7']
        });

        setShowSuccessModal(true);
      }
    }
  };

  // Share via Web Share API or save image directly
  const handleShare = async () => {
    const exportPixelWidth = getQualityPixelSize();
    const dataUrl = downloadedImageUri || (stageRef.current ? exportHighResCanvas(stageRef.current, exportPixelWidth) : null);
    if (dataUrl) {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `balisnap-studio-${timestamp}.png`;
      await saveOrShareImage(dataUrl, filename);
    }
  };

  // GIF Boomerang Generator Handler - FULL PHOTO FRAME STRIP SNAPSHOTS
  const handleOpenGifModal = async (customInterval?: number) => {
    setShowGifModal(true);
    setIsGeneratingGif(true);
    setGifProgress(10);

    const targetInterval = customInterval !== undefined ? customInterval : gifInterval;
    setGifInterval(targetInterval);

    // Simpan susunan foto asli pengguna
    const originalPhotos = [...photos];
    const validPhotos = photos.filter((p): p is string => Boolean(p));

    try {
      const fullStripSnapshots: string[] = [];
      const totalSlots = selectedFrame ? selectedFrame.slots : (validPhotos.length || 1);

      if (validPhotos.length === 0) {
        // Fallback jika tidak ada foto
        const snap = stageRef.current ? exportHighResCanvas(stageRef.current, 600) : null;
        if (snap) fullStripSnapshots.push(snap);
      } else {
        // Urutan animasi Boomerang bergeser (1 -> 2 -> 3 -> 4 -> 3 -> 2)
        const sequenceIndexes: number[] = [];
        const n = validPhotos.length;
        for (let i = 0; i < n; i++) sequenceIndexes.push(i);
        for (let i = n - 2; i > 0; i--) sequenceIndexes.push(i);
        if (sequenceIndexes.length === 1) sequenceIndexes.push(0);

        const totalSteps = sequenceIndexes.length;

        for (let s = 0; s < totalSteps; s++) {
          const shiftOffset = sequenceIndexes[s];

          // Geser foto di setiap slot bingkai untuk membentuk efek animasi bergerak
          const shiftedPhotos = Array.from({ length: Math.max(totalSlots, n) }).map((_, slotIdx) => {
            const photoIdx = (slotIdx + shiftOffset) % n;
            return validPhotos[photoIdx];
          });

          // Terapkan ke Stage Konva
          setPhotos(shiftedPhotos);

          // Tunggu sebentar (45ms) agar Konva menggambar ulang seluruh bingkai foto strip
          await new Promise((resolve) => setTimeout(resolve, 45));

          // Tangkap snapshot SELURUH BINGKAI FOTO STRIP (HD 600px)
          if (stageRef.current) {
            const stripSnap = exportHighResCanvas(stageRef.current, 600);
            if (stripSnap) {
              fullStripSnapshots.push(stripSnap);
            }
          }

          setGifProgress(Math.round(((s + 1) / totalSteps) * 45));
        }
      }

      // Kembalikan susunan foto asli di Konva Stage
      setPhotos(originalPhotos);
      await new Promise((resolve) => setTimeout(resolve, 30));

      if (fullStripSnapshots.length === 0) {
        throw new Error('Gagal mengambil snapshot bingkai foto.');
      }

      // Tentukan ukuran GIF ber-aspek-rasio SAMA PERSIS dengan bingkai foto asli
      const frameW = selectedFrame ? selectedFrame.width : 450;
      const frameH = selectedFrame ? selectedFrame.height : 675;
      const targetGifW = 450;
      const targetGifH = Math.round(targetGifW * (frameH / frameW));

      // Hasilkan file GIF Animasi dari kumpulan snapshot Full Frame Strip
      const res = await generateBoomerangGif({
        photos: fullStripSnapshots,
        interval: targetInterval,
        gifWidth: targetGifW,
        gifHeight: targetGifH,
        progressCallback: (pct) => setGifProgress(45 + Math.round((pct / 100) * 55)),
      });

      setGifResult(res);
    } catch (err) {
      console.error('Gagal membuat GIF Full Frame:', err);
      setPhotos(originalPhotos);
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleDownloadGif = () => {
    if (!gifResult) return;
    const link = document.createElement('a');
    link.href = gifResult.dataUrl;
    link.download = `balisnap-boomerang-${new Date().toISOString().slice(0, 10)}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Link Copying
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Open high-res image Blob in a new tab
  const handleOpenImageTab = () => {
    if (downloadedImageUri) {
      try {
        const blob = dataURItoBlob(downloadedImageUri);
        const blobUrl = URL.createObjectURL(blob);
        const newWin = window.open(blobUrl, '_blank');
        if (!newWin) {
          window.location.href = blobUrl;
        }
      } catch {
        const newWin = window.open(downloadedImageUri, '_blank');
        if (!newWin) {
          window.location.href = downloadedImageUri;
        }
      }
    }
  };

  // Filter CSS style map for preview enhancement
  const getFilterCss = () => {
    switch (activePresetFilter) {
      case 'vintage': return 'sepia(25%) contrast(105%) brightness(98%) saturate(110%)';
      case 'vivid': return 'saturate(135%) contrast(108%)';
      case 'bw': return 'grayscale(100%) contrast(115%)';
      default: return 'none';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] via-[#FFFBF7] to-[#FFF0F5] py-8 px-4 md:py-12 md:px-8 relative overflow-hidden flex flex-col items-center justify-center select-none">

      {/* MEWAH: BACKGROUND GRID PASTEL ELEGAN WITH SOFT GLOW PATTERN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,182,193,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,182,193,0.18)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* AMBIENT LIGHTING ORBS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* DECORATIVE ELEMENTS */}
      <div className="absolute top-20 left-10 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '3s' }}>🎀</div>
      <div className="absolute top-1/2 left-8 text-2xl animate-pulse pointer-events-none opacity-60 hidden xl:block text-pink-400"><Sparkles className="w-7 h-7 fill-current" /></div>
      <div className="absolute bottom-24 left-12 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '4s' }}>🧸</div>
      <div className="absolute top-28 right-10 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '3.5s' }}>💖</div>
      <div className="absolute bottom-16 right-10 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '4.5s' }}>✨</div>

      <div className="max-w-6xl w-full mx-auto flex flex-col items-center relative z-10">

        {/* ===== TOP NAVBAR / HEADER ROW ===== */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md border border-pink-200/60 p-4 md:p-6 rounded-3xl shadow-xl shadow-pink-100/50 gap-4 mb-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <button
              onClick={() => setStep('editor')}
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-extrabold text-[11px] tracking-wider uppercase mb-1.5 transition-all group px-3.5 py-1.5 bg-pink-100/60 rounded-full border border-pink-200/80 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Editor
            </button>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-none mt-1">
              Pratinjau Studio HD
            </h1>
            <p className="text-zinc-500 text-xs font-medium mt-1">
              Hasil karya foto Anda telah rampung &amp; siap diunduh dalam kualitas tertinggi.
            </p>
          </div>

          {/* RIGHT UTILITY BUTTONS */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider bg-pink-50/80 hover:bg-pink-100/80 border border-pink-200 text-pink-700 transition-all shadow-sm flex items-center gap-2"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-pink-500" />}
              {copiedLink ? 'Link Tersalin!' : 'Salin Tautan'}
            </button>

            <button
              onClick={resetAll}
              className="px-4 py-2.5 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider bg-white hover:bg-rose-50 border border-rose-200 text-zinc-700 transition-all shadow-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-pink-500" />
              Foto Baru
            </button>
          </div>
        </div>

        {/* ===== MAIN WORKSPACE ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

          {/* LEFT COLUMN: CANVIEW CANVAS SHOWCASE */}
          <div className="lg:col-span-6 flex flex-col justify-center items-center relative" ref={containerRef}>
            {/* CUTE TAPE STRIP */}
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-36 h-7 bg-pink-200/80 backdrop-blur-md border border-white/80 skew-x-[-10deg] z-20 shadow-md pointer-events-none flex items-center justify-center text-[9px] text-pink-700 font-black tracking-widest uppercase rounded-sm">
              ✨ BALISNAP MEMORIES ✨
            </div>

            <div
              className="relative p-3 md:p-4 bg-white/90 backdrop-blur-xl border-2 border-pink-200/90 shadow-[0_20px_50px_rgba(255,105,180,0.25)] rounded-[36px] flex flex-col items-center overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(255,105,180,0.35)]"
              style={{ filter: getFilterCss() }}
            >
              <PhotoCanvas stageRef={stageRef} containerWidth={canvasWidth} isPreviewMode={true} />
            </div>

            {/* NEW FEATURE: QUICK PRESET VIBE FILTER BAR */}
            <div className="mt-4 bg-white/80 backdrop-blur-md border border-pink-100 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 w-full justify-center max-w-md">
              <span className="text-[10px] font-black uppercase text-pink-600 tracking-wider flex items-center gap-1 pl-1">
                <Sliders className="w-3 h-3" /> Vibe Tone:
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'vintage', label: 'Warm' },
                  { id: 'vivid', label: 'Vivid' },
                  { id: 'bw', label: 'B&W' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setActivePresetFilter(preset.id as any)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase transition-all ${activePresetFilter === preset.id
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'bg-pink-50 text-zinc-600 hover:bg-pink-100'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION & SETTINGS PANEL */}
          <div className="lg:col-span-6 flex flex-col gap-5 w-full">
            <div className="bg-white/90 backdrop-blur-xl border-2 border-pink-100/90 p-6 md:p-8 rounded-[36px] shadow-[0_15px_40px_rgba(255,182,193,0.2)] flex flex-col gap-5 text-left relative overflow-hidden">

              {/* LIGHT ACCENT BACKGROUND */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-pink-100/50 rounded-full blur-2xl pointer-events-none" />

              {/* RENDER SUCCESS BADGE */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md shadow-emerald-200">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  RENDER SELESAI (STUDIO READY)
                </div>

                <span className="text-[10px] font-bold text-pink-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Density Export
                </span>
              </div>

              {/* HEADING */}
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight flex items-center gap-2">
                  Foto Anda Menawan!
                  <Heart className="w-7 h-7 text-pink-500 fill-current animate-pulse" />
                </h2>
                <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed mt-2">
                  Unduh file PNG kualitas studio dengan kejernihan maksimal tanpa kompresi. Cocok untuk dicetak langsung pada kertas cetak foto atau dibagikan ke Instagram!
                </p>
              </div>

              {/* NEW FEATURE: RESOLUTION QUALITY SELECTOR */}
              <div className="bg-pink-50/60 border border-pink-100 p-3.5 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current text-pink-500" />
                    Pilih Kualitas Resolusi Ekspor:
                  </span>
                  <span className="text-[10px] font-bold text-pink-400">PNG HQ</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1080p', label: '1080p HD', desc: 'Cepat & Ringan' },
                    { id: '2k', label: '2K Studio', desc: 'Rekomendasi' },
                    { id: '4k', label: '4K Ultra', desc: 'Maksimal Cetak', isPremiumOnly: true },
                  ].map((q) => {
                    const isLocked = q.isPremiumOnly && packageTier !== 'premium';
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          if (isLocked) {
                            setUpgradeModalOpen(true);
                            return;
                          }
                          setExportQuality(q.id as any);
                        }}
                        className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative cursor-pointer ${exportQuality === q.id
                            ? 'bg-white border-pink-400 text-pink-600 shadow-sm font-extrabold ring-2 ring-pink-300'
                            : 'bg-white/50 border-pink-100 text-zinc-500 hover:bg-white font-medium'
                          }`}
                      >
                        {isLocked && (
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Crown className="w-2 h-2 text-yellow-200 fill-yellow-200" /> VIP
                          </span>
                        )}
                        <span className="text-[11px] font-black">{q.label}</span>
                        <span className="text-[8px] opacity-70">{q.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-3 mt-1">
                {/* PRIMARY GLOW SHIMMER DOWNLOAD BUTTON */}
                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 active:scale-[0.99] text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-lg shadow-pink-300/60 flex items-center justify-center gap-2.5 group relative overflow-hidden cursor-pointer"
                >
                  {/* SHIMMER LIGHT EFFECT */}
                  <span className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-[-20deg] translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  UNDUH FOTO PNG ({exportQuality.toUpperCase()})
                </button>

                {/* BOOMERANG ANIMATED GIF BUTTON */}
                <button
                  onClick={() => handleOpenGifModal()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-[0.99] text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group"
                >
                  <Film className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform" />
                  UNDUH ANIMASI GIF (BOOMERANG)
                </button>

                {/* DIGITAL ENVELOPE GIFT BUTTON */}
                <button
                  onClick={() => setShowEnvelopeModal(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 active:scale-[0.99] text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-md shadow-pink-200 flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group"
                >
                  <Mail className="w-4 h-4 text-pink-200 group-hover:scale-110 transition-transform" />
                  KIRIM SEBAGAI GIFT / AMPLOP DIGITAL
                </button>

                {/* SECONDARY SHARE BUTTON */}
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 bg-white hover:bg-pink-50 text-pink-600 border-2 border-pink-200 font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-pink-500" />
                  BAGIKAN KE SOSIAL MEDIA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== POP-UP MODAL UNDUH BERHASIL ===== */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="bg-white border-2 border-pink-200 rounded-[36px] max-w-sm sm:max-w-md w-full p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(244,114,182,0.4)] relative overflow-hidden text-center flex flex-col items-center gap-3.5 z-50 select-none max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CUTE TAPE DECORATION */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-pink-200/80 border border-white/80 skew-x-[-10deg] shadow-sm pointer-events-none flex items-center justify-center text-[8px] text-pink-700 font-black tracking-widest uppercase">
                ✨ BALISNAP MEMORIES ✨
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full flex items-center justify-center transition-all shadow-sm group"
                aria-label="Tutup"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              {/* SUCCESS ANIMATED BADGE */}
              <div className="mt-2 w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 animate-bounce" style={{ animationDuration: '2.2s' }}>
                <Check className="w-9 h-9 text-white stroke-[3.5]" />
              </div>

              <div className="flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Unduh Berhasil!
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-snug">
                Frame Photobooth Berhasil Diunduh!{' '}
                <Heart className="inline-block w-5 h-5 text-pink-500 fill-current animate-pulse align-text-top" />
              </h3>

              {/* MOBILE GALLERY TIP */}
              <div className="w-full p-3.5 bg-pink-50/90 border border-pink-200/80 rounded-2xl text-[11px] text-zinc-600 leading-relaxed font-medium text-left flex items-start gap-2.5 select-auto">
                <span className="text-lg flex-shrink-0">📱</span>
                <div>
                  <span className="font-extrabold text-pink-600">Pengguna Smartphone:</span> Jika foto belum masuk otomatis ke Galeri, <span className="font-bold underline text-pink-600">tekan &amp; tahan foto</span> di bawah ini lalu pilih <b>"Simpan Gambar" (Save Image)</b>.
                </div>
              </div>

              {/* DOWNLOADED IMAGE THUMBNAIL */}
              {downloadedImageUri && (
                <div
                  className="my-1 p-2 bg-gradient-to-b from-pink-50/80 to-rose-50/40 border-2 border-pink-200/80 rounded-2xl shadow-inner max-h-52 overflow-hidden flex items-center justify-center relative group select-auto cursor-pointer"
                  onClick={handleOpenImageTab}
                  title="Klik untuk melihat foto ukuran penuh"
                >
                  <img
                    src={downloadedImageUri}
                    alt="Preview Frame Photobooth"
                    className="max-h-44 object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105 select-auto touch-manipulation"
                    style={{ WebkitTouchCallout: 'default', pointerEvents: 'auto' }}
                  />
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2 w-full mt-1">
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Simpan ke Galeri HP / Share
                </button>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={handleOpenImageTab}
                    className="py-2.5 bg-white hover:bg-pink-50 text-zinc-700 border border-pink-200 font-extrabold tracking-wider uppercase text-[10px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-pink-500" />
                    Buka Foto Full
                  </button>

                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setStep('editor');
                    }}
                    className="py-2.5 bg-white hover:bg-pink-50 text-zinc-700 border border-pink-200 font-extrabold tracking-wider uppercase text-[10px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-pink-500" />
                    Edit Foto
                  </button>
                </div>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold tracking-widest uppercase text-[10px] rounded-xl transition-colors mt-0.5"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== POP-UP MODAL UNDUH ANIMASI GIF BOOMERANG ===== */}
      <AnimatePresence>
        {showGifModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md"
            onClick={() => !isGeneratingGif && setShowGifModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="bg-white border-2 border-purple-200 rounded-[36px] max-w-sm sm:max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(168,85,247,0.4)] relative overflow-hidden text-center flex flex-col items-center gap-4 z-50 select-none max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CUTE TAPE DECORATION */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-purple-200/80 border border-white/80 skew-x-[-10deg] shadow-sm pointer-events-none flex items-center justify-center text-[8px] text-purple-700 font-black tracking-widest uppercase">
                🎬 BOOMERANG GIF STUDIO 🎬
              </div>

              {/* CLOSE BUTTON */}
              {!isGeneratingGif && (
                <button
                  onClick={() => setShowGifModal(false)}
                  className="absolute top-4 right-4 w-9 h-9 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex flex-col items-center gap-1 mt-3">
                <h3 className="text-lg font-black tracking-tight text-zinc-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-600 animate-pulse" />
                  Pratinjau Animasi GIF
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Foto Boomerang bergerak hasil momen Photobooth Anda!
                </p>
              </div>

              {/* GIF PREVIEW CONTAINER / LOADING STATE WITH DYNAMIC ASPECT FIT */}
              <div
                className="w-full bg-purple-950/10 rounded-2xl border-2 border-purple-200/70 overflow-hidden flex items-center justify-center relative shadow-inner p-2.5 my-1"
                style={{ minHeight: '260px', maxHeight: '55vh' }}
              >
                {isGeneratingGif ? (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                        Memproses Animasi GIF Full Frame...
                      </span>
                      <span className="text-[11px] text-purple-600 font-extrabold">{gifProgress}%</span>
                    </div>
                    {/* PROGRESS BAR */}
                    <div className="w-48 h-2.5 bg-purple-100 rounded-full overflow-hidden border border-purple-200 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                        style={{ width: `${gifProgress}%` }}
                      />
                    </div>
                  </div>
                ) : gifResult ? (
                  <img
                    src={gifResult.dataUrl}
                    alt="Animasi GIF Boomerang Full Frame Strip"
                    className="max-h-[50vh] max-w-full w-auto h-auto object-contain drop-shadow-md rounded-lg"
                  />
                ) : (
                  <div className="text-xs text-zinc-400 font-medium">Gagal memuat pratinjau</div>
                )}
              </div>

              {/* SPEED CONTROLS */}
              {!isGeneratingGif && (
                <div className="w-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider text-left">
                    ⚡ Kecepatan Animasi Boomerang:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '🏃 Cepat', value: 0.2 },
                      { label: '✨ Normal', value: 0.35 },
                      { label: '🐢 Santai', value: 0.5 },
                    ].map((s) => (
                      <button
                        key={s.value}
                        onClick={() => handleOpenGifModal(s.value)}
                        className={`py-2 px-1 text-[11px] font-black rounded-xl border transition-all cursor-pointer ${
                          gifInterval === s.value
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-300'
                            : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DOWNLOAD GIF BUTTON */}
              {!isGeneratingGif && gifResult && (
                <button
                  onClick={handleDownloadGif}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-lg shadow-purple-300/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  UNDUH FILE ANIMASI .GIF
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIGITAL ENVELOPE GIFT MODAL */}
      <DigitalEnvelopeModal
        isOpen={showEnvelopeModal}
        onClose={() => setShowEnvelopeModal(false)}
        photoStripUri={downloadedImageUri || (stageRef.current ? exportHighResCanvas(stageRef.current, 600) : null)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetTier="premium"
        featureName="Export Super Ultra-HD 4K Print-Ready"
      />
    </div>
  );
};