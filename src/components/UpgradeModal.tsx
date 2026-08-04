import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Check, ArrowRight } from 'lucide-react';
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
  featureName: _featureName,
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen && !isCheckoutOpen) return null;

  const isPremium = targetTier === 'premium';
  const priceText = isPremium ? 'Rp 135.000' : 'Rp 25.000';
  const durationText = isPremium ? 'Pass 60 Hari (2 Bulan Bebas Foto)' : 'Pass 24 Jam (Foto Sepuasnya)';

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
          <div className={`p-6 pb-5 relative ${isPremium ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white' : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white'}`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md">
                {isPremium ? <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-bounce" /> : <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/30">
                {isPremium ? '⭐ VIP EKSKLUSIF' : '🎁 TRIAL 2 SESI HABIS'}
              </span>
            </div>

            <h2 className="font-serif font-bold text-2xl tracking-tight text-white mb-1">
              {isPremium ? 'Buka Paket PREMIUM VIP! 👑' : 'Buka Kunci SEMUA Frame! 🔓'}
            </h2>
            <p className="text-xs text-white/90 font-medium leading-relaxed">
              {isPremium
                ? `Fitur khusus ini membutuhkan Paket PREMIUM VIP (Pass 60 Hari & Upload Canva).`
                : `Woohoo! Kamu sudah menyelesaikan 2 Sesi Foto Gratis (dengan unduhan HD). Upgrade ke Paket BASIC (Rp 25.000) untuk membuka SEMUA bingkai & foto sepuasnya tanpa batas 24 Jam!`}
            </p>
          </div>

          {/* Body Content & Feature List */}
          <div className="p-6">
            {targetFrame && (
              <div className="flex items-center gap-4 bg-rose-50/80 border-2 border-pink-200 p-3.5 rounded-2xl mb-5 shadow-inner">
                <div className="w-16 h-20 bg-white rounded-xl border border-pink-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <img src={targetFrame.src} alt={targetFrame.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">{targetFrame.name}</h4>
                  <span className="text-[10px] font-black text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-md inline-block mt-1 uppercase">
                    {targetFrame.category} • {targetFrame.slots} Slot
                  </span>
                  <p className="text-[10px] text-pink-700 font-bold mt-1">Unlock bingkai ini sekarang!</p>
                </div>
              </div>
            )}

            <div className="mb-5 pb-5 border-b border-zinc-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-black uppercase block tracking-wider mb-0.5">Biaya Akses Unlimited</span>
                <div className="flex items-baseline gap-2">
                  {!isPremium && <span className="text-xs text-zinc-400 line-through font-bold">Rp 35.000</span>}
                  <span className="text-3xl font-black text-purple-950">{priceText}</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-xl uppercase shadow-xs">
                ⏱️ {durationText}
              </span>
            </div>

            <div className="text-[10px] font-black uppercase tracking-wider text-purple-900/70 mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Benefit Langsung Yang Kamu Dapatkan:
            </div>

            <ul className="space-y-2.5 text-xs font-medium text-zinc-700 mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>✨ <strong>100% Bebas Watermark</strong> pada hasil foto &amp; unduhan HD.</span>
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
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>⚡ <strong>Fitur Foto Ulang (Retake) Tanpa Batas</strong> per slot foto.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🔓 <strong>UNLOCK SEMUA Frame Studio</strong> (Korean, Y2K, Polaroid, Cute, Retro, Filmstrip).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>🎀 <strong>Bebas Foto &amp; Unduh Sepuasnya 24 Jam</strong> tanpa batasan 2 sesi.</span>
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
                className={`flex-1 py-3.5 ${isPremium ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200/50' : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md'} font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all`}
              >
                <span>{isPremium ? 'Beli VIP (135k)' : 'Unlock All Frame (25k) 🔓'}</span>
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
