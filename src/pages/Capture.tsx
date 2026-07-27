import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { usePhotobooth } from '../context/PhotoboothContext';
import { generateDemoPhoto } from '../lib/utils';
import {
  ArrowLeft,
  Upload,
  RefreshCw,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Grid,
  Layers,
  Settings,
  Activity,
  Smile,
  Volume2,
  VolumeX,
  Zap,
  Wand2,
  Sun,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';

const CAMERA_FILTERS = [
  { id: 'none', label: 'Natural ✨', filterCss: 'contrast(100%) saturate(100%)' },
  { id: 'soft-glow', label: 'Korea Soft Glow 🌸', filterCss: 'contrast(98%) brightness(108%) saturate(110%) blur(0.3px)' },
  { id: 'y2k-gloss', label: 'Y2K Glossy 💅', filterCss: 'contrast(112%) brightness(105%) saturate(130%) hue-rotate(-5deg)' },
  { id: 'indie-vibes', label: 'Indie Film 🎞️', filterCss: 'contrast(92%) brightness(102%) sepia(20%) saturate(95%)' },
  { id: 'moody-cyber', label: 'Moody Cyber 🌃', filterCss: 'contrast(115%) brightness(98%) saturate(125%) hue-rotate(15deg)' },
  { id: 'sweet-pink', label: 'Sweet Pink 🎀', filterCss: 'contrast(102%) saturate(115%) sepia(8%) hue-rotate(-10deg)' },
  { id: 'bw-elegant', label: 'B&W Vintage 🖤', filterCss: 'grayscale(100%) contrast(118%) brightness(102%)' }
];

// Helper Audio Synth
const playBeepSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error(e);
  }
};

const playShutterSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {
    console.error(e);
  }
};

function fitDataUrlNoCrop(
  dataUrl: string,
  maxLongSide: number,
  filterId: string,
  brightnessLevel: number,
  isBeautyMode: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      if (!srcW || !srcH) {
        reject(new Error('Gambar tidak valid (dimensi 0).'));
        return;
      }

      let outW = srcW;
      let outH = srcH;
      const longSide = Math.max(outW, outH);
      if (longSide > maxLongSide) {
        const scale = maxLongSide / longSide;
        outW = Math.max(1, Math.round(outW * scale));
        outH = Math.max(1, Math.round(outH * scale));
      }

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context tidak tersedia.'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const currentFilterObj = CAMERA_FILTERS.find((f) => f.id === filterId);
      const filterCss = currentFilterObj ? currentFilterObj.filterCss : 'none';
      const beautyCss = isBeautyMode ? 'blur(0.5px) contrast(98%)' : '';

      ctx.filter = `brightness(${brightnessLevel}%) ${filterCss === 'none' ? '' : filterCss} ${beautyCss}`.trim();

      ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, outW, outH);
      resolve(canvas.toDataURL('image/jpeg', 0.98));
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar.'));
    img.src = dataUrl;
  });
}

