import React, { useState } from 'react';
import { stickers, stickerPacks, isStickerLocked, isStickerPackLocked } from '../../data/stickers';
import type { StickerItem, StickerPack } from '../../data/stickers';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { Heart, Sparkles, Lock } from 'lucide-react';
import { UpgradeModal } from '../UpgradeModal';

const StickerThumbnail: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={className} />;
};

export const StickerPanel: React.FC = () => {
  const { addSticker, applyStickerPack, favoriteStickers, toggleFavoriteSticker, packageTier } = usePhotobooth();
  const [activeCategory, setActiveCategory] = useState<string>('packs');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTargetTier, setUpgradeTargetTier] = useState<'basic' | 'premium'>('premium');
  const [upgradeFeatureName, setUpgradeFeatureName] = useState('Stiker Premium Studio');

  const triggerLockModal = (tier: 'basic' | 'premium', feature: string) => {
    setUpgradeTargetTier(tier);
    setUpgradeFeatureName(feature);
    setUpgradeModalOpen(true);
  };

  const categories = [
    { id: 'packs', name: '✨ Paket Auto-Spread' },
    { id: 'cat', name: '🐱 Kucing' },
    { id: 'nailong', name: '🐲 Nailong' },
    { id: 'anime', name: '🏴‍☠️ One Piece' },
    { id: 'aesthetic', name: '✨ Aesthetic' },
    { id: 'cute', name: 'Kawaii' },
    { id: 'emoji', name: 'Emoji' },
    { id: 'all', name: 'Semua' },
    { id: 'favorit', name: 'Favorit' }
  ];

  const filteredStickers = activeCategory === 'all'
    ? stickers
    : activeCategory === 'favorit'
      ? stickers.filter(s => favoriteStickers.includes(s.src))
      : stickers.filter(s => s.category === activeCategory);

  return (
    <div className="flex flex-col h-full text-charcoal">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4 pb-2 border-b border-cream-dark/20">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeCategory === cat.id
              ? 'bg-mahogany text-white shadow-md'
              : 'bg-cream-light text-charcoal/60 hover:bg-cream'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid Paket Auto-Spread */}
      {activeCategory === 'packs' ? (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[220px] md:max-h-[260px] pr-2 custom-scroll">
          {stickerPacks.map((pack: StickerPack) => {
            const isLocked = isStickerPackLocked(pack, packageTier);
            const reqTier = pack.requiredTier || (pack.category === 'nailong' || pack.category === 'cat' || pack.category === 'anime' || pack.category === 'badge' || pack.category === 'aesthetic' ? 'premium' : 'basic');

            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  if (isLocked) {
                    triggerLockModal(reqTier === 'premium' ? 'premium' : 'basic', `Paket Stiker "${pack.name}"`);
                    return;
                  }
                  applyStickerPack(pack.id);
                }}
                className="flex flex-col items-center justify-center p-3 bg-ivory-dark rounded-xl border border-cream/60 hover:border-gold-light hover:bg-white hover:shadow-lg transition-all group duration-200 text-center relative cursor-pointer"
              >
                {isLocked && (
                  <div className="absolute top-1.5 right-1.5 z-10 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{reqTier === 'premium' ? 'VIP' : 'BASIC'}</span>
                  </div>
                )}
                <div className="relative mb-2">
                  <StickerThumbnail
                    src={pack.icon}
                    alt={pack.name}
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                  <Sparkles className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-[11px] font-bold text-charcoal group-hover:text-mahogany">
                  {pack.name}
                </span>
                <span className="text-[9px] text-charcoal/50 mt-0.5">
                  {isLocked ? 'Fitur Terkunci (Klik Upgrade)' : 'Klik Auto Pasang Ke Frame'}
                </span>
              </button>
            );
          })}
        </div>
      ) : activeCategory === 'favorit' && filteredStickers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-charcoal/40 text-xs">
          <Heart className="w-8 h-8 text-charcoal/20 mb-2" />
          Belum ada stiker favorit.<br />Tekan ikon hati pada stiker untuk menyimpan.
        </div>
      ) : (
        /* Grid Stiker Satuan */
        <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-[220px] md:max-h-[260px] pr-2 custom-scroll">
          {filteredStickers.map((sticker: StickerItem) => {
            const isFav = favoriteStickers.includes(sticker.src);
            const isLocked = isStickerLocked(sticker, packageTier);
            const reqTier = sticker.requiredTier || (sticker.category === 'nailong' || sticker.category === 'cat' || sticker.category === 'anime' || sticker.category === 'badge' ? 'premium' : 'basic');

            return (
              <div key={sticker.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      triggerLockModal(reqTier === 'premium' ? 'premium' : 'basic', `Stiker "${sticker.name}"`);
                      return;
                    }
                    addSticker(sticker.src);
                  }}
                  className="flex items-center justify-center p-2 bg-ivory-dark rounded-xl border border-cream/40 hover:border-gold-light hover:bg-white hover:shadow-md transition-all w-full h-14 group duration-200 relative cursor-pointer overflow-hidden"
                  title={sticker.name}
                >
                  <StickerThumbnail
                    src={sticker.src}
                    alt={sticker.name}
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center text-white">
                      <span className="bg-rose-600 p-1 rounded-full text-white shadow-md">
                        <Lock className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavoriteSticker(sticker.src)}
                  className="absolute -top-1 -right-1 p-1 bg-white hover:bg-red-50 border border-cream/30 rounded-full shadow-md transition-all z-10 cursor-pointer"
                >
                  <Heart
                    className={`w-3 h-3 ${isFav ? 'fill-red-500 text-red-500' : 'text-charcoal/30'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetTier={upgradeTargetTier}
        featureName={upgradeFeatureName}
      />
    </div>
  );
};