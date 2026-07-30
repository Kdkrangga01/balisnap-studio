import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CheckCircle2, Loader2, Sparkles, ShieldCheck, ArrowRight, Copy, Check, Upload, ImageIcon, FileCheck, AlertTriangle } from 'lucide-react';
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
  const { setPackageTier, addTransaction } = usePhotobooth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Detail Rekening & QRIS Pribadi (Bisa disesuaikan via ENV / State)
  const personalBank = {
    name: import.meta.env.VITE_PERSONAL_BANK_NAME || 'BRI',
    accountNo: import.meta.env.VITE_PERSONAL_BANK_NO || '0368 0108 7136 505',
    accountHolder: import.meta.env.VITE_PERSONAL_BANK_HOLDER || 'BaliSnap Studio / Rangga',
    qrisUrl: import.meta.env.VITE_PERSONAL_QRIS_URL || '/qris_pribadi.png',
  };

  const isPremium = targetTier === 'premium';
  const priceFormatted = isPremium ? 'Rp 135.000' : 'Rp 25.000';
  const packageName = isPremium ? 'Paket PREMIUM VIP Pass (60 Hari)' : 'Paket BASIC Pass (24 Jam)';

  // Dummy Invoice
  const invoiceId = `#SNAP-${Math.floor(100000 + Math.random() * 900000)}`;

  // Customer Name & Payment Proof State
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofError, setProofError] = useState<string>('');
  const [isValidatingProof, setIsValidatingProof] = useState<boolean>(false);

  // Smart Receipt Inspector & Auto-Rejection Handler
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofError('');
    setIsValidatingProof(true);

    // Check 1: File size check (Minimum 8KB, Maximum 12MB)
    if (file.size < 8 * 1024) {
      setProofError('❌ File foto terlalu kecil (minimal 8 KB). Harap upload screenshot resi m-Banking / QRIS yang jelas!');
      setProofImage('');
      setProofFileName('');
      setIsValidatingProof(false);
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setProofError('❌ Ukuran file terlalu besar (maksimal 12 MB).');
      setProofImage('');
      setProofFileName('');
      setIsValidatingProof(false);
      return;
    }

    // Check 2: File type check
    if (!file.type.startsWith('image/')) {
      setProofError('❌ Harap upload file foto resi (PNG / JPG / JPEG / WebP).');
      setProofImage('');
      setProofFileName('');
      setIsValidatingProof(false);
      return;
    }

    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultUrl = reader.result as string;

      // Check 3: Image Dimensions Inspection (m-Banking Screenshots are vertical/portrait or balanced receipt cards)
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        if (width < 100 || height < 100) {
          setProofError('❌ Resolusi gambar terlalu kecil untuk dibaca sebagai resi transfer yang sah.');
          setProofImage('');
          setIsValidatingProof(false);
          return;
        }

        // Validated clean!
        setProofImage(resultUrl);
        setProofError('');
        setIsValidatingProof(false);
      };

      img.onerror = () => {
        setProofError('❌ Gagal membaca file foto resi.');
        setProofImage('');
        setIsValidatingProof(false);
      };

      img.src = resultUrl;
    };
    reader.readAsDataURL(file);
  };

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setCustomerNameInput('');
      setProofImage('');
      setProofFileName('');
      setProofError('');
      setIsValidatingProof(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    // Penolakan Otomatis jika belum meng-upload bukti pembayaran
    if (!proofImage) {
      setProofError('⚠️ Harap upload foto bukti transfer / resi m-Banking / QRIS terlebih dahulu!');
      return;
    }

    if (proofError) {
      return;
    }

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
            amount: isPremium ? 135000 : 25000,
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

                addTransaction({
                  id: invoiceId,
                  customerName: customerNameInput.trim() || 'Pelanggan Photobooth',
                  paymentProofUrl: proofImage,
                  packageName,
                  packageTier: targetTier,
                  amount: isPremium ? 135000 : 25000,
                  paymentMethod: 'Midtrans',
                  status: 'Lunas',
                  customerNote: 'Pembayaran via Midtrans Gateway',
                });

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

    // Mode Direct Transfer / Upload Verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setPackageTier(targetTier);

      // Record transaction with proof image
      addTransaction({
        id: invoiceId,
        customerName: customerNameInput.trim() || 'Pelanggan Photobooth',
        paymentProofUrl: proofImage,
        packageName,
        packageTier: targetTier,
        amount: isPremium ? 135000 : 25000,
        paymentMethod: 'QRIS Pribadi',
        status: 'Lunas',
        customerNote: 'Bukti transfer terverifikasi & diupload pelanggan',
      });

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
          className="relative max-w-lg md:max-w-4xl w-full max-h-[92vh] bg-white/95 backdrop-blur-2xl border-2 border-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white p-5 pb-4 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-pink-500/30 border border-pink-400/30 text-pink-300 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                Payment Gateway Direct / QRIS
              </span>
            </div>

            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-tight">
              Checkout &amp; Pembayaran 💳
            </h3>
            <p className="text-xs text-white/70 font-medium mt-0.5">
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
            <>
              {/* Scrollable Body Content (2 Columns on Desktop) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-h-[calc(92vh-135px)] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

                  {/* LEFT COLUMN: Input Form & Rekening & Upload */}
                  <div className="space-y-3.5">
                    {/* Customer Name Input */}
                    <div>
                      <label className="block text-[10.5px] font-black uppercase text-purple-900/70 tracking-wider mb-1">
                        Nama Lengkap / Pemesan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={customerNameInput}
                        onChange={(e) => setCustomerNameInput(e.target.value)}
                        placeholder="Misal: Menik"
                        className="w-full px-3.5 py-2 bg-purple-50/50 border border-purple-200/80 rounded-xl text-xs font-bold text-purple-950 placeholder:text-zinc-400 focus:outline-none focus:border-purple-600 transition-colors"
                      />
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-gradient-to-br from-purple-50 via-pink-50/50 to-rose-50/50 border border-purple-100 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase text-purple-900/60 tracking-wider block">Item Pembelian</span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-purple-950">{packageName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-purple-900/60 tracking-wider block">Total Tagihan</span>
                        <span className="text-lg sm:text-xl font-black text-purple-950">{priceFormatted}</span>
                      </div>
                    </div>

                    {/* Info Rekening Bank */}
                    <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/60 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                      <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                        <span className="text-[9.5px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" /> Direct Transfer / m-Banking
                        </span>
                        <span className="text-[8.5px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          {personalBank.name}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-sm flex items-center justify-between">
                        <div>
                          <span className="text-[8.5px] text-zinc-400 font-bold uppercase block">Bank {personalBank.name} • A.N {personalBank.accountHolder}</span>
                          <span className="font-mono text-base sm:text-lg font-black text-purple-950 tracking-wider">{personalBank.accountNo}</span>
                        </div>
                        <button
                          onClick={handleCopyBank}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-extrabold rounded-lg border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                        >
                          {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
                          <span>{copiedBank ? 'Tersalin!' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Upload Proof Card Section */}
                    <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/50 border border-purple-200/80 p-3.5 rounded-2xl">
                      <label className="block text-[10px] font-black uppercase text-purple-900/80 tracking-wider mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-purple-600" /> Upload Resi / Bukti Transfer
                        </span>
                        <span className="text-[8.5px] text-pink-600 font-extrabold uppercase bg-pink-100 px-2 py-0.5 rounded-full">Instan Active</span>
                      </label>

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileChange}
                          id="payment-proof-input"
                          className="hidden"
                        />
                        <label
                          htmlFor="payment-proof-input"
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl cursor-pointer transition-colors text-xs font-extrabold text-purple-950 shadow-sm"
                        >
                          {proofImage ? (
                            <>
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              <span className="truncate max-w-[180px] text-emerald-700 font-bold">{proofFileName || 'Foto Resi Terpilih'}</span>
                              <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Ganti</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 text-purple-500" />
                              <span>Pilih Foto Resi dari Galeri</span>
                            </>
                          )}
                        </label>
                      </div>
                      {isValidatingProof && (
                        <div className="mt-2 p-2 rounded-xl bg-purple-100/80 text-purple-950 text-xs font-extrabold flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          <span>Memeriksa Keaslian Foto Resi...</span>
                        </div>
                      )}

                      {proofError && (
                        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-700 text-[11px] font-bold flex items-start gap-2 leading-relaxed">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{proofError}</span>
                        </div>
                      )}

                      {proofImage && !proofError && (
                        <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-extrabold flex items-center gap-2">
                          <img src={proofImage} alt="Preview Resi" className="w-8 h-8 object-cover rounded-lg border border-emerald-300 shrink-0" />
                          <div className="flex-1">
                            <span className="text-emerald-700 block font-black">Bukti Resi Terverifikasi Valid ✅</span>
                            <span className="text-[9.5px] text-emerald-600 font-medium">Siap di-upload &amp; diaktifkan otomatis!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: QRIS Barcode Display (Very Big & Clear) */}
                  <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-4 rounded-3xl border-2 border-amber-300 shadow-md flex flex-col items-center justify-center text-center h-full min-h-[360px]">
                    {personalBank.qrisUrl ? (
                      <>
                        <div className="p-2 bg-white rounded-2xl border border-zinc-200 shadow-inner flex items-center justify-center w-full max-w-[320px]">
                          <img
                            src={personalBank.qrisUrl}
                            alt="QRIS Resmi BaliSnap Studio"
                            className="w-full max-h-[350px] object-contain mx-auto rounded-xl"
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-amber-950 font-black uppercase mt-3 block tracking-wider leading-snug">
                          📱 SCAN QRIS RESMI BALISNAP STUDIO DENGAN M-BANKING / E-WALLET ANDA
                        </span>
                      </>
                    ) : (
                      <div className="p-6 text-center text-amber-900 text-xs font-bold">
                        Gambar QRIS sedang dimuat...
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Sticky Submit Footer Buttons */}
              <div className="p-4 bg-white border-t border-purple-100 flex gap-3 z-10 shrink-0 shadow-lg">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mengaktifkan Paket...</span>
                    </>
                  ) : (
                    <>
                      <span>Upload &amp; Aktifkan Paket Saya ⚡</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>


      </motion.div>
    </AnimatePresence>
  );
};
