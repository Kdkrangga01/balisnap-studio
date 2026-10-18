import React, { useEffect, useState } from 'react';
import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';
import { CheckoutModal } from '../components/CheckoutModal';
import {
  Camera, ArrowRight, Menu, X, Check,
  Wand2, Download, Layers,
  ChevronRight, ChevronLeft,
  Sparkles, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component Logo dengan Background Transparan Rapi
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
      className={className}
    />
  );
};

export const Landing: React.FC = () => {
  const { setStep, setPackageTier } = usePhotobooth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutModalTier, setCheckoutModalTier] = useState<PackageTier>('basic');
  const [activeTutorialStep, setActiveTutorialStep] = useState(0);

  // Panduan terpadu satu tempat yang mencakup seluruh alur tanpa pengulangan
  const tutorialSteps = [
    {
      id: 1,
      badge: 'Langkah 1',
      title: 'Pilih Format dan Bingkai',
      icon: Layers,
      shortDesc: 'Tersedia susunan foto strip klasik, format kotak grid, polaroid, maupun tata letak grup.',
      details: [
        'Koleksi Bingkai: Pilihan tema mulai dari garis minimalis, gaya retro, hingga nuansa warna pastel.',
        'Bingkai Kustom: Mendukung impor desain bingkai sendiri dalam format PNG transparan.',
        'Akses Langsung: Anda dapat langsung memulai sesi foto dari browser tanpa perlu mengunduh aplikasi.'
      ],
      previewImg: '/cat1.png',
      previewTag: 'Format Bingkai Beragam'
    },
    {
      id: 2,
      badge: 'Langkah 2',
      title: 'Pengambilan Foto',
      icon: Camera,
      shortDesc: 'Gunakan kamera perangkat dengan hitung mundur otomatis atau unggah file foto dari penyimpanan.',
      details: [
        'Hitung Mundur Otomatis: Opsi jeda waktu 3, 5, atau 10 detik agar posisi pose foto selalu siap.',
        'Unggah dari Perangkat: Fleksibel untuk memasukkan foto kenangan langsung dari galeri ponsel atau laptop.',
        'Fitur Foto Ulang: Jika satu pose foto kurang pas, Anda cukup mengulang slot foto tersebut saja.'
      ],
      previewImg: '/cat2.jpg',
      previewTag: 'Hitung Mundur dan Foto Ulang'
    },
    {
      id: 3,
      badge: 'Langkah 3',
      title: 'Penyesuaian Studio',
      icon: Wand2,
      shortDesc: 'Atur posisi gambar, terapkan filter tone warna, serta tambahkan stiker dan tulisan keterangan.',
      details: [
        'Filter Warna Studio: Pilihan tone warna retro, hitam putih klasik, serta kehangatan nuansa film.',
        'Stiker Studio: Beragam pilihan ornamen dan stiker berkualitas tajam untuk melengkapi foto Anda.',
        'Pengaturan Gambar: Penyesuaian tingkat kecerahan, kontras, dan saturasi agar hasil foto optimal.'
      ],
      previewImg: '/cat3.png',
      previewTag: 'Filter dan Dekorasi'
    },
    {
      id: 4,
      badge: 'Langkah 4',
      title: 'Penyimpanan Hasil',
      icon: Download,
      shortDesc: 'Unduh file foto beresolusi tinggi untuk dicetak atau simpan animasi bergerak format GIF.',
      details: [
        'Format Siap Cetak: Berkas PNG resolusi tinggi tanpa penurunan kualitas kompresi.',
        'Animasi Bergerak GIF: Rangkai urutan foto menjadi animasi bergerak untuk dibagikan ke media sosial.',
        'Pindai Kode QR: Simpan hasil foto ke ponsel secara cepat melalui pemindaian kode QR di layar.'
      ],
      previewImg: '/cat1.png',
      previewTag: 'Unduh Resolusi Tinggi'
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

  return (
    <div className="min-h-screen w-full bg-white text-[#18181B] selection:bg-[#E4E4E7] selection:text-[#09090B] overflow-x-hidden relative font-sans antialiased">

      {/* ===== HEADER / NAVBAR ===== */}
      <header className="px-5 sm:px-10 lg:px-16 py-4 border-b border-[#F1F3F5] flex justify-between items-center bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <TransparentLogo
            src="/logo.png"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col text-left">
            <span className="font-serif tracking-[0.16em] text-lg sm:text-xl font-bold text-[#18181B] leading-none">
              BALISNAP
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.24em] font-medium text-[#71717A] uppercase mt-0.5">
              STUDIO PHOTOBOOTH
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Satu kesatuan rapi tanpa duplikasi) */}
        <nav className="hidden md:flex items-center gap-8 text-[12px] font-medium tracking-wider text-[#52525B]">
          <a
            href="#panduan-berfoto"
            className="hover:text-[#18181B] transition-colors py-1"
          >
            Cara Berfoto
          </a>
          <a
            href="#paket-harga"
            className="hover:text-[#18181B] transition-colors py-1"
          >
            Pilihan Paket
          </a>
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('select-frame')}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-medium tracking-wide transition-colors cursor-pointer shadow-xs"
          >
            <span>Mulai Foto</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4D4D8]" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Buka menu navigasi"
            className="md:hidden p-2 text-[#18181B] hover:bg-[#F4F4F5] rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-[#F1F3F5] px-6 py-4 flex flex-col gap-3.5 font-medium text-sm text-[#3F3F46] relative z-40 text-left shadow-sm"
          >
            <a
              href="#panduan-berfoto"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F4F4F5] hover:text-[#18181B] flex items-center justify-between"
            >
              <span>Cara Berfoto</span>
              <Layers className="w-4 h-4 text-[#71717A]" />
            </a>
            <a
              href="#paket-harga"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#18181B] flex items-center justify-between"
            >
              <span>Pilihan Paket</span>
              <Sparkles className="w-4 h-4 text-[#71717A]" />
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setStep('select-frame');
              }}
              className="w-full mt-2 py-3 rounded-xl bg-[#18181B] text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Mulai Sesi Foto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO SECTION ===== */}
      <main className="relative max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-18 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-white">
        
        {/* Left Column: Heading & Information */}
        <div className="lg:col-span-7 text-left flex flex-col items-start w-full">
          
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-[11px] font-medium tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A6A38]" />
            <span>Studio Photobooth Digital • Akses Langsung Browser</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl text-[#18181B] tracking-tight leading-[1.18] mb-6">
            Abadikan Momen Manis <br />
            <span className="font-normal italic text-[#9A6A38]">Dalam Setiap Bingkai.</span>
          </h1>

          {/* Subtitle bahasa proporsional tanpa istilah AI */}
          <p className="text-[#52525B] text-sm sm:text-base font-normal max-w-xl mb-8 leading-relaxed">
            Nikmati kemudahan membuat foto strip estetik langsung dari ponsel atau laptop Anda. Lengkap dengan beragam template bingkai, pilihan filter warna, dan stiker dekoratif berkualitas tinggi.
          </p>

          {/* Action Button & Micro-Info */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
            <motion.button
              onClick={() => setStep('select-frame')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 bg-[#18181B] hover:bg-[#27272A] text-white rounded-xl font-medium tracking-wide text-sm shadow-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer select-none"
            >
              <span>Mulai Sesi Foto</span>
              <ArrowRight className="w-4 h-4 text-[#D4D4D8]" />
            </motion.button>

            <a
              href="#panduan-berfoto"
              className="px-6 py-3.5 bg-white hover:bg-[#F8F9FA] text-[#3F3F46] border border-[#E4E4E7] rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lihat Cara Berfoto</span>
            </a>
          </div>

          {/* Data Highlight Nyata */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#F1F3F5] w-full max-w-md text-left">
            <div>
              <p className="font-serif font-bold text-lg text-[#18181B]">100+</p>
              <p className="text-[11px] text-[#71717A] font-normal leading-tight mt-0.5">Template Bingkai</p>
            </div>
            <div>
              <p className="font-serif font-bold text-lg text-[#18181B]">Gratis</p>
              <p className="text-[11px] text-[#71717A] font-normal leading-tight mt-0.5">2 Sesi Percobaan</p>
            </div>
            <div>
              <p className="font-serif font-bold text-lg text-[#18181B]">Format HD</p>
              <p className="text-[11px] text-[#71717A] font-normal leading-tight mt-0.5">Berkas Siap Cetak</p>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Studio Photostrip Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, rotate: 0.5 }}
            className="w-full max-w-[270px] sm:max-w-[290px] rounded-2xl bg-[#18181B] p-3.5 sm:p-4 shadow-xl border border-[#27272A] flex flex-col justify-between text-center select-none"
          >
            {/* Strip Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-[#27272A]">
              <span className="text-[10px] font-medium tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-[#E08A7C] fill-[#E08A7C]" />
                BALISNAP STUDIO
              </span>
              <span className="text-[9px] font-mono text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">
                CLASSIC STRIP
              </span>
            </div>

            {/* Photo Slots */}
            <div className="flex flex-col gap-2.5 my-3">
              <div className="w-full aspect-[4/3] bg-[#27272A] rounded-lg overflow-hidden relative group">
                <img
                  src="/cat1.png"
                  alt="Momen Foto 1"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="w-full aspect-[4/3] bg-[#27272A] rounded-lg overflow-hidden relative group">
                <img
                  src="/cat2.jpg"
                  alt="Momen Foto 2"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="w-full aspect-[4/3] bg-[#27272A] rounded-lg overflow-hidden relative group">
                <img
                  src="/cat3.png"
                  alt="Momen Foto 3"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Strip Footer Details */}
            <div className="pt-2 border-t border-[#27272A] flex flex-col gap-1 text-[9.5px] text-[#A1A1AA]">
              <p className="font-serif tracking-widest text-[#F4F4F5] font-medium">MEMORIES IN FRAMES</p>
              <div className="flex justify-between items-center text-[8.5px] text-[#71717A] pt-1">
                <span>Bali, Indonesia</span>
                <span>Matte Finish HD</span>
              </div>
            </div>
          </motion.div>
        </div>

      </main>

      {/* ===== SECTION CARA BERFOTO (PANDUAN LENGKAP SATU KESATUAN) ===== */}
      <section id="panduan-berfoto" className="border-t border-[#F1F3F5] bg-[#F8F9FA] py-16 sm:py-24 px-5 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] font-medium tracking-widest text-[#71717A] uppercase bg-white px-3 py-1 rounded-full border border-[#E4E4E7] shadow-2xs">
              Panduan Lengkap
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#18181B] mt-3 mb-3">
              Cara Berfoto di BaliSnap Studio
            </h2>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Empat tahapan praktis mulai dari menentukan bingkai, sesi pengambilan gambar, penyesuaian tampilan, hingga menyimpan foto berkualitas tinggi.
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Step Tabs List */}
            <div className="lg:col-span-6 flex flex-col gap-3 justify-center">
              {tutorialSteps.map((step, idx) => {
                const IconComponent = step.icon;
                const isActive = activeTutorialStep === idx;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveTutorialStep(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3.5 ${
                      isActive
                        ? 'bg-white border-[#18181B] shadow-sm'
                        : 'bg-white/70 border-[#E4E4E7]/70 hover:bg-white hover:border-[#D4D4D8]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isActive ? 'bg-[#18181B] text-white' : 'bg-[#F4F4F5] text-[#52525B]'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
                          {step.badge}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9A6A38]" />
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#18181B] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#52525B] leading-relaxed font-normal">
                        {step.shortDesc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Prev / Next Controller */}
              <div className="flex items-center justify-between pt-2 px-1">
                <span className="text-xs text-[#71717A]">
                  Pilih langkah untuk melihat rincian penjelasan
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTutorialStep((prev) => (prev > 0 ? prev - 1 : tutorialSteps.length - 1))}
                    aria-label="Langkah sebelumnya"
                    className="w-8 h-8 rounded-full bg-white border border-[#E4E4E7] flex items-center justify-center text-[#3F3F46] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTutorialStep((prev) => (prev < tutorialSteps.length - 1 ? prev + 1 : 0))}
                    aria-label="Langkah berikutnya"
                    className="w-8 h-8 rounded-full bg-white border border-[#E4E4E7] flex items-center justify-center text-[#3F3F46] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step Detail Card */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTutorialStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-7 shadow-sm text-left flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1F3F5]">
                      <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
                        {tutorialSteps[activeTutorialStep].badge}
                      </span>
                      <span className="text-xs font-mono text-[#52525B] bg-[#F4F4F5] px-2.5 py-0.5 rounded border border-[#E4E4E7]">
                        {activeTutorialStep + 1} / {tutorialSteps.length}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-[#18181B] mb-2">
                      {tutorialSteps[activeTutorialStep].title}
                    </h3>
                    <p className="text-xs text-[#52525B] mb-5 leading-relaxed">
                      {tutorialSteps[activeTutorialStep].shortDesc}
                    </p>

                    {/* Preview Image Thumbnail */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#18181B] mb-5 border border-[#E4E4E7]">
                      <img
                        src={tutorialSteps[activeTutorialStep].previewImg}
                        alt="Pratinjau langkah"
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute bottom-2.5 left-3 bg-[#18181B]/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-white font-medium">
                        {tutorialSteps[activeTutorialStep].previewTag}
                      </div>
                    </div>

                    {/* Bullet List Details */}
                    <div className="space-y-2 mb-6">
                      {tutorialSteps[activeTutorialStep].details.map((detail, index) => {
                        const [label, ...rest] = detail.split(':');
                        return (
                          <div key={index} className="flex items-start gap-2.5 text-xs text-[#3F3F46]">
                            <Check className="w-3.5 h-3.5 text-[#9A6A38] shrink-0 mt-0.5" />
                            <span>
                              <strong>{label}:</strong> {rest.join(':')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#F1F3F5] flex items-center justify-between">
                    <span className="text-xs text-[#71717A]">Mulai berfoto sekarang:</span>
                    <button
                      onClick={() => setStep('select-frame')}
                      className="px-5 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Masuk ke Editor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* ===== SECTION PAKET AKSES PHOTOBOOTH ===== */}
      <section id="paket-harga" className="py-16 sm:py-24 px-5 sm:px-8 lg:px-12 border-t border-[#F1F3F5] bg-white">
        <div className="max-w-5xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] font-medium tracking-widest text-[#71717A] uppercase bg-[#F4F4F5] px-3 py-1 rounded-full border border-[#E4E4E7]">
              Pilihan Akses
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#18181B] mt-3 mb-3">
              Paket Akses Studio
            </h2>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Mulai dengan sesi percobaan gratis atau pilih paket akses penuh untuk berfoto tanpa watermark.
            </p>
          </div>

          {/* 3 Pricing Cards Grid (Exact Match to User Reference Design) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4 max-w-5xl mx-auto">
            
            {/* 1. Basic / Paket Gratis */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-center"
            >
              <div>
                {/* Title */}
                <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                  Paket Gratis
                </h3>

                {/* Price & Period */}
                <div className="pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="!font-sans font-bold text-4xl sm:text-5xl text-gray-900 tracking-tight">
                      Rp 0
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium block mt-2">
                    / 2 sesi foto
                  </span>
                </div>

                {/* Features List with Blue Circled Checkmarks */}
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Dua Sesi Foto Lengkap</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Unduh Berkas Kualitas HD</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Seluruh Filter Warna Dasar</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Hitung Mundur &amp; Foto Ulang</span>
                  </div>
                </div>
              </div>

              {/* Action Button (Blue Outline) */}
              <button
                onClick={() => handleSelectPackage('free')}
                className="w-full py-3.5 px-5 bg-white hover:bg-blue-50/60 text-[#2563EB] font-bold text-sm rounded-xl border-2 border-[#2563EB] transition-colors cursor-pointer active:scale-95 shadow-2xs"
              >
                Coba Gratis
              </button>
            </motion.div>

            {/* 2. Standard / Paket Basic (Most Popular with Blue Top Bar) */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-2 border-[#2563EB] rounded-3xl shadow-xl hover:shadow-2xl transition-all text-center flex flex-col justify-between overflow-hidden relative"
            >
              {/* Integrated Blue Top Bar */}
              <div className="bg-[#2563EB] text-white text-xs font-bold tracking-widest uppercase py-2.5 text-center">
                PALING POPULER
              </div>

              <div className="p-7 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  {/* Title */}
                  <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                    Paket Basic
                  </h3>

                  {/* Price & Period (Blue Price) */}
                  <div className="pb-6 mb-6 border-b border-gray-100">
                    <div className="flex items-center justify-center">
                      <span className="!font-sans font-bold text-4xl sm:text-5xl text-[#2563EB] tracking-tight">
                        Rp 25.000
                      </span>
                    </div>
                    <span className="text-sm text-gray-400 font-medium block mt-2">
                      / akses 24 jam penuh
                    </span>
                  </div>

                  {/* Features List with Blue Circled Checkmarks */}
                  <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Bebas Foto &amp; Unduh Sepuasnya</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Hasil Bersih Tanpa Watermark</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Bebas Foto Ulang Tiap Slot</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Buka Seluruh Bingkai Standar</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Unduh Kualitas Cetak HD &amp; Scan QR</span>
                    </div>
                  </div>
                </div>

                {/* Action Button (Blue Solid) */}
                <button
                  onClick={() => handleSelectPackage('basic')}
                  className="w-full py-3.5 px-5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md"
                >
                  Pilih Paket Basic
                </button>
              </div>
            </motion.div>

            {/* 3. Premium / Paket Premium VIP */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-center"
            >
              <div>
                {/* Title */}
                <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                  Paket Premium VIP
                </h3>

                {/* Price & Period */}
                <div className="pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="!font-sans font-bold text-4xl sm:text-5xl text-gray-900 tracking-tight">
                      Rp 135.000
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium block mt-2">
                    / akses 60 hari (2 bulan)
                  </span>
                </div>

                {/* Features List with Blue Circled Checkmarks */}
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Seluruh Akses Paket Basic 60 Hari</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Unggah Bingkai Sendiri (Canva PNG)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Bingkai Rombongan (6 &amp; 8 Slot)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Ekspor Animasi Boomerang GIF</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Kustom Warna Studio &amp; Retouch Pro</span>
                  </div>
                </div>
              </div>

              {/* Action Button (Blue Outline) */}
              <button
                onClick={() => handleSelectPackage('premium')}
                className="w-full py-3.5 px-5 bg-white hover:bg-blue-50/60 text-[#2563EB] font-bold text-sm rounded-xl border-2 border-[#2563EB] transition-colors cursor-pointer active:scale-95 shadow-2xs"
              >
                Pilih Premium VIP
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
      <footer className="py-10 px-5 sm:px-10 border-t border-[#F1F3F5] bg-white text-center text-xs text-[#71717A]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            &copy; {new Date().getFullYear()} BaliSnap Studio. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6 text-[11px]">
            <a href="#panduan-berfoto" className="hover:text-[#18181B] transition-colors">Cara Berfoto</a>
            <a href="#paket-harga" className="hover:text-[#18181B] transition-colors">Pilihan Paket</a>
          </div>
        </div>
      </footer>

    </div>
  );
};