import React, { useRef, useState, useEffect } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { exportHighResCanvas, saveOrShareImage, dataURItoBlob } from '../lib/exportImage';
import { generateBoomerangGif } from '../lib/gifExport';
import { DigitalEnvelopeModal } from '../components/DigitalEnvelopeModal';
import { UpgradeModal } from '../components/UpgradeModal';
import {
  ArrowLeft, Download, RotateCcw, Check, Share2, Camera, X,
  ExternalLink, Copy, CheckCircle2, Sliders, Zap, ShieldCheck, Crown,
  Film, Loader2, Mail, Smartphone 
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
    setPhotos,
    incrementCompletedTrialSession
  } = usePhotobooth();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(450);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [downloadedImageUri, setDownloadedImageUri] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // NEW FEATURES STATE
  const [exportQuality, setExportQuality] = useState<'standard' | 'high' | 'print'>('high');

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



  if (!selectedFrame) return null;

  // Determine export dimension pixel multiplier based on selection
  const getQualityPixelSize = () => {
    switch (exportQuality) {
      case 'standard': return 1200;
      case 'high': return 1800;
      case 'print': return 2800;
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

        // Mark 1 completed trial photo session for Free Tier
        incrementCompletedTrialSession();

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
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 md:py-12 md:px-8 relative overflow-hidden flex flex-col items-center justify-center select-none text-zinc-800">

      {/* BACKGROUND MICRO-GRID & AMBIENT SOFT LIGHTING */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/70 via-zinc-50/40 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* AMBIENT LIGHTING ORBS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-slate-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-zinc-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto flex flex-col items-center relative z-10">

        {/* ===== TOP NAVBAR / HEADER ROW ===== */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white/90 backdrop-blur-xl border border-zinc-200/80 p-4 md:p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] gap-4 mb-8">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <button
              onClick={() => setStep('editor')} 
              className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-extrabold text-[11px] tracking-wider uppercase mb-1.5 transition-all group px-3.5 py-1.5 bg-zinc-100/90 rounded-full border border-zinc-200 shadow-sm"
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
            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 px-4 h-7 bg-zinc-100/90 backdrop-blur-md border border-zinc-200 skew-x-[-10deg] z-20 shadow-xs pointer-events-none flex items-center justify-center gap-1.5 text-[9px] text-zinc-700 font-bold tracking-widest uppercase rounded-sm">
              <Camera className="w-3 h-3 text-zinc-500 inline" />
              <span>BALISNAP MEMORIES</span>
            </div> 

            <div
              className="relative p-3 md:p-4 bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] rounded-[32px] flex flex-col items-center overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
              style={{ filter: getFilterCss() }}
            >
              <PhotoCanvas stageRef={stageRef} containerWidth={canvasWidth} isPreviewMode={true} />
            </div>

            {/* QUICK PRESET VIBE FILTER BAR */}
            <div className="mt-4 bg-white/90 backdrop-blur-md border border-stone-200/80 p-2 rounded-2xl shadow-2xs flex items-center gap-2 w-full justify-center max-w-md">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1 pl-1">
                <Sliders className="w-3 h-3 text-rose-500" /> Vibe Tone:
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
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activePresetFilter === preset.id
                        ? 'bg-[#E15A6E] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
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
            <div className="bg-white/95 backdrop-blur-xl border border-stone-200/80 p-6 md:p-7 rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.04)] flex flex-col gap-4.5 text-left relative overflow-hidden">

              {/* SOFT AMBIENT ACCENT */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-50/50 rounded-full blur-3xl pointer-events-none" />

              {/* SPECS */}
              <div className="flex items-center justify-end">
                <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> High-Density HD
                </span>
              </div>

              {/* HEADING */}
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight leading-snug">
                  Hasil Foto Anda Siap!
                </h2>
                <p className="text-stone-500 text-xs md:text-sm font-normal leading-relaxed mt-1">
                  Foto telah selesai diproses dengan kejernihan maksimal tanpa kompresi. Siap disimpan ke galeri, dicetak fisik, atau dibagikan ke media sosial.
                </p>
              </div>

              {/* RESOLUTION QUALITY SELECTOR */}
              <div className="bg-stone-50 border border-stone-200/70 p-3 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Pilihan Kualitas Foto:
                  </span>
                  <span className="text-[10px] font-semibold text-rose-500">
                    Format PNG HD
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standar', desc: 'Ringan & Cepat' },
                    { id: 'high', label: 'Kualitas Tinggi', desc: 'Rekomendasi' },
                    { id: 'print', label: 'Siap Cetak', desc: 'Ultra HD Fisik', isPremiumOnly: true },
                  ].map((q) => {
                    const isSelected = exportQuality === q.id;
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
                        className={`py-2 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                          isSelected
                            ? 'bg-white border-rose-300 text-stone-900 shadow-xs ring-1 ring-rose-200/70 font-bold'
                            : 'bg-white/60 border-stone-200/70 text-stone-500 hover:bg-white hover:text-stone-800 font-medium'
                        }`}
                      >
                        {isLocked && (
                          <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                            <Crown className="w-2 h-2 text-yellow-100 fill-yellow-100" /> VIP
                          </span>
                        )}
                        <span className={`text-[11px] ${isSelected ? 'text-rose-600 font-bold' : 'text-stone-700 font-semibold'}`}>
                          {q.label}
                        </span>
                        <span className="text-[8px] text-stone-400 mt-0.5">{q.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2.5 mt-0.5">
                {/* PRIMARY ACTION: HERO UNDUH FOTO PNG */}
                <button
                  onClick={handleDownload}
                  className="w-full py-3.5 px-6 bg-[#E15A6E] hover:bg-[#D4485D] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer relative overflow-hidden"
                >
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  <span>Unduh Foto PNG</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {exportQuality}
                  </span>
                </button>

                {/* SECONDARY ROW (2-KOLOM SEIMBANG): BOOMERANG GIF & DIGITAL ENVELOPE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleOpenGifModal()}
                    className="py-3 px-3.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 hover:border-stone-300 font-semibold text-xs rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Film className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Animasi Boomerang</span>
                  </button>

                  <button
                    onClick={() => setShowEnvelopeModal(true)}
                    className="py-3 px-3.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 hover:border-stone-300 font-semibold text-xs rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Mail className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Amplop Digital / Gift</span>
                  </button>
                </div>
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
              className="bg-white border border-stone-200/90 rounded-[32px] max-w-sm sm:max-w-md w-full p-6 md:p-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] relative overflow-hidden text-center flex flex-col items-center gap-3.5 z-50 select-none max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CUTE TAPE DECORATION */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 h-5 bg-stone-100 border border-stone-200 skew-x-[-10deg] shadow-2xs pointer-events-none flex items-center justify-center gap-1 text-[8px] text-stone-700 font-bold tracking-widest uppercase">
                <Camera className="w-2.5 h-2.5 text-stone-500 inline" />
                <span>BALISNAP MEMORIES</span>
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full flex items-center justify-center transition-all shadow-2xs group cursor-pointer"
                aria-label="Tutup" 
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>

              {/* SUCCESS ANIMATED BADGE */}
              <div className="mt-2 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-200 animate-bounce" style={{ animationDuration: '2.2s' }}>
                <Check className="w-8 h-8 text-white stroke-[3]" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unduh Berhasil!
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-snug">
                Frame Foto Berhasil Disimpan!
              </h3>

              {/* MOBILE GALLERY TIP */}
              <div className="w-full p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-[11px] text-stone-600 leading-relaxed font-medium text-left flex items-start gap-2.5 select-auto">
                <Smartphone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-800">Pengguna Smartphone:</span> Jika foto belum masuk otomatis ke Galeri, <span className="font-bold underline text-rose-600">tekan &amp; tahan foto</span> di bawah ini lalu pilih <b>"Simpan Gambar" (Save Image)</b>.
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
              className="bg-white border border-stone-200/90 rounded-[32px] max-w-sm sm:max-w-md w-full p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] relative overflow-hidden text-center flex flex-col items-center gap-3.5 z-50 select-none max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* TAPE STRIP */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 h-5 bg-stone-100 border border-stone-200 skew-x-[-10deg] shadow-2xs pointer-events-none flex items-center justify-center gap-1 text-[8px] text-stone-700 font-bold tracking-widest uppercase">
                <Film className="w-2.5 h-2.5 text-purple-600 inline" />
                <span>BOOMERANG GIF STUDIO</span>
              </div>

              {/* CLOSE BUTTON */}
              {!isGeneratingGif && (
                <button
                  onClick={() => setShowGifModal(false)}
                  className="absolute top-4 right-4 w-9 h-9 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex flex-col items-center gap-1 mt-2">
                <h3 className="font-serif text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-600" />
                  Pratinjau Animasi GIF
                </h3>
                <p className="text-xs text-stone-500 font-normal">
                  Foto Boomerang bergerak hasil momen Photobooth Anda!
                </p>
              </div>

              {/* GIF PREVIEW CONTAINER / LOADING STATE WITH DYNAMIC ASPECT FIT */}
              <div
                className="w-full bg-stone-50 rounded-2xl border border-stone-200/80 overflow-hidden flex items-center justify-center relative shadow-inner p-2.5 my-1"
                style={{ minHeight: '260px', maxHeight: '52vh' }}
              >
                {isGeneratingGif ? (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <Loader2 className="w-8 h-8 text-[#E15A6E] animate-spin" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-stone-700">
                        Memproses Animasi GIF Full Frame...
                      </span>
                      <span className="text-[11px] text-[#E15A6E] font-extrabold">{gifProgress}%</span>
                    </div>
                    {/* PROGRESS BAR */}
                    <div className="w-48 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E15A6E] transition-all duration-300 rounded-full"
                        style={{ width: `${gifProgress}%` }}
                      />
                    </div>
                  </div>
                ) : gifResult ? (
                  <img
                    src={gifResult.dataUrl}
                    alt="Animasi GIF Boomerang Full Frame Strip"
                    className="max-h-[48vh] max-w-full w-auto h-auto object-contain drop-shadow-md rounded-xl"
                  />
                ) : (
                  <div className="text-xs text-stone-400 font-medium">Gagal memuat pratinjau</div>
                )}
              </div>

              {/* SPEED CONTROLS */}
              {!isGeneratingGif && (
                <div className="w-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-stone-600 tracking-wider text-left flex items-center gap-1.5 px-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 inline" />
                    Kecepatan Animasi Boomerang:
                  </span>
                  <div className="grid grid-cols-3 gap-2"> 
                    {[
                      { label: 'Cepat (0.2s)', value: 0.2 },
                      { label: 'Normal (0.35s)', value: 0.35 }, 
                      { label: 'Santai (0.5s)', value: 0.5 }, 
                    ].map((s) => ( 
                      <button
                        key={s.value}
                        onClick={() => handleOpenGifModal(s.value)}
                        className={`py-2 px-1 text-[11px] rounded-xl border transition-all cursor-pointer font-semibold ${
                          gifInterval === s.value
                            ? 'bg-[#E15A6E] text-white border-[#E15A6E] shadow-2xs font-bold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
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
                  className="w-full py-3.5 bg-[#E15A6E] hover:bg-[#D4485D] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
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
        featureName="Ekspor Kualitas Cetak Fisik"
      />
    </div>
  );
};