import React from 'react';
import { usePhotobooth, type ParticleEffectType } from '../../context/PhotoboothContext';
import { Sparkles, Heart, Flower2, CircleDot, Zap, Ban } from 'lucide-react';

interface ParticleOption {
  id: ParticleEffectType;
  name: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
}

export const particleOptions: ParticleOption[] = [
  {
    id: 'none',
    name: 'Tanpa Efek',
    desc: 'Biasa Tanpa Partikel',
    icon: <Ban className="w-4 h-4 text-zinc-400" />,
    gradient: 'from-zinc-100 to-zinc-200',
  },
  {
    id: 'sparkles',
    name: 'Sparkle Bintang',
    desc: 'Kilatan Bintang Estetik',
    icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
    gradient: 'from-amber-400/20 to-yellow-500/20',
  },
  {
    id: 'gold_glitter',
    name: 'Glitter Emas VIP',
    desc: 'Kilauan Emas Mewah',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    gradient: 'from-amber-500/20 to-amber-600/20',
  },
  {
    id: 'butterflies',
    name: 'Kupu-Kupu Neon',
    desc: 'Pesona Kupu-Kupu Melayang',
    icon: <CircleDot className="w-4 h-4 text-cyan-400" />,
    gradient: 'from-cyan-400/20 to-blue-500/20',
  },
  {
    id: 'sakura',
    name: 'Sakura Gugur',
    desc: 'Kelopak Bunga Sakura',
    icon: <Flower2 className="w-4 h-4 text-pink-400" />,
    gradient: 'from-pink-400/20 to-rose-500/20',
  },
  {
    id: 'hearts',
    name: 'Love & Hearts',
    desc: 'Simbol Hati Romantis',
    icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />,
    gradient: 'from-rose-500/20 to-red-500/20',
  },
];

export const ParticleSelector: React.FC = () => {
  const { particleEffect, setParticleEffect } = usePhotobooth();

  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex flex-col">
        <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          EFEK PARTIKEL & GLITTER VIP
        </h4>
        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
          Pilih efek bintang/glitter yang bergerak di atas kanvas foto strip Anda!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {particleOptions.map((opt) => {
          const isSelected = particleEffect === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setParticleEffect(opt.id)}
              className={`p-3 rounded-2xl border transition-all flex flex-col gap-1.5 text-left relative cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-50 via-purple-50 to-pink-100 border-pink-400 ring-2 ring-pink-300 shadow-md scale-[1.02]'
                  : 'bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${opt.gradient} border border-white/60 shadow-sm`}>
                  {opt.icon}
                </div>
                {isSelected && (
                  <span className="text-[9px] font-black text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full uppercase border border-pink-200">
                    AKTIF
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-zinc-800">{opt.name}</span>
              <span className="text-[9px] text-zinc-500 font-medium leading-tight">{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
