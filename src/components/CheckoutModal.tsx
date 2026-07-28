import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CreditCard, Building2, CheckCircle2, Loader2, Sparkles, ShieldCheck, ArrowRight, Copy, Check, Clock } from 'lucide-react';
import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: PackageTier;
  onSuccess?: () => void;
}

type PaymentMethod = 'qris' | 'va' | 'card';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  targetTier,
  onSuccess,
}) => {
  const { setPackageTier } = usePhotobooth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('bca');
  const [copiedVa, setCopiedVa] = useState(false);

  const isPremium = targetTier === 'premium';
  const priceFormatted = isPremium ? 'Rp 120.000' : 'Rp 25.000';
  const packageName = isPremium ? 'Paket PREMIUM VIP Pass (60 Hari)' : 'Paket BASIC Pass (24 Jam)';

  // Dummy Invoice & VA numbers
  const invoiceId = `#SNAP-${Math.floor(100000 + Math.random() * 900000)}`;
  const vaNumber = `88019${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setPaymentMethod('qris');
      setCopiedVa(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
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

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
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

              {/* Payment Method Selector Tabs */}
              <div className="mb-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">Pilih Metode Pembayaran</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'bg-purple-950 text-white border-purple-900 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-pink-400" />
                    <span>QRIS Instant</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('va')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'va'
                        ? 'bg-purple-950 text-white border-purple-900 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-pink-400" />
                    <span>Virtual Account</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-purple-950 text-white border-purple-900 shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-pink-400" />
                    <span>Kartu Kredit</span>
                  </button>
                </div>
              </div>

              {/* Payment Method Content */}
              {paymentMethod === 'qris' && (
                <div className="bg-zinc-900 text-white p-5 rounded-3xl border border-zinc-800 text-center mb-6">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2.5">
                    <span className="text-[10px] font-black uppercase text-pink-400 tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Masa Berlaku: 14:59
                    </span>
                    <span className="text-[9px] font-black uppercase bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
                      All E-Wallet &amp; M-Banking
                    </span>
                  </div>

                  {/* Simulated QR Code Graphic */}
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto mb-3 shadow-xl border-2 border-pink-500/30 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full bg-zinc-950 p-2 rounded-xl flex items-center justify-center">
                      {/* Stylized QRIS Grid SVG Simulation */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                        <rect x="5" y="5" width="30" height="30" fill="white" />
                        <rect x="10" y="10" width="20" height="20" fill="black" />
                        <rect x="15" y="15" width="10" height="10" fill="white" />

                        <rect x="65" y="5" width="30" height="30" fill="white" />
                        <rect x="70" y="10" width="20" height="20" fill="black" />
                        <rect x="75" y="15" width="10" height="10" fill="white" />

                        <rect x="5" y="65" width="30" height="30" fill="white" />
                        <rect x="10" y="70" width="20" height="20" fill="black" />
                        <rect x="15" y="75" width="10" height="10" fill="white" />

                        <rect x="42" y="10" width="16" height="16" fill="white" />
                        <rect x="42" y="42" width="16" height="16" fill="pink" />
                        <rect x="65" y="42" width="25" height="10" fill="white" />
                        <rect x="42" y="65" width="16" height="25" fill="white" />
                        <rect x="65" y="65" width="25" height="25" fill="white" />
                      </svg>
                    </div>
                    <span className="absolute bottom-1 bg-pink-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-md">
                      QRIS BALISNAP
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-medium">
                    Scan menggunakan BCA Mobile, GoPay, OVO, DANA, ShopeePay, atau Mobile Banking pilihanmu.
                  </p>
                </div>
              )}

              {paymentMethod === 'va' && (
                <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-200 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">Pilih Bank Virtual Account</span>
                  <div className="flex gap-2 mb-4">
                    {['bca', 'mandiri', 'bni', 'bri'].map((bank) => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          selectedBank === bank ? 'bg-purple-950 text-white border-purple-900 shadow-sm' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Nomor Virtual Account ({selectedBank.toUpperCase()})</span>
                      <span className="font-mono text-base font-black text-purple-950 tracking-wider">{vaNumber}</span>
                    </div>
                    <button
                      onClick={handleCopyVa}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-extrabold rounded-xl border border-purple-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedVa ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-200 mb-6 space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Nomor Kartu Kredit / Debit</label>
                    <input
                      type="text"
                      readOnly
                      value="4532 •••• •••• 8910"
                      className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-700 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Masa Berlaku</label>
                      <input type="text" readOnly value="12 / 28" className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-700" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">CVV</label>
                      <input type="text" readOnly value="•••" className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-700" />
                    </div>
                  </div>
                </div>
              )}

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
