import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { usePhotobooth } from '../context/PhotoboothContext';
import { generateDemoPhoto, generateDemoBurst } from '../lib/utils';
import {
  ArrowLeft,
  Upload,
  Check,
  Camera,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Grid,
  Smile,
  Sun,
  Maximize2,
  Clock,
  X,
  Film,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CAMERA_FILTERS = [
  { id: 'none', label: 'Natural', filterCss: 'contrast(100%) saturate(100%)' },
  { id: 'soft-glow', label: 'Korea Soft', filterCss: 'contrast(98%) brightness(106%) saturate(108%) blur(0.2px)' },
  { id: 'y2k-gloss', label: 'Glossy Vintage', filterCss: 'contrast(108%) brightness(104%) saturate(120%) hue-rotate(-4deg)' },
  { id: 'indie-vibes', label: 'Warm Film', filterCss: 'contrast(95%) brightness(102%) sepia(18%) saturate(100%)' },
  { id: 'sweet-pink', label: 'Soft Blush', filterCss: 'contrast(102%) saturate(112%) sepia(6%) hue-rotate(-8deg)' },
  { id: 'bw-elegant', label: 'Classic B&W', filterCss: 'grayscale(100%) contrast(115%) brightness(102%)' }
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

function fitDataUrlToSlotAspect(
  dataUrl: string,
  maxLongSide: number,
  filterId: string, 
  brightnessLevel: number,
  isBeautyMode: boolean, 
  _targetAspect?: number | null
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

      // Pertahankan 100% foto utuh asli tanpa crop sama sekali (Full Optical FOV)
      // JANGAN PERNAH potong/crop foto saat capture atau upload!
      // Semua bagian (pose 2 jari, tangan, kepala, gestur tubuh, dan orang di samping)
      // tetap tersimpan 100% utuh tanpa ada yang terpotong permanen.
      const cropX = 0; 
      const cropY = 0; 
      const cropW = srcW;
      const cropH = srcH;

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

      const currentFilterObj = CAMERA_FILTERS.find((f) => f.id === filterId);
      const filterCss = currentFilterObj ? currentFilterObj.filterCss : 'none';
      const beautyCss = isBeautyMode ? 'blur(0.4px) contrast(98%)' : ''; 

      ctx.filter = `brightness(${brightnessLevel}%) ${filterCss === 'none' ? '' : filterCss} ${beautyCss}`.trim();

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);    
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
    setPhotoBurstAtSlot,
    captureType,
    setCaptureType,
    photoBurstFrames,
  } = usePhotobooth();

  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [actualResolution, setActualResolution] = useState<{ width: number; height: number } | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [cameraErrorDetail, setCameraErrorDetail] = useState<string | null>(null);
  const [cameraRetryCount, setCameraRetryCount] = useState<number>(0);
  const [isRetryingCamera, setIsRetryingCamera] = useState<boolean>(false);
  const [isAutoShooting, setIsAutoShooting] = useState<boolean>(false);

  // Live Camera GIF / Boomerang Burst Recording State
  const [isBurstRecording, setIsBurstRecording] = useState<boolean>(false);
  const [burstFrameProgress, setBurstFrameProgress] = useState<number>(0);
  const [burstRecordedPreview, setBurstRecordedPreview] = useState<{ slotIndex: number; frames: string[] } | null>(null);
  const [burstPreviewFrameIndex, setBurstPreviewFrameIndex] = useState<number>(0);

  // Filter, Tone & Mirroring
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [brightness, setBrightness] = useState<number>(104);
  const isBeautyMode = false; 
  const isMirrorMode = true; 
  const [timerInterval, setTimerInterval] = useState<number>(3);
  const [photoAspects, setPhotoAspects] = useState<Record<number, number>>({});
  const [previewModalPhoto, setPreviewModalPhoto] = useState<string | null>(null);
  const [previewModalBurst, setPreviewModalBurst] = useState<string[] | null>(null);
  const [modalBurstIndex, setModalBurstIndex] = useState<number>(0);

  // Ping-pong loop for review modal (0..N-1..1)
  useEffect(() => {
    if (!burstRecordedPreview || burstRecordedPreview.frames.length <= 1) return;
    const totalFrames = burstRecordedPreview.frames.length;
    const seq: number[] = [];
    for (let i = 0; i < totalFrames; i++) seq.push(i);
    for (let i = totalFrames - 2; i > 0; i--) seq.push(i);

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % seq.length;
      setBurstPreviewFrameIndex(seq[step]);
    }, 120);

    return () => clearInterval(interval);
  }, [burstRecordedPreview]);

  // Ping-pong loop for lightbox modal when viewing recorded GIF
  useEffect(() => {
    if (!previewModalBurst || previewModalBurst.length <= 1) return;
    const total = previewModalBurst.length;
    const seq: number[] = [];
    for (let i = 0; i < total; i++) seq.push(i);
    for (let i = total - 2; i > 0; i--) seq.push(i);
    let step = 0;
    const timer = setInterval(() => {
      step = (step + 1) % seq.length;
      setModalBurstIndex(seq[step]);
    }, 120);
    return () => clearInterval(timer);
  }, [previewModalBurst]);

  // Fitur Pendukung Kamera
  const soundEnabled = true; 
  const gridOverlay = false;

  const [isPortraitView, setIsPortraitView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight >= window.innerWidth;
  });

  // Fullscreen state 
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => { 
    const handleFullscreenChange = () => { 
      setIsFullscreen(!!document.fullscreenElement); 
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photosStateRef = useRef<(string | null)[]>(photos);
  useEffect(() => {
    photosStateRef.current = photos;
  }, [photos]);

  // Pantau dan ukur aspect ratio asli dari foto yang masuk secara otomatis
  useEffect(() => {
    photos.forEach((src, idx) => {
      if (src && !photoAspects[idx]) {
        const img = new window.Image();
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            setPhotoAspects((prev) => ({
              ...prev,
              [idx]: img.naturalWidth / img.naturalHeight,
            }));
          }
        };
        img.src = src;
      }
    });
  }, [photos, photoAspects]);

  const getSlotAspectRatio = useCallback((slotIndex: number): number => {
    const coords = selectedFrame?.slotCoords?.[slotIndex];
    if (coords && coords.w > 0 && coords.h > 0) {
      return coords.w / coords.h;
    }
    return 16 / 9;
  }, [selectedFrame]);

  // Ukuran kotak preview pas otomatis menyesuaikan bentuk foto/slot bingkai secara maksimal
  const getThumbnailBoxSize = useCallback((aspect: number) => {
    const baseH = 52;
    const minW = 42;
    const maxW = 82;
    let w = Math.round(baseH * aspect);
    let h = baseH;

    if (w < minW) {
      w = minW;
      h = Math.round(minW / aspect);
    } else if (w > maxW) {
      w = maxW;
      h = Math.round(maxW / aspect);
    }

    h = Math.min(Math.max(h, 46), 62);
    w = Math.round(h * aspect);
    w = Math.min(Math.max(w, 40), 84);

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
        if (document.fullscreenElement && document.exitFullscreen) {
          setTimeout(() => {
            document.exitFullscreen().catch(() => {});
          }, 1200);
        }
        setTimeout(() => setShowCelebration(false), 3000);
        const fallbackIndex = totalSlots - 1;
        setActiveSlot(fallbackIndex >= 0 ? fallbackIndex : 0);

        // Jika mode Foto GIF Boomerang, otomatis skip editor dan langsung menuju Pratinjau Studio
        if (captureType === 'boomerang') {
          setTimeout(() => {
            setStep('preview');
          }, 600);
        }
        return null;
      }
    },
    [selectedFrame, captureType, setStep]
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
    setCameraErrorDetail(null);
    const track = stream.getVideoTracks()[0];
    if (track) {
      const settings = track.getSettings();
      if (settings.width && settings.height) {
        setActualResolution({ width: settings.width, height: settings.height });
      }
    }
  };

  const handleUserMediaError = (error: any) => {
    console.warn('Webcam onUserMediaError:', error);
    setHasCamera(false);
    let detail = 'Kamera tidak terdeteksi atau akses ditolak.';
    if (error) {
      const errName = error.name || (typeof error === 'string' ? error : '');
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        detail = 'Izin kamera diblokir browser. Klik ikon setelan di sebelah kiri URL, lalu ubah Kamera menjadi "Izinkan" (Allow).';
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        detail = 'Tidak ada webcam yang terhubung ke perangkat ini.';
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        detail = 'Kamera sedang digunakan oleh aplikasi lain (seperti Zoom, Meet, atau tab lain).';
      } else if (errName === 'OverconstrainedError') {
        detail = 'Resolusi yang diminta tidak didukung webcam Anda.';
        if (cameraRetryCount === 0) {
          setCameraRetryCount(1);
          setHasCamera(true);
          return;
        }
      } else if (error.message) {
        detail = error.message;
      }
    }
    setCameraErrorDetail(detail);
  };

  const retryCamera = async () => {
    setIsRetryingCamera(true);
    setCaptureError(null);
    setCameraErrorDetail(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const testStream = await navigator.mediaDevices.getUserMedia(
          cameraRetryCount > 0 ? { video: true } : { video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
        );
        testStream.getTracks().forEach((track) => track.stop());
      }
      setCameraRetryCount((prev) => prev + 1);
      setHasCamera(true);
    } catch (err: any) {
      console.warn('Retry camera failed:', err);
      handleUserMediaError(err);
    } finally {
      setIsRetryingCamera(false);
    }
  };

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

  const capturePhoto = useCallback(async () => {
    if (!webcamRef.current) return;

    const video = webcamRef.current.video;
    const actualWidth = video?.videoWidth || actualResolution?.width || 1920;
    const actualHeight = video?.videoHeight || actualResolution?.height || 1080;
    const capturedSlot = activeSlot;
    const targetAspect = getSlotAspectRatio(capturedSlot);
    const maxLongSide = 2048;

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

    fitDataUrlToSlotAspect(imageSrc, maxLongSide, activeFilter, brightness, isBeautyMode, targetAspect)
      .then((croppedSrc) => {
        setPhotoBurstAtSlot(capturedSlot, [croppedSrc]);
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
  }, [
    webcamRef,
    activeSlot,
    isAutoShooting,
    activeFilter,
    brightness,
    isBeautyMode,
    timerInterval,
    setPhotoAtSlot,
    setPhotoBurstAtSlot,
    selectNextEmptySlot,
    actualResolution,
    soundEnabled,
    getSlotAspectRatio,
  ]);

  // LIVE CAMERA GIF / BOOMERANG BURST CAPTURE
  // Captures 10 frames from webcam in rapid succession (~140ms interval, ~1.4s total)
  // while the user poses freely, fits each frame to the slot aspect, and opens an instant review
  const captureBurstSequence = useCallback(async () => {
    if (!webcamRef.current) return;

    const video = webcamRef.current.video;
    const actualWidth = video?.videoWidth || actualResolution?.width || 1280;
    const actualHeight = video?.videoHeight || actualResolution?.height || 720;
    const capturedSlot = activeSlot;
    const targetAspect = getSlotAspectRatio(capturedSlot);
    const maxLongSide = 1280;

    setIsBurstRecording(true);
    setBurstFrameProgress(0);
    const totalBurstFrames = 10;
    const intervalMs = 140;
    const rawFrames: string[] = [];

    try {
      for (let i = 0; i < totalBurstFrames; i++) {
        const frameSrc = webcamRef.current.getScreenshot({
          width: actualWidth,
          height: actualHeight,
        });
        if (frameSrc) {
          rawFrames.push(frameSrc);
        }
        setBurstFrameProgress(i + 1);
        if (soundEnabled && i % 3 === 0) {
          playBeepSound();
        }
        if (i < totalBurstFrames - 1) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
      }

      if (rawFrames.length === 0) {
        throw new Error('Gagal mengambil frame dari webcam.');
      }

      if (soundEnabled) playShutterSound();
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);

      setIsProcessingPhoto(true);

      const filteredFrames = await Promise.all(
        rawFrames.map((src) =>
          fitDataUrlToSlotAspect(
            src,
            maxLongSide,
            activeFilter,
            brightness,
            isBeautyMode,
            targetAspect
          )
        )
      );

      // Middle frame is saved as sharp still photo for canvas & print
      const middleIdx = Math.floor(filteredFrames.length / 2);
      const middleFrame = filteredFrames[middleIdx];

      setPhotoAtSlot(capturedSlot, middleFrame);
      setPhotoBurstAtSlot(capturedSlot, filteredFrames);

      const updatedPhotos = [...photosStateRef.current];
      updatedPhotos[capturedSlot] = middleFrame;

      setIsProcessingPhoto(false);
      setIsBurstRecording(false);

      // Open instant review modal so user can view their looping GIF and choose to Keep or Retake
      setBurstRecordedPreview({
        slotIndex: capturedSlot,
        frames: filteredFrames,
      });
    } catch (err: any) {
      console.error('Error during burst recording:', err);
      setIsBurstRecording(false);
      setIsProcessingPhoto(false);
      setCaptureError(err?.message || 'Gagal merekam foto GIF.');
      setIsAutoShooting(false);
    }
  }, [
    webcamRef,
    activeSlot,
    actualResolution,
    getSlotAspectRatio,
    activeFilter,
    brightness,
    isBeautyMode,
    soundEnabled,
    setPhotoAtSlot,
    setPhotoBurstAtSlot,
  ]);

  const handleConfirmBurst = useCallback(() => {
    if (!burstRecordedPreview) return;
    const slotIdx = burstRecordedPreview.slotIndex;
    const middleFrame = burstRecordedPreview.frames[Math.floor(burstRecordedPreview.frames.length / 2)];
    setPhotoAtSlot(slotIdx, middleFrame);
    setPhotoBurstAtSlot(slotIdx, burstRecordedPreview.frames);
    photosStateRef.current[slotIdx] = middleFrame;
    setBurstRecordedPreview(null);
    const updatedPhotos = [...photosStateRef.current];
    updatedPhotos[slotIdx] = middleFrame;
    setTimeout(() => {
      const nextSlot = selectNextEmptySlot(updatedPhotos);
      if (isAutoShooting && nextSlot !== null) {
        setCountdown(timerInterval);
      }
    }, 200);
  }, [burstRecordedPreview, selectNextEmptySlot, isAutoShooting, timerInterval, setPhotoAtSlot, setPhotoBurstAtSlot]);

  const handleRetakeBurst = useCallback(() => {
    if (!burstRecordedPreview) return;
    const capturedSlot = burstRecordedPreview.slotIndex;
    setPhotoAtSlot(capturedSlot, null);
    setPhotoBurstAtSlot(capturedSlot, null);
    setBurstRecordedPreview(null);
    setActiveSlot(capturedSlot);
  }, [burstRecordedPreview, setPhotoAtSlot, setPhotoBurstAtSlot]);

  if (!selectedFrame) return null;

  const { slots: totalSlots, name: frameName } = selectedFrame;

  const getVideoConstraints = () => {
    if (cameraRetryCount > 0) {
      return {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
      };
    }
    return {
      facingMode: 'user',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
    };
  };

  // Ukuran kamera foto proporsional 4:3 persis seperti model foto referensi photobooth
  const viewfinderAspect = isPortraitView ? 3 / 4 : 4 / 3;

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

  // Toggle Fullscreen Layar Penuh
  const toggleFullscreen = useCallback(() => {
    const el = cameraContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  // Handler klik / tap pada kamera untuk memulai countdown otomatis sesuai timer yang dipilih
  const handleCameraContainerClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Abaikan jika yang diklik tombol fullscreen atau kontrol lainnya
    if ((e.target as HTMLElement).closest('button')) return;
    if (!hasCamera || isProcessingPhoto || isBurstRecording || countdown !== null || isAutoShooting) return;
    startSingleClickMultiShoot();
  }, [hasCamera, isProcessingPhoto, isBurstRecording, countdown, isAutoShooting, startSingleClickMultiShoot]);

  // Dukungan tombol SPACE & TAB untuk memulai sesi pemotretan otomatis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Tab' || e.key === 'Tab' || e.key === ' ') && !e.repeat) {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')
        ) {
          return;
        }
        e.preventDefault();
        if (!isAutoShooting && countdown === null && hasCamera && !isProcessingPhoto && !isBurstRecording) {
          startSingleClickMultiShoot();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoShooting, countdown, hasCamera, isProcessingPhoto, isBurstRecording, startSingleClickMultiShoot]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      if (captureType === 'boomerang') {
        captureBurstSequence();
      } else {
        capturePhoto();
      }
      return;
    }
    if (soundEnabled && countdown > 0) playBeepSound();
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto, captureBurstSequence, soundEnabled, captureType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;

      const rawSrc = reader.result;
      const maxLongSide = 2048;
      const targetSlot = activeSlot;
      const targetAspect = getSlotAspectRatio(targetSlot);

      setIsProcessingPhoto(true);
      setCaptureError(null);

      fitDataUrlToSlotAspect(rawSrc, maxLongSide, activeFilter, brightness, isBeautyMode, targetAspect)
        .then((croppedSrc) => {
          setPhotoAtSlot(targetSlot, croppedSrc);
          setPhotoBurstAtSlot(targetSlot, [croppedSrc]);
          const updatedPhotos = [...photosStateRef.current];
          updatedPhotos[targetSlot] = croppedSrc;
          setIsProcessingPhoto(false);
          setTimeout(() => selectNextEmptySlot(updatedPhotos), 300);
        })
        .catch((err) => {
          console.error("Gagal memproses foto upload, mencoba fallback...", err);
          fitDataUrlToSlotAspect(rawSrc, 1024, 'none', 100, false, targetAspect)
            .then((fallbackSrc) => {
              setPhotoAtSlot(targetSlot, fallbackSrc);
              setPhotoBurstAtSlot(targetSlot, [fallbackSrc]);
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
    if (captureType === 'boomerang') {
      const demoFrames = generateDemoBurst(activeSlot, 8);
      const middleIdx = Math.floor(demoFrames.length / 2);
      const middlePhoto = demoFrames[middleIdx] || demoUrl;
      setPhotoAtSlot(activeSlot, middlePhoto);
      setPhotoBurstAtSlot(activeSlot, demoFrames);
      photosStateRef.current[activeSlot] = middlePhoto;
      setBurstRecordedPreview({
        slotIndex: activeSlot,
        frames: demoFrames,
      });
    } else {
      setPhotoAtSlot(activeSlot, demoUrl);
      setPhotoBurstAtSlot(activeSlot, [demoUrl]);
      photosStateRef.current[activeSlot] = demoUrl;
      const updatedPhotos = [...photosStateRef.current];
      updatedPhotos[activeSlot] = demoUrl;
      setTimeout(() => selectNextEmptySlot(updatedPhotos), 300);
    }
  };

  const isAllFilled = photos.slice(0, totalSlots).every((p) => p !== null);
  const filledCount = photos.slice(0, totalSlots).filter((p) => p !== null).length;

  const selectedFilterObj = CAMERA_FILTERS.find(f => f.id === activeFilter);
  const activeFilterCss = selectedFilterObj ? selectedFilterObj.filterCss : '';
  const beautyCss = isBeautyMode ? 'blur(0.4px) contrast(98%)' : '';
  const combinedFilterStyle = `brightness(${brightness}%) ${activeFilterCss} ${beautyCss}`.trim();

  return (
    <>
      <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#FAF7F2] text-stone-800 p-2 sm:p-3 lg:p-3.5 relative antialiased font-sans flex flex-col justify-start lg:overflow-hidden select-none">
        
        {/* Soft Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50/40 via-amber-50/20 to-transparent pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,113,108,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,113,108,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none z-0" />

        {/* Flash Layer */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[100] pointer-events-none flex items-center justify-center"
              transition={{ duration: 0.1 }}
            />
          )}
        </AnimatePresence>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              variants={overlayVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit"
              className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/30 backdrop-blur-sm px-4"
            >
              <motion.div
                variants={popupVariants} 
                initial="hidden" 
                animate="visible" 
                exit="exit"
                className="bg-white rounded-3xl p-7 text-center shadow-2xl border border-stone-200 max-w-sm w-full mx-4 relative overflow-hidden"
              >
                <div className="w-14 h-14 mx-auto mb-3.5 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shadow-sm">
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h2 className="font-serif text-2xl font-black text-stone-800 tracking-tight">Sesi Selesai!</h2>
                <p className="text-stone-500 text-xs mt-1.5 font-normal">
                  {captureType === 'boomerang'
                    ? 'Semua foto GIF telah lengkap terisi. Mengalihkan ke pratinjau animasi...'
                    : 'Semua slot foto telah lengkap terisi. Siap untuk beralih ke editor.'}
                </p>
                <button
                  onClick={() => setStep(captureType === 'boomerang' ? 'preview' : 'editor')}
                  className="mt-5 w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-rose-500/20 cursor-pointer"
                >
                  {captureType === 'boomerang' ? 'Lanjut ke Pratinjau Animasi' : 'Lanjut ke Editor Foto'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE CONTENT CONTAINER */}
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-start relative z-10 gap-2 sm:gap-2.5 min-h-0 overflow-hidden">

          {/* TOP BAR / HEADER */}
          <header className="sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-center bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-2xl border border-stone-200/80 shadow-xs gap-2 w-full flex-shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => { setIsAutoShooting(false); setStep('select-frame'); }}
                className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-bold text-xs transition-colors px-3 py-1.5 bg-stone-100/80 hover:bg-stone-200/70 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Pilih Bingkai</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="font-serif text-base sm:text-lg font-black text-stone-800 tracking-tight">
                  BaliSnap Studio
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs font-medium text-stone-500 truncate max-w-[140px] sm:max-w-[200px]">
                  {frameName}
                </span>
              </div>
            </div>

            {/* Mode Switcher: Foto Biasa vs Foto GIF Boomerang */}
            <div className="flex items-center p-1 bg-stone-100/90 border border-stone-200/90 rounded-xl gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  if (!isAutoShooting && !isBurstRecording) {
                    setCaptureType('still');
                  }
                }}
                disabled={isAutoShooting || isBurstRecording}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  captureType === 'still'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto Biasa</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isAutoShooting && !isBurstRecording) {
                    setCaptureType('boomerang');
                  }
                }}
                disabled={isAutoShooting || isBurstRecording}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  captureType === 'boomerang'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Foto GIF Boomerang</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => { setIsAutoShooting(false); clearPhotos(); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xs shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center"
              >
                Reset Foto
              </button>
              
              <button
                onClick={() => { setIsAutoShooting(false); setStep(captureType === 'boomerang' ? 'preview' : 'editor'); }}
                disabled={!isAllFilled}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                  isAllFilled
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>{captureType === 'boomerang' ? 'Lanjut ke Pratinjau' : 'Lanjut ke Editor'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button> 
            </div> 
          </header> 

          {captureError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{captureError}</span> 
            </div> 
          )}

          {/* TWO-COLUMN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 items-stretch w-full flex-1 min-h-0 overflow-hidden">

            {/* LEFT COLUMN: CAMERA VIEWFINDER & CONTROLS */}
            <div className="lg:col-span-8 flex flex-col justify-start gap-2 sm:gap-2.5 h-full w-full min-h-0">
              
              {/* VIEWFINDER FRAME WRAPPER - Centered, Large 4:3 Camera Frame */}
              <div className="w-full flex items-center justify-center flex-1 min-h-0 py-0.5">
                <div
                  ref={cameraContainerRef}
                  onClick={handleCameraContainerClick}
                  onTouchEnd={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    if (!hasCamera || isProcessingPhoto || countdown !== null || isAutoShooting) return;
                    startSingleClickMultiShoot();
                  }}
                  className={`relative bg-stone-900 border-2 border-stone-200/90 rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm flex items-center justify-center mx-auto transition-all ${
                    isFullscreen ? 'cursor-pointer ring-4 ring-rose-300/40' : 'cursor-pointer'
                  }`}
                  style={{
                    aspectRatio: viewfinderAspect,
                    height: '100%',
                    maxHeight: isFullscreen ? '100vh' : (isPortraitView ? '56vh' : 'calc(100vh - 180px)'),
                    maxWidth: isFullscreen ? '100vw' : (isPortraitView ? '100%' : 'min(100%, calc((100vh - 180px) * 4 / 3))'),
                    width: '100%',
                  }}
                  title={isFullscreen ? `Tap layar atau tekan SPACE / TAB untuk mulai timer ${timerInterval}s` : 'Tap / Klik layar untuk mulai foto'}
                >
                {/* Petunjuk Tap saat Layar Penuh (Fullscreen) */}
                {isFullscreen && countdown === null && !isAutoShooting && !isProcessingPhoto && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-14 sm:top-6 px-4 py-2 bg-black/70 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 pointer-events-none z-30 shadow-lg"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>Tap / Klik layar atau tekan SPACE / TAB untuk mulai ({timerInterval}s)</span>
                  </motion.div>
                )}

                {/* Kilatan Flash di dalam container (tampak jelas di mode fullscreen) */}
                {showFlash && (
                  <div className="absolute inset-0 bg-white z-[50] pointer-events-none" />
                )}
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 p-6 bg-stone-900 text-center z-10 overflow-y-auto">
                    <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 mb-3">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-white mb-1">
                      Kamera Belum Terdeteksi
                    </h3>
                    <p className="text-xs text-stone-400 max-w-sm mb-4 leading-relaxed">
                      {cameraErrorDetail || 'Pastikan izin kamera browser aktif.'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={retryCamera}
                        disabled={isRetryingCamera}
                        className="px-4 py-2 bg-[#1D63FF] hover:bg-[#1550D6] text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
                      >
                        {isRetryingCamera ? 'Mencoba...' : 'Coba Sambungkan'}
                      </button>
                      {captureType === 'still' && (
                        <button
                          onClick={handleDemoPhoto}
                          className="px-4 py-2 bg-stone-800 hover:bg-[#1D63FF] text-stone-200 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer border border-stone-700"
                        >
                          Foto Demo
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Grid Overlay */}
                {gridOverlay && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white/20">
                    <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
                    <div className="border-r border-b border-white" /><div className="border-r border-b border-white" /><div className="border-b border-white" />
                    <div className="border-r border-white" /><div className="border-r border-white" /><div />
                  </div>
                )}

                {/* HUD Top Bar Minimalis */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
                  {/* Slot Active Badge */}
                  <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 pointer-events-auto">
                    <span className={`w-1.5 h-1.5 rounded-full ${isBurstRecording ? 'bg-red-500 animate-ping' : isAutoShooting ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span>
                      {isBurstRecording
                        ? `Merekam Frame (${burstFrameProgress}/10)...`
                        : isAutoShooting
                          ? (captureType === 'boomerang' ? 'Merekam GIF...' : 'Foto Otomatis...')
                          : `Slot #${activeSlot + 1} (${captureType === 'boomerang' ? 'GIF' : 'Foto'})`}
                    </span>
                  </div>

                  {/* Quick Timer Selector saat Layar Penuh (Fullscreen) */}
                  {isFullscreen && (
                    <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-1 flex items-center gap-1 pointer-events-auto shadow-md">
                      <span className="text-[9px] font-bold text-white/80 px-2 uppercase tracking-wider flex items-center gap-1 select-none">
                        <Clock className="w-2.5 h-2.5 text-rose-400" /> Jeda:
                      </span>
                      {[3, 5, 7, 10].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          disabled={isAutoShooting || countdown !== null || isBurstRecording}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimerInterval(sec);
                          }}
                          className={`min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                            timerInterval === sec
                              ? 'bg-rose-500 text-white shadow-xs scale-102'
                              : 'text-white/80 hover:bg-white/20'
                          }`} 
                        >
                          {sec}s 
                        </button>
                      ))} 
                    </div>
                  )}
                </div>

                {/* Burst Recording Live HUD Indicator */}
                <AnimatePresence>
                  {isBurstRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-between p-4 bg-black/25 backdrop-blur-[1px]"
                    >
                      <div className="bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                        <span>MEREKAM POSE BEBAS ({burstFrameProgress}/10)</span>
                      </div>

                      <div className="w-full max-w-xs bg-black/75 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 flex flex-col items-center gap-1.5 shadow-xl">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 transition-all duration-150 rounded-full"
                            style={{ width: `${(burstFrameProgress / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white font-medium tracking-wide">
                          Bergayalah bebas! Kamera sedang merekam frame gerak.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Countdown Overlay */}
                <AnimatePresence>
                  {countdown !== null && (
                    <motion.div
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] z-30"
                    >
                      <motion.span
                        key={countdown}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="font-sans font-black text-white text-8xl sm:text-9xl tracking-tight drop-shadow-md select-none"
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
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30 gap-2 text-white"
                    >
                      <div className="w-7 h-7 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">Menyimpan Foto...</span>
                    </motion.div>
                  )}
                </AnimatePresence> 


                {/* Tombol Fullscreen / Expand di pojok kanan bawah persis seperti referensi */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-30 bg-white hover:bg-stone-50 active:scale-95 transition-all text-stone-700 border border-stone-200/90 rounded-xl px-2.5 py-1.5 shadow-xs flex items-center justify-center cursor-pointer pointer-events-auto"
                  title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  > 
                    <path d="M15 3h6v6" /> 
                    <path d="M9 21H3v-6" />
                    <path d="M21 15v6h-6" /> 
                    <path d="M3 9V3h6" />
                  </svg>
                </button> 

                {/* Slot Indicator Pills Bawah */}
                <div className="absolute bottom-2.5 left-4 right-14 sm:right-16 flex gap-1.5 z-20 pointer-events-none">
                  {Array.from({ length: totalSlots }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        photos[idx] 
                          ? 'bg-rose-400' 
                          : idx === activeSlot 
                            ? 'bg-white' 
                            : 'bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* FILTER BAR & KECERAHAN - Aligned to exact camera width */}
            <div className="w-full max-w-[min(100%,_calc((100vh_-_180px)_*_4_/_3))] mx-auto flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-stone-200/90 px-3 py-1.5 rounded-2xl shadow-xs flex-shrink-0">
              {/* Filter Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full custom-scroll flex-1 py-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1 flex-shrink-0">
                  <Smile className="w-3.5 h-3.5 text-stone-500" /> Filter:
                </span>
                {CAMERA_FILTERS.map((fStr) => (
                  <button
                    key={fStr.id}
                    onClick={() => setActiveFilter(fStr.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                      activeFilter === fStr.id
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    {fStr.label}
                  </button>
                ))}
              </div>

              {/* Brightness Slider */}
              <div className="flex items-center gap-2 pl-3 border-l border-stone-200 flex-shrink-0">
                <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <input 
                  type="range" 
                  min="80" 
                  max="140" 
                  value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-16 sm:w-20 accent-rose-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                  title="Atur Kecerahan" 
                />
                <span className="text-[10px] font-mono font-bold text-stone-600 w-7 text-right">{brightness}%</span> 
              </div>  
            </div> 

            {/* LOWER DECK CONTROLS - Aligned to exact camera width with balanced spacing */} 
            <div className="w-full max-w-[min(100%,_calc((100vh_-_180px)_*_4_/_3))] mx-auto bg-white/95 backdrop-blur-md border border-stone-200/90 p-2 sm:p-2.5 rounded-2xl shadow-xs flex items-center justify-between gap-2.5 flex-shrink-0">
              {/* Main Shutter & Upload Buttons */} 
              <div className="flex items-center gap-2"> 
                <button
                  onClick={startSingleClickMultiShoot}
                  disabled={countdown !== null || !hasCamera || isProcessingPhoto || isAutoShooting || isBurstRecording}
                  className="h-9 px-4.5 active:scale-95 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs shadow-rose-500/20 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 cursor-pointer"
                >
                  {captureType === 'boomerang' ? (
                    <Film className="w-3.5 h-3.5 text-rose-100" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isBurstRecording
                      ? 'Merekam Frame...'
                      : isAutoShooting
                        ? (captureType === 'boomerang' ? 'Sedang Merekam GIF...' : 'Sedang Memotret...')
                        : (captureType === 'boomerang' ? 'Rekam GIF Boomerang' : 'Mulai Foto Otomatis')}
                  </span>
                </button>

                {captureType === 'still' && (
                  <button
                    onClick={() => { setIsAutoShooting(false); fileInputRef.current?.click(); }}
                    disabled={isProcessingPhoto || isAutoShooting || isBurstRecording} 
                    className="h-9 px-3.5 bg-rose-50 hover:bg-rose-100/80 active:scale-95 text-rose-700 border border-rose-200/80 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-40 cursor-pointer"
                    title="Unggah Foto dari Perangkat"  
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-500" /> 
                    <span>Upload</span> 
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div> 
              
              {/* Center Spacebar Shortcut Hint */}
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
                <span>Tips: Tekan</span>
                <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] font-mono text-stone-600 font-bold">SPACE</kbd>
                <span>untuk {captureType === 'boomerang' ? 'rekam GIF' : 'mulai foto'}</span>
              </span>
              
              {/* Timer Deck & Demo Button */}
              <div className="flex items-center gap-2"> 
                {/* Timer Selector */}
                <div className="h-9 flex items-center rounded-xl p-1 gap-1 shadow-2xs bg-stone-100/90 border border-stone-200/90">
                  <span className="text-[10px] font-bold pl-2 pr-1 uppercase tracking-wider select-none text-stone-600">
                    Jeda: 
                  </span> 
                  {[3, 5, 7, 10].map((sec) => ( 
                    <button 
                      key={sec} 
                      disabled={isAutoShooting || countdown !== null || isBurstRecording} 
                      onClick={() => setTimerInterval(sec)}     
                      className={`min-w-[32px] h-7 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        timerInterval === sec 
                          ? 'bg-rose-500 text-white shadow-xs scale-102' 
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`} 
                    > 
                      {sec} 
                    </button> 
                  ))}
                </div>

                {captureType === 'still' && (
                  <button
                    onClick={handleDemoPhoto}
                    disabled={isAutoShooting || isBurstRecording}
                    className="h-9 px-3.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 border border-stone-200/90 rounded-xl font-semibold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center whitespace-nowrap"
                  >
                    Foto Demo
                  </button>
                )}
              </div>
            </div>

            </div>

            {/* RIGHT COLUMN: PROGRESS SLOT TRACKER */}
            <div className="lg:col-span-4 w-full h-full flex flex-col justify-start min-h-0 overflow-hidden">
              <div className="bg-white/90 backdrop-blur-md border border-stone-200/80 p-3 sm:p-3.5 rounded-3xl shadow-sm flex flex-col h-full max-h-full min-h-0">
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 mb-2.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-rose-500" />
                    <h3 className="font-serif text-sm font-black text-stone-800">
                      Progres Slot Foto
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    {filledCount} / {totalSlots} Terisi
                  </span>
                </div>

                {/* Slot Item Cards */}
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scroll flex-1 min-h-0">
                  {Array.from({ length: totalSlots }).map((_, index) => {
                    const photo = photos[index] || null;
                    const hasPhoto = photo !== null;
                    const burst = photoBurstFrames[index] || null;
                    const hasBurst = Array.isArray(burst) && burst.length > 1;
                    const isActive = index === activeSlot;
                    const slotAspect = getSlotAspectRatio(index);
                    const actualAspect = photoAspects[index] || slotAspect;
                    const thumbBox = getThumbnailBoxSize(actualAspect);

                    return (
                      <div
                        key={index}
                        onClick={() => { if (!isAutoShooting && !isBurstRecording) setActiveSlot(index); }}
                        className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
                          isAutoShooting || isBurstRecording ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isActive
                            ? 'border-rose-400 bg-rose-50/40 shadow-sm ring-1 ring-rose-200'
                            : hasPhoto
                              ? 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/50'
                              : 'border-stone-200/60 bg-transparent hover:border-stone-300'
                        }`}
                      >
                        {/* Thumbnail Box: Ukuran Pas Otomatis Menyesuaikan Bentuk Foto */}
                        <div
                          className="rounded-xl overflow-hidden flex items-center justify-center bg-stone-100 border border-stone-200/90 flex-shrink-0 relative shadow-2xs group/box transition-all"
                          style={{
                            height: `${thumbBox.height}px`,
                            width: `${thumbBox.width}px`,
                          }}
                        >
                          {hasPhoto ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img 
                                src={photo} 
                                alt={`Slot ${index + 1}`} 
                                className="w-full h-full object-cover rounded-lg" 
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasBurst && burst) {
                                    setPreviewModalBurst(burst);
                                  } else {
                                    setPreviewModalPhoto(photo);
                                  }
                                }}
                                className="absolute inset-0 bg-black/45 opacity-0 group-hover/box:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer backdrop-blur-[1px]"
                                title={hasBurst ? "Lihat Animasi Boomerang Loop" : "Klik untuk Lihat Preview Foto Utuh"}
                              >
                                <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
                                <span className="text-[7px] font-bold tracking-tight">Lihat{hasBurst ? ' GIF' : ''}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1 text-stone-300 p-1.5 text-center">
                              <ImageIcon className="w-4 h-4 text-stone-400/80" />
                              <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">
                                {slotAspect > 1.15 ? 'Wide' : slotAspect < 0.85 ? 'Tegak' : 'Kotak'}
                              </span>
                            </div>
                          )}
                          {isActive && !hasPhoto && (
                            <div className="absolute inset-0 border-2 border-rose-400 rounded-xl bg-rose-400/10 animate-pulse pointer-events-none" />
                          )}
                        </div>

                        {/* Slot Information */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-800">Foto #{index + 1}</span>
                              {hasBurst && (
                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200/80 text-[8px] font-mono font-bold rounded tracking-wide">
                                  GIF
                                </span>
                              )}
                            </div>
                            {hasPhoto && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hasBurst && burst) {
                                    setPreviewModalBurst(burst);
                                  } else {
                                    setPreviewModalPhoto(photo);
                                  }
                                }}
                                className="text-[9px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-100 transition-all cursor-pointer"
                              >
                                <Maximize2 className="w-2.5 h-2.5" />
                                <span>Preview{hasBurst ? ' GIF' : ''}</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-stone-400 mt-0.5 flex items-center gap-1">
                            {hasPhoto ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 inline flex-shrink-0" />
                                <span className="text-emerald-700 font-semibold">
                                  {hasBurst ? 'GIF Boomerang Siap' : 'Pas & tersimpan'}
                                </span>
                              </>
                            ) : isActive ? (
                              <span className="text-rose-600 font-semibold">
                                {isBurstRecording ? 'Merekam pose...' : 'Sedang dibidik kamera'}
                              </span>
                            ) : (
                              <span>Menunggu antrean foto</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Review Modal: Langsung Tinjau GIF Setelah Direkam */}
      <AnimatePresence>
        {burstRecordedPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative max-w-md w-full bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Pratinjau Foto GIF Boomerang
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                  Slot #{burstRecordedPreview.slotIndex + 1}
                </span>
              </div>

              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 my-4 relative shadow-inner flex items-center justify-center border border-stone-200">
                {burstRecordedPreview.frames[burstPreviewFrameIndex] && (
                  <img
                    src={burstRecordedPreview.frames[burstPreviewFrameIndex]}
                    alt="Pratinjau Foto GIF"
                    className="w-full h-full object-cover camera-mirror"
                  />
                )}
                <div className="absolute top-2.5 right-2.5 bg-stone-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-white tracking-wider flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>BOOMERANG LOOP</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 text-center mb-4 leading-relaxed">
                Pose bebas Anda berhasil direkam dalam format animasi Boomerang. Simpan untuk slot ini atau ulangi rekam jika ingin bergaya lain.
              </p>

              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  type="button"
                  onClick={handleRetakeBurst}
                  className="w-full py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Rekam</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBurst}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs shadow-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Gunakan Foto GIF</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal: Preview Foto Penuh Utuh (Still Foto) */}
      <AnimatePresence>
        {previewModalPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalPhoto(null)}
            className="fixed inset-0 z-[120] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white border border-stone-200/90 rounded-3xl p-4 shadow-xl flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-bold text-stone-800">Preview Foto Penuh (Utuh Tanpa Terpotong)</span>
                <button
                  type="button"
                  onClick={() => setPreviewModalPhoto(null)}
                  className="p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-stone-100/90 border border-stone-200/80 p-1">
                <img
                  src={previewModalPhoto}
                  alt="Preview Penuh"
                  className="max-w-full max-h-[68vh] object-contain rounded-xl"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-2 text-center">
                Foto tampil 100% utuh sesuai bentuk aslinya tanpa ada bagian yang terpotong.
              </p>
            </motion.div> 
          </motion.div> 
        )}
      </AnimatePresence> 

      {/* Lightbox Modal: Preview Animasi Boomerang Loop */}
      <AnimatePresence>
        {previewModalBurst && previewModalBurst.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalBurst(null)}
            className="fixed inset-0 z-[120] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white border border-stone-200/90 rounded-3xl p-4 shadow-xl flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between pb-2 px-1 border-b border-stone-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-stone-800">Animasi Boomerang Loop</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalBurst(null)}
                  className="p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full max-h-[68vh] aspect-[4/3] flex items-center justify-center overflow-hidden rounded-2xl bg-stone-100/90 border border-stone-200/80 relative">
                <img
                  src={previewModalBurst[modalBurstIndex]}
                  alt="Boomerang Loop"
                  className="max-w-full max-h-[66vh] object-contain rounded-xl camera-mirror"
                />
                <div className="absolute top-2.5 right-2.5 bg-stone-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-white tracking-wider flex items-center gap-1.5 border border-white/10">
                  <Film className="w-3 h-3 text-emerald-400" />
                  <span>FRAME {modalBurstIndex + 1}/{previewModalBurst.length}</span>
                </div>
              </div>
              <p className="text-[10px] text-stone-500 mt-2.5 text-center">
                Animasi bolak-balik (boomerang loop) mulus dari gerakan asli kamera.
              </p>
            </motion.div> 
          </motion.div> 
        )}
      </AnimatePresence> 

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 10px; }
        .camera-mirror {
          transform: scaleX(${isMirrorMode ? '-1' : '1'});
        }
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