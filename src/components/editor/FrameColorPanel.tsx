import React, { useState } from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { frameColors } from '../../data/frameColors';
import { wallpapers, wallpaperCategories } from '../../data/wallpapers';
import { presets } from '../../data/presets';
import {
    Palette,
    Sliders,
    Image as ImageIcon,
    Sparkles,
    Heart,
    Upload,
    Check,
    Undo
} from 'lucide-react';

export const FrameColorPanel: React.FC = () => {
    const {
        frameColor, setFrameColor,
        frameStyle, setFrameStyle,
        borderThickness, setBorderThickness,
        borderRadius, setBorderRadius,
        shadowIntensity, setShadowIntensity,
        shadowBlur, setShadowBlur,
        shadowColor, setShadowColor,
        frameOpacity, setFrameOpacity,
        framePadding, setFramePadding,
        wallpaperId, setWallpaperId,
        wallpaperUpload, setWallpaperUpload,
        wallpaperBlur, setWallpaperBlur,
        wallpaperOpacity, setWallpaperOpacity,
        wallpaperScaleMode, setWallpaperScaleMode,
        favoriteColors, toggleFavoriteColor,
        recentColors, addRecentColor,
        setAppliedFilter
    } = usePhotobooth();

    const [subTab, setSubTab] = useState<'color' | 'detail' | 'wallpaper' | 'preset'>('color');
    const [activeWallpaperCat, setActiveWallpaperCat] = useState<string>('all');
    const [customHex, setCustomHex] = useState<string>('#ffffff');

    // ------------------------------------------------------------
    // FIX (BaliSnap bugfix): Sebelumnya baris ini memaksa
    // setFrameColor('original') setiap kali user mengetik hex yang
    // valid di kolom "Custom Color" -> warna yang diketik user TIDAK
    // PERNAH benar-benar dipakai, selalu balik ke default. Sekarang
    // benar-benar menerapkan hex yang diketik.
    // ------------------------------------------------------------
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            setFrameColor(val as any); // FIX: sebelumnya 'original', sekarang pakai hex yang diketik
            addRecentColor(val);
        }
    };

    const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomHex(val);
        setFrameColor(val as any);
        addRecentColor(val);
    };

    const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result as string;
            setWallpaperUpload(src);
            setWallpaperId(''); // Clear predefined wallpaper
        };
        reader.readAsDataURL(file);
    };

    const handleApplyPreset = (preset: typeof presets[0]) => {
        setFrameColor(preset.frameColor);
        setAppliedFilter(preset.appliedFilter);
        setWallpaperId(preset.wallpaperId);
        setBorderThickness(preset.borderThickness);
        setBorderRadius(preset.borderRadius);
        setShadowIntensity(preset.shadowIntensity);
        setFramePadding(preset.framePadding);
        setFrameOpacity(preset.frameOpacity);
    };

    // Filtered wallpapers based on category
    const filteredWallpapers = wallpapers.filter(w =>
        activeWallpaperCat === 'all' || w.category === activeWallpaperCat
    );

    return (
        <div className="flex flex-col gap-4 text-charcoal">
            {/* Sub tabs */}
            <div className="flex gap-1 border-b border-cream/20 pb-2">
                {[
                    { id: 'color', label: 'Warna', icon: Palette },
                    { id: 'detail', label: 'Detail', icon: Sliders },
                    { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon },
                    { id: 'preset', label: 'Preset', icon: Sparkles },
                ].map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setSubTab(t.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${subTab === t.id
                            ? 'bg-mahogany text-white shadow-sm'
                            : 'text-charcoal/50 hover:bg-cream-light/30'
                            }`}
                    >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* SUB TAB CONTENT */}
            {subTab === 'color' && (
                <div className="flex flex-col gap-3">
                    {/* Style Category buttons */}
                    <div className="flex gap-2">
                        {['solid', 'gradient', 'glassmorphism', 'glossy'].map(style => (
                            <button
                                key={style}
                                onClick={() => setFrameStyle(style)}
                                className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${frameStyle === style
                                    ? 'border-mahogany bg-mahogany/5 text-mahogany'
                                    : 'border-cream/20 hover:border-cream text-charcoal/50'
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>

                    {/* Color Picker & Custom HEX Input */}
                    <div className="flex items-center gap-3 bg-ivory-dark/30 p-2.5 rounded-xl border border-cream/10">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cream/40 shadow-inner flex-shrink-0 cursor-pointer">
                            <input
                                type="color"
                                value={customHex}
                                onChange={handleColorPicker}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <div
                                className="w-full h-full"
                                style={{ backgroundColor: customHex }}
                            />
                        </div>
                        <div className="flex-1">
                            <span className="text-[9px] font-bold text-charcoal/40 uppercase">Custom Color</span>
                            <input
                                type="text"
                                value={customHex}
                                onChange={handleHexChange}
                                placeholder="#ffffff"
                                className="w-full bg-white border border-cream/30 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gold"
                            />
                        </div>
                    </div>

                    {/* Preset Swatches Grid */}
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">Palette Pilihan</span>
                        <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scroll">
                            {frameColors.map((fc) => {
                                const isSelected = frameColor === fc.id;
                                return (
                                    <div key={fc.id} className="relative group">
                                        <button
                                            key={fc.id}
                                            type="button"
                                            onClick={() => {
                                                setFrameColor(fc.id);
                                                addRecentColor(fc.previewCss);
                                            }}
                                            title={fc.name}
                                            className={`flex items-center justify-center p-0.5 rounded-full transition-all duration-200 w-9 h-9 ${isSelected ? 'ring-2 ring-gold ring-offset-1 scale-105' : 'hover:scale-105'
                                                }`}
                                        >
                                            <span
                                                className="w-full h-full rounded-full shadow-inner border border-black/10 block"
                                                style={{ background: fc.previewCss }}
                                            />
                                        </button>
                                        <button
                                            onClick={() => toggleFavoriteColor(fc.id)}
                                            className="absolute -top-1 -right-1 p-0.5 rounded-full bg-white shadow-md border border-cream/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Heart
                                                className={`w-2.5 h-2.5 ${favoriteColors.includes(fc.id) ? 'fill-red-500 text-red-500' : 'text-charcoal/30'}`}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent and Favorites */}
                    {favoriteColors.length > 0 && (
                        <div>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1">Favorit</span>
                            <div className="flex flex-wrap gap-1.5">
                                {favoriteColors.map(c => {
                                    const fc = frameColors.find(o => o.id === c);
                                    const preview = fc ? fc.previewCss : c;
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => setFrameColor(c as any)}
                                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                                            style={{ background: preview }}
                                            title={fc ? fc.name : c}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {recentColors.length > 0 && (
                        <div>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1">Baru Digunakan</span>
                            <div className="flex flex-wrap gap-1.5">
                                {recentColors.map((c, i) => (
                                    <button
                                        key={`${c}-${i}`}
                                        onClick={() => {
                                            if (c.startsWith('#')) {
                                                setFrameColor(c as any);
                                                setCustomHex(c);
                                            } else {
                                                const matched = frameColors.find(o => o.previewCss === c);
                                                if (matched) setFrameColor(matched.id);
                                            }
                                        }}
                                        className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                                        style={{ background: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {subTab === 'detail' && (
                <div className="flex flex-col gap-3 text-xs">
                    {/* Sliders */}
                    <div>
                        <div className="flex justify-between font-semibold mb-1 text-[10px]">
                            <span className="text-charcoal/60 uppercase">Ketebalan Border ({borderThickness}px)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={borderThickness}
                            onChange={(e) => setBorderThickness(Number(e.target.value))}
                            className="w-full accent-mahogany cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between font-semibold mb-1 text-[10px]">
                            <span className="text-charcoal/60 uppercase">Sudut Radius ({borderRadius}px)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={borderRadius}
                            onChange={(e) => setBorderRadius(Number(e.target.value))}
                            className="w-full accent-mahogany cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between font-semibold mb-1 text-[10px]">
                            <span className="text-charcoal/60 uppercase">Padding Foto ({framePadding}px)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={framePadding}
                            onChange={(e) => setFramePadding(Number(e.target.value))}
                            className="w-full accent-mahogany cursor-pointer"
                        />
                    </div>

                    <div className="border-t border-cream/10 pt-2 flex flex-col gap-2">
                        <div className="flex justify-between font-semibold mb-1 text-[10px]">
                            <span className="text-charcoal/60 uppercase">Intensitas Bayangan ({shadowIntensity})</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={shadowIntensity}
                            onChange={(e) => setShadowIntensity(Number(e.target.value))}
                            className="w-full accent-mahogany cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1">Blur Bayangan</span>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                value={shadowBlur}
                                onChange={(e) => setShadowBlur(Number(e.target.value))}
                                className="w-full accent-mahogany cursor-pointer"
                            />
                        </div>
                        <div className="w-[100px] flex flex-col justify-end">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1">Warna Bayangan</span>
                            <input
                                type="color"
                                value={shadowColor}
                                onChange={(e) => setShadowColor(e.target.value)}
                                className="w-full h-8 rounded-lg border border-cream/20 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between font-semibold mb-1 text-[10px]">
                            <span className="text-charcoal/60 uppercase">Transparansi Frame ({Math.round(frameOpacity * 100)}%)</span>
                        </div>
                        <input
                            type="range"
                            min="0.2"
                            max="1"
                            step="0.05"
                            value={frameOpacity}
                            onChange={(e) => setFrameOpacity(Number(e.target.value))}
                            className="w-full accent-mahogany cursor-pointer"
                        />
                    </div>
                </div>
            )}

            {subTab === 'wallpaper' && (
                <div className="flex flex-col gap-3">
                    {/* Upload Wallpaper */}
                    <div className="flex items-center gap-3 bg-ivory-dark/30 p-2.5 rounded-xl border border-cream/10">
                        <button
                            onClick={() => document.getElementById('wallpaper-file-input')?.click()}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50/50 text-charcoal border border-cream/30 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 w-full justify-center"
                        >
                            <Upload className="w-3.5 h-3.5 text-mahogany" />
                            Unggah Wallpaper Sendiri
                        </button>
                        <input
                            id="wallpaper-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleWallpaperUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Wallpaper category filters */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {wallpaperCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveWallpaperCat(cat.id)}
                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0 transition-all flex items-center gap-1 ${activeWallpaperCat === cat.id
                                    ? 'bg-mahogany text-white'
                                    : 'bg-cream-light text-charcoal/60 hover:bg-cream'
                                    }`}
                            >
                                <span>{cat.emoji}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Wallpapers Swatches */}
                    <div>
                        <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scroll">
                            {/* Option to clear wallpaper */}
                            <button
                                type="button"
                                onClick={() => {
                                    setWallpaperId('');
                                    setWallpaperUpload('');
                                }}
                                className={`h-12 rounded-lg border border-dashed border-cream/40 flex flex-col items-center justify-center text-[9px] font-bold text-charcoal/40 hover:border-mahogany hover:text-mahogany transition-all ${!wallpaperId && !wallpaperUpload ? 'ring-2 ring-gold border-solid bg-gold-light/10' : ''
                                    }`}
                            >
                                <Undo className="w-4 h-4 mb-0.5" />
                                Kosong
                            </button>

                            {/* Custom Uploaded Preview */}
                            {wallpaperUpload && (
                                <button
                                    type="button"
                                    onClick={() => setWallpaperId('')}
                                    className={`h-12 rounded-lg border overflow-hidden relative ${!wallpaperId ? 'ring-2 ring-gold' : ''
                                        }`}
                                >
                                    <img src={wallpaperUpload} alt="Uploaded" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                </button>
                            )}

                            {/* Curated list */}
                            {filteredWallpapers.map(w => {
                                const isSelected = wallpaperId === w.id;
                                return (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => {
                                            setWallpaperId(w.id);
                                            setWallpaperUpload('');
                                        }}
                                        title={w.name}
                                        className={`h-12 rounded-lg border shadow-sm transition-all relative ${isSelected ? 'ring-2 ring-gold scale-95 border-gold shadow-md' : 'hover:scale-98'
                                            }`}
                                        style={{ background: w.previewCss }}
                                    >
                                        {isSelected && (
                                            <span className="absolute inset-0 bg-black/25 flex items-center justify-center rounded-lg">
                                                <Check className="w-4 h-4 text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Wallpaper Edit sliders */}
                    {(wallpaperId || wallpaperUpload) && (
                        <div className="border-t border-cream/10 pt-2.5 flex flex-col gap-2.5 text-xs">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1">Blur Wallpaper ({wallpaperBlur}px)</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="15"
                                        value={wallpaperBlur}
                                        onChange={(e) => setWallpaperBlur(Number(e.target.value))}
                                        className="w-full accent-mahogany cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1">Transparansi ({Math.round(wallpaperOpacity * 100)}%)</span>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={wallpaperOpacity}
                                        onChange={(e) => setWallpaperOpacity(Number(e.target.value))}
                                        className="w-full accent-mahogany cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/40 mb-1.5">Skala / Pengepasan Wallpaper</span>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {['fill', 'fit', 'crop', 'stretch'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setWallpaperScaleMode(mode as any)}
                                            className={`py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${wallpaperScaleMode === mode
                                                ? 'border-mahogany bg-mahogany/5 text-mahogany'
                                                : 'border-cream/20 hover:border-cream text-charcoal/50'
                                                }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {subTab === 'preset' && (
                <div className="flex flex-col gap-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-charcoal/50">Gaya Siap Pakai</span>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scroll">
                        {presets.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleApplyPreset(p)}
                                className="p-3 bg-white hover:bg-amber-50/20 border border-cream/20 hover:border-cream rounded-xl text-left transition-all shadow-sm hover:shadow-md flex flex-col gap-1 relative overflow-hidden group"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="text-lg leading-none">{p.emoji}</span>
                                    <span className="font-bold text-xs leading-none text-charcoal">{p.name}</span>
                                </div>
                                <div className="flex gap-1 mt-1 text-[8px] text-charcoal/40 font-semibold uppercase">
                                    <span>Frame: {p.frameColor}</span>
                                    <span>•</span>
                                    <span>Filter: {p.appliedFilter}</span>
                                </div>
                                <span className="absolute bottom-0 right-0 w-8 h-8 rounded-tl-full bg-gold/10 group-hover:bg-gold/20 transition-all pointer-events-none" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};