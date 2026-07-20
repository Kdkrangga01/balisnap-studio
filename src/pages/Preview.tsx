import React, { useRef, useState, useEffect } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { PhotoCanvas } from '../components/editor/PhotoCanvas';
import { exportHighResCanvas, downloadBase64Image } from '../lib/exportImage';
import { ArrowLeft, Download, RotateCcw, Check, Share2, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Preview: React.FC = () => {
  const {
    selectedFrame,
    setStep,
    resetAll
  } = usePhotobooth();

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState<number>(450);

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

  // Trigger celebratory confetti on mount
  useEffect(() => {
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#F472B6', '#FBBF24', '#38BDF8']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#F472B6', '#FBBF24', '#38BDF8']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  if (!selectedFrame) return null;

  // Handle Export high-res and trigger full confetti storm
  const handleDownload = () => {
    if (stageRef.current) {
      const dataUrl = exportHighResCanvas(stageRef.current, 1800);
      if (dataUrl) {
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadBase64Image(dataUrl, `balisnap-studio-${timestamp}.png`);

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F472B6', '#FBBF24', '#38BDF8', '#EC4899', '#10B981', '#3B82F6']
        });
      }
    }
  };

  // Share via Web Share API (if supported)
  const handleShare = async () => {
    if (stageRef.current && navigator.share) {
      const dataUrl = exportHighResCanvas(stageRef.current, 1200);
      if (dataUrl) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'balisnap-photo.png', { type: 'image/png' });
          await navigator.share({ files: [file], title: 'BaliSnap Studio Photo' });
        } catch {
          // User cancelled or not supported
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] py-8 px-4 md:py-12 md:px-8 relative overflow-hidden flex flex-col items-center justify-center select-none">
      {/* CUTE BACKDROP PATTERN: Uniform Ivory Grid Kotak-Kotak Cream Hangat */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFEBE2_1px,transparent_1px),linear-gradient(to_bottom,#EFEBE2_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.9] pointer-events-none z-0" />

      {/* FLOATING KAWAII SCRAPBOOK ELEMENTS */}
      <div className="absolute top-24 left-8 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '3.2s' }}>🎀</div>
      <div className="absolute top-1/2 left-12 text-2xl animate-pulse pointer-events-none opacity-50 hidden xl:block text-pink-300"><Sparkles className="w-6 h-6 fill-current" /></div>
      <div className="absolute bottom-28 left-14 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '4.2s' }}>🧸</div>
      <div className="absolute top-36 right-8 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '3.8s' }}>💖</div>
      <div className="absolute bottom-20 right-12 text-3xl animate-bounce pointer-events-none opacity-80 hidden xl:block" style={{ animationDuration: '4.8s' }}>✨</div>

      {/* Soft Pink Radial Ambient Layer */}
      <div className="pointer-events-none absolute -inset-px opacity-40 bg-[radial-gradient(600px_circle_at_50%_40%,rgba(255,182,193,0.15),transparent_80%)] z-0" />

      <div className="max-w-5xl w-full mx-auto flex flex-col items-center relative z-10">

        {/* ===== HEADER NAVIGATION ROW ===== */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center border-b-4 border-dashed border-rose-100 pb-5 gap-4 mb-8">
          <div className="text-center sm:text-left">
            <button
              onClick={() => setStep('editor')}
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-600 font-black text-[10px] tracking-[0.25em] uppercase mb-1 transition-colors group px-2.5 py-1 bg-pink-50 rounded-full border border-pink-100/40"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Kembali ke Editor
            </button>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-none mt-1">
              Pratinjau Foto Final
            </h1>
            <p className="text-zinc-400 text-xs font-medium mt-1">
              Foto Anda siap diunduh dalam kualitas studio HD jernih tanpa kompresi.
            </p>
          </div>
          <button
            onClick={resetAll}
            className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border border-rose-100 text-zinc-500 hover:bg-rose-50/50 hover:text-zinc-800 transition-all shadow-sm flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Foto Baru
          </button>
        </div>

        {/* ===== CENTER DISPLAY WORKSPACE ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">

          {/* LEFT COLUMN: FRAME SHOWCASE PREVIEW */}
          <div className="md:col-span-6 flex flex-col justify-center items-center relative" ref={containerRef}>
            {/* SOLATIP PASTEL CUTE OVERLAY */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-28 h-5.5 bg-pink-200/30 backdrop-blur-sm border border-white/40 skew-x-[-10deg] z-20 shadow-sm pointer-events-none flex items-center justify-center text-[7px] text-pink-500 font-bold tracking-widest uppercase">
              ✨ BALISNAP MEMORIES ✨
            </div>

            <div className="relative p-3 bg-white/40 backdrop-blur-sm border border-rose-100 shadow-[0_20px_50px_rgba(255,192,203,0.22)] rounded-[32px] flex flex-col items-center overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
              <PhotoCanvas stageRef={stageRef} containerWidth={canvasWidth} isPreviewMode={true} />
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION CONTROLS PANEL */}
          <div className="md:col-span-6 flex flex-col gap-6 w-full">
            <div className="bg-white border-4 border-rose-50 p-6 md:p-8 rounded-[28px] shadow-[0_12px_35px_rgba(255,192,203,0.12)] flex flex-col gap-4 text-left">

              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Render Selesai
              </div>

              <h2 className="font-serif text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-snug">
                Foto Anda Sangat Menawan!{' '}
                <Heart className="inline-block w-6 h-6 text-pink-400 fill-current animate-pulse align-text-top" />
              </h2>

              <p className="text-zinc-500 text-xs md:text-sm font-medium leading-relaxed">
                Unduh file PNG resolusi tinggi Anda secara instan. File ini siap untuk dicetak pada kertas foto dengan kualitas studio tajam, atau dibagikan langsung ke media sosial Anda untuk mengabadikan momen serumu!
              </p>

              <div className="flex flex-col gap-3 mt-3">
                {/* Download Main Large Action Button */}
                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-20deg] translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Unduh Foto PNG (HD)
                </button>

                {/* Optional Web Share Action Button */}
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleShare}
                    className="w-full py-3.5 bg-white hover:bg-rose-50/40 text-zinc-700 border-2 border-rose-50 font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2.5"
                  >
                    <Share2 className="w-4 h-4 text-pink-400" />
                    Bagikan ke Sosial Media
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};