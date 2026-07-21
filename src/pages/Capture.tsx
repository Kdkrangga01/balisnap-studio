import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { usePhotobooth } from '../context/PhotoboothContext';
import { generateDemoPhoto } from '../lib/utils';
import {
  ArrowLeft,
  Camera,
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
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';

const CAMERA_FILTERS = [
  { id: 'none', label: 'Natural ✨', filterCss: 'contrast(100%) brightness(100%) saturate(100%)' },
  { id: 'sweet-pink', label: 'Sweet Pink 🎀', filterCss: 'contrast(102%) brightness(108%) saturate(115%) sepia(8%) hue-rotate(-10deg)' },
  { id: 'retro', label: 'Retro Film 🎞️', filterCss: 'contrast(95%) brightness(98%) sepia(25%) saturate(90%)' },
  { id: 'bw', label: 'B&W Elegant 🖤', filterCss: 'grayscale(100%) contrast(115%) brightness(102%)' }
];

function cropDataUrlToAspect(
  dataUrl: string,
  targetAspect: number,
  maxLongSide: number,
  filterId: string
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
      const srcAspect = srcW / srcH;

      let cropW = srcW;
      let cropH = srcH;
      if (srcAspect > targetAspect) {
        cropW = Math.round(srcH * targetAspect);
        cropH = srcH;
      } else {
        cropW = srcW;
        cropH = Math.round(srcW / targetAspect);
      }
      const cropX = Math.round((srcW - cropW) / 2);
      const cropY = Math.round((srcH - cropH) / 2);

      let outW = cropW;
      let outH = cropH;
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

      if (filterId === 'sweet-pink') {
        ctx.filter = 'contrast(102%) brightness(108%) saturate(115%) sepia(8%)';
      } else if (filterId === 'retro') {
        ctx.filter = 'contrast(95%) brightness(98%) sepia(25%) saturate(90%)';
      } else if (filterId === 'bw') {
        ctx.filter = 'grayscale(100%) contrast(115%) brightness(102%)';
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
      resolve(canvas.toDataURL('image/jpeg', 0.98));
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar untuk di-crop.'));
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
  const [isMirrorMode, setIsMirrorMode] = useState<boolean>(true);
  const [timerInterval, setTimerInterval] = useState<number>(3);

  // Melacak orientasi viewport agar preview kamera bisa menyesuaikan rasio
  // (mobile/portrait pakai rasio lebih tinggi supaya wajah tidak terpotong,
  // desktop/landscape tetap pakai 16:9).
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

  // Sinkronisasi mutlak referensi array state agar pembacaan sekuensial tidak miss
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
        // Fallback aman mengunci indeks terakhir jika semua slot penuh
        const fallbackIndex = totalSlots - 1;
        setActiveSlot(fallbackIndex >= 0 ? fallbackIndex : 0);
        return null;
      }
    },
    [selectedFrame]
  );

  // Jalankan inisialisasi slot aktif pertama kali berdasarkan slot kosong murni di context
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

  // Sebagian browser mobile (terutama saat HP di-rotate ke landscape) melaporkan
  // videoWidth/videoHeight yang BERUBAH dari nilai awal getSettings(). Kalau kita
  // cuma pakai nilai dari handleUserMedia sekali di awal, kontainer preview jadi
  // tidak sinkron dengan bentuk asli stream setelah rotate -> wajah kepotong lagi.
  // Di sini kita dengarkan event 'loadedmetadata' & 'resize' langsung dari elemen
  // <video>, yang selalu mencerminkan dimensi video yang sesungguhnya saat ini.
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

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
    setCaptureError(null);
    setIsProcessingPhoto(true);

    const targetAspect = getSlotAspectRatio(activeSlot);
    const maxLongSide = 2048;
    const capturedSlot = activeSlot;

    cropDataUrlToAspect(imageSrc, targetAspect, maxLongSide, activeFilter)
      .then((croppedSrc) => {
        // 1. Perbarui state context global
        setPhotoAtSlot(capturedSlot, croppedSrc);

        // 2. Paksa salinan array lokal instan agar pencarian pencocokan indeks berikutnya presisi mutlak
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
  }, [webcamRef, activeSlot, isAutoShooting, activeFilter, timerInterval, setPhotoAtSlot, selectNextEmptySlot, actualResolution, getSlotAspectRatio]);

  if (!selectedFrame) return null;

  const { slots: totalSlots, name: frameName } = selectedFrame;

  // PENTING: tidak memaksa `aspectRatio`, `min`, ATAU height di videoConstraints.
  // - Memaksa rasio 16:9 di hardware bikin kamera depan HP (native-nya portrait)
  //   di-crop duluan oleh driver kamera sebelum sampai ke browser.
  // - Meminta width DAN height ideal yang sama (mis. 1280x1280) juga bikin
  //   kamera dipaksa crop jadi persegi oleh hardware -> hasilnya tetap zoom.
  // Solusinya: minta `ideal width` saja, biarkan browser/kamera memilih tinggi
  // sesuai rasio asli sensornya. Bentuk box preview di CSS akan MENGIKUTI
  // dimensi asli ini (lihat `cameraAspect` di bawah), bukan sebaliknya.
  const getVideoConstraints = () => {
    return {
      facingMode: 'user',
      width: { ideal: 1280 },
    };
  };

  // Rasio kontainer preview mengikuti dimensi ASLI video (dari state
  // actualResolution yang selalu ter-update, termasuk saat rotate).
  // Selama dimensi asli belum diketahui, pakai fallback yang wajar
  // sesuai orientasi layar saat ini.
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
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;

      const rawSrc = reader.result;
      const targetAspect = getSlotAspectRatio(activeSlot);
      const maxLongSide = 2048;
      const targetSlot = activeSlot;

      setIsProcessingPhoto(true);
      setCaptureError(null);

      cropDataUrlToAspect(rawSrc, targetAspect, maxLongSide, activeFilter)
        .then((croppedSrc) => {
          setPhotoAtSlot(targetSlot, croppedSrc);
          const updatedPhotos = [...photosStateRef.current];
          updatedPhotos[targetSlot] = croppedSrc;
          setIsProcessingPhoto(false);
          setTimeout(() => selectNextEmptySlot(updatedPhotos), 300);
        })
        .catch((err) => {
          console.error("Gagal melakukan auto-crop upload, mencoba pemotongan fallback...", err);
          cropDataUrlToAspect(rawSrc, targetAspect, 1024, 'none')
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
  const activeFilterStyle = CAMERA_FILTERS.find(f => f.id === activeFilter)?.filterCss || 'none';

  return (
    <>
      <div
        onMouseMove={handleKawaiiMouseMove}
        className="min-h-screen w-full bg-[#FFFDF6] text-zinc-800 py-3 px-3 sm:px-6 lg:px-12 relative overflow-hidden antialiased font-sans flex flex-col items-center justify-between group/canvas select-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFEBE2_1px,transparent_1px),linear-gradient(to_bottom,#EFEBE2_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.9] pointer-events-none z-0" />

        {/* Floating Emojis */}
        <div className="absolute top-20 left-6 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '3s' }}>🎀</div>
        <div className="absolute top-1/2 left-8 text-2xl animate-pulse pointer-events-none opacity-50 hidden xl:block text-pink-300"><Sparkles className="w-5 h-5 fill-current" /></div>
        <div className="absolute bottom-28 left-10 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '4.5s' }}>🧸</div>
        <div className="absolute top-28 right-6 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '3.5s' }}>💖</div>
        <div className="absolute bottom-20 right-8 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '4s' }}>✨</div>

        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover/canvas:opacity-100 transition duration-300 hidden md:block z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                550px circle at ${bX}px ${bY}px,
                rgba(255, 182, 193, 0.12),
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
              className="fixed inset-0 bg-white z-50 pointer-events-none"
              transition={{ duration: 0.15 }}
            />
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/10 backdrop-blur-md px-4"
            >
              <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="exit" className="bg-white border-4 border-rose-100 rounded-[36px] p-8 text-center shadow-2xl max-w-sm w-full mx-4">
                <motion.div animate={{ rotate: [0, 12, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl mb-4">🎉</motion.div>
                <h2 className="font-serif text-2xl font-black text-zinc-900 leading-tight">Semua Slot Terisi!</h2>
                <p className="text-zinc-500 text-xs mt-2 font-light">Potret selesai! Tekan <strong className="text-pink-500 font-bold">Lanjut ke Editor</strong> untuk merangkai ornamen lucu.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE CONTENT CONTAINER */}
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-between relative z-10 gap-2 overflow-hidden py-1">

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-b-4 border-dashed border-rose-100 pb-3 gap-2 w-full flex-shrink-0">
            <div className="text-center sm:text-left">
              <button
                onClick={() => { setIsAutoShooting(false); setStep('select-frame'); }}
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-600 font-black text-[10px] tracking-[0.25em] uppercase mb-1 transition-colors group px-2.5 py-1 bg-pink-50 rounded-full border border-pink-100/40"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                Kembali
              </button>
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-none">
                Ambil{' '}
                <span className="font-sans font-black italic bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-transparent bg-clip-text">
                  Foto Sesi
                </span>
              </h1>
              <p className="text-zinc-400 text-[10px] sm:text-[11px] font-normal flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>Katalog Bingkai: <strong className="font-bold text-zinc-700">"{frameName}"</strong></span>
                <span className="text-rose-200">•</span>
                <span className="bg-pink-50 text-pink-500 font-black px-1.5 py-0.5 rounded text-[10px]">{totalSlots} Slot Foto</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => { setIsAutoShooting(false); clearPhotos(); }}
                className="px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-rose-100 text-pink-400 hover:bg-rose-50/50 shadow-sm transition-all"
              >
                Ulangi Sesi
              </button>
              <button
                onClick={() => { setIsAutoShooting(false); setStep('editor'); }}
                disabled={!isAllFilled}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5 ${isAllFilled ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:opacity-90' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
              >
                <span>Lanjut ke Editor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {captureError && (
            <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{captureError}</span>
            </div>
          )}

          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center w-full flex-1 overflow-hidden min-h-0">

            {/* LEFT COLUMN: WEBCAM VIEWFINDER */}
            <div className="lg:col-span-8 flex flex-col justify-center gap-2 sm:gap-2.5 h-full w-full min-h-0 overflow-hidden relative">
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-24 h-4 bg-pink-200/40 backdrop-blur-sm border border-white/40 skew-x-[-12deg] z-20 shadow-sm pointer-events-none flex items-center justify-center text-[7px] text-pink-500 font-bold tracking-widest uppercase">BALISNAP</div>

              {/*
                Container preview kamera: rasionya sekarang mengikuti PERSIS rasio
                video asli (cameraAspect, dari actualResolution). Karena kontainer
                dan video punya rasio yang sama persis, object-cover tidak perlu
                memotong apa pun -> wajah selalu penuh, baik saat HP tegak (portrait)
                maupun saat di-rotate ke landscape.
              */}
              <div
                className="relative bg-zinc-950 border-4 border-rose-100 shadow-[0_15px_40px_rgba(253,244,245,0.6)] rounded-[20px] sm:rounded-[28px] overflow-hidden mx-auto w-full max-w-4xl flex-1 min-h-0"
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
                    style={{ filter: activeFilterStyle }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-4 bg-zinc-900 text-center">
                    <AlertCircle className="w-8 h-8 text-pink-300 mb-2" />
                    <h3 className="font-serif font-bold text-sm text-zinc-200">Kamera Tidak Terdeteksi</h3>
                  </div>
                )}

                {/* Composition Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-[0.15] border border-white/20">
                  <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
                  <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
                  <div className="border-r border-white" /><div className="border-r border-white" /><div />
                </div>

                {/* HUD Overlay Row: dulu 3 badge diposisikan absolute pakai angka "magic"
                    (right-24, right-3, dll) yang gampang tabrakan di layar sempit.
                    Sekarang pakai flex justify-between supaya otomatis menyesuaikan lebar layar. */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
                  <div className="bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[9px] font-black tracking-widest uppercase px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/10 pointer-events-auto max-w-[55%]">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAutoShooting ? 'bg-red-500 animate-ping' : 'bg-pink-400'}`} />
                    <span className="truncate">{isAutoShooting ? 'AUTO SEQUENCING...' : `SLOT #${activeSlot + 1} VIEW`}</span>
                  </div>

                  <div className="flex items-center gap-1.5 pointer-events-auto flex-shrink-0">
                    <button
                      onClick={() => setIsMirrorMode(!isMirrorMode)}
                      className="bg-zinc-950/80 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-black tracking-widest uppercase px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-md border border-white/10 transition-transform active:scale-95 flex items-center gap-1 whitespace-nowrap"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-pink-300 flex-shrink-0" />
                      <span className="hidden xs:inline">{isMirrorMode ? 'Mirror: On' : 'Mirror: Off'}</span>
                    </button>

                    <div className="hidden sm:flex bg-zinc-950/80 backdrop-blur-md text-zinc-300 text-[8px] font-black px-2.5 py-1.5 rounded-full border border-white/10 items-center gap-1 whitespace-nowrap">
                      <Settings className="w-2.5 h-2.5 text-pink-300 animate-spin-slow" />
                      <span>{actualResolution ? `${actualResolution.width}×${actualResolution.height}` : 'Full HD'}</span>
                    </div>
                  </div>
                </div>

                {/* Countdown display */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[1px] z-10"
                    >
                      <motion.span
                        key={countdown}
                        initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
                        animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.8, rotate: 15, opacity: 0 }}
                        className="font-sans font-black text-white text-6xl sm:text-8xl tracking-tighter drop-shadow-md select-none"
                      >
                        {countdown}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing Loader */}
                <AnimatePresence>
                  {isProcessingPhoto && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm z-10"
                    >
                      <div className="w-6 h-6 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Slot bar dots indicator overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex gap-1 z-10">
                  {Array.from({ length: totalSlots }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${photos[idx] ? 'bg-emerald-400' : idx === activeSlot ? 'bg-pink-400' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Filters selector container */}
              <div className="w-full flex justify-center flex-shrink-0">
                <div className="bg-white border-2 border-rose-50 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 overflow-x-auto max-w-full">
                  <span className="text-[8px] font-black tracking-wider uppercase text-zinc-400 mr-1 flex items-center gap-0.5 flex-shrink-0"><Smile className="w-3 h-3 text-pink-400" /> Filter:</span>
                  {CAMERA_FILTERS.map((fStr) => (
                    <button
                      key={fStr.id}
                      onClick={() => setActiveFilter(fStr.id)}
                      className={`px-2.5 py-1 text-[9px] font-black rounded-lg transition-all border whitespace-nowrap flex-shrink-0 ${activeFilter === fStr.id
                        ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white border-transparent shadow-sm'
                        : 'bg-zinc-50 text-zinc-500 border-rose-100/40 hover:bg-rose-50/20'}`}
                    >
                      {fStr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lower button panel operational deck */}
              <div className="bg-white border-2 border-rose-100 p-3 sm:p-3.5 rounded-[20px] shadow-[0_6px_25px_rgba(253,244,245,0.4)] flex flex-col sm:flex-row items-center justify-between gap-3 w-full flex-shrink-0">
                <div className="flex gap-2 w-full sm:w-auto relative">
                  <button
                    onClick={startSingleClickMultiShoot}
                    disabled={countdown !== null || !hasCamera || isProcessingPhoto || isAutoShooting}
                    className="px-4 sm:px-5 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-none disabled:opacity-40 shadow-[0_3px_10px_rgba(244,63,94,0.15)]"
                  >
                    <Camera className="w-3.5 h-3.5 text-white flex-shrink-0" />
                    <span className="truncate">{isAutoShooting ? 'Rentetan...' : 'Mulai Foto Otomatis ✨'}</span>
                  </button>
                  <button
                    onClick={() => { setIsAutoShooting(false); fileInputRef.current?.click(); }}
                    disabled={isProcessingPhoto || isAutoShooting}
                    className="px-4 py-3 bg-white border-2 border-rose-100 text-pink-400 hover:bg-rose-50/30 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-none disabled:opacity-30"
                  >
                    <Upload className="w-3.5 h-3.5 text-pink-300" />
                    Upload
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>

                {/* Timer Deck */}
                <div className="flex bg-[#FFFDF9] border-2 border-rose-50 rounded-lg p-0.5 shadow-inner items-center flex-shrink-0">
                  <span className="text-[7px] font-black font-mono text-zinc-400 px-1.5 uppercase border-r border-rose-100 mr-0.5">Timer:</span>
                  {[3, 5, 7].map((sec) => (
                    <button
                      key={sec}
                      disabled={isAutoShooting || countdown !== null}
                      onClick={() => setTimerInterval(sec)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black font-mono transition-all disabled:opacity-40 ${timerInterval === sec ? 'bg-zinc-950 text-white' : 'text-zinc-400'}`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>

                {/* Pulse bars component visual */}
                <div className="hidden md:flex items-center gap-1 border-2 border-rose-50 bg-[#FFFDF9] py-1.5 px-2.5 rounded-lg shadow-inner text-[8px] font-black text-pink-300 uppercase select-none font-mono flex-shrink-0">
                  <Activity className="w-3 h-3 text-pink-400 animate-pulse" />
                  <div className="flex items-end gap-0.5 h-3 w-12">
                    {[0.6, 0.9, 0.4, 0.8, 0.5, 0.9, 0.3].map((bVal, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [bVal, bVal * 0.2, bVal * 1.3, bVal] }}
                        transition={{ repeat: Infinity, duration: 0.7 + (i % 2) * 0.2, ease: 'easeInOut' }}
                        className="w-full h-full bg-pink-400/40 rounded-t origin-bottom"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDemoPhoto}
                  disabled={isAutoShooting}
                  className="px-4 py-3 bg-purple-50 text-purple-500 border border-purple-100 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 flex-shrink-0"
                >
                  Demo
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: PROGRESS SLOT TRACKER SIDEBAR */}
            <div className="lg:col-span-4 w-full h-full flex flex-col justify-center min-h-0 overflow-hidden">
              <div className="bg-white border-4 border-rose-50 p-4 sm:p-5 rounded-[22px] sm:rounded-[28px] shadow-[0_12px_30px_rgba(255,192,203,0.12)] flex flex-col max-h-full overflow-hidden">

                <div className="flex items-center justify-between mb-4 border-b-2 border-dashed border-rose-100 pb-2 flex-shrink-0">
                  <h3 className="font-serif text-sm sm:text-base font-black text-zinc-900 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-pink-400" />
                    Progres Slot
                  </h3>
                  <span className="text-[9px] font-black tracking-wider text-pink-500 bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded-full">
                    {filledCount} / {totalSlots} Terisi
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 custom-scroll flex-1 min-h-0">
                  {Array.from({ length: totalSlots }).map((_, index) => {
                    const photo = photos[index] || null;
                    const hasPhoto = photo !== null;
                    const isActive = index === activeSlot;
                    const slotAspect = getSlotAspectRatio(index);

                    return (
                      <div
                        key={index}
                        onClick={() => { if (!isAutoShooting) setActiveSlot(index); }}
                        className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all duration-300 ${isAutoShooting ? 'cursor-not-allowed' : 'cursor-pointer'} ${isActive
                          ? 'border-pink-400 bg-rose-50/20 shadow-sm ring-1 ring-pink-300'
                          : hasPhoto
                            ? 'border-emerald-100 bg-emerald-50/20'
                            : 'border-rose-50 bg-transparent hover:border-rose-200'
                          }`}
                      >
                        <div
                          className="rounded-lg overflow-hidden flex items-center justify-center bg-[#FFFDF9] border border-rose-100 flex-shrink-0 relative shadow-sm"
                          style={{
                            height: '46px',
                            width: `${Math.round(46 * slotAspect)}px`,
                            maxWidth: '64px',
                          }}
                        >
                          {hasPhoto ? (
                            <img src={photo} alt={`Slot ${index + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-rose-200" />
                          )}
                          {isActive && !hasPhoto && (
                            <div className="absolute inset-0 bg-pink-400/5 border border-pink-300 rounded-lg animate-pulse" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-zinc-800">Slot # {index + 1}</span>
                            {hasPhoto && <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-pink-400 mt-0.5">
                            {hasPhoto ? '✦ Tersimpan' : isActive ? '● Dibidik' : '✦ Antrean'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-2 border-t-2 border-dashed border-rose-100 flex-shrink-0">
                  {isAutoShooting ? (
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-[10px] font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500 animate-spin" />
                      <span>Mode berantai aktif dengan jeda {timerInterval}s!</span>
                    </div>
                  ) : !isAllFilled ? (
                    <div className="flex items-start gap-2 p-2 bg-amber-50/60 border border-amber-100 rounded-xl text-amber-800 text-[10px] font-medium leading-tight">
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
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #FBCFE8; border-radius: 10px; }
        .camera-mirror { transform: scaleX(${isMirrorMode ? '-1' : '1'}); }
        .animate-spin-slow { animation: spin 6s linear infinite; }
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