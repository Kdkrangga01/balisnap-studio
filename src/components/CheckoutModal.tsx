import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CheckCircle2, Loader2, Sparkles, ShieldCheck, ArrowRight, Copy, Check } from 'lucide-react';
import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: PackageTier;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  targetTier,
  onSuccess,
}) => {
  const { setPackageTier } = usePhotobooth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Detail Rekening & QRIS Pribadi (Bisa disesuaikan via ENV / State)
  const personalBank = {
    name: import.meta.env.VITE_PERSONAL_BANK_NAME || 'BRI',
    accountNo: import.meta.env.VITE_PERSONAL_BANK_NO || '0368 0108 7136 505',
    accountHolder: import.meta.env.VITE_PERSONAL_BANK_HOLDER || 'BaliSnap Studio / Rangga',
    qrisUrl: import.meta.env.VITE_PERSONAL_QRIS_URL || '',
  };

  const isPremium = targetTier === 'premium';
  const priceFormatted = isPremium ? 'Rp 120.000' : 'Rp 25.000';
  const packageName = isPremium ? 'Paket PREMIUM VIP Pass (60 Hari)' : 'Paket BASIC Pass (24 Jam)';

  // Dummy Invoice
  const invoiceId = `#SNAP-${Math.floor(100000 + Math.random() * 900000)}`;

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);

    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const isSandbox = import.meta.env.VITE_MIDTRANS_IS_SANDBOX !== 'false';

    // Jika Client Key Midtrans telah terpasang di .env, panggil Midtrans Snap Popup SDK!
    if (clientKey && clientKey !== 'SB-Mid-client-xxxxxxxxxxxxxx') {
      try {
        // Panggil endpoint backend / API untuk buat Transaction Snap Token
        const response = await fetch('/api/midtrans/create-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: invoiceId.replace('#', ''),
            amount: isPremium ? 120000 : 25000,
            packageName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            const { triggerMidtransSnapPayment } = await import('../lib/midtrans');
            await triggerMidtransSnapPayment({
              snapToken: data.token,
              clientKey,
              isSandbox,
              onSuccess: () => {
                setIsProcessing(false);
                setIsSuccess(true);
                setPackageTier(targetTier);
                setTimeout(() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }, 1800);
              },
              onError: (err) => {
                console.error("Midtrans Payment Error:", err);
                setIsProcessing(false);
              },
              onClose: () => {
                setIsProcessing(false);
              }
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Server Midtrans backend belum aktif, beralih ke mode Simulasi Testing:", err);
      }
    }

    // Mode Simulasi / Dev Sandbox jika API Key belum dikonfigurasi
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setPackageTier(targetTier);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    }, 1500);
  };

  const handleCopyBank = () => {
    navigator.clipboard.writeText(personalBank.accountNo);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 26 } },
    exit: { opacity: 0, scale: 0.92, y: 15, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[110] bg-zinc-950/75 backdrop-blur-md flex items-center justify-center p-4 select-none"
        onClick={onClose}
      >
        <motion.div
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-w-lg w-full bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white p-6 pb-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-pink-500/30 border border-pink-400/30 text-pink-300 text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                Midtrans Payment Gateway Simulator
              </span>
            </div>

            <h3 className="font-serif font-bold text-2xl text-white tracking-tight">
              Checkout &amp; Pembayaran 💳
            </h3>
            <p className="text-xs text-white/70 font-medium mt-1">
              Invoice ID: <span className="font-mono text-pink-300 font-bold">{invoiceId}</span>
            </p>
          </div>

          {/* Success Overlay View */}
          {isSuccess ? (
            <div className="p-8 text-center flex flex-col items-center justify-center my-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-emerald-100 rounded-full border-4 border-emerald-300 flex items-center justify-center text-emerald-600 mb-4 shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="font-serif font-bold text-2xl text-purple-950 mb-1">
                Pembayaran Berhasil! 🎉
              </h3>
              <p className="text-xs text-zinc-500 font-semibold max-w-xs mx-auto mb-4">
                Lisensi <strong className="text-pink-600">{packageName}</strong> kamu sudah otomatis aktif! Selamat berfoto ria!
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full border border-emerald-200 animate-pulse">
                <Sparkles className="w-4 h-4" /> Otomatis Membuka Bingkai...
              </span>
            </div>
          ) : (
            <div className="p-6">
              {/* Order Summary Card */}
              <div className="bg-gradient-to-br from-purple-50 via-pink-50/50 to-rose-50/50 border border-purple-100 p-4 rounded-2xl mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-900/60 tracking-wider block">Item Pembelian</span>
                  <h4 className="font-extrabold text-sm text-purple-950">{packageName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-purple-900/60 tracking-wider block">Total Tagihan</span>
                  <span className="text-xl font-black text-purple-950">{priceFormatted}</span>
                </div>
              </div>

              {/* Direct Bank Transfer Section */}
              <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-pink-50/60 p-4 rounded-3xl border border-amber-200/80 mb-6 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" /> Transfer Bank Direct
                  </span>
                  <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {personalBank.name}
                  </span>
                </div>

                {/* Info Rekening */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] text-zinc-400 font-bold uppercase block">Bank {personalBank.name} • A.N {personalBank.accountHolder}</span>
                    <span className="font-mono text-xl font-black text-purple-950 tracking-wider">{personalBank.accountNo}</span>
                  </div>
                  <button
                    onClick={handleCopyBank}
                    className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold rounded-xl border border-amber-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedBank ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-700" />}
                    <span>{copiedBank ? 'Tersalin!' : 'Salin Rekening'}</span>
                  </button>
                </div>

                {/* QRIS Asli Jika Tersedia atau Panduan Transfer */}
                {personalBank.qrisUrl ? (
                  <div className="text-center bg-white p-3 rounded-2xl border border-amber-200/60 shadow-sm">
                    <img src={personalBank.qrisUrl} alt="QRIS Bank Pribadi" className="w-36 h-36 object-contain mx-auto rounded-xl" />
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase mt-1 block">Scan QRIS Resmi Bank / E-Wallet Anda</span>
                  </div>
                ) : (
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/50 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                      💳 Cara Pembayaran Transfer Bank:
                    </span>
                    <p className="text-[10px] text-amber-900/80 font-medium leading-relaxed">
                      1. Buka aplikasi m-Banking (BRImo, BCA Mobile, Livin, DANA, dll) lalu pilih menu <strong>Transfer Bank</strong>.<br />
                      2. Masukkan nomor rekening <strong className="font-mono">{personalBank.accountNo}</strong> (A.N {personalBank.accountHolder}).<br />
                      3. Transfer nominal sebesar <strong className="text-pink-600 font-black">{priceFormatted}</strong> lalu klik <strong>"Simulasi Bayar Sekarang ⚡"</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Simulation Submit Button */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-5 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Simulasi Bayar Sekarang ⚡</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
