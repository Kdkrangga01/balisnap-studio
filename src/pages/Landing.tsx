import React, { useEffect, useState } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { Camera, Sparkles, Image as ImageIcon, ArrowRight, Maximize2, Menu, X, Star } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// Component khusus dengan Algoritma Flood-Fill Removal yang presisi
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
    <motion.img
      src={transparentSrc || src}
      alt="BaliSnap Studio Logo"
      className={className}
      animate={{
        scale: [1, 1.04, 1],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 4.5,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      whileHover={{ scale: 1.08, rotate: 3 }}
    />
  );
};

export const Landing: React.FC = () => {
  const { setStep } = usePhotobooth();

  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [12, -12]);
  const rotateY = useTransform(x, [-300, 300], [-12, 12]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!isDesktop) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - rect.width / 2;
    const mouseY = event.clientY - rect.top - rect.height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    if (!isDesktop) return;
    x.set(0);
    y.set(0);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, stiffness: 100, damping: 18 },
    },
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-gradient-to-br from-[#FFF8F6] via-[#F6F0FF] to-[#EDF6FF] text-zinc-800 selection:bg-pink-200 selection:text-pink-900 overflow-x-hidden relative font-sans antialiased">

      {/* ===== SOFT PASTEL AURA MESH BACKGROUND (SOFT, CLEAN & COLORFUL) ===== */}
      <div className="absolute top-[-8%] left-[-8%] w-[75vw] sm:w-[55vw] h-[75vw] sm:h-[55vw] bg-gradient-to-tr from-pink-200/50 via-rose-100/40 to-amber-100/50 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[22%] right-[-10%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] bg-gradient-to-bl from-indigo-200/40 via-purple-100/50 to-sky-100/40 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[8%] w-[65vw] sm:w-[45vw] h-[65vw] sm:h-[45vw] bg-gradient-to-r from-teal-100/40 via-emerald-100/30 to-pink-100/40 rounded-full blur-[80px] sm:blur-[130px] pointer-events-none mix-blend-multiply" />

      {/* Subtle Polka Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.4] pointer-events-none" />

      {/* ===== FLOATING DECORATIVE STICKERS ===== */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Ribbon Kiri Atas */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 8, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-[14%] left-[2%] sm:left-[3.5%] text-3xl sm:text-5xl drop-shadow-[0_4px_12px_rgba(244,63,94,0.2)] select-none"
        >
          🎀
        </motion.div>

        {/* Bintang Sparkles Kanan Atas */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, 20, -20, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          className="absolute top-[11%] right-[8%] sm:right-[15%] text-3xl sm:text-5xl drop-shadow-sm select-none"
        >
          ✨
        </motion.div>

        {/* Cherry Blossom Mid Left */}
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -12, 12, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="absolute top-[50%] left-[1.5%] sm:left-[2.5%] text-2xl sm:text-4xl select-none"
        >
          🌸
        </motion.div>

        {/* Teddy Bear Mid Right */}
        <motion.div
          animate={{ y: [0, -12, 0], scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="absolute top-[56%] right-[2%] sm:right-[3.5%] text-3xl sm:text-5xl select-none hidden sm:block"
        >
          🧸
        </motion.div>

        {/* Floating Heart Kanan Bawah */}
        <motion.div
          animate={{ y: [0, -10, 0], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-[10%] right-[6%] text-2xl sm:text-4xl select-none"
        >
          💖
        </motion.div>
      </div>

      {/* ===== HEADER / NAVBAR ===== */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="px-4 sm:px-8 lg:px-16 py-3.5 border-b border-white/80 flex justify-between items-center bg-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_20px_rgba(200,180,220,0.15)]"
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer">
          <TransparentLogo
            src="/logo.png"
            className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-[0_4px_12px_rgba(236,72,153,0.2)] shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.15em] sm:tracking-[0.2em] text-lg sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-indigo-950 to-pink-900 leading-none">
              BALISNAP
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.25em] sm:tracking-[0.35em] font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text mt-0.5 uppercase">
              STUDIO
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10 lg:gap-14 text-[10.5px] font-black tracking-[0.25em] text-purple-900/60 uppercase">
          <a href="#cara-kerja" className="hover:text-pink-600 transition-colors relative group py-1">
            Cara Kerja
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-pink-400 to-purple-500 group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#spesifikasi" className="hover:text-pink-600 transition-colors relative group py-1">
            Spesifikasi
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-pink-400 to-purple-500 group-hover:w-full transition-all duration-300" />
          </a>
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 20px rgba(236,72,153,0.25)" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setStep('select-frame')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white transition-all duration-300 shadow-md flex items-center gap-2 group whitespace-nowrap z-10 border border-white/20"
          >
            <span>Ambil Foto</span>
            <Camera className="w-3.5 h-3.5 transition-transform group-hover:rotate-12 text-pink-300 shrink-0" />
          </motion.button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-purple-900 hover:text-pink-600 rounded-lg bg-white/80 border border-purple-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-xl border-b border-pink-100 px-6 py-4 flex flex-col gap-4 font-black tracking-widest text-xs uppercase text-purple-900 relative z-40"
          >
            <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-pink-100/60 hover:text-pink-600">
              Cara Kerja
            </a>
            <a href="#spesifikasi" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-pink-600">
              Spesifikasi
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO SECTION ===== */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-16 pb-16 sm:pb-28 z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">

        {/* Left Column Text Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-7 text-left flex flex-col items-start w-full"
        >
          {/* Tagline Pill Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/80 backdrop-blur-md border border-pink-200/80 text-pink-700 text-[8.5px] sm:text-[10px] font-black tracking-[0.18em] uppercase mb-6 shadow-sm shadow-pink-100/50 cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin duration-1000 shrink-0" />
            <span>THE HIGH-END DIGITAL PHOTOBOOTH</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600 text-[8px]">SOFT STUDIO ✨</span>
          </motion.div>

          {/* Clean & Elegant Hero Title */}
          <motion.h1
            variants={itemVariants}
            className="font-serif font-bold text-4xl sm:text-6xl md:text-7xl lg:text-[82px] tracking-tight leading-[1.08] text-purple-950 mb-6 sm:mb-8 break-words"
          >
            Capturing <br />
            <span className="font-sans font-black italic bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text drop-shadow-[0_4px_12px_rgba(236,72,153,0.2)]">
              Pure Emotion
            </span> <br />
            in Perfect Grids.
          </motion.h1>

          {/* Description Paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-purple-950/70 text-xs sm:text-base font-medium tracking-wide max-w-xl mb-8 sm:mb-10 leading-relaxed"
          >
            Transformasikan momentum terbaik Anda ke dalam tata letak bingkai premium berstandar kurasi galeri seni. Responsif, instan, dan terenkripsi penuh dari browser Anda.
          </motion.p>

          {/* ELEGANT PASTEL CTA BUTTON */}
          <motion.div variants={itemVariants} className="relative group cursor-pointer w-full sm:w-auto">
            {/* Soft Ambient Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-2xl blur opacity-50 group-hover:opacity-90 transition duration-500" />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('select-frame')}
              className="relative w-full sm:w-auto px-8 sm:px-11 py-4 sm:py-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white rounded-2xl font-black tracking-[0.18em] uppercase text-xs sm:text-sm shadow-xl transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 border border-white/20"
            >
              <span>Mulai Sesi Foto</span>
              <ArrowRight className="w-4 h-4 text-pink-300 group-hover:translate-x-1.5 transition-transform shrink-0" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Column Interactive Card Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', damping: 20 }}
          className="lg:col-span-5 flex justify-center items-center w-full lg:perspective-[1000px] mt-2 lg:mt-0"
        >
          <motion.div
            style={isDesktop ? { rotateX, rotateY } : undefined}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-[290px] sm:max-w-[325px] aspect-[3/5] rounded-[30px] bg-white/70 border-2 border-white/90 p-4 sm:p-5 shadow-[0_20px_50px_rgba(220,190,240,0.4)] backdrop-blur-xl relative group cursor-grab active:cursor-grabbing flex flex-col justify-between"
          >
            {/* Top Bar Label */}
            <div className="flex justify-between items-center z-10">
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-purple-900/50 uppercase flex items-center gap-1">
                <Star className="w-3 h-3 text-pink-400 fill-pink-400" /> BALISNAP PREVIEW
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-sm border border-purple-100 flex items-center justify-center text-purple-800 shrink-0">
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>

            {/* Photo Strip Container */}
            <div className="w-full flex-1 my-3 sm:my-4 bg-zinc-950 rounded-2xl p-2.5 sm:p-3 shadow-2xl relative overflow-hidden flex flex-col gap-2 justify-between border border-pink-500/20">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

              {/* Slot 1 */}
              <div className="bg-zinc-900 rounded-lg flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <img
                  src="/cat1.png"
                  alt="Preview 1"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/slot:scale-105 group-hover/slot:opacity-100"
                />
                <ImageIcon className="w-5 h-5 text-white/40 z-10" />
                <div className="absolute bottom-1 right-1 text-xs select-none">🌸</div>
              </div>

              {/* Slot 2 */}
              <div className="bg-zinc-900 rounded-lg flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <img
                  src="/cat2.jpg"
                  alt="Preview 2"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/slot:scale-105 group-hover/slot:opacity-100"
                />
                <Camera className="w-5 h-5 text-white/40 z-10" />
                <div className="absolute top-1 left-1 text-xs select-none">💖</div>
              </div>

              {/* Slot 3 */}
              <div className="bg-zinc-900 rounded-lg flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <img
                  src="/cat3.png"
                  alt="Preview 3"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover/slot:scale-105 group-hover/slot:opacity-100"
                />
                <Sparkles className="w-5 h-5 text-white/40 z-10" />
                <div className="absolute bottom-1 right-1 text-xs select-none">✨</div>
              </div>

              <div className="text-center font-serif tracking-[0.25em] text-[8.5px] sm:text-[9.5px] text-pink-300 font-bold pt-1 border-t border-zinc-800 z-10">
                BALISNAP STUDIO
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="flex justify-between items-center text-[9.5px] sm:text-[11px] text-purple-900/70 font-bold z-10 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">Premium Matte Finish</span>
              </div>
              <span className="font-mono text-pink-600 bg-pink-100/70 px-2 py-0.5 rounded-md text-[9px] shrink-0">4:3 Aspect</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* ===== WORKFLOW SECTION ===== */}
      <section id="cara-kerja" className="relative border-t border-white/80 bg-white/40 backdrop-blur-md py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-pink-600 uppercase mb-2">EXQUISITE WORKFLOW</h2>
            <h3 className="font-serif font-bold text-2xl sm:text-4xl md:text-5xl tracking-tight text-purple-950 px-2">
              Tiga Tahap Kreasi Estetik
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              { step: 'I', title: 'Pilih Proporsi', desc: 'Tentukan layout bingkai dengan variasi rasio dan jumlah grid sesuai narasi momentum Anda.' },
              { step: 'II', title: 'Abadikan Sudut', desc: 'Aktifkan lensa kamera resolusi tinggi dengan interval pewaktu terintegrasi secara mulus.' },
              { step: 'III', title: 'Sentuhan Akhir', desc: 'Sematkan stiker kontemporer, kurasi filter warna impian, dan ekspor berkas resolusi tinggi.' }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group text-left flex flex-col items-start bg-white/70 p-6 sm:p-8 rounded-3xl border border-white shadow-xl shadow-purple-900/5 hover:shadow-pink-500/10 transition-all duration-300"
              >
                <span className="font-serif italic font-black text-4xl sm:text-6xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text mb-2 sm:mb-3 select-none">
                  {card.step}
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-purple-950 mb-2">
                  {card.title}
                </h4>
                <p className="text-purple-950/70 text-xs sm:text-sm leading-relaxed font-medium">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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