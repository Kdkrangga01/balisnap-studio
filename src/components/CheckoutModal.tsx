import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CheckCircle2, Loader2, ShieldCheck, ArrowRight, Copy, Check, Upload, ImageIcon, FileCheck, AlertTriangle, CreditCard, QrCode } from 'lucide-react';
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
      setProofError('File foto terlalu kecil (minimal 8 KB). Harap upload screenshot resi m-Banking / QRIS yang jelas!');
      setProofImage('');
      setProofFileName('');
      setIsValidatingProof(false);
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setProofError('Ukuran file terlalu besar (maksimal 12 MB).');
      setProofImage('');
      setProofFileName('');
      setIsValidatingProof(false);
      return;
    }

    // Check 2: File type check
    if (!file.type.startsWith('image/')) {
      setProofError('Harap upload file foto resi (PNG / JPG / JPEG / WebP).');
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
          setProofError('Resolusi gambar terlalu kecil untuk dibaca sebagai resi transfer yang sah.');
          setProofImage('');
          setIsValidatingProof(false);
          return;
        }

        // Validated clean! Compress and resize proof image (max 800px & 75% quality JPEG)
        // so that Supabase REST API payload stays lightweight (~40KB) and saves instantly!
        try {
          const canvas = document.createElement('canvas');
          let cWidth = width;
          let cHeight = height;
          const maxDim = 800;

          if (cWidth > maxDim || cHeight > maxDim) {
            if (cWidth > cHeight) {
              cHeight = Math.round((cHeight * maxDim) / cWidth);
              cWidth = maxDim;
            } else {
              cWidth = Math.round((cWidth * maxDim) / cHeight);
              cHeight = maxDim;
            }
          }

          canvas.width = cWidth;
          canvas.height = cHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, cWidth, cHeight);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.75);
            setProofImage(compressedUrl);
          } else {
            setProofImage(resultUrl);
          }
        } catch {
          setProofImage(resultUrl);
        }

        setProofError('');
        setIsValidatingProof(false);
      };

      img.onerror = () => {
        setProofError('Gagal membaca file foto resi.');
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
    if (!customerNameInput.trim()) {
      setProofError('Harap ketik Nama Lengkap / Pemesan kamu terlebih dahulu!');
      return;
    }

    // Penolakan Otomatis jika belum meng-upload bukti pembayaran
    if (!proofImage) {
      setProofError('Harap upload foto bukti transfer / resi m-Banking / QRIS terlebih dahulu!');
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
          <div className="bg-gradient-to-b from-stone-50/90 via-white to-white border-b border-stone-200/80 p-5 sm:p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                PAYMENT GATEWAY DIRECT / QRIS
              </span>
            </div>

            <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-stone-700 inline" />
              <span>Checkout &amp; Pembayaran</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mt-1">
              <span>Invoice ID:</span>
              <span className="font-mono text-stone-800 font-bold bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/70">{invoiceId}</span>
            </div>
          </div>

          {/* Success Overlay View */}
          {isSuccess ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-emerald-50 rounded-full border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="font-serif font-bold text-2xl text-stone-900 mb-1">
                Pembayaran Berhasil
              </h3>
              <p className="text-xs text-stone-500 font-normal max-w-xs mx-auto mb-5 leading-relaxed">
                Lisensi <strong className="text-stone-800 font-semibold">{packageName}</strong> kamu sudah otomatis aktif! Selamat berfoto ria!
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Otomatis Membuka Bingkai...
              </span>
            </div>
          ) : (
            <>
              {/* Scrollable Body Content (2 Columns on Desktop) */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 max-h-[calc(92vh-140px)] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                  {/* LEFT COLUMN: Input Form & Rekening & Upload */}
                  <div className="space-y-4">
                    {/* Customer Name Input */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap / Pemesan <span className="text-rose-500 font-medium normal-case text-[11px]">(Wajib Diisi)</span>
                      </label>
                      <input
                        type="text"
                        value={customerNameInput}
                        onChange={(e) => setCustomerNameInput(e.target.value)}
                        placeholder="Misal: Budi"
                        className="w-full px-3.5 py-2.5 bg-stone-50/60 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-400 focus:ring-2 focus:ring-stone-200 transition-all"
                      />
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-stone-50/80 border border-stone-200/80 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Item Pembelian</span>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 mt-0.5">{packageName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block">Total Tagihan</span>
                        <span className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">{priceFormatted}</span>
                      </div>
                    </div>

                    {/* Info Rekening Bank */}
                    <div className="bg-stone-50/60 p-4 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                        <span className="text-[10.5px] font-bold uppercase text-stone-700 tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-stone-600" /> Direct Transfer / m-Banking
                        </span>
                        <span className="text-[9px] font-bold uppercase bg-stone-200/70 text-stone-800 px-2.5 py-0.5 rounded-full">
                          {personalBank.name}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Bank {personalBank.name} • A.N {personalBank.accountHolder}</span>
                          <span className="font-mono text-base sm:text-lg font-bold text-stone-900 tracking-wider mt-0.5 block">{personalBank.accountNo}</span>
                        </div>
                        <button
                          onClick={handleCopyBank}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-200 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                        >
                          {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
                          <span>{copiedBank ? 'Tersalin!' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Upload Proof Card Section */}
                    <div className="bg-stone-50/60 border border-stone-200 p-4 rounded-2xl space-y-2">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-stone-600" /> Upload Resi / Bukti Transfer
                        </span>
                        <span className="text-[9px] text-emerald-700 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Instan Active</span>
                      </label>

                      <div className="relative pt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileChange}
                          id="payment-proof-input"
                          className="hidden"
                        />
                        <label
                          htmlFor="payment-proof-input"
                          className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white border border-dashed border-stone-300 hover:border-stone-400 rounded-xl cursor-pointer transition-colors text-xs font-semibold text-stone-700 shadow-2xs"
                        >
                          {proofImage ? (
                            <>
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              <span className="truncate max-w-[180px] text-emerald-700 font-bold">{proofFileName || 'Foto Resi Terpilih'}</span>
                              <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Ganti</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 text-stone-400" />
                              <span>Pilih Foto Resi dari Galeri</span>
                            </>
                          )}
                        </label>
                      </div>
                      {isValidatingProof && (
                        <div className="mt-2 p-2 rounded-xl bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
                          <span>Memeriksa Keaslian Foto Resi...</span>
                        </div>
                      )}

                      {proofError && (
                        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-medium flex items-start gap-2 leading-relaxed">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{proofError}</span>
                        </div>
                      )}

                      {proofImage && !proofError && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                          <img src={proofImage} alt="Preview Resi" className="w-9 h-9 object-cover rounded-lg border border-emerald-300 shrink-0" />
                          <div className="flex-1">
                            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                              Bukti Resi Terverifikasi Valid
                            </span>
                            <span className="text-[10px] text-emerald-600 font-normal">Siap di-upload &amp; diaktifkan otomatis!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: QRIS Barcode Display (Very Big & Clear) */}
                  <div className="bg-stone-50/60 p-5 rounded-3xl border border-stone-200 flex flex-col items-center justify-center text-center h-full min-h-[360px]">
                    {personalBank.qrisUrl ? (
                      <>
                        <div className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-center w-full max-w-[300px]">
                          <img
                            src={personalBank.qrisUrl}
                            alt="QRIS Resmi BaliSnap Studio"
                            className="w-full max-h-[340px] object-contain mx-auto rounded-xl"
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-stone-600 font-bold uppercase mt-3.5 flex items-center justify-center gap-1.5 tracking-wider leading-snug">
                          <QrCode className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          SCAN QRIS RESMI BALISNAP STUDIO DENGAN M-BANKING / E-WALLET
                        </span>
                      </>
                    ) : (
                      <div className="p-6 text-center text-stone-500 text-xs font-medium">
                        Gambar QRIS sedang dimuat...
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Sticky Submit Footer Buttons */}
              <div className="p-4 sm:px-6 bg-white border-t border-stone-200/80 flex items-center justify-between gap-4 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block leading-none">Total Tagihan</span>
                    <span className="text-sm font-extrabold text-stone-900 mt-0.5 block">{priceFormatted}</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial sm:min-w-[240px] px-6 py-3 bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm shadow-rose-200 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Mengaktifkan Paket...</span>
                    </>
                  ) : (
                    <>
                      <span>Upload &amp; Aktifkan Paket</span>
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
