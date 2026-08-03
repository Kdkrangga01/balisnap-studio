import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Mic, Square, Play, Pause, Send, X, Download, Upload, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
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

  const handleShareDirectFiles = async () => {
    let shareCaption = `💌 HADIAH FOTO KADO DIGITAL BALISNAP STUDIO 💌\n\n`;
    shareCaption += `Untuk: ${receiverName || 'Sahabatku'}\n`;
    shareCaption += `Dari: ${senderName || 'Seseorang'}\n\n`;
    shareCaption += `"${giftMessage || 'Semoga hari kamu menyenangkan! ✨'}"`;

    try {
      const filesToShare: File[] = [];

      if (activePhoto) {
        const photoBlob = dataURItoBlob(activePhoto);
        filesToShare.push(
          new File([photoBlob], `kado-foto-${(receiverName || 'sahabat').toLowerCase().replace(/\s+/g, '-')}.png`, {
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

  const handleDownloadPackage = () => {
    buildGiftLink();

    // 1) Unduh Foto Kado PNG
    if (activePhoto) {
      const pLink = document.createElement('a');
      pLink.href = activePhoto;
      pLink.download = `kado-foto-${(receiverName || 'sahabat').toLowerCase().replace(/\s+/g, '-')}.png`;
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

    // 3) Buka WhatsApp dengan Teks Ucapan (Tanpa Link!)
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
          className="bg-gradient-to-b from-rose-50 via-pink-50 to-purple-50 border-2 border-pink-300 rounded-[36px] max-w-sm sm:max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(244,114,182,0.5)] relative overflow-hidden text-center flex flex-col items-center gap-4 z-50 select-none max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TAPE DECORATION */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-5 bg-pink-300/80 border border-white/80 skew-x-[-10deg] shadow-sm pointer-events-none flex items-center justify-center text-[8px] text-rose-800 font-black tracking-widest uppercase">
            💌 DIGITAL GIFT ENVELOPE 💌
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center gap-1 mt-3">
            <h3 className="text-xl font-serif font-black tracking-tight text-rose-950 flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-600 animate-bounce" />
              Amplop Surat & Gift Digital
            </h3>
            <p className="text-xs text-rose-700/80 font-medium">
              Kirim foto strip ini sebagai hadiah ucapan & pesan suara spesial!
            </p>
          </div>

          {/* ANIMASI AMPLOP 3D INTERAKTIF */}
          <div className="w-full relative flex flex-col items-center justify-center my-1">
            {!isEnvelopeOpen ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleOpenEnvelope}
                className="w-full h-48 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 rounded-2xl border-2 border-white/80 shadow-lg flex flex-col items-center justify-center p-4 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                <Mail className="w-12 h-12 text-white mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black text-white uppercase tracking-wider drop-shadow-sm">
                  KLIK UNTUK BUKA AMPLOP 💌
                </span>
                <span className="text-[10px] text-pink-100 font-medium mt-1">
                  Sentuh untuk melihat hadiah ucapan &amp; foto kado
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                className="w-full flex flex-col items-center gap-2 py-2"
              >
                <span className="text-rose-700 font-bold text-xs">
                  💌 Amplop Ucapan Digital Berhasil Dibuka! 💌
                </span>
                {activePhoto && (
                  <div className="relative group overflow-hidden rounded-2xl border-2 border-rose-200 shadow-md bg-white p-1 max-h-48 flex justify-center">
                    <img
                      src={activePhoto}
                      alt="Foto Kado Gift Spesial"
                      className="max-h-44 object-contain rounded-xl"
                    />
                    {customGiftPhoto && (
                      <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                        📸 Foto Kado Upload
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* FORM UCAPAN & SENDER/RECEIVER */}
          <div className="w-full flex flex-col gap-2.5 text-left bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-rose-200 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black uppercase text-rose-800 tracking-wider block mb-1">
                  Dari (Pengirim):
                </label>
                <input
                  type="text"
                  placeholder="Nama Kamu"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-rose-800 tracking-wider block mb-1">
                  Untuk (Penerima):
                </label>
                <input
                  type="text"
                  placeholder="Nama Sahabat/Pacar"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-rose-800 tracking-wider block mb-1">
                Pesan Ucapan Spesial:
              </label>
              <textarea
                placeholder="Tulis ucapan ucapan manis di sini..."
                rows={2}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white resize-none"
              />
            </div>

            {/* UPLOAD FOTO KADO CUSTOM */}
            <div className="pt-2 border-t border-rose-200/60 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-600" /> UNGGAH FOTO KADO GIFT SPESIAL:
                </span>
                {customGiftPhoto && (
                  <button
                    type="button"
                    onClick={() => setCustomGiftPhoto(null)}
                    className="text-[9px] text-rose-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Reset Foto
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 border border-dashed border-rose-300 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-rose-500" />
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
                <p className="text-[9.5px] text-rose-600/80 font-medium italic">
                  *Opsional: Jika tidak diunggah, foto photobooth strip akan digunakan secara otomatis.
                </p>
              )}
            </div>

            {/* AUDIO VOICE NOTE RECORDER */}
            <div className="pt-2 border-t border-rose-200/60 flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-rose-600" /> REKAM PESAN SUARA (VOICE NOTE 10s):
              </span>

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {audioUrl ? 'Rekam Ulang Suara' : 'Mulai Rekam Suara'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm animate-pulse cursor-pointer"
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
                      className="py-2 px-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      Putar
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadAudio}
                      className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Unduh file rekaman pesan suara ini"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Audio
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
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              📲 KIRIM REKAMAN SUARA (WHATSAPP)
            </button>

            <button
              onClick={handleDownloadPackage}
              className="w-full py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-rose-500" />
              📦 UNDUH PAKET KADO (VOICE NOTE &amp; UCAPAN)
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
