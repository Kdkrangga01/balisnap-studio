import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles, CheckCircle2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveFeedback } from '../lib/feedbackDb';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'ulasan' | 'saran' | 'kritik';
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'ulasan'
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<'ulasan' | 'saran' | 'kritik'>(defaultCategory);
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Mohon tuliskan ulasan, kritik, atau saran Anda.');
      return;
    }

    const senderName = name.trim() || 'Pengunjung Studio';

    try {
      setIsSaving(true);
      setErrorMsg('');

      await saveFeedback({
        name: senderName,
        rating,
        category,
        comment: comment.trim()
      });

      // Hanya tampilkan layar sukses kalau beneran kesimpen di database
      setIsSubmitted(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF2A85', '#FF73B3', '#FBBF24', '#10B981']
      });
    } catch (error) {
      console.error('Gagal menyimpan feedback:', error);
      setErrorMsg('Gagal mengirim masukan Anda. Cek koneksi internet, lalu coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setComment('');
    setRating(5);
    setCategory(defaultCategory);
    setErrorMsg('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-6 text-white relative">
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Sparkles className="w-6 h-6 text-yellow-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">Ulasan, Kritik & Saran</h3>
                <p className="text-xs text-white/90">Masukan Anda sangat berharga untuk BaliSnap Studio</p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800">Terima Kasih Banyak! ❤️</h4>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Ulasan dan saran Anda telah berhasil terkirim. Dukungan Anda sangat berarti bagi kami untuk terus berkembang!
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] transition-all"
                >
                  Selesai
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Selection Tabs */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Kategori Masukan
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setCategory('ulasan')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${category === 'ulasan'
                          ? 'bg-white text-pink-600 shadow-sm font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <span>🌟 Ulasan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('saran')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${category === 'saran'
                          ? 'bg-white text-amber-600 shadow-sm font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <span>💡 Saran</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('kritik')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${category === 'kritik'
                          ? 'bg-white text-purple-600 shadow-sm font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <span>🛠️ Kritik</span>
                    </button>
                  </div>
                </div>

                {/* Star Rating Selection */}
                <div className="text-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Beri Penilaian (Rating)
                  </label>
                  <div className="flex items-center justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${isActive
                                ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                : 'text-gray-300'
                              }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-medium text-amber-600 mt-2">
                    {rating === 5 && 'Sangat Memuaskan! 😍'}
                    {rating === 4 && 'Bagus Banget! 😊'}
                    {rating === 3 && 'Cukup Baik 👍'}
                    {rating === 2 && 'Perlu Ditingkatkan 😐'}
                    {rating === 1 && 'Kurang Memuaskan 🙁'}
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Anda <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Alex & Friends"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Comment Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pesan {category === 'ulasan' ? 'Ulasan' : category === 'saran' ? 'Saran' : 'Kritik'} <span className="text-pink-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      category === 'ulasan'
                        ? 'Tuliskan kesan & pengalaman serumu berfoto di BaliSnap Studio...'
                        : category === 'saran'
                          ? 'Ide atau fitur apa yang ingin Anda tambahkan di BaliSnap Studio?'
                          : 'Apa kendala atau kekurangan yang perlu kami perbaiki?'
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    {errorMsg}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-500/20 hover:shadow-pink-500/35 hover:scale-[1.02] transition-all flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span>{isSaving ? 'Mengirim...' : 'Kirim Masukan'}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};