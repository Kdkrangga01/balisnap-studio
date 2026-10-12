import React, { useState } from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import type { FilterType } from '../../context/PhotoboothContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Heart, Lock } from 'lucide-react';
import { UpgradeModal } from '../UpgradeModal';

export const FilterPanel: React.FC = () => {
  const { appliedFilter, setAppliedFilter } = usePhotobooth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const filters: { id: FilterType; name: string; desc: string; styleClass: string }[] = [
    {
      id: 'normal',
      name: 'Original',
      desc: 'Warna asli potretmu',
      styleClass: 'bg-gradient-to-br from-[#EFEBE2] to-[#DCD7CD]'
    },
    {
      id: 'grayscale',
      name: 'Noir B&W',
      desc: 'Hitam & putih klasik',
      styleClass: 'bg-gradient-to-br from-zinc-300 to-zinc-600'
    },
    {
      id: 'vintage',
      name: 'Retro Warm',
      desc: 'Nuansa hangat nostalgic',
      styleClass: 'bg-gradient-to-br from-amber-100 to-amber-500'
    },
    {
      id: 'sepia',
      name: 'Warm Sepia',
      desc: 'Warna cokelat antik',
      styleClass: 'bg-gradient-to-br from-orange-200 to-amber-800'
    },
    {
      id: 'cool',
      name: 'Cool Dream',
      desc: 'Tampilan dingin modern',
      styleClass: 'bg-gradient-to-br from-sky-100 to-indigo-500'
    },
    {
      id: 'vivid',
      name: 'Vivid Chrome',
      desc: 'Warna kontras & pop',
      styleClass: 'bg-gradient-to-br from-pink-300 to-rose-500'
    }
  ];

  return (
    <div className="flex flex-col gap-3 text-left select-none">
      {/* Label Title */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#E15A6E]" />
          Pilihan Preset Filter
        </span>
        <span className="text-[10px] text-stone-400 font-medium">Tone warna foto</span>
      </div>

      {/* Grid Matriks Pilihan Filter */}
      <div className="grid grid-cols-2 gap-2.5">
        {filters.map((fil) => {
          const isActive = appliedFilter === fil.id;
          const isLocked = false;

          return (
            <motion.button
              key={fil.id}
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isLocked) {
                  setUpgradeModalOpen(true);
                  return;
                }
                setAppliedFilter(fil.id);
              }}
              className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-200 shadow-2xs relative overflow-hidden group cursor-pointer ${
                isActive
                  ? 'border-stone-900 bg-white ring-2 ring-stone-900/10 shadow-xs'
                  : 'border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50/70'
              }`}
            >
              {/* Lock Badge overlay jika terkunci */}
              {isLocked && (
                <div className="absolute top-2 right-2 z-10 bg-[#E15A6E] text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                  <Lock className="w-2.5 h-2.5" />
                  <span>VIP</span>
                </div>
              )}

              {/* Visual Mini Tone Box representing the filter look */}
              <div className={`w-full h-8 rounded-xl mb-2 shadow-inner transition-transform group-hover:scale-[1.01] ${fil.styleClass}`} />

              {/* Filter Name Label Row */}
              <div className="flex items-center justify-between w-full min-w-0">
                <span className={`text-xs tracking-tight truncate ${isActive ? 'font-bold text-stone-900' : 'font-semibold text-stone-700'}`}>
                  {fil.name}
                </span>

                {/* Pop Hati Kecil jika Filter Sedang Aktif */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                      className="shrink-0"
                    >
                      <Heart className="w-3 h-3 text-[#E15A6E] fill-current" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Deskripsi Singkat Nuansa Filter */}
              <span className="text-[10px] font-normal text-stone-400 mt-0.5 leading-tight">
                {fil.desc}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetTier="basic"
        featureName="Semua Filter Warna Estetik"
      />
    </div>
  );
};