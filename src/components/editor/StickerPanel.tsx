import React, { useState } from 'react';
import { stickers } from '../../data/stickers';
import type { StickerItem } from '../../data/stickers';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { Heart } from 'lucide-react';

export const StickerPanel: React.FC = () => {
  const { addSticker, favoriteStickers, toggleFavoriteSticker } = usePhotobooth();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Semua' },
    { id: 'favorit', name: 'Favorit' },
    { id: 'cute', name: 'Kawaii' },
    { id: 'text', name: 'Bubble' },
    { id: 'emoji', name: 'Emoji' },
    { id: 'washi', name: 'Washi' },
    { id: 'badge', name: 'Badge' }
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
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id
                ? 'bg-mahogany text-white shadow-md'
                : 'bg-cream-light text-charcoal/60 hover:bg-cream'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {activeCategory === 'favorit' && filteredStickers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-charcoal/40 text-xs">
          <Heart className="w-8 h-8 text-charcoal/20 mb-2" />
          Belum ada stiker favorit.<br />Tekan ikon hati pada stiker untuk menyimpan.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-[220px] md:max-h-[260px] pr-2 custom-scroll">
          {filteredStickers.map((sticker: StickerItem) => {
            const isFav = favoriteStickers.includes(sticker.src);
            return (
              <div key={sticker.id} className="relative group">
                <button
                  type="button"
                  onClick={() => addSticker(sticker.src)}
                  className="flex items-center justify-center p-2 bg-ivory-dark rounded-xl border border-cream/40 hover:border-gold-light hover:bg-white hover:shadow-md transition-all w-full h-14 group duration-200"
                  title={sticker.name}
                >
                  <img
                    src={sticker.src}
                    alt={sticker.name}
                    className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavoriteSticker(sticker.src)}
                  className="absolute -top-1 -right-1 p-1 bg-white hover:bg-red-50 border border-cream/30 rounded-full shadow-md transition-all z-10"
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
    </div>
  );
};
