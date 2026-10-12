import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Mic, Square, Play, Pause, Send, X, Download, Upload, Image as ImageIcon, Trash2, CheckCircle2, Copy, Check, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

import { getBestAudioMimeType, getAudioExtension, createMobileAudioElement } from '../lib/mobileAudio';

interface DigitalEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoStripUri: string | null;
}

export const DigitalEnvelopeModal: React.FC<DigitalEnvelopeModalProps> = ({
  isOpen,
  onClose,
  photoStripUri,
}) => {
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // Custom Gift Photo Upload State
  const [customGiftPhoto, setCustomGiftPhoto] = useState<string | null>(null);
  const activePhoto = customGiftPhoto || photoStripUri;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomGiftPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Merekam Suara (Voice Note 10s) - MOBIL / CROSS-PLATFORM SUPPORT
  const startRecording = async () => {
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      setIsPlayingAudio(false);
      setAudioUrl(null);
      setAudioBase64(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getBestAudioMimeType();
      setRecordedMimeType(mimeType);

      const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const actualType = recorder.mimeType || mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = reader.result as string;
          setAudioBase64(b64);
          try {
            localStorage.setItem('balisnap_gift_audio', b64);
          } catch { }
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 10) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('Izin mikrofon diperlukan untuk merekam pesan suara.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayAudio = () => {
    const targetSrc = audioUrl || audioBase64;
    if (!targetSrc) return;

    if (!audioElementRef.current || audioElementRef.current.src !== targetSrc) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = createMobileAudioElement(targetSrc);
      audio.onended = () => setIsPlayingAudio(false);
      audioElementRef.current = audio;
    }

    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.load();
      audioElementRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          console.warn('Gagal memutar audio di HP:', err);
          setIsPlayingAudio(false);
        });
    }
  };

  const handleDownloadAudio = () => {
    const targetSrc = audioUrl || audioBase64;
    if (!targetSrc) return;
    const ext = getAudioExtension(recordedMimeType);
    const link = document.createElement('a');
    link.href = targetSrc;
    link.download = `voice-note-${(senderName || 'balisnap').toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch { }
  };

  const buildGiftLink = () => {
    const activeAudio = audioBase64 || audioUrl;
    const payload = {
      from: senderName || 'Seseorang',
      to: receiverName || 'Sahabatku',
      msg: giftMessage || 'Semoga hari kamu menyenangkan! ✨',
      audio: activeAudio,
      photo: activePhoto,
    };

    try {
      localStorage.setItem('balisnap_active_gift', JSON.stringify(payload));
      if (activeAudio) localStorage.setItem('balisnap_gift_audio', activeAudio);
    } catch { }

    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const hasAudio = activeAudio ? '1' : '0';

    return `${baseUrl}?gift=1&from=${encodeURIComponent(payload.from)}&to=${encodeURIComponent(payload.to)}&msg=${encodeURIComponent(payload.msg)}&audio=${hasAudio}`;
  };

  function dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyGiftLink = () => {
    const link = buildGiftLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

const createCombinedGiftCardCanvas = async (
  photoUri: string,
  fromName: string,
  toName: string,
  message: string
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(photoUri);

        const fromStr = fromName || 'Seseorang';
        const toStr = toName || 'Sahabatku';
        const msgStr = message || 'Semoga hari kamu menyenangkan! ✨';

        const padding = 36;
        const cardWidth = Math.max(800, img.width);
        const textBlockHeight = 310;
        const cardHeight = img.height + textBlockHeight + padding * 2;

        canvas.width = cardWidth;
        canvas.height = cardHeight;

        // Background Gradient - Soft Warm Studio Photobooth
        const bgGrad = ctx.createLinearGradient(0, 0, 0, cardHeight);
        bgGrad.addColorStop(0, '#FAFAF9');
        bgGrad.addColorStop(0.5, '#FFF5F6');
        bgGrad.addColorStop(1, '#FCE8EB');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // Main Card Container Background
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(padding, padding, cardWidth - padding * 2, cardHeight - padding * 2, 28);
        } else {
          ctx.rect(padding, padding, cardWidth - padding * 2, cardHeight - padding * 2);
        }
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Draw Photo at top
        const photoX = padding + 20;
        const photoY = padding + 20;
        const photoW = cardWidth - padding * 2 - 40;
        const photoH = img.height;
        ctx.drawImage(img, photoX, photoY, photoW, photoH);

        // Divider
        const cardDividerY = photoY + photoH + 28;
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(photoX, cardDividerY);
        ctx.lineTo(photoX + photoW, cardDividerY);
        ctx.stroke();

        let currentY = cardDividerY + 34;

        // Header: UNTUK & DARI
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`💌 UNTUK: ${toStr.toUpperCase()}`, photoX, currentY);

        ctx.fillStyle = '#6B7280';
        ctx.font = '500 16px sans-serif';
        ctx.fillText(`Dari: ${fromStr}`, photoX, currentY + 28);

        currentY += 68;

        // Message Box
        ctx.fillStyle = '#F9FAFB';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(photoX, currentY, photoW, 110, 16);
        } else {
          ctx.rect(photoX, currentY, photoW, 110);
        }
        ctx.fill();

        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#374151';
        ctx.font = 'italic 17px sans-serif';

        const words = msgStr.split(' ');
        let line = '';
        let lineY = currentY + 36;
        const maxTextW = photoW - 40;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextW && n > 0) {
            ctx.fillText(`"${line.trim()}"`, photoX + 20, lineY);
            line = words[n] + ' ';
            lineY += 28;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(`"${line.trim()}"`, photoX + 20, lineY);

        // Footer Branding
        currentY += 135;
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('📸 BaliSnap Studio | Digital Gift Card', photoX, currentY);

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error generating combined gift card canvas:', err);
        resolve(photoUri);
      }
    };
    img.onerror = () => resolve(photoUri);
    img.src = photoUri;
  });
};

  const handleShareDirectFiles = async () => {
    let shareCaption = `💌 HADIAH FOTO KADO DIGITAL BALISNAP STUDIO 💌\n\n`;
    shareCaption += `Untuk: ${receiverName || 'Sahabatku'}\n`;
    shareCaption += `Dari: ${senderName || 'Seseorang'}\n\n`;
    shareCaption += `"${giftMessage || 'Semoga hari kamu menyenangkan! ✨'}"`;

    try {
      const filesToShare: File[] = [];

      if (activePhoto) {
        const combinedPhotoUri = await createCombinedGiftCardCanvas(
          activePhoto,
          senderName,
          receiverName,
          giftMessage
        );
        const photoBlob = dataURItoBlob(combinedPhotoUri);
        filesToShare.push(
          new File([photoBlob], `kado-foto-dan-ucapan-${(receiverName || 'sahabat').toLowerCase().replace(/\s+/g, '-')}.png`, {
            type: 'image/png',
          })
        );
      }

      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        filesToShare.push(
          new File([audioBlob], `voice-note-${(senderName || 'pengirim').toLowerCase().replace(/\s+/g, '-')}.webm`, {
            type: 'audio/webm',
          })
        );
      }

      if (navigator.canShare && filesToShare.length > 0 && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare,
          title: 'Gift Foto & Voice Note BaliSnap',
          text: shareCaption,
        });
        return;
      }
    } catch (err) {
      console.log('Native file share fallback:', err);
    }

    // Fallback: Unduh Sekaligus kedua file (Foto + Audio) & Buka WhatsApp
    handleDownloadPackage();
  };

  const handleDownloadPackage = async () => {
    // 1) Unduh Foto Kado & Kartu Ucapan PNG Menyatu (1 Gambar)
    if (activePhoto) {
      const combinedPhotoUri = await createCombinedGiftCardCanvas(
        activePhoto,
        senderName,
        receiverName,
        giftMessage
      );
      const pLink = document.createElement('a');
      pLink.href = combinedPhotoUri;
      pLink.download = `kado-foto-dan-ucapan-${(receiverName || 'sahabat').toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(pLink);
      pLink.click();
      document.body.removeChild(pLink);
    }

    // 2) Unduh Rekaman Suara Voice Note
    if (audioUrl) {
      setTimeout(() => {
        const aLink = document.createElement('a');
        aLink.href = audioUrl;
        aLink.download = `voice-note-${(senderName || 'pengirim').toLowerCase().replace(/\s+/g, '-')}.webm`;
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
      }, 300);
    }

    // 3) Buka WhatsApp dengan Teks Ucapan Ringkas
    let text = `💌 HADIAH FOTO KADO DIGITAL BALISNAP STUDIO 💌\n\n`;
    text += `Untuk: ${receiverName || 'Sahabatku'}\n`;
    text += `Dari: ${senderName || 'Seseorang'}\n\n`;
    text += `"${giftMessage || 'Semoga hari kamu menyenangkan! ✨'}"`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-[32px] max-w-sm sm:max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] relative overflow-hidden text-center flex flex-col items-center gap-4 z-50 select-none max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TAPE DECORATION */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 h-5 bg-stone-100/95 border border-stone-200/90 skew-x-[-10deg] shadow-xs pointer-events-none flex items-center justify-center gap-1.5 text-[8.5px] text-stone-600 font-bold tracking-widest uppercase">
            <Heart className="w-2.5 h-2.5 text-[#E15A6E]" />
            <span>DIGITAL GIFT ENVELOPE</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center gap-1 mt-2">
            <h3 className="text-xl font-serif font-black tracking-tight text-stone-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#E15A6E]" />
              Amplop Surat &amp; Gift Digital
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Kirim foto strip ini sebagai hadiah ucapan &amp; pesan suara spesial!
            </p>
          </div>

          {/* ANIMASI AMPLOP 3D INTERAKTIF */}
          <div className="w-full relative flex flex-col items-center justify-center">
            {!isEnvelopeOpen ? (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleOpenEnvelope}
                className="w-full h-44 bg-gradient-to-b from-[#FFF7F7] via-[#FFF1F3] to-[#FCE8EB] rounded-2xl border border-rose-200/80 hover:border-[#E15A6E]/50 shadow-xs hover:shadow-md flex flex-col items-center justify-center p-4 cursor-pointer relative overflow-hidden group transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-rose-100 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6 text-[#E15A6E]" />
                </div>
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                  KLIK UNTUK BUKA AMPLOP
                </span>
                <span className="text-[11px] text-stone-500 font-medium mt-0.5">
                  Sentuh untuk melihat hadiah ucapan &amp; foto kado
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                className="w-full flex flex-col items-center gap-2 py-1"
              >
                <span className="text-stone-700 font-bold text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#E15A6E]" />
                  Amplop Ucapan Digital Berhasil Dibuka!
                </span>
                {activePhoto && (
                  <div className="relative group overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/60 shadow-xs p-1.5 max-h-48 flex justify-center">
                    <img
                      src={activePhoto}
                      alt="Foto Kado Gift Spesial"
                      className="max-h-44 object-contain rounded-xl"
                    />
                    {customGiftPhoto && (
                      <span className="absolute top-2.5 right-2.5 bg-stone-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Foto Kado Upload
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* FORM UCAPAN & SENDER/RECEIVER */}
          <div className="w-full flex flex-col gap-3 text-left bg-stone-50/70 p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block mb-1">
                  Dari (Pengirim):
                </label>
                <input
                  type="text"
                  placeholder="Nama Kamu"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#E15A6E] focus:ring-1 focus:ring-[#E15A6E] bg-white text-stone-800 placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block mb-1">
                  Untuk (Penerima):
                </label>
                <input
                  type="text"
                  placeholder="Nama Sahabat/Pacar"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#E15A6E] focus:ring-1 focus:ring-[#E15A6E] bg-white text-stone-800 placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-stone-500 tracking-wider block mb-1">
                Pesan Ucapan Spesial:
              </label>
              <textarea
                placeholder="Tulis ucapan ucapan manis di sini..."
                rows={2}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#E15A6E] focus:ring-1 focus:ring-[#E15A6E] bg-white text-stone-800 placeholder:text-stone-400 resize-none"
              />
            </div>

            {/* UPLOAD FOTO KADO CUSTOM */}
            <div className="pt-2.5 border-t border-stone-200/70 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" /> UNGGAH FOTO KADO GIFT SPESIAL:
                </span>
                {customGiftPhoto && (
                  <button
                    type="button"
                    onClick={() => setCustomGiftPhoto(null)}
                    className="text-[9.5px] text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Reset Foto
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex-1 py-2 px-3 bg-white hover:bg-stone-50 border border-dashed border-stone-300 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>{customGiftPhoto ? 'Ganti Foto Kado Upload' : 'Unggah Foto Kado Kustom'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {customGiftPhoto ? (
                <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Foto kado kustom berhasil diunggah!</span>
                </div>
              ) : (
                <p className="text-[10px] text-stone-400 font-medium">
                  *Opsional: Jika tidak diunggah, foto photobooth strip akan digunakan secara otomatis.
                </p>
              )}
            </div>

            {/* AUDIO VOICE NOTE RECORDER */}
            <div className="pt-2.5 border-t border-stone-200/70 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-stone-400" /> REKAM PESAN SUARA (VOICE NOTE 10s):
              </span>

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 py-2 px-3 bg-[#E15A6E] hover:bg-[#CC475B] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {audioUrl ? 'Rekam Ulang Suara' : 'Mulai Rekam Suara'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs animate-pulse cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    Stop Rekam ({recordingSeconds}s)
                  </button>
                )}

                {audioUrl && !isRecording && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={togglePlayAudio}
                      className="py-2 px-3 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      Putar
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadAudio}
                      className="py-2 px-2.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                      title="Unduh file rekaman pesan suara ini"
                    >
                      <Download className="w-3.5 h-3.5 text-stone-500" />
                      Unduh
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handleShareDirectFiles}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-wider uppercase text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              KIRIM REKAMAN SUARA &amp; LINK (WHATSAPP)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyGiftLink}
                className="py-2.5 px-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold tracking-wider uppercase text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Kado'}</span>
              </button>

              <button
                onClick={handleDownloadPackage}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold tracking-wider uppercase text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Unduh Paket</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