export const Capture: React.FC = () => {
  const {
    selectedFrame,
    photos,
    setPhotoAtSlot,
    clearPhotos,
    setStep,
  } = usePhotobooth();

  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [actualResolution, setActualResolution] = useState<{ width: number; height: number } | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [isAutoShooting, setIsAutoShooting] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [brightness, setBrightness] = useState<number>(105);
  const [isBeautyMode, setIsBeautyMode] = useState<boolean>(false);
  const [isMirrorMode, setIsMirrorMode] = useState<boolean>(true);
  const [timerInterval, setTimerInterval] = useState<number>(3);

  // States Opsi Tampilan & Fitur Pendukung
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [gridOverlay, setGridOverlay] = useState<boolean>(true);

  const [isPortraitView, setIsPortraitView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight >= window.innerWidth;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsPortraitView(window.innerHeight >= window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photosStateRef = useRef<(string | null)[]>(photos);
  useEffect(() => {
    photosStateRef.current = photos;
  }, [photos]);

  const bX = useMotionValue(0);
  const bY = useMotionValue(0);

  function handleKawaiiMouseMove({ clientX, clientY, currentTarget }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    bX.set(clientX - left);
    bY.set(clientY - top);
  }

  const getSlotAspectRatio = useCallback((slotIndex: number): number => {
    const coords = selectedFrame?.slotCoords?.[slotIndex];
    if (coords && coords.w > 0 && coords.h > 0) {
      return coords.w / coords.h;
    }
    return 16 / 9;
  }, [selectedFrame]);

  const getThumbnailBoxSize = useCallback((slotAspect: number) => {
    const maxW = 64;
    const maxH = 46;
    let w = Math.round(maxH * slotAspect);
    let h = maxH;
    if (w > maxW) {
      w = maxW;
      h = Math.round(maxW / slotAspect);
    }
    return { width: w, height: h };
  }, []);

  const selectNextEmptySlot = useCallback(
    (currentPhotos: (string | null)[]) => {
      if (!selectedFrame) return null;
      const { slots: totalSlots } = selectedFrame;
      const nextEmpty = currentPhotos.findIndex((p) => p === null);
      if (nextEmpty !== -1 && nextEmpty < totalSlots) {
        setActiveSlot(nextEmpty);
        return nextEmpty;
      } else {
        setIsAutoShooting(false);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        const fallbackIndex = totalSlots - 1;
        setActiveSlot(fallbackIndex >= 0 ? fallbackIndex : 0);
        return null;
      }
    },
    [selectedFrame]
  );

  useEffect(() => {
    if (!selectedFrame) return;
    const { slots: totalSlots } = selectedFrame;
    const initialEmpty = photos.findIndex((p) => p === null);
    if (initialEmpty !== -1 && initialEmpty < totalSlots) {
      setActiveSlot(initialEmpty);
    } else {
      setActiveSlot(0);
    }
  }, [selectedFrame, photos]);

  const handleUserMedia = (stream: MediaStream) => {
    setHasCamera(true);
    const track = stream.getVideoTracks()[0];
    if (track) {
      const settings = track.getSettings();
      if (settings.width && settings.height) {
        setActualResolution({ width: settings.width, height: settings.height });
      }
    }
  };
  const handleUserMediaError = () => setHasCamera(false);

  useEffect(() => {
    if (!hasCamera) return;
    const video = webcamRef.current?.video;
    if (!video) return;

    const updateRealDimensions = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setActualResolution({ width: video.videoWidth, height: video.videoHeight });
      }
    };

    updateRealDimensions();
    video.addEventListener('loadedmetadata', updateRealDimensions);
    video.addEventListener('resize', updateRealDimensions);
    window.addEventListener('orientationchange', updateRealDimensions);

    return () => {
      video.removeEventListener('loadedmetadata', updateRealDimensions);
      video.removeEventListener('resize', updateRealDimensions);
      window.removeEventListener('orientationchange', updateRealDimensions);
    };
  }, [hasCamera]);

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;

    const video = webcamRef.current.video;
    const actualWidth = video?.videoWidth || actualResolution?.width || 1920;
    const actualHeight = video?.videoHeight || actualResolution?.height || 1080;

    const imageSrc = webcamRef.current.getScreenshot({
      width: actualWidth,
      height: actualHeight,
    });

    if (!imageSrc) {
      setCaptureError('Gagal mengambil foto dari kamera. Sesi otomatis dihentikan.');
      setIsAutoShooting(false);
      return;
    }

    if (soundEnabled) playShutterSound();
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
    setCaptureError(null);
    setIsProcessingPhoto(true);

    const maxLongSide = 2048;
    const capturedSlot = activeSlot;

    fitDataUrlNoCrop(imageSrc, maxLongSide, activeFilter, brightness, isBeautyMode)
      .then((croppedSrc) => {
        setPhotoAtSlot(capturedSlot, croppedSrc);

        const updatedPhotos = [...photosStateRef.current];
        updatedPhotos[capturedSlot] = croppedSrc;

        setIsProcessingPhoto(false);

        setTimeout(() => {
          const nextSlot = selectNextEmptySlot(updatedPhotos);
          if (isAutoShooting && nextSlot !== null) {
            setCountdown(timerInterval);
          }
        }, 400);
      })
      .catch((err) => {
        console.error(err);
        setIsProcessingPhoto(false);
        setIsAutoShooting(false);
      });
  }, [webcamRef, activeSlot, isAutoShooting, activeFilter, brightness, isBeautyMode, timerInterval, setPhotoAtSlot, selectNextEmptySlot, actualResolution, soundEnabled]);

  if (!selectedFrame) return null;

  const { slots: totalSlots, name: frameName } = selectedFrame;

  const getVideoConstraints = () => {
    return {
      facingMode: 'user',
      width: { ideal: 1280 },
    };
  };

  const fallbackAspect = isPortraitView ? 3 / 4 : 4 / 3;
  const cameraAspect =
    actualResolution && actualResolution.width > 0 && actualResolution.height > 0
      ? actualResolution.width / actualResolution.height
      : fallbackAspect;

  const startSingleClickMultiShoot = () => {
    const firstEmpty = photosStateRef.current.findIndex((p) => p === null);
    if (firstEmpty === -1 || firstEmpty >= totalSlots) {
      clearPhotos();
      setActiveSlot(0);
      setTimeout(() => {
        setIsAutoShooting(true);
        setCountdown(timerInterval);
      }, 250);
    } else {
      setActiveSlot(firstEmpty);
      setIsAutoShooting(true);
      setCountdown(timerInterval);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      capturePhoto();
      return;
    }
    if (soundEnabled && countdown > 0) playBeepSound();
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto, soundEnabled]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;

      const rawSrc = reader.result;
      const maxLongSide = 2048;
      const targetSlot = activeSlot;

      setIsProcessingPhoto(true);
      setCaptureError(null);

      fitDataUrlNoCrop(rawSrc, maxLongSide, activeFilter, brightness, isBeautyMode)
        .then((croppedSrc) => {
          setPhotoAtSlot(targetSlot, croppedSrc);
          const updatedPhotos = [...photosStateRef.current];
          updatedPhotos[targetSlot] = croppedSrc;
          setIsProcessingPhoto(false);
          setTimeout(() => selectNextEmptySlot(updatedPhotos), 300);
        })
        .catch((err) => {
          console.error("Gagal memproses foto upload, mencoba fallback...", err);
          fitDataUrlNoCrop(rawSrc, 1024, 'none', 100, false)
            .then((fallbackSrc) => {
              setPhotoAtSlot(targetSlot, fallbackSrc);
              const updatedPhotos = [...photosStateRef.current];
              updatedPhotos[targetSlot] = fallbackSrc;
              setIsProcessingPhoto(false);
              setTimeout(() => selectNextEmptySlot(updatedPhotos), 300);
            })
            .catch((fallbackErr) => {
              console.error("Kritis: Gagal memotong gambar.", fallbackErr);
              setIsProcessingPhoto(false);
              setCaptureError("Format gambar tidak didukung atau rusak.");
            });
        });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDemoPhoto = () => {
    const demoUrl = generateDemoPhoto(activeSlot);
    setPhotoAtSlot(activeSlot, demoUrl);
    const updatedPhotos = [...photosStateRef.current];
    updatedPhotos[activeSlot] = demoUrl;
    setTimeout(() => selectNextEmptySlot(updatedPhotos), 300);
  };

  const isAllFilled = photos.slice(0, totalSlots).every((p) => p !== null);
  const filledCount = photos.slice(0, totalSlots).filter((p) => p !== null).length;

  const selectedFilterObj = CAMERA_FILTERS.find(f => f.id === activeFilter);
  const activeFilterCss = selectedFilterObj ? selectedFilterObj.filterCss : '';
  const beautyCss = isBeautyMode ? 'blur(0.5px) contrast(98%)' : '';
  const combinedFilterStyle = `brightness(${brightness}%) ${activeFilterCss} ${beautyCss}`.trim();

  return (
    <>
      <div
        onMouseMove={handleKawaiiMouseMove}
        className="min-h-screen w-full bg-[#FAF6FF] text-zinc-800 py-3 px-3 sm:px-6 lg:px-12 relative overflow-hidden antialiased font-sans flex flex-col items-center justify-between group/canvas select-none"
      >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-200/40 via-purple-100/20 to-cyan-100/30 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E9D5FF_1px,transparent_1px),linear-gradient(to_bottom,#E9D5FF_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.5] pointer-events-none z-0" />

        {/* Floating Animated Aesthetics */}
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-16 left-8 text-3xl pointer-events-none opacity-80 hidden xl:block z-0">🌸</motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute top-1/2 left-10 text-2xl pointer-events-none text-purple-400 hidden xl:block z-0"><Sparkles className="w-6 h-6 fill-current animate-pulse" /></motion.div>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute bottom-24 left-12 text-3xl pointer-events-none opacity-80 hidden xl:block z-0">🍧</motion.div>
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-24 right-10 text-3xl pointer-events-none opacity-80 hidden xl:block z-0">🔮</motion.div>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} className="absolute bottom-20 right-12 text-3xl pointer-events-none opacity-80 hidden xl:block z-0">✨</motion.div>

        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover/canvas:opacity-100 transition duration-500 hidden md:block z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${bX}px ${bY}px,
                rgba(216, 180, 254, 0.25),
                transparent 80%
              )
            `,
          }}
        />

        {/* Flash Layer */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[100] pointer-events-none flex items-center justify-center"
              transition={{ duration: 0.1 }}
            >
              <div className="w-full h-full bg-pink-100/30 backdrop-blur-3xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration Pop Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/20 backdrop-blur-md px-4"
            >
              <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="exit" className="bg-white/90 backdrop-blur-xl border-4 border-purple-200 rounded-[36px] p-8 text-center shadow-[0_20px_50px_rgba(168,85,247,0.3)] max-w-sm w-full mx-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-200/50 rounded-full blur-xl pointer-events-none" />
                <motion.div animate={{ rotate: [0, 15, -15, 15, 0], scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-6xl mb-4 relative z-10">🎉</motion.div>
                <h2 className="font-serif text-2xl font-black text-zinc-900 leading-tight">Sesi Selesai!</h2>
                <p className="text-zinc-500 text-xs mt-2 font-light">Semua foto lengkap! Klik <strong className="text-purple-600 font-bold">Lanjut ke Editor</strong> untuk berkreasi.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE CONTENT CONTAINER */}
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-between relative z-10 gap-2 overflow-hidden py-1">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-b-4 border-dashed border-purple-200/70 pb-3 gap-2 w-full flex-shrink-0">
            <div className="text-center sm:text-left">
              <button
                onClick={() => { setIsAutoShooting(false); setStep('select-frame'); }}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-black text-[10px] tracking-[0.25em] uppercase mb-1 transition-all group px-3 py-1 bg-purple-50 hover:bg-purple-100 rounded-full border border-purple-200/80 shadow-sm"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                Kembali
              </button>
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-normal flex items-center gap-2 justify-center sm:justify-start">
                <span>Studio</span>
                <span className="font-sans font-black italic bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-transparent bg-clip-text pr-2 py-0.5 inline-block">
                  Foto Digital
                </span>
              </h1>
              <p className="text-zinc-400 text-[10px] sm:text-[11px] font-normal flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Katalog Bingkai: <strong className="font-bold text-zinc-700">"{frameName}"</strong></span>
                <span className="text-purple-200">•</span>
                <span className="bg-purple-100/80 text-purple-700 font-black px-2 py-0.5 rounded-full text-[10px] shadow-sm">{totalSlots} Slot Foto</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => { setIsAutoShooting(false); clearPhotos(); }}
                className="px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm border border-purple-100 text-purple-500 hover:bg-purple-50 shadow-sm transition-all active:scale-95"
              >
                Ulangi Sesi
              </button>
              <button
                onClick={() => { setIsAutoShooting(false); setStep('editor'); }}
                disabled={!isAllFilled}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 ${isAllFilled ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-white hover:opacity-95 active:scale-95 shadow-purple-200' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
              >
                <span>Lanjut ke Editor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {captureError && (
            <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex-shrink-0 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{captureError}</span>
            </div>
          )}

          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center w-full flex-1 overflow-hidden min-h-0">

            {/* LEFT COLUMN: WEBCAM VIEWFINDER */}
            <div className="lg:col-span-8 flex flex-col justify-center gap-2 sm:gap-2.5 h-full w-full min-h-0 overflow-hidden relative">

              {/* PERBAIKAN: Washi Tape Badge posisi aman (top-1) & rapih tanpa kepotong */}
              <div className="absolute top-1 sm:top-1.5 left-1/2 -translate-x-1/2 px-3.5 h-5 sm:h-6 bg-purple-300/80 backdrop-blur-md border border-white/80 skew-x-[-12deg] z-30 shadow-sm pointer-events-none flex items-center justify-center text-[8px] sm:text-[9px] text-purple-900 font-black tracking-widest uppercase rounded-sm">
                BALISNAP FX STUDIO
              </div>

              {/* Viewfinder Frame */}
              <div
                className="relative bg-zinc-950 border-4 border-purple-200/80 shadow-[0_20px_50px_rgba(216,180,254,0.4)] rounded-[20px] sm:rounded-[28px] overflow-hidden mx-auto w-full max-w-4xl flex-1 min-h-0 group pt-2"
                style={{
                  aspectRatio: cameraAspect,
                  maxHeight: isPortraitView ? '62vh' : '78vh',
                }}
              >
                {hasCamera ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={1.0}
                    imageSmoothing={true}
                    videoConstraints={getVideoConstraints()}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    className="w-full h-full object-cover object-center camera-mirror"
                    style={{ filter: combinedFilterStyle }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-4 bg-zinc-900 text-center">
                    <AlertCircle className="w-8 h-8 text-purple-300 mb-2 animate-bounce" />
                    <h3 className="font-serif font-bold text-sm text-zinc-200">Kamera Tidak Terdeteksi</h3>
                  </div>
                )}

                {/* Grid Lines Overlay */}
                {gridOverlay && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-[0.22] border border-white/30 transition-opacity">
                    <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
                    <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
                    <div className="border-r border-white" /><div className="border-r border-white" /><div />
                  </div>
                )}

                {/* Watermark Overlay */}
                {showWatermark && (
                  <div className="absolute bottom-6 left-5 z-20 pointer-events-none flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white/90 font-mono text-[9px] uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3 h-3 text-purple-300 animate-spin-slow" />
                    <span>BALISNAP • BOOTH LIVE</span>
                  </div>
                )}

                {/* HUD Overlay Top */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
                  <div className="bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[9px] font-black tracking-widest uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/10 pointer-events-auto max-w-[55%]">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAutoShooting ? 'bg-red-500 animate-ping' : 'bg-purple-400'}`} />
                    <span className="truncate">{isAutoShooting ? 'AUTO SEQUENCING...' : `SLOT #${activeSlot + 1} VIEW`}</span>
                  </div>

                  <div className="flex items-center gap-1.5 pointer-events-auto flex-shrink-0">
                    <button
                      onClick={() => setIsBeautyMode(!isBeautyMode)}
                      className={`bg-zinc-950/80 backdrop-blur-md text-[7px] sm:text-[8px] font-black uppercase px-2 py-1.5 rounded-full shadow-md border border-white/10 transition-all active:scale-95 flex items-center gap-1 ${isBeautyMode ? 'text-pink-300 border-pink-400/50' : 'text-zinc-400'}`}
                      title="Toggle Beauty Cam Blur"
                    >
                      <Sparkle className="w-3 h-3" />
                      <span>{isBeautyMode ? 'Beauty: ON' : 'Beauty: OFF'}</span>
                    </button>

                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-black uppercase p-1.5 sm:p-2 rounded-full shadow-md border border-white/10 transition-transform active:scale-95 flex items-center justify-center"
                      title="Toggle Sound"
                    >
                      {soundEnabled ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-rose-400" />}
                    </button>

                    <button
                      onClick={() => setGridOverlay(!gridOverlay)}
                      className={`bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-black uppercase p-1.5 sm:p-2 rounded-full shadow-md border border-white/10 transition-transform active:scale-95 ${gridOverlay ? 'text-purple-300' : 'text-zinc-500'}`}
                      title="Toggle Grid"
                    >
                      <Grid className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setShowWatermark(!showWatermark)}
                      className={`bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-black uppercase p-1.5 sm:p-2 rounded-full shadow-md border border-white/10 transition-transform active:scale-95 ${showWatermark ? 'text-amber-300' : 'text-zinc-500'}`}
                      title="Toggle Watermark Stamp"
                    >
                      <Wand2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => setIsMirrorMode(!isMirrorMode)}
                      className="bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-black tracking-widest uppercase px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-md border border-white/10 transition-transform active:scale-95 flex items-center gap-1 whitespace-nowrap"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-purple-300 flex-shrink-0" />
                      <span className="hidden xs:inline">{isMirrorMode ? 'Mirror: On' : 'Mirror: Off'}</span>
                    </button>

                    <div className="hidden sm:flex bg-zinc-950/80 backdrop-blur-md text-zinc-300 text-[8px] font-black px-2.5 py-1.5 rounded-full border border-white/10 items-center gap-1 whitespace-nowrap">
                      <Settings className="w-2.5 h-2.5 text-purple-300 animate-spin-slow" />
                      <span>{actualResolution ? `${actualResolution.width}×${actualResolution.height}` : 'Full HD'}</span>
                    </div>
                  </div>
                </div>

                {/* Countdown Display */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] z-30"
                    >
                      <motion.span
                        key={countdown}
                        initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1.3, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.7, rotate: 20, opacity: 0 }}
                        className="font-sans font-black text-white text-7xl sm:text-9xl tracking-tighter drop-shadow-[0_10px_25px_rgba(168,85,247,0.6)] select-none"
                      >
                        {countdown}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing Overlay */}
                <AnimatePresence>
                  {isProcessingPhoto && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-sm z-30 gap-2"
                    >
                      <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-white text-[10px] font-black uppercase tracking-widest animate-pulse">Menyimpan Foto...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Slot Indicator Bars */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-1 z-20">
                  {Array.from({ length: totalSlots }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${photos[idx] ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : idx === activeSlot ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Filter IG-Style Bar & Brightness Adjustment */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
                {/* Aesthetic IG Filters */}
                <div className="bg-white/90 backdrop-blur-md border border-purple-100 px-3 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 overflow-x-auto max-w-full custom-scroll flex-1">
                  <span className="text-[8px] font-black tracking-wider uppercase text-zinc-400 mr-1 flex items-center gap-0.5 flex-shrink-0"><Smile className="w-3.5 h-3.5 text-purple-400" /> Filter IG:</span>
                  {CAMERA_FILTERS.map((fStr) => (
                    <button
                      key={fStr.id}
                      onClick={() => setActiveFilter(fStr.id)}
                      className={`px-3 py-1 text-[9px] font-black rounded-xl transition-all border whitespace-nowrap flex-shrink-0 active:scale-95 ${activeFilter === fStr.id
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-white border-transparent shadow-sm'
                        : 'bg-zinc-50 text-zinc-500 border-purple-100/60 hover:bg-purple-50/40'}`}
                    >
                      {fStr.label}
                    </button>
                  ))}
                </div>

                {/* Brightness Adjustment Slider */}
                <div className="bg-white/90 backdrop-blur-md border border-purple-100 px-3 py-2 rounded-2xl shadow-sm flex items-center gap-2 flex-shrink-0">
                  <Sun className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-16 sm:w-24 accent-purple-500 cursor-pointer h-1.5 bg-purple-100 rounded-lg"
                    title="Atur Kecerahan"
                  />
                  <span className="text-[9px] font-mono font-bold text-purple-600 w-7">{brightness}%</span>
                </div>
              </div>

              {/* Lower Deck Operational Buttons */}
              <div className="bg-white/90 backdrop-blur-md border-2 border-purple-100 p-3 sm:p-3.5 rounded-[22px] shadow-[0_8px_30px_rgba(216,180,254,0.3)] flex flex-col sm:flex-row items-center justify-between gap-3 w-full flex-shrink-0">
                <div className="flex gap-2 w-full sm:w-auto relative">
                  <button
                    onClick={startSingleClickMultiShoot}
                    disabled={countdown !== null || !hasCamera || isProcessingPhoto || isAutoShooting}
                    className="px-4 sm:px-5 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-none disabled:opacity-40 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-purple-300 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-200 fill-current flex-shrink-0" />
                    <span className="truncate">{isAutoShooting ? 'Rentetan...' : 'Mulai Foto Otomatis ✨'}</span>
                  </button>
                  <button
                    onClick={() => { setIsAutoShooting(false); fileInputRef.current?.click(); }}
                    disabled={isProcessingPhoto || isAutoShooting}
                    className="px-4 py-3 bg-white border-2 border-purple-100 text-purple-600 hover:bg-purple-50/50 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-none disabled:opacity-30 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    Upload
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>

                {/* Timer Deck */}
                <div className="flex bg-[#FBF7FF] border-2 border-purple-100/70 rounded-xl p-1 shadow-inner items-center flex-shrink-0">
                  <span className="text-[7px] font-black font-mono text-zinc-400 px-1.5 uppercase border-r border-purple-100 mr-0.5">Timer:</span>
                  {[3, 5, 7].map((sec) => (
                    <button
                      key={sec}
                      disabled={isAutoShooting || countdown !== null}
                      onClick={() => setTimerInterval(sec)}
                      className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black font-mono transition-all disabled:opacity-40 active:scale-95 ${timerInterval === sec ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                {/* Audio pulse graphic */}
                <div className="hidden md:flex items-center gap-1 border-2 border-purple-50 bg-[#FBF7FF] py-1.5 px-2.5 rounded-xl shadow-inner text-[8px] font-black text-purple-300 uppercase select-none font-mono flex-shrink-0">
                  <Activity className="w-3 h-3 text-purple-500 animate-pulse" />
                  <div className="flex items-end gap-0.5 h-3 w-12">
                    {[0.6, 0.9, 0.4, 0.8, 0.5, 0.9, 0.3].map((bVal, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [bVal, bVal * 0.2, bVal * 1.3, bVal] }}
                        transition={{ repeat: Infinity, duration: 0.7 + (i % 2) * 0.2, ease: 'easeInOut' }}
                        className="w-full h-full bg-purple-400/40 rounded-t origin-bottom"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDemoPhoto}
                  disabled={isAutoShooting}
                  className="px-4 py-3 bg-pink-50 text-pink-600 border border-pink-100 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 flex-shrink-0 hover:bg-pink-100 active:scale-95"
                >
                  Demo
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: PROGRESS SLOT TRACKER SIDEBAR */}
            <div className="lg:col-span-4 w-full h-full flex flex-col justify-center min-h-0 overflow-hidden">
              <div className="bg-white/90 backdrop-blur-md border-4 border-purple-100/60 p-4 sm:p-5 rounded-[22px] sm:rounded-[28px] shadow-[0_12px_35px_rgba(216,180,254,0.25)] flex flex-col max-h-full overflow-hidden">

                <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-purple-100 pb-2 flex-shrink-0">
                  <h3 className="font-serif text-sm sm:text-base font-black text-zinc-900 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-purple-500" />
                    Progres Slot
                  </h3>
                  <span className="text-[9px] font-black tracking-wider text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full shadow-sm">
                    {filledCount} / {totalSlots} Terisi
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 custom-scroll flex-1 min-h-0">
                  {Array.from({ length: totalSlots }).map((_, index) => {
                    const photo = photos[index] || null;
                    const hasPhoto = photo !== null;
                    const isActive = index === activeSlot;
                    const slotAspect = getSlotAspectRatio(index);
                    const thumbBox = getThumbnailBoxSize(slotAspect);

                    return (
                      <div
                        key={index}
                        onClick={() => { if (!isAutoShooting) setActiveSlot(index); }}
                        className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all duration-300 ${isAutoShooting ? 'cursor-not-allowed' : 'cursor-pointer'} ${isActive
                          ? 'border-purple-400 bg-purple-50/40 shadow-sm ring-1 ring-purple-300'
                          : hasPhoto
                            ? 'border-emerald-100 bg-emerald-50/20'
                            : 'border-purple-50 bg-transparent hover:border-purple-200'
                          }`}
                      >
                        <div
                          className="rounded-lg overflow-hidden flex items-center justify-center bg-[#FAF6FF] border border-purple-100 flex-shrink-0 relative shadow-sm"
                          style={{
                            height: `${thumbBox.height}px`,
                            width: `${thumbBox.width}px`,
                          }}
                        >
                          {hasPhoto ? (
                            <img src={photo} alt={`Slot ${index + 1}`} className="w-full h-full object-cover" style={{ objectPosition: '50% 25%' }} />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-purple-200" />
                          )}
                          {isActive && !hasPhoto && (
                            <div className="absolute inset-0 bg-purple-400/10 border border-purple-400 rounded-lg animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-zinc-800">Slot # {index + 1}</span>
                            {hasPhoto && <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-purple-500 mt-0.5">
                            {hasPhoto ? '✦ Tersimpan' : isActive ? '● Dibidik' : '✦ Antrean'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-2 border-t-2 border-dashed border-purple-100 flex-shrink-0">
                  {isAutoShooting ? (
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-[10px] font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500 animate-spin" />
                      <span>Mode berantai aktif dengan jeda {timerInterval}s!</span>
                    </div>
                  ) : !isAllFilled ? (
                    <div className="flex items-start gap-2 p-2 bg-amber-50/70 border border-amber-100 rounded-xl text-amber-800 text-[10px] font-medium leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                      <span>Lengkapi matriks slot foto untuk lanjut hias.</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50/80 border border-emerald-100 rounded-xl text-emerald-800 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                      <span>Komposisi rampung! Siap beralih.</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #E9D5FF; border-radius: 10px; }
        .camera-mirror { transform: scaleX(${isMirrorMode ? '-1' : '1'}); }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 22 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};