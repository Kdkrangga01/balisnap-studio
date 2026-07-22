import React, { useEffect, useState } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { Camera, Sparkles, Image as ImageIcon, ArrowRight, Maximize2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

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

      // Algoritma Flood Fill dari sudut-sudut gambar untuk menghapus background luar murni
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];

      // Memasukkan piksel tepi luar canvas ke antrean
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

        // Toleransi deteksi warna latar/bercak luar (krem, putih, bercak vintage)
        const isBackground = (r > 160 && g > 145 && b > 120) || (r > 200 && g > 200 && b > 200);

        if (isBackground) {
          data[pIdx + 3] = 0; // Hapus piksel bercak background jadi transparan

          // Periksa tetangga 4 arah
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
        scale: [1, 1.03, 1],
        rotate: [0, 1.5, -1.5, 0],
      }}
      transition={{
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror"
      }}
      whileHover={{ scale: 1.05 }}
    />
  );
};

export const Landing: React.FC = () => {
  const { setStep } = usePhotobooth();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

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
    hidden: { opacity: 0, y: 35, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, stiffness: 100, damping: 18 },
    },
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-[#FAF9F5] text-zinc-900 selection:bg-rose-100 overflow-x-hidden relative font-sans antialiased">

      {/* ===== EMOTE KIYOMO CUTE & AESTHETIC ===== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3.5 }} className="absolute top-[10%] left-[3%] text-5xl opacity-80 hidden lg:block">🎀</motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-[6%] right-[18%] text-5xl opacity-80 hidden lg:block">✨</motion.div>
        <motion.div animate={{ y: [0, 10, 0], rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[52%] left-[4%] text-6xl opacity-70 hidden lg:block">🧸</motion.div>
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute bottom-[6%] right-[8%] text-5xl opacity-80 hidden lg:block">💖</motion.div>
        <motion.div animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-[35%] left-[2%] text-4xl hidden lg:block">🌸</motion.div>
        <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute top-[28%] right-[2%] text-4xl opacity-60 hidden lg:block">💫</motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-[62%] right-[5%] text-3xl opacity-50 hidden lg:block">🍓</motion.div>
      </div>

      {/* Iridescent Light Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tr from-rose-200/50 via-amber-100/40 to-cyan-200/30 rounded-full blur-[60px] sm:blur-[100px] lg:blur-[160px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-gradient-to-bl from-purple-100/60 via-teal-50/50 to-orange-100/40 rounded-full blur-[60px] sm:blur-[100px] lg:blur-[180px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] bg-gradient-to-r from-emerald-100/40 via-indigo-100/50 to-pink-100/30 rounded-full blur-[60px] sm:blur-[100px] lg:blur-[140px] pointer-events-none mix-blend-multiply" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAE6DC_1px,transparent_1px),linear-gradient(to_bottom,#EAE6DC_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.5] pointer-events-none" />

      {/* Header / Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="px-4 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-[#EAE6DC]/60 flex justify-between items-center bg-[#FAF9F5]/90 backdrop-blur-sm sticky top-0 z-50 shadow-[0_4px_30px_rgba(234,230,220,0.2)]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer">
          {/* LOGO DENGAN CLEAN FLOOD-FILL BACKGROUND REMOVER */}
          <TransparentLogo
            src="/logo.png"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_10px_rgba(180,140,80,0.15)] shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-serif tracking-[0.15em] sm:tracking-[0.2em] text-base sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600 leading-none">
              BALISNAP
            </span>
            <span className="text-[7px] sm:text-[8px] tracking-[0.25em] sm:tracking-[0.35em] font-black bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text mt-0.5 uppercase">
              STUDIO
            </span>
          </div>
        </div>

        <nav className="hidden md:flex gap-12 text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase">
          <a href="#cara-kerja" className="hover:text-zinc-950 transition-colors relative group py-1">
            Cara Kerja
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-rose-400 to-purple-500 group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#cara-kerja" className="hover:text-zinc-950 transition-colors relative group py-1">
            Spesifikasi
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-rose-400 to-purple-500 group-hover:w-full transition-all duration-300" />
          </a>
        </nav>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep('select-frame')}
          className="px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-300 shadow-xl shadow-zinc-950/10 flex items-center gap-1.5 sm:gap-2 group whitespace-nowrap"
        >
          Ambil Foto <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:rotate-12 text-rose-300 shrink-0" />
        </motion.button>
      </motion.header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 sm:pt-16 pb-16 sm:pb-28 z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-7 text-left flex flex-col items-start w-full"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-[#EAE6DC] text-zinc-600 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-6 sm:mb-8 shadow-sm relative overflow-hidden group cursor-default"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 animate-spin duration-1000 shrink-0" />
            <span>The High-End Digital Photobooth</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-serif font-normal text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] sm:leading-[1.05] text-zinc-950 mb-6 sm:mb-8 break-words"
          >
            Capturing <br />
            <span className="font-sans font-black italic bg-gradient-to-r from-rose-500 via-purple-600 to-cyan-500 text-transparent bg-clip-text drop-shadow-sm">
              Pure Emotion
            </span> <br />
            in Perfect Grids.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-zinc-500 text-sm md:text-base font-normal tracking-wide max-w-xl mb-8 sm:mb-12 leading-relaxed"
          >
            Transformasikan momentum terbaik Anda ke dalam tata letak bingkai premium berstandar kurasi galeri seni. Responsif, instan, dan terenkripsi penuh dari browser Anda.
          </motion.p>

          <motion.div variants={itemVariants} className="relative group cursor-pointer w-full sm:w-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400 via-purple-500 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('select-frame')}
              className="relative w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white border border-[#EAE6DC] rounded-2xl text-zinc-950 font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase text-xs shadow-xl transition-all duration-300 flex items-center justify-center gap-3 sm:gap-4 overflow-hidden group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950"
            >
              Mulai Sesi Foto <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform shrink-0" />
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="lg:col-span-5 flex justify-center items-center w-full lg:perspective-[1000px]"
        >
          <motion.div
            style={isDesktop ? { rotateX, rotateY } : undefined}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-[280px] sm:max-w-[310px] aspect-[3/5] rounded-[24px] sm:rounded-[28px] bg-white/90 lg:bg-white/40 border border-white/80 p-4 sm:p-5 shadow-[0_10px_30px_rgba(210,200,180,0.25)] lg:shadow-[0_30px_70px_rgba(210,200,180,0.35)] lg:backdrop-blur-xl relative group cursor-grab active:cursor-grabbing flex flex-col justify-between"
          >
            <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] bg-gradient-to-tr from-rose-400/10 via-purple-400/0 to-cyan-400/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-center z-10">
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-zinc-400 uppercase">BALISNAP PREVIEW</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 shadow-sm border border-[#EAE6DC] flex items-center justify-center text-zinc-700 shrink-0">
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>

            {/* Preview Grid */}
            <div className="w-full flex-1 my-4 sm:my-5 bg-zinc-950 rounded-xl p-2.5 sm:p-3 shadow-inner relative overflow-hidden flex flex-col gap-2 sm:gap-2.5 justify-between">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

              <div className="bg-zinc-900 rounded-md flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <img src="/cat1.png" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity group-hover/slot:opacity-100" />
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 z-10" />
                <div className="hidden lg:block absolute bottom-1 right-1 text-xs">🌸</div>
              </div>

              <div className="bg-zinc-900 rounded-md flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <img src="/cat2.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity group-hover/slot:opacity-100" />
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 z-10" />
                <div className="hidden lg:block absolute top-1 left-1 text-xs">💖</div>
              </div>

              <div className="bg-zinc-900 rounded-md flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <img src="/cat3.png" alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity group-hover/slot:opacity-100" />
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 z-10" />
                <div className="hidden lg:block absolute bottom-1 right-1 text-xs">✨</div>
              </div>

              <div className="text-center font-serif tracking-[0.2em] sm:tracking-[0.25em] text-[9px] sm:text-[10px] text-zinc-500 font-bold pt-1.5 border-t border-zinc-900 z-10">
                BALISNAP STUDIO
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-zinc-500 font-medium z-10 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">Premium Matte Finish</span>
              </div>
              <span className="font-mono text-zinc-400 shrink-0">4:3 Aspect</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Workflow Section */}
      <section id="cara-kerja" className="relative border-t border-[#EAE6DC]/60 bg-white/40 py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-12, -6, -12] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="absolute top-[28%] left-[2%] w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white z-0 hidden lg:block pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        >
          <img src="/stickers/cute-angry-cat.jpg" className="w-full h-full object-cover" alt="Cute Angry Cat" loading="lazy" decoding="async" />
        </motion.div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14 sm:mb-20"
          >
            <h2 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] sm:tracking-[0.3em] text-purple-600 uppercase mb-3">EXQUISITE WORKFLOW</h2>
            <h3 className="font-serif font-normal text-2xl sm:text-3xl md:text-5xl tracking-tight text-zinc-950 px-2">
              Tiga Tahap Kreasi Estetik
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-16 relative">
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
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative group text-left flex flex-col items-start"
              >
                <span className="font-serif italic font-black text-5xl sm:text-6xl text-rose-200/60 mb-4 select-none group-hover:text-rose-400/40 transition-colors duration-500">
                  {card.step}
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-zinc-900 mb-2 group-hover:text-zinc-950 transition-colors">
                  {card.title}
                </h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-normal">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-16 px-4 sm:px-6 border-t border-[#EAE6DC]/60 bg-[#FAF9F5] text-center text-[10px] text-zinc-400 font-bold relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="tracking-[0.1em] sm:tracking-[0.15em]">
            &copy; {new Date().getFullYear()} BALISNAP STUDIO. ALL RIGHTS RESERVED.
          </p>
          <p className="tracking-[0.2em] sm:tracking-[0.3em] bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
            CRAFTED FOR ULTRA-CLEAN VISUAL EXPRESSION.
          </p>
        </div>
      </footer>
    </div>
  );
};