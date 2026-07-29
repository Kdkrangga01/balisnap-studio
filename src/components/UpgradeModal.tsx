import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Crown, Sparkles, Check, ArrowRight } from 'lucide-react';
import { type PackageTier } from '../context/PhotoboothContext';
import type { FrameTemplate } from '../data/frames';
import { CheckoutModal } from './CheckoutModal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: PackageTier;
  targetFrame?: FrameTemplate | null;
  featureName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  targetTier,
  targetFrame,
  featureName,
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen && !isCheckoutOpen) return null;

  const isPremium = targetTier === 'premium';
  const priceText = isPremium ? 'Rp 135.000' : 'Rp 25.000';
  const durationText = isPremium ? 'Pass 60 Hari (2 Bulan Bebas Foto)' : 'Pass 24 Jam (Foto Sepuasnya)';
  const packageTitle = isPremium ? 'Paket PREMIUM VIP' : 'Paket BASIC';

  const handleUpgrade = () => {
    setIsCheckoutOpen(true);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 25 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.15 } },
  };

  return (
    <>
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none"
        onClick={onClose}
      >
        <motion.div
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-w-md w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Banner Header */}
          <div className={`p-6 pb-5 relative ${isPremium ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white' : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white'}`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                {isPremium ? <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-bounce" /> : <Lock className="w-5 h-5 text-white" />}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
                {isPremium ? '⭐ VIP EKSKLUSIF' : '🔒 FITUR TERKUNCI'}
              </span>
            </div>

            <h2 className="font-serif font-bold text-2xl tracking-tight text-white mb-1">
              Buka {packageTitle}! 🔓
            </h2>
            <p className="text-xs text-white/80 font-medium leading-relaxed">
              {targetFrame
                ? `Bingkai "${targetFrame.name}" membutuhkan ${packageTitle} untuk dibuka.`
                : featureName
                ? `Fitur "${featureName}" khusus tersedia di ${packageTitle}.`
                : `Aktifkan paket untuk membuka fitur & bingkai secara penuh!`}
            </p>
          </div>

          {/* Body Content & Feature List */}
          <div className="p-6">
            {targetFrame && (
              <div className="flex items-center gap-4 bg-rose-50/60 border border-pink-100 p-3.5 rounded-2xl mb-5">
                <div className="w-16 h-20 bg-white rounded-xl border border-pink-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <img src={targetFrame.src} alt={targetFrame.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">{targetFrame.name}</h4>
                  <span className="text-[10px] font-black text-pink-600 bg-pink-100 px-2 py-0.5 rounded-md inline-block mt-1 uppercase">
                    {targetFrame.category} • {targetFrame.slots} Slot
                  </span>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Dapatkan akses langsung sekarang!</p>
                </div>
              </div>
            )}

            <div className="mb-5 pb-5 border-b border-zinc-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-black uppercase block tracking-wider mb-0.5">Biaya Akses Paket</span>
                <span className="text-3xl font-black text-purple-950">{priceText}</span>
              </div>
              <span className="text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl uppercase">
                ⏱️ {durationText}
              </span>
            </div>

            <div className="text-[10px] font-black uppercase tracking-wider text-purple-900/60 mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Benefit Spesial Yang Kamu Dapatkan:
            </div>

            <ul className="space-y-2.5 text-xs font-medium text-zinc-700 mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>✨ <strong>100% Bebas Watermark</strong> pada hasil foto &amp; download.</span>
              </li>
              {isPremium ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🖼️ <strong>Bebas Upload Custom Canva Frame</strong> (Format PNG &amp; SVG).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>📸 <strong>Extended Studio Grid 6 &amp; 8 Cut</strong> khusus grup ramai-ramai.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎨 <strong>Full Custom Color Picker HEX, Border, Shadow, &amp; Wallpaper</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>💌 <strong>Kirim Kado Amplop Digital 3D &amp; Voice Note WhatsApp</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🌟 <strong>Dynamic Sparkles, Glitter, Sakura &amp; Love Overlays</strong>.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎨 <strong>Akses Semua Bingkai Estetik</strong> (Korean, Y2K, Polaroid, Cute, Retro, Filmstrip).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎀 <strong>Full Sticker Studio &amp; Text Overlay Custom</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>📱 <strong>Hasil HD Jernih + Instant QR Code Download</strong>.</span>
                  </li>
                </>
              )}
            </ul>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUpgrade}
                className={`flex-1 py-3.5 ${isPremium ? 'bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 hover:from-purple-900 hover:to-indigo-950 text-white border border-white/20 shadow-xl' : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30'} font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all`}
              >
                <span>Aktifkan Sekarang 🔥</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    {/* Checkout Simulator Modal */}
    <CheckoutModal
      isOpen={isCheckoutOpen}
      onClose={() => {
        setIsCheckoutOpen(false);
        onClose();
      }}
      targetTier={targetTier}
    />
    </>
  );
};
