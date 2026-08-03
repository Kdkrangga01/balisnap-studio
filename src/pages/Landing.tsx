import React, { useEffect, useState } from 'react';
import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { TestimonialSection } from '../components/TestimonialSection';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  Camera, Sparkles, Image as ImageIcon, ArrowRight, Maximize2, Menu, X, Star, Check,
  Crown, Wand2, UploadCloud, Download, CheckCircle2, Palette, Film, HelpCircle,
  Layers, Sliders, Smile, QrCode, Heart, ChevronRight, ChevronLeft, Play, RefreshCw, Smartphone
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
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeTutorialStep, setActiveTutorialStep] = useState(0);

  const tutorialSteps = [
    {
      id: 1,
      badge: 'Langkah 01',
      title: 'Pilih Paket & Template Frame Estetik',
      icon: Layers,
      color: 'from-pink-500 to-rose-500',
      shortDesc: 'Pilih paket yang kamu inginkan & tentukan layout foto favoritmu dari studio kami.',
      details: [
        'Pilih Paket: Paket Gratis (tes fitur), Paket Basic 24 Jam (Tanpa Watermark), atau VIP 60 Hari.',
        'Pilih Template Frame: Variasi Korean Photo Strip (3/4 slot), Grid 2x2, Retro Filmstrip, atau Frame Rombongan (6-8 slot).',
        'VIP Canva Upload: Pengguna paket VIP dapat mengunggah desain bingkai buatan sendiri (PNG transparan) dari Canva.'
      ],
      previewImg: '/cat1.png',
      previewTag: '🎨 100+ Template Ready'
    },
    {
      id: 2,
      badge: 'Langkah 02',
      title: 'Sesi Foto Otomatis & Fitur Retake',
      icon: Camera,
      color: 'from-purple-600 to-indigo-600',
      shortDesc: 'Ambil foto secara live dengan timer otomatis atau unggah langsung dari galeri HP/PC.',
      details: [
        'Countdown Timer: Atur jeda 3s, 5s, atau 10s agar punya cukup waktu bersiap dan bergaya.',
        'Upload Galeri: Pilihan alternatif untuk mengambil foto dari galeri HP atau Komputer Anda.',
        'Fitur Retake (Foto Ulang): Jika ada pose foto yang merem atau kurang pas, cukup klik "Retake" pada slot foto tersebut tanpa harus mengulang foto lain!'
      ],
      previewImg: '/cat2.jpg',
      previewTag: '📸 Auto Timer & Retake'
    },
    {
      id: 3,
      badge: 'Langkah 03',
      title: 'Studio Edit (Filter, Stiker & Teks)',
      icon: Wand2,
      color: 'from-pink-500 to-purple-600',
      shortDesc: 'Atur posisi foto, beri filter estetik, stiker lucu, dan tulisan momen spesialmu.',
      details: [
        'Atur Zoom & Drag: Geser & zoom foto agar presisi di dalam slot bingkai.',
        'Filter Warna & Color Picker: Pilih filter (Vintage, B&W, Sepia, Soft Glow) dan ubah warna frame dengan Custom HEX Picker (VIP).',
        'Stiker & Teks Studio: Pasang ratusan stiker imut & ketik nama/tanggal momen bersejarah.',
        'Efek Animated Overlays (VIP): Aktifkan kilauan sakura, love, dan glitter estetik di atas foto strip.'
      ],
      previewImg: '/cat3.png',
      previewTag: '✨ Full Creative Control'
    },
    {
      id: 4,
      badge: 'Langkah 04',
      title: 'Download HD, Scan QR & Kado Amplop 3D',
      icon: Download,
      color: 'from-emerald-500 to-teal-600',
      shortDesc: 'Simpan foto strip resolusi tinggi langsung di HP atau bungkus jadi kado kejutan 3D.',
      details: [
        'Download HD Jernih: Unduh file foto PNG resolusi tinggi tanpa terkompresi.',
        'Instant QR Code Scan: Tinggal scan QR Code di layar menggunakan HP untuk menyimpan foto di galeri secara otomatis.',
        'Kado Amplop Digital 3D (VIP): Kirimkan foto strip sebagai kado ucapan 3D romantis berpesan suara via WhatsApp!'
      ],
      previewImg: '/cat1.png',
      previewTag: '📲 Instant Save & Share'
    }
  ];

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
        ease: 'easeOut'
      }
    })
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

          <motion.button
            onClick={() => setGuideModalOpen(true)}
            whileHover={{ y: -2, scale: 1.05, color: '#db2777' }}
            whileTap={{ scale: 0.95 }}
            className="transition-colors py-1 flex items-center gap-1.5 relative group select-none cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Cara Pakai</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full" />
          </motion.button>

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

          <motion.button
            onClick={() => setFeedbackModalOpen(true)}
            whileHover={{ y: -2, scale: 1.05, color: '#db2777' }}
            whileTap={{ scale: 0.95 }}
            className="transition-colors py-1 flex items-center gap-1 relative group select-none cursor-pointer"
          >
            <span>Ulasan & Saran</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full" />
          </motion.button>
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
            className="md:hidden bg-white/95 backdrop-blur-md border-b border-pink-100 px-6 py-4 flex flex-col gap-3 font-black tracking-widest text-xs uppercase text-purple-900 relative z-40 text-left"
          >
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setGuideModalOpen(true);
              }}
              className="py-2 border-b border-pink-100/60 hover:text-pink-600 flex items-center justify-between text-left cursor-pointer"
            >
              <span>✨ Panduan Cara Pakai</span>
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[9px] rounded-full">Info 📖</span>
            </button>
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
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
              className="px-8 sm:px-11 py-4 sm:py-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white rounded-2xl font-black tracking-[0.18em] uppercase text-xs sm:text-sm shadow-xl flex items-center justify-center gap-3 sm:gap-4 border border-white/20 relative overflow-hidden group cursor-pointer select-none"
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

            <motion.button
              onClick={() => setGuideModalOpen(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 rounded-2xl bg-white/90 border-2 border-pink-200/80 text-purple-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:bg-pink-50 transition-colors cursor-pointer select-none"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>✨ Cara Pakai</span>
            </motion.button>
          </div>
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

      {/* ===== INTERACTIVE 4-STEP TUTORIAL SECTION ===== */}
      <section id="cara-kerja" className="relative border-t border-white/80 bg-gradient-to-b from-white/60 via-pink-50/40 to-purple-50/30 backdrop-blur-md py-16 sm:py-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/90 border border-pink-200 text-pink-700 text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>PANDUAN LENGKAP CARA PAKAI</span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-purple-950 tracking-tight leading-tight mb-4">
              Mudah Banget! 4 Langkah Foto Strip 📸
            </h2>
            <p className="text-purple-950/70 text-xs sm:text-base font-medium leading-relaxed">
              Ikuti alur sederhana dari memilih bingkai hingga menyimpan hasil foto berkualitas tinggi langsung di smartphone Anda.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left: Step Tabs Selector */}
            <div className="lg:col-span-6 flex flex-col gap-3.5 justify-center">
              {tutorialSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isActive = activeTutorialStep === idx;
                return (
                  <motion.div
                    key={step.id}
                    onClick={() => setActiveTutorialStep(idx)}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer select-none relative overflow-hidden flex items-start gap-4 ${
                      isActive
                        ? 'bg-white border-pink-400 shadow-xl shadow-pink-500/10'
                        : 'bg-white/60 border-white/80 hover:bg-white/80'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-purple-600 rounded-r-full" />
                    )}

                    <div className={`p-3 rounded-2xl shrink-0 text-white bg-gradient-to-br ${step.color} shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                          {step.badge}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                            Aktif 👈
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base text-purple-950 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs text-purple-950/70 leading-relaxed font-medium">
                        {step.shortDesc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              <div className="pt-2 flex items-center justify-between px-2">
                <button
                  onClick={() => setGuideModalOpen(true)}
                  className="text-xs font-black text-pink-600 hover:text-pink-700 flex items-center gap-1.5 uppercase tracking-wider py-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Buka Panduan Detail (Pop-Up) ➔</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTutorialStep((prev) => (prev > 0 ? prev - 1 : tutorialSteps.length - 1))}
                    className="w-9 h-9 rounded-full bg-white border border-pink-100 flex items-center justify-center text-purple-900 hover:bg-pink-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTutorialStep((prev) => (prev < tutorialSteps.length - 1 ? prev + 1 : 0))}
                    className="w-9 h-9 rounded-full bg-white border border-pink-100 flex items-center justify-center text-purple-900 hover:bg-pink-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Active Step Detail Display Card */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTutorialStep}
                  initial={{ opacity: 0, x: 20, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="bg-white/95 border-2 border-white rounded-[36px] p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between h-full text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl pointer-events-none" />

                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-pink-100">
                      <div className="flex items-center gap-2">
                        <span className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100">
                          {React.createElement(tutorialSteps[activeTutorialStep].icon, { className: "w-5 h-5" })}
                        </span>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-pink-600">
                            {tutorialSteps[activeTutorialStep].badge}
                          </span>
                          <h3 className="font-serif font-bold text-lg text-purple-950">
                            {tutorialSteps[activeTutorialStep].title}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        {activeTutorialStep + 1} / {tutorialSteps.length}
                      </span>
                    </div>

                    {/* Image Mockup Highlight */}
                    <div className="relative w-full h-44 sm:h-52 bg-zinc-950 rounded-2xl mb-5 overflow-hidden flex items-center justify-center border border-pink-200/50 group shadow-inner">
                      <img
                        src={tutorialSteps[activeTutorialStep].previewImg}
                        alt="Tutorial Preview"
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="text-[10px] font-black text-white bg-pink-600/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          {tutorialSteps[activeTutorialStep].previewTag}
                        </span>
                        <span className="text-[9px] text-white/80 font-bold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md">
                          BaliSnap Interactive Guide
                        </span>
                      </div>
                    </div>

                    {/* Step Points Detail List */}
                    <div className="space-y-3 mb-6">
                      {tutorialSteps[activeTutorialStep].details.map((item, index) => {
                        const parts = item.split(':');
                        const label = parts[0];
                        const text = parts.slice(1).join(':');
                        return (
                          <div key={index} className="flex items-start gap-2.5 text-xs text-purple-950/90 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>{label}:</strong> {text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-pink-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setGuideModalOpen(true)}
                      className="text-[11px] font-black text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-3 rounded-2xl transition-colors cursor-pointer"
                    >
                      Buka Modal Panduan Lengkap 📖
                    </button>

                    <button
                      onClick={() => setStep('select-frame')}
                      className="px-5 py-3 bg-gradient-to-r from-purple-900 to-indigo-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:from-purple-950 hover:to-indigo-900 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <span>Mulai Foto</span>
                      <ArrowRight className="w-3.5 h-3.5 text-pink-300" />
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

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
                    <span>📱 Hasil Foto HD Jernih + Unduh Instant Ke HP.</span>
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
                    <span className="text-3xl sm:text-4xl font-black text-white">Rp 135.000</span>
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

                  <li className="flex items-start gap-2.5 bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-400/30">
                    <Film className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                    <span>🎬 <strong>Unduh Animasi GIF (Boomerang Photobooth)</strong> — Ekspor foto bergerak beresolusi tinggi dengan pilihan kecepatan animasi.</span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-pink-500/20 p-2.5 rounded-xl border border-pink-400/30">
                    <Sparkles className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
                    <span>💌 <strong>Kirim Kado Amplop Digital 3D &amp; Voice Note</strong> — Kirim foto strip ucapan &amp; rekaman suara otomatis via WhatsApp.</span>
                  </li>

                  <li className="flex items-start gap-2.5 bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/30">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>🌟 <strong>Dynamic Sparkle &amp; Partikel Overlays</strong> — Efek glitter, sakura, love, &amp; partikel kilau estetik pada foto.</span>
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

      {/* Testimonials, Reviews & Suggestions Section */}
      <TestimonialSection onOpenFeedbackModal={() => setFeedbackModalOpen(true)} />

      {/* Checkout Simulator Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        targetTier={checkoutModalTier}
        onSuccess={() => setStep('select-frame')}
      />

      {/* Feedback & Review Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

      {/* Interactive Tutorial Guide Modal */}
      <AnimatePresence>
        {guideModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto"
            onClick={() => setGuideModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative max-w-2xl w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-left my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="p-6 pb-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-pink-950 text-white relative">
                <button
                  onClick={() => setGuideModalOpen(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="p-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                    <Sparkles className="w-5 h-5 text-pink-300" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
                    📖 PANDUAN PENGGUNA BARU
                  </span>
                </div>

                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-1">
                  Cara Pakai BaliSnap Studio 📸
                </h2>
                <p className="text-xs text-white/80 font-medium leading-relaxed">
                  Panduan lengkap dari memilih bingkai hingga foto tersimpan di galeri ponselmu.
                </p>
              </div>

              {/* Body Content - Step Cards list */}
              <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
                {tutorialSteps.map((st) => (
                  <div key={st.id} className="bg-pink-50/50 border border-pink-100 p-4 rounded-2xl flex items-start gap-4 text-left">
                    <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${st.color} shrink-0 shadow-sm mt-1`}>
                      {React.createElement(st.icon, { className: "w-5 h-5" })}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-md">
                          {st.badge}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-purple-950 mb-1">{st.title}</h4>
                      <p className="text-xs text-purple-950/70 font-medium mb-3">{st.shortDesc}</p>

                      <div className="space-y-1.5 border-t border-pink-200/50 pt-2">
                        {st.details.map((dt, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-700 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{dt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Modal CTA */}
              <div className="p-5 border-t border-zinc-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-purple-900/70 font-bold">
                  Sudah paham? Yuk buat foto strip pertamamu! ✨
                </span>
                <button
                  onClick={() => {
                    setGuideModalOpen(false);
                    setStep('select-frame');
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Mulai Photobooth Sekarang 🔥</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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