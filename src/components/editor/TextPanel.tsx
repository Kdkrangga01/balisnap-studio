import React, { useState, useEffect } from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';

export const TextPanel: React.FC = () => {
  const { addText, selectedId, texts, updateText, removeText, selectedFrame, customHeadline, setCustomHeadline } = usePhotobooth();
  
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<string>('"Playfair Display", serif');
  const [selectedColor, setSelectedColor] = useState<string>('#6B4A3A');

  const fonts = [
    { name: 'Elegant Serif', value: '"Playfair Display", serif' },
    { name: 'Playful Cursive', value: '"Pacifico", cursive' },
    { name: 'Cute Handwriting', value: '"Caveat", cursive' },
    { name: 'Scrapbook Sketch', value: '"Gochi Hand", cursive' },
    { name: 'Clean Sans', value: '"Poppins", sans-serif' }
  ];

  const colors = [
    { name: 'Mahogany', value: '#6B4A3A' },
    { name: 'Beige Cream', value: '#D8C3A5' },
    { name: 'Muted Gold', value: '#C9A66B' },
    { name: 'Deep Charcoal', value: '#2E2620' },
    { name: 'Pastel Pink', value: '#FB7185' },
    { name: 'Mint Green', value: '#34D399' },
    { name: 'Sky Blue', value: '#38BDF8' },
    { name: 'Clean White', value: '#FFFFFF' }
  ];

  // Detect if current selection is a text node
  const isTextSelected = selectedId?.startsWith('text-');
  const selectedText = isTextSelected ? texts.find(t => t.id === selectedId) : null;

  // Sync inputs with selected text node
  useEffect(() => {
    if (selectedText) {
      setInputValue(selectedText.text);
      setSelectedFont(selectedText.fontFamily);
      setSelectedColor(selectedText.fill);
    }
  }, [selectedId, selectedText]);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (selectedText) {
      // Update existing
      updateText(selectedText.id, {
        text: inputValue,
        fontFamily: selectedFont,
        fill: selectedColor
      });
    } else {
      // Create new
      addText(inputValue, selectedColor, selectedFont);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* CARD CUSTOM NAMA DAERAH (HEADLINE NEWSPAPER) */}
      {selectedFrame?.headlineConfig && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400/50 p-4 rounded-2xl text-left shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              📰 Custom Nama Daerah / Headline
            </span>
            <span className="text-[9px] bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
              Newspaper Frame
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80 font-medium mb-3">
            Ubah nama daerah pada bingkai koran sesuai daerah Anda (font otomatis menyesuaikan).
          </p>

          <div className="flex gap-2 mb-2.5">
            <input
              type="text"
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              placeholder="cth: DENPASAR, BALI, JAKARTA..."
              className="flex-1 px-3.5 py-2.5 bg-white dark:bg-zinc-900 border-2 border-amber-300 dark:border-amber-700/60 rounded-xl text-xs font-black text-zinc-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['DENPASAR', 'BALI', 'JAKARTA', 'SURABAYA', 'BANDUNG', 'JOGJA', 'SANUR', 'UBUD', 'KUTA', 'CANGGU', 'SEMINYAK'].map(city => (
              <button
                key={city}
                type="button"
                onClick={() => setCustomHeadline(city)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  (customHeadline || 'DENPASAR').toUpperCase() === city
                    ? 'bg-amber-700 text-white shadow-md scale-105'
                    : 'bg-white/80 dark:bg-zinc-800 text-amber-900 dark:text-amber-200 border border-amber-300/60 hover:bg-amber-100 dark:hover:bg-zinc-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-4">
      {/* Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
          {selectedText ? 'Edit Teks' : 'Tulis Sesuatu'}
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (selectedText) {
              updateText(selectedText.id, { text: e.target.value });
            }
          }}
          placeholder="Tulis nama, tanggal, atau caption..."
          className="w-full px-4 py-2.5 rounded-xl border border-cream focus:border-gold focus:ring-1 focus:ring-gold bg-ivory-dark outline-none text-sm transition-all"
        />
      </div>

      {/* Font Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
          Gaya Font
        </label>
        <div className="grid grid-cols-2 gap-2">
          {fonts.map((f) => (
            <button
              type="button"
              key={f.value}
              onClick={() => {
                setSelectedFont(f.value);
                if (selectedText) {
                  updateText(selectedText.id, { fontFamily: f.value });
                }
              }}
              style={{ fontFamily: f.value.replace(/"/g, '') }}
              className={`px-3 py-2 rounded-xl text-left border text-xs transition-all ${
                selectedFont === f.value
                  ? 'border-gold bg-gold-light/10 font-bold'
                  : 'border-cream/40 bg-ivory-dark/40 hover:bg-cream-light/30'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
          Warna
        </label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => {
                setSelectedColor(c.value);
                if (selectedText) {
                  updateText(selectedText.id, { fill: c.value });
                }
              }}
              style={{ backgroundColor: c.value }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === c.value
                  ? 'border-gold scale-110 shadow-md'
                  : 'border-cream/50 hover:scale-105'
              }`}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="flex-1 py-2.5 rounded-xl bg-mahogany text-white hover:bg-mahogany-dark disabled:opacity-50 transition-all font-semibold text-sm shadow-md"
        >
          {selectedText ? 'Selesai Edit' : 'Tambah ke Foto'}
        </button>
        {selectedText && (
          <button
            type="button"
            onClick={() => removeText(selectedText.id)}
            className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all font-semibold text-sm"
          >
            Hapus
          </button>
        )}
      </div>
    </form>
  </div>
);
};
