import React, { useEffect, useState } from 'react';
import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';
import { CheckoutModal } from '../components/CheckoutModal';
import {
  Camera, Sparkles, Image as ImageIcon, ArrowRight, Maximize2, Menu, X, Star, Check,
  Crown, Wand2, UploadCloud, Download, CheckCircle2, Palette
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// Component Logo Ringan
const TransparentLogo: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const visited = new Uint8Array(width * height);
      const queue: number[] = [];

      for (let x = 0; x < width; x++) {
        queue.push(x, 0);
        queue.push(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        queue.push(0, y);
        queue.push(width - 1, y);
      }

      while (queue.length > 0) {
        const cy = queue.pop()!;
        const cx = queue.pop()!;
        const idx = cy * width + cx;

        if (visited[idx]) continue;
        visited[idx] = 1;

        const pIdx = idx * 4;
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];

        const isBackground = (r > 160 && g > 145 && b > 120) || (r > 200 && g > 200 && b > 200);

        if (isBackground) {
          data[pIdx + 3] = 0;

          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!visited[nIdx]) {
                queue.push(nx, ny);
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setTransparentSrc(canvas.toDataURL('image/png'));
    };
  }, [src]);

  return (
    <img
      src={transparentSrc || src}
      alt="BaliSnap Studio Logo"
      className={`${className} transition-transform duration-300 hover:scale-105`}
    />
  );
};

