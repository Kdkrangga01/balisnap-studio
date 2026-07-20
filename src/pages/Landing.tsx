import React from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { Camera, Sparkles, Image as ImageIcon, Heart, ArrowRight, Layers, ShieldCheck, Zap, Maximize2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const Landing: React.FC = () => {
  const { setStep } = usePhotobooth();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [15, -15]);
  const rotateY = useTransform(x, [-300, 300], [-15, 15]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
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
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 selection:bg-rose-100 overflow-x-hidden relative font-sans antialiased">

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

      {/* Iridescent Organic Light Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-tr from-rose-200/50 via-amber-100/40 to-cyan-200/30 rounded-full blur-[160px] pointer-events-none mix-blend-multiply animate-pulse duration-[12s]" />
      <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-gradient-to-bl from-purple-100/60 via-teal-50/50 to-orange-100/40 rounded-full blur-[180px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] bg-gradient-to-r from-emerald-100/40 via-indigo-100/50 to-pink-100/30 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />

      {/* Luxury Editorial Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAE6DC_1px,transparent_1px),linear-gradient(to_bottom,#EAE6DC_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.5] pointer-events-none" />

      {/* Header / Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="px-6 md:px-12 py-6 border-b border-[#EAE6DC]/60 flex justify-between items-center bg-[#FAF9F5]/60 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(234,230,220,0.2)]"
      >
        <div className="flex items-center gap-3 group cursor-pointer">
          <span className="font-serif tracking-[0.2em] text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600">
            BALISNAP
          </span>
          <span className="text-[8px] tracking-[0.35em] font-black bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text border border-rose-200 px-2.5 py-0.5 rounded-full bg-white/80 shadow-sm transition-all duration-300 group-hover:scale-105">
            STUDIO
          </span>
        </div>

        <nav className="hidden md:flex gap-12 text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase">
          <a href="#cara-kerja" className="hover:text-zinc-950 transition-colors relative group py-1">
            Cara Kerja
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-rose-400 to-purple-500 group-hover:w-full transition-all duration-300" />
          </a>
          <a href="#features" className="hover:text-zinc-950 transition-colors relative group py-1">
            Spesifikasi
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-rose-400 to-purple-500 group-hover:w-full transition-all duration-300" />
          </a>
        </nav>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep('select-frame')}
          className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-300 shadow-xl shadow-zinc-950/10 flex items-center gap-2 group"
        >
          Ambil Foto <Camera className="w-3.5 h-3.5 transition-transform group-hover:rotate-12 text-rose-300" />
        </motion.button>
      </motion.header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-16 pb-28 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="lg:col-span-7 text-left flex flex-col items-start"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EAE6DC] text-zinc-600 text-[10px] font-black tracking-[0.2em] uppercase mb-8 shadow-sm backdrop-blur-md relative overflow-hidden group cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin duration-1000" />
            The High-End Digital Photobooth
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-serif font-normal text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-zinc-950 mb-8"
          >
            Capturing <br />
            <span className="font-sans font-black italic bg-gradient-to-r from-rose-500 via-purple-600 to-cyan-500 text-transparent bg-clip-text drop-shadow-sm">
              Pure Emotion
            </span> <br />
            in Perfect Grids.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-zinc-500 text-sm md:text-base font-normal tracking-wide max-w-xl mb-12 leading-relaxed"
          >
            Transformasikan momentum terbaik Anda ke dalam tata letak bingkai premium berstandar kurasi galeri seni. Responsif, instan, dan terenkripsi penuh dari browser Anda.
          </motion.p>

          <motion.div variants={itemVariants} className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400 via-purple-500 to-cyan-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('select-frame')}
              className="relative px-10 py-5 bg-white border border-[#EAE6DC] rounded-2xl text-zinc-950 font-black tracking-[0.2em] uppercase text-xs shadow-xl transition-all duration-300 flex items-center gap-4 overflow-hidden group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950"
            >
              Mulai Sesi Foto <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="lg:col-span-5 flex justify-center items-center perspective-[1000px]"
        >
          <motion.div
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-[310px] h-[520px] rounded-[28px] bg-white/40 border border-white/80 p-5 shadow-[0_30px_70px_rgba(210,200,180,0.35)] backdrop-blur-xl relative group cursor-grab active:cursor-grabbing flex flex-col justify-between"
          >
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-rose-400/10 via-purple-400/0 to-cyan-400/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">BALISNAP PREVIEW</span>
              <div className="w-7 h-7 rounded-full bg-white/90 shadow-sm border border-[#EAE6DC] flex items-center justify-center text-zinc-700">
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>

            {/* GRID DENGAN GAMBAR ESTETIK */}
            <div className="w-full flex-1 my-5 bg-zinc-950 rounded-xl p-3 shadow-inner relative overflow-hidden flex flex-col gap-2.5 justify-between">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />

              <div className="bg-zinc-900 rounded-md flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <div className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity group-hover/slot:opacity-100" style={{ backgroundImage: "url('/cat1.png')" }} />
                <ImageIcon className="w-6 h-6 text-white/40 z-10" />
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-1 right-1 text-xs">🌸</motion.div>
              </div>

              <div className="bg-zinc-900 rounded-md flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <div className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity group-hover/slot:opacity-100" style={{ backgroundImage: "url('/cat2.jpg')" }} />
                <Camera className="w-6 h-6 text-white/40 z-10" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-1 left-1 text-xs">💖</motion.div>
              </div>

              <div className="bg-zinc-900 rounded-md flex-1 w-full flex items-center justify-center relative overflow-hidden group/slot">
                <div className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity group-hover/slot:opacity-100" style={{ backgroundImage: "url('/cat3.png')" }} />
                <Sparkles className="w-6 h-6 text-white/40 z-10" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute bottom-1 right-1 text-xs">✨</motion.div>
              </div>

              <div className="text-center font-serif tracking-[0.25em] text-[10px] text-zinc-500 font-bold pt-1.5 border-t border-zinc-900 z-10">
                BALISNAP STUDIO
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-zinc-500 font-medium z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Premium Matte Finish</span>
              </div>
              <span className="font-mono text-zinc-400">4:3 Aspect</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full mb-28">
        {[{ title: 'Architectural Grids', desc: 'Presisi struktur bingkai matematis.', icon: <Layers className="w-5 h-5" /> }, { title: 'Curated Badges', desc: 'Ratusan elemen grafis mikro.', icon: <Heart className="w-5 h-5" /> }, { title: 'Chromium Export', desc: 'Kompresi tanpa kehilangan detail.', icon: <Camera className="w-5 h-5" /> }, { title: 'Absolute Discretion', desc: 'Pemrosesan enkripsi lokal.', icon: <ShieldCheck className="w-5 h-5" /> }].map((item, idx) => (
          <motion.div key={idx} variants={itemVariants} className="p-8 rounded-[24px] bg-white border border-[#EAE6DC]/80 shadow-[0_4px_24px_rgba(234,230,220,0.1)] hover:border-zinc-400/50 hover:bg-white/90 transition-all duration-300 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DC] flex items-center justify-center text-zinc-800 mb-6 shadow-sm group-hover:text-white group-hover:bg-zinc-950 group-hover:border-zinc-950 transition-all duration-300">
              {item.icon}
            </div>
            <h3 className="font-bold text-base text-zinc-900 mb-2 tracking-wide font-serif">
              {item.title}
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed font-normal">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Procedural Section (Workflow Berkelas) */}
      <section id="cara-kerja" className="relative border-t border-[#EAE6DC]/60 bg-white/40 backdrop-blur-md py-28 px-6 overflow-hidden">
        {/* Live Angry Cat Sticker - Positioned inside relative section context */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-12, -6, -12] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="absolute top-[28%] left-[2%] w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white z-0 hidden lg:block pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        >
          <img src="/stickers/cute-angry-cat.jpg" className="w-full h-full object-cover" alt="Cute Angry Cat" />
        </motion.div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-[10px] font-black tracking-[0.3em] text-purple-600 uppercase mb-3">EXQUISITE WORKFLOW</h2>
            <h3 className="font-serif font-normal text-3xl md:text-5xl tracking-tight text-zinc-950">
              Tiga Tahap Kreasi Estetik
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 relative">
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
                <span className="font-serif italic font-black text-6xl text-rose-200/60 mb-4 select-none group-hover:text-rose-400/40 transition-colors duration-500">
                  {card.step}
                </span>
                <h4 className="font-serif font-bold text-lg text-zinc-900 mb-2 group-hover:text-zinc-950 transition-colors">
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

      {/* Showcase Call To Action Banner */}
      <section id="features" className="relative max-w-7xl mx-auto py-28 px-6 overflow-visible">
        {/* Live Helmet Cat Sticker - Placed in section context for correct layout layering */}
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [12, 6, 12] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute -top-[12%] right-[1%] w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white z-20 hidden lg:block pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
        >
          <img src="/stickers/cute-helmet-cat.jpg" className="w-full h-full object-cover" alt="Cute Helmet Cat" />
        </motion.div>

        <div className="bg-white border border-[#EAE6DC] rounded-[32px] p-8 md:p-16 shadow-[0_20px_60px_rgba(234,230,220,0.15)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-rose-200/20 to-transparent rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-2 mb-4 text-purple-600 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-4 h-4 text-rose-400" /> Instant Frame Rendering Engine
            </div>
            <h3 className="text-3xl md:text-5xl font-serif font-normal text-zinc-950 tracking-tight mb-6 leading-tight">
              Siap untuk merajut memori visual yang berkelas?
            </h3>
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed font-normal mb-0 max-w-xl">
              Tidak ada kompromi pada kualitas. BaliSnap menggabungkan efisiensi kompilasi gambar modern dengan keindahan estetika tradisional studio foto premium.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setStep('select-frame')}
            className="px-10 py-5 bg-zinc-950 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-900 transition-all shadow-xl shadow-zinc-950/20 shrink-0"
          >
            Mulai Sesi Sekarang
          </motion.button>
        </div>
      </section>

      {/* Footer Minimalis Galeri */}
      <footer className="py-16 px-6 border-t border-[#EAE6DC]/60 bg-[#FAF9F5] text-center text-[10px] text-zinc-400 font-bold relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="tracking-[0.15em]">
            &copy; {new Date().getFullYear()} BALISNAP STUDIO. ALL RIGHTS RESERVED.
          </p>
          <p className="tracking-[0.3em] bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-transparent bg-clip-text">
            CRAFTED FOR ULTRA-CLEAN VISUAL EXPRESSION.
          </p>
        </div>
      </footer>
    </div>
  );
};