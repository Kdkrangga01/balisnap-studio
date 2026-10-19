import React, { useEffect, useState, useRef } from 'react';
import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';
import { CheckoutModal } from '../components/CheckoutModal';
import { frames } from '../data/frames';
import {
  Camera, ArrowRight, Menu, X, Check,
  Wand2, Download, Layers,
  ChevronRight, ChevronLeft,
  Sparkles, Film
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

// Kurasi Desain Bingkai Populer dari Studio dengan Foto Real HD BLACKPINK (Jennie, Jisoo, Rosé, Lisa, & Group)
export interface PopularSliderItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}

const POPULAR_SLIDER_ITEMS: PopularSliderItem[] = [
  {
    id: 'custom-1784636333576-2jx9',
    title: 'Vanilla Melody · 2 Photos',
    subtitle: 'Cute Cherry & Floral Pink',
    badge: 'POPULAR CUTE',
    badgeColor: 'bg-[#FEF08A] text-[#9A3412] border-[#FDE047]',
  },
  {
    id: 'custom-1784637773555-camr',
    title: 'Vintage Cassette · 3 Photos',
    subtitle: 'Newspaper Editorial Retro',
    badge: 'RETRO EDITORIAL',
    badgeColor: 'bg-[#FEF08A] text-[#9A3412] border-[#FDE047]', 
  }, 
  {
    id: 'custom-1784637808377-sm67',
    title: 'Frame Spiderman · 4 Photos',
    subtitle: '35mm Filmstrip Hero Edition',
    badge: 'NEW LAYOUT',
    badgeColor: 'bg-[#F43F5E] text-white border-[#E11D48]',
  },
  {
    id: 'custom-1784638914224-t68k',
    title: 'Daisy Bunny · 1 Photo',
    subtitle: 'Cozy Knit Floral Kawaii',
    badge: 'CUTE MASCOT',
    badgeColor: 'bg-[#FEF08A] text-[#9A3412] border-[#FDE047]',
  },
  {
    id: 'custom-1784636523212-9oxx',
    title: 'Oldschool Romance · 2 Photos',
    subtitle: 'Vintage Camera & Scrapbook',
    badge: 'RETRO VINTAGE',
    badgeColor: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
  },
  {
    id: 'custom-1784428020314-mq4y',
    title: 'Retro Journal · 4 Photos',
    subtitle: '4-Grid Polaroid Aesthetic',
    badge: 'TEMPLATE LAYOUT',
    badgeColor: 'bg-[#FEF08A] text-[#9A3412] border-[#FDE047]',
  },
  {
    id: 'custom-1784544196068-ee8i',
    title: 'Butter Kiss · 6 Photos',
    subtitle: '6-Slot Kitten Kawaii Grid',
    badge: 'FAVORITE CUTE',
    badgeColor: 'bg-[#F43F5E] text-white border-[#E11D48]',
  },
  {
    id: 'custom-1784638948066-87pn',
    title: 'Frame Band · 3 Photos',
    subtitle: 'Electric Red Filmstrip',
    badge: 'POPULAR STRIP',
    badgeColor: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
  },
  {
    id: 'custom-1784424710599-i4k0',
    title: 'Radiant Mirage · 6 Photos',
    subtitle: 'Aesthetic Studio Grid',
    badge: 'STUDIO EXCLUSIVE',
    badgeColor: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
  },
  {
    id: 'custom-1784428172316-tz5k',
    title: 'Frame Klasik · 8 Photos',
    subtitle: '8-Slot Korean Classic Grid',
    badge: 'GROUP 8-SLOT',
    badgeColor: 'bg-[#27272A] text-white border-[#3F3F46]',
  },
];