export const Landing: React.FC = () => {
  const { setStep, setPackageTier } = usePhotobooth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutModalTier, setCheckoutModalTier] = useState<PackageTier>('basic');

  const handleSelectPackage = (tier: PackageTier) => {
    if (tier === 'free') {
      setPackageTier('free');
      setStep('select-frame');
    } else {
      setCheckoutModalTier(tier);
      setCheckoutModalOpen(true);
    }
  };

  // Motion Variants Ringan Berbasis GPU Acceleration
  const cardPopUpVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        delay: i * 0.1,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-gradient-to-br from-[#FFF8F6] via-[#F6F0FF] to-[#EDF6FF] text-zinc-800 selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden relative font-sans antialiased">

      {/* ===== SOFT PASTEL AURA BACKGROUND ===== */}
      <div className="absolute top-[-8%] left-[-8%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] bg-pink-200/40 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute top-[22%] right-[-10%] w-[65vw] sm:w-[45vw] h-[65vw] sm:h-[45vw] bg-purple-200/40 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Subtle Polka Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.35] pointer-events-none" />

      {/* ===== HEADER / NAVBAR ===== */}
      <header className="px-4 sm:px-8 lg:px-16 py-3.5 border-b border-white/80 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer select-none"
        >
          <motion.div
            animate={{ y: [0, -2.5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
          >
            <TransparentLogo
              src="/logo.png"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0 filter drop-shadow-sm transition-transform duration-300 group-hover:rotate-3"
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.15em] sm:tracking-[0.2em] text-lg sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-indigo-950 to-pink-900 leading-none">
              BALISNAP
            </span>
            <motion.span
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-[7.5px] sm:text-[8.5px] tracking-[0.25em] sm:tracking-[0.35em] font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text mt-0.5 uppercase"
            >
              STUDIO
            </motion.span>
          </div>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-[10.5px] font-black tracking-[0.2em] text-purple-900/70 uppercase">
          <motion.a
            href="#cara-kerja"
            whileHover={{ y: -2, scale: 1.05, color: '#db2777' }}
            whileTap={{ scale: 0.95 }}
            className="transition-colors py-1 relative group select-none"
          >
            <span>Cara Kerja</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full" />
          </motion.a>

          <motion.a
            href="#paket-harga"
            whileHover={{ y: -2, scale: 1.05, color: '#db2777' }}
            whileTap={{ scale: 0.95 }}
            className="transition-colors py-1 flex items-center gap-1.5 relative group select-none"
          >
            <span>Paket Harga</span>
            <motion.span
              animate={{ scale: [1, 1.12, 1], y: [0, -1, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-[8px] lowercase font-black shadow-xs tracking-normal flex items-center gap-0.5"
            >
              promo ✨
            </motion.span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full" />
          </motion.a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            onClick={() => setStep('select-frame')}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-lg shadow-purple-950/20 flex items-center gap-2 whitespace-nowrap z-10 border border-white/20 relative overflow-hidden group cursor-pointer"
          >
            {/* Button Shimmer Light Pass */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', repeatDelay: 1.5 }}
            />
            <span className="relative z-10">Ambil Foto</span>
            <motion.div
              animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Camera className="w-3.5 h-3.5 text-pink-300 shrink-0" />
            </motion.div>
          </motion.button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-purple-900 hover:text-pink-600 rounded-lg bg-white/80 border border-purple-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-b border-pink-100 px-6 py-4 flex flex-col gap-3 font-black tracking-widest text-xs uppercase text-purple-900 relative z-40"
          >
            <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-pink-100/60 hover:text-pink-600">
              Cara Kerja
            </a>
            <a href="#paket-harga" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-pink-600 flex items-center justify-between">
              <span>Paket Harga & Promo</span>
              <span className="px-2 py-0.5 bg-pink-500 text-white text-[9px] rounded-full">Hot ✨</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO SECTION ===== */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-16 pb-16 sm:pb-24 z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
        <div className="lg:col-span-7 text-left flex flex-col items-start w-full">
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
            whileHover={{ scale: 1.04, y: -2 }}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/85 backdrop-blur-md border border-pink-200/90 text-pink-700 text-[8.5px] sm:text-[10px] font-black tracking-[0.18em] uppercase mb-6 shadow-sm shadow-pink-200/40 relative overflow-hidden group cursor-pointer select-none"
          >
            {/* Shimmer light pass effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', repeatDelay: 1 }}
            />

            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            </motion.div>

            <span>THE HIGH-END DIGITAL PHOTOBOOTH</span>

            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-100 via-rose-100 to-purple-100 text-pink-600 text-[8px] border border-pink-200/60 shadow-xs flex items-center gap-1 font-black"
            >
              SOFT STUDIO ✨
            </motion.span>
          </motion.div>

          <h1 className="font-serif font-bold text-4xl sm:text-6xl md:text-7xl lg:text-[80px] tracking-tight leading-[1.08] text-purple-950 mb-6 sm:mb-8 break-words">
            Capturing <br />
            <span className="font-sans font-black italic bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
              Pure Emotion
            </span> <br />
            in Perfect Grids.
          </h1>

          <p className="text-purple-950/70 text-xs sm:text-base font-medium tracking-wide max-w-xl mb-8 sm:mb-10 leading-relaxed">
            Transformasikan momentum terbaik Anda ke dalam tata letak bingkai premium berstandar kurasi galeri seni. Responsif, instan, dan terenkripsi penuh dari browser Anda.
          </p>

          <motion.button
            onClick={() => setStep('select-frame')}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: [1, 1.03, 1] }}
            transition={{
              opacity: { duration: 0.5, delay: 0.15 },
              y: { duration: 0.5, delay: 0.15, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
              scale: { repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.6 }
            }}
            whileHover={{ scale: 1.06, y: -4, boxShadow: "0px 20px 40px rgba(76, 29, 149, 0.45)" }}
            whileTap={{ scale: 0.95, y: 0 }}
            className="w-full sm:w-auto px-8 sm:px-11 py-4 sm:py-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white rounded-2xl font-black tracking-[0.18em] uppercase text-xs sm:text-sm shadow-xl flex items-center justify-center gap-3 sm:gap-4 border border-white/20 relative overflow-hidden group cursor-pointer select-none"
          >
            {/* Button Light Shimmer Pass */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full pointer-events-none"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', repeatDelay: 1.2 }}
            />

            <span className="relative z-10">Mulai Sesi Foto</span>

            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <ArrowRight className="w-4 h-4 text-pink-300 shrink-0 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </motion.button>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-5 flex justify-center items-center w-full mt-2 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] }}
            whileHover={{ scale: 1.03, y: -6 }}
            style={{ willChange: "transform, opacity" }}
            className="w-full max-w-[280px] sm:max-w-[320px] aspect-[3/5] rounded-[30px] bg-white/85 border-2 border-white/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md relative flex flex-col justify-between overflow-hidden group cursor-pointer select-none"
          >
            {/* Ambient Floating Glow & Shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-pink-200/20 via-transparent to-purple-200/20 pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full pointer-events-none"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', repeatDelay: 2 }}
            />

            <div className="flex justify-between items-center z-10">
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-purple-900/60 uppercase flex items-center gap-1.5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  style={{ willChange: "transform" }}
                >
                  <Star className="w-3.5 h-3.5 text-pink-500 fill-pink-400" />
                </motion.div>
                BALISNAP PREVIEW
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 shadow-sm border border-purple-100 flex items-center justify-center text-purple-800 shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>

            <div className="w-full flex-1 my-3 sm:my-4 bg-zinc-950 rounded-2xl p-2.5 sm:p-3 shadow-2xl relative overflow-hidden flex flex-col gap-2 justify-between border border-pink-500/30">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="bg-zinc-900 rounded-lg flex-1 w-full flex items-center justify-center relative overflow-hidden group/img"
              >
                <img src="/cat1.png" alt="Preview 1" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/img:scale-105" />
                <ImageIcon className="w-5 h-5 text-white/40 z-10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="bg-zinc-900 rounded-lg flex-1 w-full flex items-center justify-center relative overflow-hidden group/img"
              >
                <img src="/cat2.jpg" alt="Preview 2" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/img:scale-105" />
                <Camera className="w-5 h-5 text-white/40 z-10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="bg-zinc-900 rounded-lg flex-1 w-full flex items-center justify-center relative overflow-hidden group/img"
              >
                <img src="/cat3.png" alt="Preview 3" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/img:scale-105" />
                <Sparkles className="w-5 h-5 text-white/40 z-10" />
              </motion.div>

              <div className="text-center font-serif tracking-[0.25em] text-[8.5px] sm:text-[9.5px] text-pink-300 font-bold pt-1 border-t border-zinc-800 z-10">
                BALISNAP STUDIO
              </div>
            </div>

            <div className="flex justify-between items-center text-[9.5px] sm:text-[11px] text-purple-900/70 font-bold z-10 gap-2">
              <span className="truncate">Premium Matte Finish</span>
              <span className="font-mono text-pink-600 bg-pink-100/70 px-2 py-0.5 rounded-md text-[9px] shrink-0">4:3 Aspect</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ===== WORKFLOW SECTION ===== */}
      <section id="cara-kerja" className="relative border-t border-white/80 bg-white/40 backdrop-blur-md py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-pink-600 uppercase mb-2">EXQUISITE WORKFLOW</h2>
            <h3 className="font-serif font-bold text-2xl sm:text-4xl md:text-5xl tracking-tight text-purple-950 px-2">
              Tiga Tahap Kreasi Estetik
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: 'I', title: 'Pilih Proporsi', desc: 'Tentukan layout bingkai dengan variasi rasio dan jumlah grid sesuai narasi momentum Anda.' },
              { step: 'II', title: 'Abadikan Sudut', desc: 'Aktifkan lensa kamera resolusi tinggi dengan interval pewaktu terintegrasi secara mulus.' },
              { step: 'III', title: 'Sentuhan Akhir', desc: 'Sematkan stiker kontemporer, kurasi filter warna impian, dan ekspor berkas resolusi tinggi.' }
            ].map((card, i) => (
              <div key={i} className="bg-white/70 p-6 sm:p-8 rounded-3xl border border-white shadow-lg text-left">
                <span className="font-serif italic font-black text-4xl sm:text-5xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text mb-2 block select-none">
                  {card.step}
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-purple-950 mb-2">{card.title}</h4>
                <p className="text-purple-950/70 text-xs sm:text-sm leading-relaxed font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION PAKET & HARGA PHOTOBOOTH STUDIO ===== */}
      <section id="paket-harga" className="relative border-t border-white/80 py-16 sm:py-28 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-white/30 via-pink-50/20 to-purple-50/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-pink-500" />
              <span>PILIHAN AKSES STUDIO</span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-purple-950 tracking-tight leading-tight mb-4">
              Pilih Paket Photobooth Studiomu! 📸
            </h2>
            <p className="text-purple-950/70 text-xs sm:text-base font-medium leading-relaxed">
              Abadikan momen serumu bareng pacar, sahabat, atau diri sendiri langsung dari HP atau Laptop tanpa perlu antre ke studio mahal!
            </p>
          </div>

          {/* 3 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-6 sm:pt-8">

            {/* 1. PAKET GRATIS */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={cardPopUpVariants}
              style={{ willChange: "transform, opacity" }}
              className="bg-white/85 border border-white/90 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-md transition-transform duration-200 hover:-translate-y-2 relative text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">🆓</span>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                    FREE PASS
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-purple-950 mb-1">Paket GRATIS</h3>
                <p className="text-[11px] text-purple-900/60 font-medium mb-5 min-h-[32px]">
                  💡 Coba fitur dasar & tes kamera langsung tanpa bayar.
                </p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-purple-950">Rp 0</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md inline-block mt-2">
                    ⏱️ Masa Aktif: 1x Sesi Foto
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-purple-950/80 font-medium mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎨 Akses bingkai dasar polos & 2-slot grid.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🌈 Filter warna standar (Original & B&W).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>📱 Hasil foto pratinjau standar.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-amber-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100 text-[11px]">
                    <span>⚠️ Terdapat watermark logo kecil di sudut foto.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPackage('free')}
                className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-purple-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-colors active:scale-95 cursor-pointer"
              >
                Coba Gratis Sekarang
              </button>
            </motion.div>

            {/* 2. PAKET BASIC / SINGLE EVENT */}
            <motion.div
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={cardPopUpVariants}
              style={{ willChange: "transform, opacity" }}
              className="bg-white/95 border-2 border-pink-200/90 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-lg transition-transform duration-200 hover:-translate-y-2 relative text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">💖</span>
                  <span className="text-[10px] font-black tracking-widest text-pink-600 uppercase bg-pink-100/80 px-3 py-1 rounded-full">
                    DATE &amp; BESTIE PASS
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-purple-950 mb-1">Paket BASIC</h3>
                <p className="text-[11px] text-purple-900/60 font-medium mb-5 min-h-[32px]">
                  💖 Pilihan favorit untuk Date Night, Anniversary, atau foto bareng Bestie.
                </p>

                <div className="mb-6 pb-6 border-b border-pink-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-purple-950">Rp 25.000</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-2.5 py-1 rounded-md inline-block mt-2">
                    ⏱️ Masa Aktif: Pass 24 Jam (Foto Sepuasnya)
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-purple-950/80 font-medium mb-8">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>✨ <strong>100% Bebas Watermark</strong> (Hasil bersih ala studio profesional).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎨 Akses Bingkai Estetik (Korean, Y2K, Polaroid, Cute, Retro, Filmstrip).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>📐 Pilihan Grid Foto (1, 2, 3, hingga 4 Slot Foto).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🌈 Bebas Pakai Semua Filter Warna (Vintage, Cool, Vivid, Sepia, B&amp;W).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎀 <strong>Sticker Studio &amp; Text Overlay</strong> (Tambah stiker digital &amp; tulisan nama/tanggal).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>📱 Hasil Foto HD Jernih + Unduh Instant via Scan QR Code.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPackage('basic')}
                className="w-full py-3.5 px-4 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                Pilih Paket Basic
              </button>
            </motion.div>

            {/* 3. PAKET PREMIUM / VIP CREATOR PASS */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={cardPopUpVariants}
              style={{ willChange: "transform, opacity" }}
              className="bg-gradient-to-b from-purple-950 via-indigo-950 to-purple-900 border-2 border-pink-400 text-white rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-transform duration-200 hover:-translate-y-2 relative text-left"
            >
              {/* Badge Populer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap z-30 border border-white/30">
                <Crown className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
                <span>⭐ VIP UNLIMITED &amp; FULL ACCESS</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-2xl">👑</span>
                  <span className="text-[10px] font-black tracking-widest text-pink-300 uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    VIP CREATOR &amp; EVENT PRO
                  </span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-white mb-1">Paket PREMIUM</h3>
                <p className="text-[11px] text-pink-200/80 font-medium mb-5 min-h-[32px]">
                  👑 Solusi komplit! Bebas foto sepuasnya 60 Hari + Upload Canva Frame Sendiri &amp; Fitur Custom Pro.
                </p>

                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">Rp 120.000</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-pink-300 bg-white/10 px-2.5 py-1 rounded-md inline-block mt-2 border border-pink-400/30">
                    ⏱️ Masa Aktif: Pass 60 Hari (2 Bulan Bebas Foto)
                  </span>
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-pink-300 mb-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Semua Fitur Basic + Benefit VIP Eksklusif:
                </div>

                <ul className="space-y-2.5 text-xs text-white/90 font-medium mb-8">
                  <li className="flex items-start gap-2.5">
                    <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0 mt-0.5" />
                    <span>⭐ <strong>Semua Akses Paket Basic Included</strong> (Bebas Watermark, All Filters, QR Download).</span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-pink-500/20 p-2.5 rounded-xl border border-pink-400/30">
                    <UploadCloud className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                    <span>🖼️ <strong>Unlimited Upload Custom Frame</strong> — Import bingkai karya sendiri (Canva/Photoshop PNG &amp; SVG) tanpa batas.</span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-purple-500/20 p-2.5 rounded-xl border border-purple-400/30">
                    <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                    <span>📸 <strong>VIP Studio Extended Grid</strong> — Akses Grid Rame-rame 6-Cut &amp; 8-Cut khusus grup besar &amp; pesta.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <Palette className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                    <span>🎨 <strong>Full Custom Color &amp; Wallpaper Studio</strong> — Bebas atur Color Picker HEX, Border Thickness, Radius, Shadow &amp; Custom Backdrop.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <Wand2 className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                    <span>🪄 <strong>Photo Fine-Tuning &amp; Retouch Pro</strong> — Kontrol presisi Brightness, Contrast, Saturation &amp; Soft Focus.</span>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <Download className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                    <span>🚀 <strong>Export Super Ultra-HD 4K Print-Ready</strong> — Hasil cetak fisik kualitas studio tanpa terkompresi.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPackage('premium')}
                className="w-full py-4 px-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
              >
                <span>Pilih Paket Premium 🔥</span>
              </button>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Checkout Simulator Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        targetTier={checkoutModalTier}
        onSuccess={() => setStep('select-frame')}
      />

      {/* ===== FOOTER ===== */}
      <footer className="py-8 sm:py-14 px-4 sm:px-8 border-t border-white/80 bg-white/50 backdrop-blur-md text-center text-[9.5px] sm:text-[10.5px] text-purple-900/60 font-bold relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="tracking-[0.12em]">
            &copy; {new Date().getFullYear()} BALISNAP STUDIO. ALL RIGHTS RESERVED.
          </p>
          <p className="tracking-[0.2em] bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-transparent bg-clip-text font-black">
            CRAFTED FOR ULTRA-CLEAN VISUAL EXPRESSION.
          </p>
        </div>
      </footer>

    </div>
  );
};