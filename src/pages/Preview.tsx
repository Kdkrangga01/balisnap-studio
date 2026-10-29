import React, { useRef, useState, useEffect } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { exportHighResCanvas, saveOrShareImage, dataURItoBlob } from '../lib/exportImage';
import { generateBoomerangGif, type BoomerangMode } from '../lib/gifExport';
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
    incrementCompletedTrialSession,
    photoBurstFrames,
    photos,
    frameColor,
    captureType
  } = usePhotobooth();

  const stageRef = useRef<any>(null);
  const boomerangCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(450);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false); 
  const [downloadedImageUri, setDownloadedImageUri] = useState<string | null>(null); 
  const [copiedLink, setCopiedLink] = useState<boolean>(false); 
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false); 

  // NEW FEATURES STATE 
  const [exportQuality, setExportQuality] = useState<'standard' | 'high' | 'print'>('high'); 

  // BOOMERANG GIF STATE - default ke tab 'boomerang' bila user selesai sesi Foto GIF Boomerang
  const [previewTab, setPreviewTab] = useState<'strip' | 'boomerang'>(captureType === 'boomerang' ? 'boomerang' : 'strip');
  const [showGifModal, setShowGifModal] = useState<boolean>(false); 
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false); 
  const [gifProgress, setGifProgress] = useState<number>(0);
  const [gifResult, setGifResult] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [gifInterval, setGifInterval] = useState<number>(0.15);
  const [gifMode, setGifMode] = useState<BoomerangMode>('sequence'); 

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

  // PEMUTAR ANIMASI BOOMERANG REAL-TIME LANGSUNG (100% STABIL, TIDAK PERNAH FREEZE / HITAM)
  // Menampilkan pergerakan looping maju-mundur asli dari frame kamera tanpa perlu menunggu encoder GIF
  useEffect(() => {
    if (previewTab !== 'boomerang' || !selectedFrame) return;

    let isCancelled = false;
    let animTimer: any = null;

    const runLivePlayer = async () => {
      const canvas = boomerangCanvasRef.current;
      if (!canvas) return;

      const fW = selectedFrame.width || 1200;
      const fH = selectedFrame.height || 1800;
      const targetW = 420;
      const targetH = Math.round(targetW * (fH / fW));
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Preload frame template overlay
      const frameImg = new window.Image();
      frameImg.crossOrigin = 'Anonymous';
      frameImg.src = selectedFrame.src;
      await new Promise((res) => {
        if (frameImg.complete && frameImg.naturalWidth > 0) res(true);
        else {
          frameImg.onload = () => res(true);
          frameImg.onerror = () => res(true);
        }
      });
      if (isCancelled) return;

      // 2. Preload foto & burst sequence tiap slot
      const slotCount = selectedFrame.slotCoords.length;
      const hasBurst = photoBurstFrames && photoBurstFrames.some((b) => Array.isArray(b) && b.length > 1);
      const loadedImages: HTMLImageElement[][] = [];
      let maxFrames = 1;

      for (let idx = 0; idx < slotCount; idx++) {
        loadedImages[idx] = [];
        const frames = photoBurstFrames?.[idx];
        if (hasBurst && frames && frames.length > 1) {
          maxFrames = Math.max(maxFrames, frames.length);
          for (const src of frames) {
            const img = new window.Image();
            img.src = src;
            await new Promise((res) => {
              if (img.complete && img.naturalWidth > 0) res(true);
              else {
                img.onload = () => res(true);
                img.onerror = () => res(true);
              }
            });
            loadedImages[idx].push(img);
          }
        } else if (photos[idx]) {
          const img = new window.Image();
          img.src = photos[idx]!;
          await new Promise((res) => {
            if (img.complete && img.naturalWidth > 0) res(true);
            else {
              img.onload = () => res(true);
              img.onerror = () => res(true);
            }
          });
          loadedImages[idx].push(img);
        }
      }
      if (isCancelled) return;

      // 3. Bangun urutan ping-pong boomerang
      const pingPongSeq: number[] = [];
      if (hasBurst && maxFrames > 1) {
        for (let i = 0; i < maxFrames; i++) pingPongSeq.push(i);
        for (let i = maxFrames - 2; i > 0; i--) pingPongSeq.push(i);
      } else {
        // Fallback untuk foto biasa: 12 langkah osilasi gelombang harmonis
        for (let i = 0; i < 12; i++) pingPongSeq.push(i); 
      }

      let step = 0;
      const frameIntervalMs = Math.max(80, Math.round(gifInterval * 1000));

      const renderFrame = () => {
        if (isCancelled) return;
        const frameIdx = pingPongSeq[step % pingPongSeq.length];
        const t = (step / pingPongSeq.length) * Math.PI * 2;

        ctx.clearRect(0, 0, targetW, targetH);
        ctx.fillStyle = frameColor && frameColor !== 'original' ? frameColor : '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);

        for (let idx = 0; idx < slotCount; idx++) {
          const slot = selectedFrame.slotCoords[idx];
          if (!slot) continue;

          const sx = (slot.x / fW) * targetW;
          const sy = (slot.y / fH) * targetH;
          const sw = (slot.w / fW) * targetW;
          const sh = (slot.h / fH) * targetH;
          const srx = slot.rx ? (slot.rx / fW) * targetW : 0;

          const imgs = loadedImages[idx];
          if (!imgs || imgs.length === 0) continue;

          let activeImg = imgs[frameIdx % imgs.length];
          let scale = 1.0;
          let panX = 0;
          let panY = 0;

          if (!hasBurst) {
            activeImg = imgs[0];
            if (gifMode === 'sequence') {
              const phase = t + idx * ((Math.PI * 2) / Math.max(1, slotCount));
              scale = 1.0 + Math.sin(phase) * 0.045;
              panY = Math.cos(phase) * 3;
            } else if (gifMode === 'pop') {
              const currentActiveIdx = Math.floor((step / pingPongSeq.length) * slotCount);
              scale = idx === currentActiveIdx ? 1.08 : 0.98;
            }
          }

          if (activeImg && activeImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            if (srx > 0 && typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(sx, sy, sw, sh, srx);
            } else {
              ctx.rect(sx, sy, sw, sh);
            }
            ctx.clip();
            drawImageCover(ctx, activeImg, sx, sy, sw, sh, scale, panX, panY);
            ctx.restore();
          }
        }

        if (frameImg.complete && frameImg.naturalWidth > 0) {
          ctx.drawImage(frameImg, 0, 0, targetW, targetH);
        }

        step = (step + 1) % pingPongSeq.length;
      };

      renderFrame();
      animTimer = setInterval(renderFrame, frameIntervalMs);
    };

    runLivePlayer();

    return () => {
      isCancelled = true;
      if (animTimer) clearInterval(animTimer);
    };
  }, [previewTab, selectedFrame, photoBurstFrames, photos, frameColor, gifInterval, gifMode]);



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

  // Helper untuk menggambar foto mengisi slot edge-to-edge tanpa distorsi (Center Cover Fit)
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    scale = 1.0,
    panX = 0,
    panY = 0
  ) => {
    const imgW = img.naturalWidth || img.width || 800;
    const imgH = img.naturalHeight || img.height || 600;
    if (!imgW || !imgH) return;

    const baseScale = Math.max(w / imgW, h / imgH);
    const finalScale = baseScale * scale;
    const renderW = imgW * finalScale;
    const renderH = imgH * finalScale;

    const renderX = x + (w - renderW) / 2 + panX;
    const renderY = y + (h - renderH) / 2 + panY;

    ctx.drawImage(img, renderX, renderY, renderW, renderH);
  };

  // GIF Boomerang Generator Handler - RENDER VIA CANVAS 2D OFFSCREEN UNTUK EKSPOR FILE .GIF CEPAT & STABIL
  const generateGif = async (customInterval?: number, customMode?: BoomerangMode): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!selectedFrame) return null;

    setIsGeneratingGif(true);
    setGifProgress(15);

    const targetInterval = customInterval !== undefined ? customInterval : gifInterval;
    const targetMode = customMode !== undefined ? customMode : gifMode;
    setGifInterval(targetInterval);
    setGifMode(targetMode);

    try {
      const fW = selectedFrame.width || 1200;
      const fH = selectedFrame.height || 1800;
      // Gunakan resolusi 340px optimal agar encoding GIF cepat (<2 detik) dan file ringan untuk diunduh
      const targetGifW = 340;
      const targetGifH = Math.min(800, Math.round(targetGifW * (fH / fW)));
      const slotCount = selectedFrame.slotCoords.length;

      // 1. Preload frame overlay mask
      const frameImg = new window.Image();
      frameImg.crossOrigin = 'Anonymous';
      frameImg.src = selectedFrame.src;
      await new Promise((res) => {
        if (frameImg.complete && frameImg.naturalWidth > 0) res(true);
        else {
          frameImg.onload = () => res(true);
          frameImg.onerror = () => res(true);
        }
      });

      setGifProgress(25);

      // 2. Preload seluruh foto burst / still untuk masing-masing slot
      const hasCameraBurst = photoBurstFrames && photoBurstFrames.some((b) => Array.isArray(b) && b.length > 1);
      const burstImages: HTMLImageElement[][] = [];
      let maxBurstFrames = 1;

      for (let idx = 0; idx < slotCount; idx++) {
        burstImages[idx] = [];
        const frames = photoBurstFrames?.[idx];

        if (hasCameraBurst && frames && frames.length > 1) {
          maxBurstFrames = Math.max(maxBurstFrames, frames.length);
          for (const src of frames) {
            const img = new window.Image();
            img.src = src;
            await new Promise((res) => {
              if (img.complete && img.naturalWidth > 0) res(true);
              else {
                img.onload = () => res(true);
                img.onerror = () => res(true);
              }
            });
            burstImages[idx].push(img);
          }
        } else if (photos[idx]) {
          const img = new window.Image();
          img.src = photos[idx]!;
          await new Promise((res) => {
            if (img.complete && img.naturalWidth > 0) res(true);
            else {
              img.onload = () => res(true);
              img.onerror = () => res(true);
            }
          });
          burstImages[idx].push(img);
        }
      }

      setGifProgress(35);

      // 3. Kanvas render 2D offscreen mandiri
      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetGifW;
      offCanvas.height = targetGifH;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context tidak tersedia.');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const generatedFrames: string[] = [];
      let isPreLooped = false;

      if (hasCameraBurst) {
        // MODE LIVE BURST: Siklus Ping-Pong Boomerang Nyata
        isPreLooped = true;
        const pingPongSeq: number[] = [];
        for (let i = 0; i < maxBurstFrames; i++) pingPongSeq.push(i);
        for (let i = maxBurstFrames - 2; i > 0; i--) pingPongSeq.push(i);

        const totalSteps = pingPongSeq.length;

        for (let step = 0; step < totalSteps; step++) {
          const frameIdx = pingPongSeq[step];

          ctx.clearRect(0, 0, targetGifW, targetGifH);
          ctx.fillStyle = frameColor && frameColor !== 'original' ? frameColor : '#ffffff';
          ctx.fillRect(0, 0, targetGifW, targetGifH);

          for (let idx = 0; idx < slotCount; idx++) {
            const slot = selectedFrame.slotCoords[idx];
            if (!slot) continue;

            const sx = (slot.x / fW) * targetGifW;
            const sy = (slot.y / fH) * targetGifH;
            const sw = (slot.w / fW) * targetGifW;
            const sh = (slot.h / fH) * targetGifH;
            const srx = slot.rx ? (slot.rx / fW) * targetGifW : 0;

            const imgs = burstImages[idx];
            if (!imgs || imgs.length === 0) continue;
            const activeImg = imgs[frameIdx % imgs.length];
            if (!activeImg) continue;

            ctx.save();
            ctx.beginPath();
            if (srx > 0 && typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(sx, sy, sw, sh, srx);
            } else {
              ctx.rect(sx, sy, sw, sh);
            }
            ctx.clip();

            drawImageCover(ctx, activeImg, sx, sy, sw, sh);
            ctx.restore();
          }

          if (frameImg.complete && frameImg.naturalWidth > 0) {
            ctx.drawImage(frameImg, 0, 0, targetGifW, targetGifH);
          }

          generatedFrames.push(offCanvas.toDataURL('image/jpeg', 0.88));
          setGifProgress(35 + Math.round(((step + 1) / totalSteps) * 35));
        }
      } else {
        // Fallback Foto Biasa: 10 langkah osilasi gelombang harmonis
        isPreLooped = true;
        const totalSteps = 10;
        for (let step = 0; step < totalSteps; step++) {
          const t = (step / totalSteps) * Math.PI * 2;
          ctx.clearRect(0, 0, targetGifW, targetGifH);
          ctx.fillStyle = frameColor && frameColor !== 'original' ? frameColor : '#ffffff';
          ctx.fillRect(0, 0, targetGifW, targetGifH);

          for (let idx = 0; idx < slotCount; idx++) {
            const slot = selectedFrame.slotCoords[idx];
            if (!slot) continue;

            const sx = (slot.x / fW) * targetGifW;
            const sy = (slot.y / fH) * targetGifH;
            const sw = (slot.w / fW) * targetGifW;
            const sh = (slot.h / fH) * targetGifH;
            const srx = slot.rx ? (slot.rx / fW) * targetGifW : 0;

            const imgs = burstImages[idx];
            if (!imgs || imgs.length === 0) continue;
            const activeImg = imgs[0];
            if (!activeImg) continue;

            const phase = t + (idx * ((Math.PI * 2) / Math.max(1, slotCount)));
            const waveScale = 1.0 + Math.sin(phase) * 0.04;
            const panY = Math.cos(phase) * 3;

            ctx.save();
            ctx.beginPath();
            if (srx > 0 && typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(sx, sy, sw, sh, srx);
            } else {
              ctx.rect(sx, sy, sw, sh);
            }
            ctx.clip();
            drawImageCover(ctx, activeImg, sx, sy, sw, sh, waveScale, 0, panY);
            ctx.restore();
          }

          if (frameImg.complete && frameImg.naturalWidth > 0) {
            ctx.drawImage(frameImg, 0, 0, targetGifW, targetGifH);
          }

          generatedFrames.push(offCanvas.toDataURL('image/jpeg', 0.88));
          setGifProgress(35 + Math.round(((step + 1) / totalSteps) * 35));
        }
      }

      setGifProgress(72);

      const res = await generateBoomerangGif({
        photos: generatedFrames,
        interval: targetInterval,
        gifWidth: targetGifW,
        gifHeight: targetGifH,
        isPreLooped: isPreLooped,
        progressCallback: (pct) => setGifProgress(72 + Math.round((pct / 100) * 26)),
      });

      setGifResult(res);
      setGifProgress(100);
      return res; 
    } catch (err) {
      console.error('Gagal membuat Boomerang GIF:', err); 
      return null; 
    } finally {
      setIsGeneratingGif(false);
    }
  };

  const handleOpenGifModal = async (customInterval?: number, customMode?: BoomerangMode) => {
    setShowGifModal(true);
    if (!gifResult || customInterval !== undefined || customMode !== undefined) {
      await generateGif(customInterval, customMode); 
    }
  };

  const handleDownloadGif = async () => { 
    let result = gifResult; 
    if (!result) {
      result = await generateGif();
    }
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.dataUrl;
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
              onClick={() => setStep(captureType === 'boomerang' ? 'capture' : 'editor')} 
              className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-extrabold text-[11px] tracking-wider uppercase mb-1.5 transition-all group px-3.5 py-1.5 bg-zinc-100/90 rounded-full border border-zinc-200 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              {captureType === 'boomerang' ? 'Kembali ke Kamera' : 'Kembali ke Editor'}
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

          {/* LEFT COLUMN: CANVAS OR BOOMERANG SHOWCASE */}
          <div className="lg:col-span-6 flex flex-col justify-center items-center relative" ref={containerRef}>
            {/* VIEW MODE TOGGLE (FOTO STRIP VS BOOMERANG GIF) */}
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <div className="bg-stone-100/90 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-stone-200/80 shadow-2xs">
                <button
                  onClick={() => setPreviewTab('strip')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'strip'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-stone-700" />
                  <span>Foto Strip HD</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewTab('boomerang');
                    if (!gifResult && !isGeneratingGif) {
                      generateGif();
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'boomerang'
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Film className="w-3.5 h-3.5 text-rose-100" />
                  <span>Animasi Boomerang</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-semibold ${
                    previewTab === 'boomerang' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                  }`}>
                    GIF
                  </span>
                </button>
              </div>

              {previewTab === 'boomerang' && gifResult && !isGeneratingGif && (
                <button
                  onClick={() => setShowGifModal(true)}
                  className="text-[11px] font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1.5 rounded-xl transition-all border border-stone-200"
                  title="Buka Pratinjau Penuh"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Perbesar</span>
                </button>
              )}
            </div>

            {/* CUTE TAPE STRIP */}
            <div className="absolute top-[38px] left-1/2 -translate-x-1/2 px-4 h-7 bg-zinc-100/90 backdrop-blur-md border border-zinc-200 skew-x-[-10deg] z-20 shadow-xs pointer-events-none flex items-center justify-center gap-1.5 text-[9px] text-zinc-700 font-bold tracking-widest uppercase rounded-sm">
              <Camera className="w-3 h-3 text-zinc-500 inline" />
              <span>BALISNAP MEMORIES</span>
            </div> 

            {/* MAIN SHOWCASE CONTAINER */}
            <div
              className="relative p-3 md:p-4 bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.06)] rounded-[32px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] w-full"
              style={{ minHeight: '480px' }}
            >
              {/* PhotoCanvas always stays mounted in DOM */}
              <div
                className={`transition-opacity duration-300 flex items-center justify-center ${
                  previewTab === 'strip'
                    ? 'relative opacity-100 z-10'
                    : 'absolute opacity-0 pointer-events-none -z-10'
                }`}
                style={{ filter: getFilterCss() }}
              >
                <PhotoCanvas stageRef={stageRef} containerWidth={canvasWidth} isPreviewMode={true} />
              </div>

              {/* Boomerang Live Showcase - Real-time Live Animated Canvas Player */}
              {previewTab === 'boomerang' && (
                <div className="w-full flex flex-col items-center justify-center min-h-[440px] py-2 relative z-10">
                  <div className="relative group flex items-center justify-center"> 
                    <canvas
                      ref={boomerangCanvasRef}
                      className="max-h-[54vh] max-w-full w-auto h-auto object-contain rounded-2xl drop-shadow-md"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-stone-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-stone-200/90 tracking-wide flex items-center gap-1.5 shadow-xs pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Boomerang Loop</span>
                    </div>
                  </div> 
                </div>
              )}
            </div>

            {/* CONTROLS BELOW SHOWCASE */}
            {previewTab === 'strip' ? (
              /* QUICK PRESET VIBE FILTER BAR */
              <div className="mt-3.5 bg-white/95 backdrop-blur-md border border-stone-200/90 p-2.5 rounded-2xl shadow-xs flex items-center gap-2 w-full justify-center">
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
            ) : (
              /* BOOMERANG SPEED & STYLE CONTROLS BAR */
              <div className="mt-3.5 bg-white/95 backdrop-blur-md border border-stone-200/90 p-3 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                {/* Gaya Efek */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Mode:</span>
                  <div className="flex gap-1.5 flex-1 sm:flex-initial">
                    {[
                      { id: 'sequence', label: 'Siklus Dinamis' },
                      { id: 'pop', label: 'Sorotan Panggung' },
                      { id: 'flash', label: 'Kilat Studio' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => generateGif(undefined, m.id as BoomerangMode)}
                        disabled={isGeneratingGif}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex-1 sm:flex-initial ${
                          gifMode === m.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kecepatan */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Tempo:</span>
                  <div className="flex gap-1.5">
                    {[
                      { label: 'Cepat', value: 0.08 },
                      { label: 'Sedang', value: 0.15 },
                      { label: 'Santai', value: 0.28 },
                    ].map((s) => (
                      <button
                        key={s.value}
                        onClick={() => generateGif(s.value, undefined)}
                        disabled={isGeneratingGif}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                          gifInterval === s.value
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                  {previewTab === 'boomerang' ? 'Animasi Boomerang Siap!' : 'Hasil Foto Anda Siap!'}
                </h2>
                <p className="text-stone-500 text-xs md:text-sm font-normal leading-relaxed mt-1">
                  {previewTab === 'boomerang'
                    ? 'Format GIF animasi bergerak loop bolak-balik tanpa patah. Siap disimpan ke galeri atau dibagikan ke Instagram Stories & TikTok.'
                    : 'Foto telah selesai diproses dengan kejernihan maksimal tanpa kompresi. Siap disimpan ke galeri, dicetak fisik, atau dibagikan ke media sosial.'}
                </p>
              </div>

              {/* SPECIFICATIONS OR RESOLUTION QUALITY SELECTOR */}
              {previewTab === 'boomerang' ? (
                <div className="bg-stone-50 border border-stone-200/80 p-3.5 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      Informasi Animasi Boomerang:
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Auto-Loop HD
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col items-center">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400">Format</span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5">GIF Strip HD</span>
                      <span className="text-[9px] text-stone-500">Mulus Tanpa Jeda</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col items-center">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400">Mode Aktif</span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5">
                        {gifMode === 'sequence' ? 'Siklus' : gifMode === 'pop' ? 'Sorotan' : 'Kilat'}
                      </span>
                      <span className="text-[9px] text-stone-500">Khas Event Booth</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-col items-center">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-400">Tempo</span>
                      <span className="text-xs font-bold text-stone-900 mt-0.5">
                        {gifInterval === 0.08 ? 'Cepat' : gifInterval === 0.28 ? 'Santai' : 'Sedang'}
                      </span>
                      <span className="text-[9px] text-stone-500">Fluid Motion</span>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2.5 mt-0.5">
                {previewTab === 'boomerang' ? (
                  /* HERO ACTION WHEN ON BOOMERANG TAB: UNDUH GIF */
                  <button
                    onClick={handleDownloadGif}
                    disabled={isGeneratingGif || !gifResult}
                    className="w-full py-3.5 px-6 bg-[#E15A6E] hover:bg-[#D4485D] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer relative overflow-hidden disabled:opacity-50"
                  >
                    {isGeneratingGif ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                        <span>Merender Boomerang ({gifProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        <span>Unduh Animasi GIF (.gif)</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          Boomerang
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  /* PRIMARY ACTION: HERO UNDUH FOTO PNG */
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
                )}

                {/* SECONDARY ROW (2-KOLOM SEIMBANG) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {previewTab === 'boomerang' ? (
                    <button
                      onClick={() => setPreviewTab('strip')}
                      className="py-3 px-3.5 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 hover:border-stone-300 font-semibold text-xs rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Camera className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform shrink-0" />
                      <span>Kembali ke Foto Strip</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPreviewTab('boomerang');
                        if (!gifResult && !isGeneratingGif) {
                          generateGif();
                        }
                      }}
                      className="py-3 px-3.5 bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-200 font-semibold text-xs rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Film className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform shrink-0" />
                      <span>Animasi Boomerang</span>
                    </button>
                  )}

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
                      setStep(captureType === 'boomerang' ? 'capture' : 'editor');
                    }}
                    className="py-2.5 bg-white hover:bg-pink-50 text-zinc-700 border border-pink-200 font-extrabold tracking-wider uppercase text-[10px] rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-pink-500" />
                    {captureType === 'boomerang' ? 'Foto Lagi' : 'Edit Foto'}
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
              className="bg-white border border-stone-200/90 rounded-[28px] max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] relative overflow-hidden text-center flex flex-col items-center gap-3 z-50 select-none max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON */}
              {!isGeneratingGif && (
                <button
                  onClick={() => setShowGifModal(false)}
                  className="absolute top-3.5 right-3.5 w-8 h-8 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full flex items-center justify-center transition-all cursor-pointer z-10"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex flex-col items-center gap-1 mt-0.5">
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-600" />
                  Pratinjau Animasi GIF
                </h3>
                <p className="text-xs text-stone-500 font-normal">
                  Foto Boomerang bergerak hasil momen Photobooth Anda!
                </p>
              </div>

              {/* GIF PREVIEW CONTAINER - Clean, borderless display like real photobooth */}
              <div
                className="w-full bg-stone-950 rounded-2xl overflow-hidden flex items-center justify-center relative my-1"
                style={{ minHeight: '240px', maxHeight: '50vh' }}
              >
                {isGeneratingGif ? (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <Loader2 className="w-7 h-7 text-white/80 animate-spin" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-white/90">
                        Membuat animasi boomerang...
                      </span>
                      <span className="text-[11px] text-purple-300 font-bold">{gifProgress}%</span>
                    </div>
                    {/* PROGRESS BAR */}
                    <div className="w-44 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-400 transition-all duration-300 rounded-full"
                        style={{ width: `${gifProgress}%` }}
                      />
                    </div>
                  </div>
                ) : gifResult ? (
                  <img
                    src={gifResult.dataUrl}
                    alt="Animasi GIF Boomerang"
                    className="max-h-[48vh] max-w-full w-auto h-auto object-contain"
                  />
                ) : (
                  <div className="text-xs text-stone-500 font-medium p-6">Gagal memuat pratinjau</div>
                )}
              </div>

              {/* ANIMATION STYLE CONTROLS */}
              {!isGeneratingGif && (
                <div className="w-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider text-left flex items-center gap-1.5 px-0.5">
                    <Sliders className="w-3.5 h-3.5 text-stone-700 inline" />
                    Mode Animasi:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sequence', label: 'Siklus Dinamis', desc: 'Harmoni Mengalir' }, 
                      { id: 'pop', label: 'Sorotan Panggung', desc: 'Fokus Sorotan Anggun' },
                      { id: 'flash', label: 'Kilat Studio', desc: 'Blitz Lampu Kamera' }, 
                    ].map((m) => ( 
                      <button
                        key={m.id}
                        onClick={() => handleOpenGifModal(undefined, m.id as BoomerangMode)}
                        className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          gifMode === m.id
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-semibold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 font-medium'
                        }`}
                      >
                        <span className="text-[11px] font-bold leading-tight">{m.label}</span>
                        <span className={`text-[9px] mt-0.5 ${gifMode === m.id ? 'text-stone-300' : 'text-stone-400'}`}>
                          {m.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SPEED CONTROLS */}
              {!isGeneratingGif && (
                <div className="w-full flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider text-left flex items-center gap-1.5 px-0.5">
                    <Zap className="w-3.5 h-3.5 text-stone-700 inline" />
                    Tempo Gerakan:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5"> 
                    {[
                      { label: 'Cepat (0.08s)', value: 0.08 },
                      { label: 'Sedang (0.15s)', value: 0.15 }, 
                      { label: 'Santai (0.28s)', value: 0.28 }, 
                    ].map((s) => ( 
                      <button
                        key={s.value}
                        onClick={() => handleOpenGifModal(s.value, undefined)}
                        className={`py-2 px-1 text-[11px] rounded-xl border transition-all cursor-pointer font-semibold ${
                          gifInterval === s.value
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-bold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 font-medium'
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
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-0.5"
                >
                  <Download className="w-4 h-4" />
                  Unduh Animasi .GIF
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