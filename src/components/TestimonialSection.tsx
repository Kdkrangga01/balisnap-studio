import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquarePlus, Heart, Sparkles, Loader2 } from 'lucide-react';
import {
  getFeedbacks,
  getFeedbackStats,
  subscribeToFeedbacks,
  type FeedbackItem
} from '../lib/feedbackDb';

interface TestimonialSectionProps {
  onOpenFeedbackModal: () => void;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ onOpenFeedbackModal }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState({ average: 5.0, total: 0 });
  const [activeTab, setActiveTab] = useState<'semua' | 'ulasan' | 'saran' | 'kritik'>('semua');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [items, statsData] = await Promise.all([getFeedbacks(), getFeedbackStats()]);
      setFeedbacks(items);
      setStats(statsData);
      setLoadError(false);
    } catch (error) {
      console.error('Gagal memuat testimoni:', error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Dengerin perubahan realtime dari Supabase — kalau ADA SIAPA SAJA,
    // di device manapun, kirim testimoni baru, semua pengunjung lain
    // (termasuk kamu) otomatis lihat update-nya tanpa refresh.
    const unsubscribe = subscribeToFeedbacks(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (activeTab === 'semua') return true;
    return item.category === activeTab;
  });

  return (
    <section id="ulasan" className="py-20 bg-gradient-to-b from-white via-rose-50/30 to-white relative overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-rose-100/80 border border-rose-200 rounded-full text-rose-700 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Kata Mereka Pengguna BaliSnap</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            Ulasan, Kritik & Saran Dari Pengunjung
          </h2>

          <p className="text-sm md:text-base text-gray-600">
            Dengar langsung pendapat dan pengalaman seru teman-teman yang telah berfoto di studio kami.
          </p>

          {/* Rating Summary Card */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-lg mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-black text-gray-900">{stats.average}</span>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-left font-medium">{stats.total} Penilaian Pengguna</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <button
              onClick={onOpenFeedbackModal}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 hover:shadow-pink-500/35 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Tulis Ulasan / Saran</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl gap-1 border border-gray-200/60">
            <button
              onClick={() => setActiveTab('semua')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'semua'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Semua ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('ulasan')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${activeTab === 'ulasan'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <span>🌟 Ulasan</span>
            </button>
            <button
              onClick={() => setActiveTab('saran')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${activeTab === 'saran'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <span>💡 Saran</span>
            </button>
            <button
              onClick={() => setActiveTab('kritik')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${activeTab === 'kritik'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <span>🛠️ Kritik</span>
            </button>
          </div>
        </div>

        {/* Loading / Error / Empty states */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat testimoni...</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="text-center py-16 text-rose-500 text-sm font-medium bg-rose-50 rounded-2xl border border-rose-100 max-w-md mx-auto">
            Gagal memuat testimoni. Cek koneksi internet kamu, lalu muat ulang halaman.
          </div>
        )}

        {!isLoading && !loadError && filteredFeedbacks.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm font-medium">
            Belum ada masukan untuk kategori ini.
          </div>
        )}

        {/* Testimonials Grid */}
        {!isLoading && !loadError && filteredFeedbacks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedbacks.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:border-pink-200 transition-all flex flex-col justify-between relative group"
              >
                <div className="space-y-4">
                  {/* Header: User Info & Category Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.avatarColor || 'from-pink-500 to-rose-400'
                          } text-white font-bold flex items-center justify-center shadow-md shadow-pink-500/10 text-sm`}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <div className="flex text-amber-400 mt-0.5">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${item.category === 'ulasan'
                          ? 'bg-pink-50 text-pink-600 border border-pink-100'
                          : item.category === 'saran'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}
                    >
                      {item.category === 'ulasan' && '🌟 Ulasan'}
                      {item.category === 'saran' && '💡 Saran'}
                      {item.category === 'kritik' && '🛠️ Kritik'}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-normal italic">
                    "{item.comment}"
                  </p>
                </div>

                {/* Footer info: Date */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center text-pink-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-3 h-3 fill-pink-500 mr-1" /> Verified User
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};