// Komponen kartu bingkai photostrip fisik murni tanpa foto (kosong)
const SliderFrameCard: React.FC<{
  item: PopularSliderItem;
  onSelect: (id: string) => void;
}> = ({ item, onSelect }) => {
  const template = frames.find((f) => f.id === item.id);
  if (!template) return null;

  const aspect = template.width / template.height;
  const heightPx = 380;
  const widthPx = Math.min(270, Math.max(140, Math.round(heightPx * aspect)));

  return (
    <div
      onClick={() => onSelect(item.id)}
      className="flex flex-col items-center shrink-0 cursor-pointer group select-none transition-all duration-300"
    >
      {/* Box Photostrip Fisik */}
      <div
        className="relative transition-transform duration-300 group-hover:-translate-y-3"
        style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
      >
        {/* Badge Washi Tape Stiker Miring */}
        {item.badge && (
          <div
            className={`absolute -top-3.5 right-1 z-30 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md border ${item.badgeColor} rotate-[4deg] group-hover:rotate-[2deg] transition-transform`}
          >
            {item.badge}
          </div>
        )}

        {/* Real Photostrip Physical Paper Card (Kosong tanpa foto, menampilkan desain asli bingkai) */}
        <div className="relative w-full h-full bg-white rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.14)] group-hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] border border-black/30 overflow-hidden flex items-center justify-center">
          {/* Template Frame Artwork PNG */}
          <img
            src={template.src}
            alt={template.name}
            className="w-full h-full object-fill pointer-events-none select-none transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />

          {/* Quick Hover Select Overlay */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex items-center justify-center backdrop-blur-[0.5px]">
            <span className="px-3.5 py-1.5 rounded-full bg-white text-zinc-900 font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <Camera className="w-3.5 h-3.5 text-rose-600" />
              <span>Gunakan Frame Ini</span>
            </span>
          </div>
        </div>
      </div>

      {/* Title & Subtitle Below the Strip */}
      <div className="text-center mt-3.5 max-w-[220px]">
        <h4 className="font-bold text-[13px] sm:text-sm text-zinc-900 group-hover:text-rose-600 transition-colors leading-tight">
          {item.title}
        </h4>
        <p className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-tight">
          {item.subtitle}
        </p>
      </div>
    </div>
  );
};

export const Landing: React.FC = () => {
  const { setStep, setPackageTier, selectFrame } = usePhotobooth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutModalTier, setCheckoutModalTier] = useState<PackageTier>('basic');
  const [activeTutorialStep, setActiveTutorialStep] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleUsePopularFrame = (frameId: string) => {
    const target = frames.find((f) => f.id === frameId);
    if (target) {
      selectFrame(target);
      setStep('capture');
    }
  };

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
            href="#koleksi-bingkai"
            className="hover:text-[#18181B] transition-colors py-1"
          >
            Koleksi Bingkai
          </a>
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
              href="#koleksi-bingkai"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#F4F4F5] hover:text-[#18181B] flex items-center justify-between"
            >
              <span>Koleksi Bingkai</span>
              <Film className="w-4 h-4 text-[#71717A]" />
            </a>
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

      {/* ===== HERO SECTION DENGAN 2 FRAME MELAYANG (SISI KIRI & SISI KANAN PERSIS REFERENSI) ===== */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 sm:pb-22 bg-white overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* SISI KIRI: Frame Oldschool Romance (Kosong Tanpa Foto) Melayang Halus */}
          <div className="hidden lg:flex lg:col-span-3 justify-end items-center">
            <motion.div
              onClick={() => handleUsePopularFrame('custom-1784636523212-9oxx')}
              animate={{
                y: [-7, 7, -7],
                rotate: [-6, -4, -6],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.05, rotate: -2, y: 0, transition: { duration: 0.3 } }}
              className="w-[195px] xl:w-[210px] aspect-[736/1308] rounded-xl bg-white p-1 shadow-[0_14px_34px_rgba(0,0,0,0.12)] border border-black/15 flex items-center justify-center select-none cursor-pointer group transition-shadow hover:shadow-[0_22px_45px_rgba(0,0,0,0.18)]"
              title="Oldschool Romance · Klik untuk gunakan bingkai ini"
            >
              <div className="w-full h-full bg-white rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/templates/custom-1784636523212-9oxx.png"
                  alt="Oldschool Romance"
                  className="w-full h-full object-fill pointer-events-none select-none transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>

          {/* SISI TENGAH: Heading, Subtitle & Tombol Navigasi Utama */}
          <div className="lg:col-span-6 flex flex-col items-center text-center w-full px-2 sm:px-4">
            
            {/* Subtle Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-[11px] font-medium tracking-wide mb-4 sm:mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9A6A38]" />
              <span>Studio Photobooth Digital • Akses Langsung Browser</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-[44px] xl:text-[48px] text-[#18181B] tracking-tight leading-[1.16] mb-4">
              Abadikan Momen Manis
              <span className="block font-normal italic text-[#9A6A38] mt-1 sm:mt-1.5">
                Dalam Setiap Bingkai.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#52525B] text-xs sm:text-sm md:text-[14.5px] font-normal max-w-md xl:max-w-[480px] mb-7 leading-relaxed text-balance">
              Nikmati kemudahan membuat foto strip estetik langsung dari ponsel atau laptop Anda, lengkap dengan beragam pilihan template bingkai, filter warna studio, dan stiker dekoratif berkualitas.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-8">
              <motion.button
                onClick={() => setStep('select-frame')} 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#18181B] hover:bg-[#27272A] text-white rounded-xl font-medium tracking-wide text-sm shadow-sm transition-colors flex items-center justify-center gap-2.5 cursor-pointer select-none"
              >
                <span>Mulai Sesi Foto</span>
                <ArrowRight className="w-4 h-4 text-[#D4D4D8]" />
              </motion.button>

              <a
                href="#panduan-berfoto"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F8F9FA] text-[#3F3F46] border border-[#E4E4E7] rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lihat Cara Berfoto</span> 
              </a> 
            </div>

            {/* Data Highlight Nyata */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#F1F3F5] w-full max-w-sm text-center">
              <div>
                <p className="font-serif font-bold text-base sm:text-lg text-[#18181B]">100+</p>
                <p className="text-[10px] sm:text-[11px] text-[#71717A] font-normal leading-tight mt-0.5">Template Bingkai</p>
              </div>
              <div>
                <p className="font-serif font-bold text-base sm:text-lg text-[#18181B]">Gratis</p>
                <p className="text-[10px] sm:text-[11px] text-[#71717A] font-normal leading-tight mt-0.5">2 Sesi Percobaan</p>
              </div>
              <div>
                <p className="font-serif font-bold text-base sm:text-lg text-[#18181B]">Format HD</p>
                <p className="text-[10px] sm:text-[11px] text-[#71717A] font-normal leading-tight mt-0.5">Berkas Siap Cetak</p>
              </div>
            </div>

            {/* Duo Frame Tampilan Khusus Layar Tablet / Mobile (Kosong Tanpa Foto) */}
            <div className="lg:hidden flex items-center justify-center gap-4 sm:gap-6 pt-7 w-full">
              {/* Left Frame Mobile Preview */}
              <motion.div
                onClick={() => handleUsePopularFrame('custom-1784636523212-9oxx')}
                animate={{
                  y: [-4, 4, -4],
                  rotate: [-4, -2, -4],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-[125px] sm:w-[150px] aspect-[736/1308] rounded-lg bg-white p-0.5 shadow-md border border-black/15 flex items-center justify-center cursor-pointer overflow-hidden"
                title="Oldschool Romance"
              >
                <img
                  src="/templates/custom-1784636523212-9oxx.png"
                  alt="Oldschool Romance"
                  className="w-full h-full object-fill pointer-events-none"
                  loading="lazy"
                />
              </motion.div>

              {/* Right Frame Mobile Preview */}
              <motion.div
                onClick={() => handleUsePopularFrame('custom-1784637808377-sm67')}
                animate={{
                  y: [4, -4, 4],
                  rotate: [4, 2, 4],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-[125px] sm:w-[150px] aspect-[736/1308] rounded-lg bg-white p-0.5 shadow-md border border-black/15 flex items-center justify-center cursor-pointer overflow-hidden"
                title="Frame Spiderman"
              >
                <img
                  src="/templates/custom-1784637808377-sm67.png"
                  alt="Frame Spiderman"
                  className="w-full h-full object-fill pointer-events-none"
                  loading="lazy"
                />
              </motion.div>
            </div>

          </div>

          {/* SISI KANAN: Frame Spiderman (Kosong Tanpa Foto) Melayang Halus */}
          <div className="hidden lg:flex lg:col-span-3 justify-start items-center">
            <motion.div
              onClick={() => handleUsePopularFrame('custom-1784637808377-sm67')}
              animate={{
                y: [7, -7, 7],
                rotate: [6, 4, 6],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.05, rotate: 2, y: 0, transition: { duration: 0.3 } }}
              className="w-[195px] xl:w-[210px] aspect-[736/1308] rounded-xl bg-white p-1 shadow-[0_14px_34px_rgba(0,0,0,0.12)] border border-black/15 flex items-center justify-center select-none cursor-pointer group transition-shadow hover:shadow-[0_22px_45px_rgba(0,0,0,0.18)]"
              title="Frame Spiderman · Klik untuk gunakan bingkai ini"
            >
              <div className="w-full h-full bg-white rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/templates/custom-1784637808377-sm67.png"
                  alt="Frame Spiderman"
                  className="w-full h-full object-fill pointer-events-none select-none transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>

        </div>

      </main> 

      {/* ===== SECTION KOLEKSI BINGKAI POPULER (HORIZONTAL SLIDER PERSIS REFERENSI) ===== */}
      <section id="koleksi-bingkai" className="py-14 sm:py-20 bg-white border-t border-b border-[#F1F3F5] relative overflow-hidden select-none">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto px-5 mb-8 sm:mb-10"> 
          <span className="text-[10px] font-bold tracking-widest text-[#52525B] uppercase bg-[#F4F4F5] px-3.5 py-1 rounded-full border border-[#E4E4E7] shadow-2xs">
            Pilihan Layout Terpopuler
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#18181B] mt-2.5 mb-2 tracking-tight">
            Pilih Layout Bingkai Favorit
          </h2>
          <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed font-normal">
            Geser untuk melihat beragam layout estetik studio. Klik layout bingkai favorit untuk langsung memulai sesi foto.
          </p> 
        </div> 

        {/* Carousel Container with Left & Right Arrows */} 
        <div className="relative max-w-7xl mx-auto px-2 sm:px-6"> 
          {/* Tombol Panah Kiri */}
          <button 
            onClick={() => scrollCarousel('left')} 
            aria-label="Geser ke kiri"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md hover:bg-zinc-50 hover:text-zinc-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer absolute left-1 sm:left-4 top-[45%] -translate-y-1/2 z-30"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /> 
          </button>

          {/* Tombol Panah Kanan */} 
          <button
            onClick={() => scrollCarousel('right')} 
            aria-label="Geser ke kanan"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md hover:bg-zinc-50 hover:text-zinc-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer absolute right-1 sm:right-4 top-[45%] -translate-y-1/2 z-30"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /> 
          </button>

          {/* Horizontal Scroll Track */}
          <div 
            ref={carouselRef}
            className="flex items-end gap-8 sm:gap-12 overflow-x-auto scroll-smooth py-6 px-12 sm:px-20 scrollbar-none snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {POPULAR_SLIDER_ITEMS.map((item) => ( 
              <div key={item.id} className="snap-center shrink-0">
                <SliderFrameCard item={item} onSelect={handleUsePopularFrame} />
              </div> 
            ))}
          </div>
        </div>

        {/* Action Link di Bawah Slider */}
        <div className="text-center mt-6 sm:mt-8"> 
          <button
            onClick={() => setStep('select-frame')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-zinc-800 hover:text-zinc-950 font-bold text-xs border border-zinc-200 shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <span>Buka Seluruh 100+ Koleksi Bingkai Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-700" />
          </button>
        </div> 

      </section> 

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4 max-w-6xl mx-auto">
            
            {/* 1. Basic / Paket Gratis */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-center"
            >
              <div>
                {/* Title */}
                <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                  Paket Gratis
                </h3>

                {/* Price & Period */}
                <div className="pb-5 mb-5 border-b border-gray-100">
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
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Akses coba 2 sesi foto lengkap (foto, edit, dan unduh)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Buka seluruh filter warna foto (Normal, B&W, Vintage, Cool, Vivid, Sepia)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Koleksi stiker dekorasi studio lengkap (Panda, Cute, Y2K, dsb.)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Fitur hitung mundur otomatis dan foto ulang (retake) per slot</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Tambah teks estetik dengan beragam pilihan gaya font studio</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Unduh hasil foto jernih format HD (tersedia 2 kali)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Menyertakan tanda air (watermark) halus studio</span>
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

              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
                <div>
                  {/* Title */}
                  <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                    Paket Basic
                  </h3>

                  {/* Price & Period (Blue Price) */}
                  <div className="pb-5 mb-5 border-b border-gray-100">
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
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Akses penuh bebas foto &amp; unduh sepuasnya selama 24 jam</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>100% hasil foto bersih tanpa watermark studio</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Buka seluruh koleksi bingkai studio (Korean, Polaroid, Filmstrip, Retro)</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Bebas foto ulang (retake) per slot tanpa batasan sesi</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Buka seluruh filter warna foto &amp; semua paket stiker studio</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Bebas atur posisi foto (geser posisi, perbesar / zoom) sesuai keinginan</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Unduh hasil foto kualitas tinggi format HD</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span>Fitur scan QR code untuk simpan foto langsung ke smartphone</span>
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
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all text-center"
            >
              <div>
                {/* Title */}
                <h3 className="!font-sans font-bold text-2xl text-gray-900 mb-3 tracking-tight">
                  Paket Premium VIP
                </h3>

                {/* Price & Period */}
                <div className="pb-5 mb-5 border-b border-gray-100">
                  <div className="flex items-center justify-center">
                    <span className="!font-sans font-bold text-4xl sm:text-5xl text-gray-900 tracking-tight">
                      Rp 135.000
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium block mt-2">
                    / akses 60 hari (2 bulan)
                  </span>
                </div>

                {/* Features List with Blue Circled Checkmarks - COMPLETE SYSTEM LIST */}
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>Masa aktif panjang 60 hari penuh (2 bulan)</strong> bebas foto kapan saja</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Termasuk seluruh fitur Paket Basic (bebas watermark &amp; unduh sepuasnya)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>Unggah bingkai sendiri tanpa batas</strong> (desain Canva / Photoshop PNG &amp; SVG)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Deteksi otomatis area foto transparan saat unggah bingkai kustom</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span><strong>Buka bingkai rombongan (grid 6 &amp; 8 slot)</strong> khusus foto ramai-ramai</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Atur warna bebas (Color Picker HEX, ketebalan border, radius, &amp; bayangan)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Pilihan koleksi wallpaper latar belakang eksklusif untuk bingkai foto</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Pengaturan detail foto (Brightness, Contrast, Saturation, &amp; Soft Focus)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Ekspor animasi bergerak Boomerang GIF dengan pengaturan kecepatan</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Kirim kado amplop digital 3D interaktif &amp; rekaman suara via WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Efek partikel estetik foto (kilau cahaya, kelopak sakura, hati, &amp; glitter emas)</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-[13px] text-gray-700 leading-snug">
                    <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Pilihan ekspor kualitas Ultra HD fisik siap cetak standar percetakan</span>
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
            <a href="#koleksi-bingkai" className="hover:text-[#18181B] transition-colors">Koleksi Bingkai</a>
            <a href="#panduan-berfoto" className="hover:text-[#18181B] transition-colors">Cara Berfoto</a>
            <a href="#paket-harga" className="hover:text-[#18181B] transition-colors">Pilihan Paket</a>
          </div>
        </div>
      </footer>

    </div>
  );
};