import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, ShieldCheck, Check, ArrowRight, Clock } from 'lucide-react';
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
          <div className={`p-6 pb-5 relative ${isPremium ? 'bg-zinc-900 text-white border-b border-amber-500/20' : 'bg-zinc-900 text-white border-b border-zinc-800'}`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">
                {isPremium ? <Crown className="w-4 h-4 text-amber-300" /> : <ShieldCheck className="w-4 h-4 text-teal-300" />}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isPremium ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                {isPremium ? 'VIP EKSKLUSIF' : 'KUOTA TRIAL HABIS'}
              </span>
            </div>

            <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-white mb-1">
              {isPremium ? 'Buka Paket PREMIUM VIP' : 'Buka Kunci SEMUA Frame'}
            </h2>
            <p className="text-xs text-zinc-400 font-normal leading-relaxed">
              {isPremium
                ? `Fitur khusus ini membutuhkan Paket PREMIUM VIP (Pass 60 Hari & Upload Canva).`
                : `Kamu telah menyelesaikan 2 Sesi Foto Gratis. Upgrade ke Paket BASIC (Rp 25.000) untuk membuka SEMUA bingkai & foto sepuasnya tanpa batas 24 Jam.`}
            </p>
          </div>

          {/* Body Content & Feature List */}
          <div className="p-6">
            {targetFrame && (
              <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl mb-5">
                <div className="w-16 h-20 bg-white rounded-xl border border-zinc-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  <img src={targetFrame.src} alt={targetFrame.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 leading-tight">{targetFrame.name}</h4>
                  <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-200/80 px-2.5 py-0.5 rounded-md inline-block mt-1 uppercase">
                    {targetFrame.category} • {targetFrame.slots} Slot
                  </span>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">Unlock bingkai ini sekarang</p> 
                </div>
              </div>
            )}

            <div className="mb-5 pb-5 border-b border-zinc-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-semibold uppercase block tracking-wider mb-0.5">Biaya Akses Unlimited</span>
                <div className="flex items-baseline gap-2">
                  {!isPremium && <span className="text-xs text-zinc-400 line-through font-bold">Rp 35.000</span>}
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900">{priceText}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl uppercase inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{durationText}</span>
              </span>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-zinc-400" /> Benefit Yang Kamu Dapatkan:
            </div>

            <ul className="space-y-2.5 text-xs font-medium text-zinc-700 mb-6">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>100% Bebas Watermark</strong> pada hasil foto &amp; unduhan HD.</span>
              </li>
              {isPremium ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bebas Upload Custom Canva Frame</strong> (Format PNG &amp; SVG).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Extended Studio Grid 6 &amp; 8 Cut</strong> khusus grup ramai-ramai.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Full Custom Color Picker HEX, Border, Shadow, &amp; Wallpaper</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Kirim Kado Amplop Digital 3D &amp; Voice Note WhatsApp</strong>.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Fitur Foto Ulang (Retake) Tanpa Batas</strong> per slot foto.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>UNLOCK SEMUA Frame Studio</strong> (Korean, Y2K, Polaroid, Cute, Retro, Filmstrip).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bebas Foto &amp; Unduh Sepuasnya 24 Jam</strong> tanpa batasan 2 sesi.</span>
                  </li>
                </>
              )}
            </ul>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                <span>{isPremium ? 'Beli VIP (135k)' : 'Unlock All Frame (25k)'}</span>
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
