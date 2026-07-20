import React, { useState, useEffect } from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';

export const TextPanel: React.FC = () => {
  const { addText, selectedId, texts, updateText, removeText } = usePhotobooth();
  
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
  );
};
