import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Play, Pause, X, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createMobileAudioElement } from '../lib/mobileAudio';

export interface GiftPayload {
  from: string;
  to: string;
  msg: string;
  audio?: string | null;
  photo?: string | null;
}

export const RecipientGiftModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [giftData, setGiftData] = useState<GiftPayload | null>(null);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Periksa Query Parameter URL pada saat halaman dibuka
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const rawGiftData = urlParams.get('giftData');
      const giftParam = urlParams.get('gift');

      let payload: GiftPayload | null = null;

      if (rawGiftData) {
        try {
          const decoded = decodeURIComponent(escape(atob(rawGiftData)));
          payload = JSON.parse(decoded);
        } catch { }
      }

      if (!payload && giftParam) {
        payload = {
          from: urlParams.get('from') || 'Seseorang',
          to: urlParams.get('to') || 'Kamu',
          msg: urlParams.get('msg') || 'Semoga hari kamu menyenangkan! ✨',
          audio: urlParams.get('audio') || localStorage.getItem('balisnap_gift_audio'),
        };
      }

      if (!payload) {
        const saved = localStorage.getItem('balisnap_active_gift');
        if (saved && urlParams.get('viewGift') === '1') {
          try {
            payload = JSON.parse(saved);
          } catch { }
        }
      }

      if (payload) {
        setGiftData(payload);
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Gagal membaca gift data:', err);
    }
  }, []);

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch { }

    // OTOMATIS PUTAR REKAMAN PESAN SUARA SAAT AMPLOP DIBUKA
    if (giftData?.audio) {
      try {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
        }
        const audio = createMobileAudioElement(giftData.audio);
        audio.onended = () => setIsPlayingAudio(false);
        audioElementRef.current = audio;
        audio.load();
        audio.play().then(() => {
          setIsPlayingAudio(true);
        }).catch((err) => {
          console.warn('Playback error di HP:', err);
        });
      } catch (err) {
        console.error('Gagal memutar audio otomatis:', err);
      }
    } else if (giftData?.msg && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const textToSpeak = `Pesan ucapan untuk ${giftData.to} dari ${giftData.from}: ${giftData.msg}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'id-ID';
        utterance.pitch = 1.1;
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onstart = () => setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      } catch { }
    }
  };

  const togglePlayAudio = () => {
    if (!giftData?.audio) return;

    if (!audioElementRef.current || audioElementRef.current.src !== giftData.audio) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = createMobileAudioElement(giftData.audio);
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

  const handleClose = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlayingAudio(false);
    setIsOpen(false);
  };

  if (!isOpen || !giftData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-md"
        onClick={handleClose}
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-5 bg-pink-300/80 border border-white/80 skew-x-[-10deg] shadow-sm pointer-events-none flex items-center justify-center text-[8px] text-rose-800 font-black tracking-widest uppercase">
            💌 KADO AMPLOP SURAT DIGITAL 💌
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center gap-1 mt-3">
            <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-100 px-3 py-0.5 rounded-full border border-pink-200">
              UNTUK: {giftData.to.toUpperCase()}
            </span>
            <h3 className="text-xl font-serif font-black tracking-tight text-rose-950 flex items-center gap-2 mt-1">
              <Mail className="w-5 h-5 text-rose-600 animate-bounce" />
              Hadiah Spesial Dari {giftData.from}!
            </h3>
          </div>

          {/* ANIMASI AMPLOP 3D INTERAKTIF */}
          <div className="w-full relative flex flex-col items-center justify-center my-1">
            {!isEnvelopeOpen ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleOpenEnvelope}
                className="w-full h-52 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 rounded-2xl border-2 border-white/80 shadow-lg flex flex-col items-center justify-center p-4 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                <Mail className="w-14 h-14 text-white mb-2 group-hover:scale-110 transition-transform animate-pulse" />
                <span className="text-sm font-black text-white uppercase tracking-wider drop-shadow-sm">
                  KLIK UNTUK BUKA AMPLOP 💌
                </span>
                <span className="text-[10px] text-pink-100 font-medium mt-1">
                  Sentuh untuk mendengarkan pesan suara &amp; foto strip!
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                className="w-full flex flex-col items-center gap-3"
              >
                {/* UCAPAN SURAT DIGITAL */}
                <div className="w-full bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col gap-2 text-left">
                  <div className="flex justify-between items-center border-b border-rose-100 pb-2">
                    <span className="text-xs font-bold text-rose-800">Dari: {giftData.from}</span>
                    <span className="text-xs font-bold text-rose-800">Untuk: {giftData.to}</span>
                  </div>
                  <p className="text-sm font-medium italic text-zinc-800 leading-relaxed my-1">
                    "{giftData.msg}"
                  </p>
                </div>

                {/* FOTO KADO SPESIAL */}
                {giftData.photo && (
                  <div className="w-full relative overflow-hidden rounded-2xl border-2 border-rose-200 shadow-md bg-white p-1 max-h-56 flex justify-center">
                    <img
                      src={giftData.photo}
                      alt="Hadiah Foto Spesial"
                      className="max-h-52 object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* OTOMATIS VOICE NOTE AUDIO PLAYER */}
                {giftData.audio && (
                  <div className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-2xl shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Volume2 className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black uppercase tracking-wider">PESAN SUARA REKAMAN</span>
                        <span className="text-[9px] text-pink-100 font-medium">
                          {isPlayingAudio ? '▶ Sedang Diputar...' : 'Disertakan langsung oleh pengirim'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={togglePlayAudio}
                      className="py-1.5 px-3 bg-white text-purple-700 font-black text-xs rounded-xl flex items-center gap-1 shadow-sm hover:bg-pink-50 transition-all cursor-pointer"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isPlayingAudio ? 'Pause' : 'Putar'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
