import React from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import type { FilterType } from '../../context/PhotoboothContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export const FilterPanel: React.FC = () => {
  const { appliedFilter, setAppliedFilter } = usePhotobooth();

  const filters: { id: FilterType; name: string; desc: string; styleClass: string }[] = [
    {
      id: 'normal',
      name: 'Original ✨',
      desc: 'Warna asli potretmu',
      styleClass: 'bg-gradient-to-br from-[#EFEBE2] to-[#DCD7CD]'
    },
    {
      id: 'grayscale',
      name: 'Noir B&W 🖤',
      desc: 'Hitam & putih klasik',
      styleClass: 'bg-gradient-to-br from-zinc-300 to-zinc-600'
    },
    {
      id: 'vintage',
      name: 'Retro Warm 🎞️',
      desc: 'Nuansa hangat nostalgic',
      styleClass: 'bg-gradient-to-br from-amber-100 to-amber-500'
    },
    {
      id: 'sepia',
      name: 'Warm Sepia ☕',
      desc: 'Warna cokelat antik',
      styleClass: 'bg-gradient-to-br from-orange-200 to-amber-800'
    },
    {
      id: 'cool',
      name: 'Cool Dream ❄️',
      desc: 'Tampilan dingin modern',
      styleClass: 'bg-gradient-to-br from-sky-100 to-indigo-500'
    },
    {
      id: 'vivid',
      name: 'Vivid Chrome 🌈',
      desc: 'Warna kontras & pop',
      styleClass: 'bg-gradient-to-br from-pink-300 to-rose-500'
    }
  ];

  return (
    <div className="flex flex-col gap-2.5 text-left select-none">
      {/* Label Title bergaya cute pastel gallery */}
      <label className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1 bg-pink-50/60 border border-pink-100/40 px-2.5 py-1 rounded-full w-fit">
        <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
        Pilih Filter Foto
      </label>

      {/* Grid Matriks Pilihan Filter */}
      <div className="grid grid-cols-2 gap-2.5">
        {filters.map((fil) => {
          const isActive = appliedFilter === fil.id;

          return (
            <motion.button
              key={fil.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAppliedFilter(fil.id)}
              className={`flex flex-col items-left text-left p-3 rounded-2xl border-2 transition-all duration-300 shadow-sm relative overflow-hidden group ${isActive
                  ? 'border-pink-400 bg-gradient-to-br from-white to-rose-50/20 ring-1 ring-pink-300'
                  : 'border-rose-50 bg-white hover:border-rose-200 hover:bg-zinc-50/40'
                }`}
            >
              {/* Background Glow Effect saat Active */}
              {isActive && (
                <div className="absolute inset-0 bg-pink-400/5 pointer-events-none" />
              )}

              {/* Visual Mini Tone Box representing the filter look */}
              <div className={`w-full h-9 rounded-xl mb-2.5 shadow-inner transition-transform group-hover:scale-[1.01] ${fil.styleClass}`} />

              {/* Filter Name Label Row */}
              <div className="flex items-center justify-between w-full min-w-0">
                <span className={`text-xs font-black tracking-wide truncate ${isActive ? 'text-pink-500' : 'text-zinc-700'}`}>
                  {fil.name}
                </span>

                {/* Pop Hati Kecil jika Filter Sedang Aktif */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className="flex-shrink-0"
                    >
                      <Heart className="w-3 h-3 text-pink-400 fill-current" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Deskripsi Singkat Nuansa Filter */}
              <span className={`text-[9px] font-medium mt-0.5 leading-tight ${isActive ? 'text-pink-400/80' : 'text-zinc-400'}`}>
                {fil.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};