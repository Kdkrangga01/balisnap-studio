import React, { useState } from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { frameColors } from '../../data/frameColors';
import { presets } from '../../data/presets';
import {
    Palette,
    Sliders,
    Sparkles,
    Heart
} from 'lucide-react';

export const FrameColorPanel: React.FC = () => {
    const {
        lineColor, setLineColor,
        borderThickness, setBorderThickness,
        borderRadius, setBorderRadius,
        shadowIntensity, setShadowIntensity,
        shadowBlur, setShadowBlur,
        shadowColor, setShadowColor,
        frameOpacity, setFrameOpacity,
        framePadding, setFramePadding,
        setWallpaperId,
        favoriteColors, toggleFavoriteColor,
        addRecentColor,
        setAppliedFilter,
        setFrameColor,
        setCardColor
    } = usePhotobooth();

    const [subTab, setSubTab] = useState<'line' | 'detail' | 'preset'>('line');

    const handleApplyPreset = (preset: typeof presets[0]) => {
        setLineColor(preset.frameColor);
        setCardColor('original');
        setFrameColor(preset.frameColor);
        setAppliedFilter(preset.appliedFilter);
        setWallpaperId(preset.wallpaperId);
        setBorderThickness(preset.borderThickness);
        setBorderRadius(preset.borderRadius);
        setShadowIntensity(preset.shadowIntensity);
        setFramePadding(preset.framePadding);
        setFrameOpacity(preset.frameOpacity);
    };

    const activeLineColor = lineColor || 'original';

    return (
        <div className="flex flex-col gap-4 text-charcoal">
            {/* Sub tabs */}
            <div className="flex gap-1 border-b border-cream/20 pb-2">
                {[
                    { id: 'line', label: 'Warna Garis Pembatas', icon: Palette },
                    { id: 'detail', label: 'Detail', icon: Sliders },
                    { id: 'preset', label: 'Preset', icon: Sparkles },
                ].map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setSubTab(t.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${subTab === t.id
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-charcoal/60 hover:bg-rose-50'
                            }`}
                    >
                        <t.icon className="w-3 h-3" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* TAB: WARNA GARIS PEMBATAS (DIVIDERS & BORDER) */}
            {subTab === 'line' && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                            ✏️ Warna Garis Pembatas (Dividers)
                        </span>
                        <span className="text-[8px] text-rose-500 font-medium">Ubah warna garis pembatas &amp; border</span>
                    </div>

                    {/* Custom Line Color Picker & HEX Input */}
                    {(() => {
                        const selectedFcOpt = frameColors.find(c => c.id === activeLineColor);
                        const previewBackground = selectedFcOpt ? selectedFcOpt.previewCss : (activeLineColor.startsWith('#') ? activeLineColor : (activeLineColor === 'original' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 0/10px 10px' : '#18181b'));
                        const displayName = selectedFcOpt ? selectedFcOpt.name : (activeLineColor === 'original' ? 'Asli (Default)' : activeLineColor);

                        return (
                            <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-rose-200 shadow-sm">
                                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-rose-300 shadow-inner flex-shrink-0 cursor-pointer">
                                    <input
                                        type="color"
                                        value={activeLineColor.startsWith('#') ? activeLineColor : '#18181b'}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setLineColor(val);
                                            addRecentColor(val);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div
                                        className="w-full h-full"
                                        style={{ background: previewBackground }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setLineColor(v);
                                            if (/^#[0-9A-F]{6}$/i.test(v)) {
                                                addRecentColor(v);
                                            }
                                        }}
                                        placeholder="#18181b"
                                        className="w-full bg-rose-50/50 border border-rose-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-rose-400"
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    {/* Quick Line Color Buttons */}
                    <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/60 mb-1.5">Warna Garis Populer</span>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { id: 'original', name: 'Asli (Default)', css: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 0/10px 10px' },
                                { id: '#18181b', name: 'Hitam Klasik', css: '#18181b' },
                                { id: '#ffffff', name: 'Putih Bersih', css: '#ffffff' },
                                { id: '#3d261d', name: 'Deep Coffee', css: '#3d261d' },
                                { id: '#d4a373', name: 'Rose Gold', css: '#d4a373' },
                                { id: '#475569', name: 'Slate Blue', css: '#475569' },
                                { id: '#5c1414', name: 'Maroon Wine', css: '#5c1414' },
                                { id: '#ffd8e4', name: 'Pastel Pink', css: '#ffd8e4' },
                            ].map(l => (
                                <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => setLineColor(l.id)}
                                    title={l.name}
                                    className={`py-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                                        activeLineColor === l.id ? 'border-zinc-800 bg-white ring-2 ring-zinc-500 shadow-sm' : 'border-zinc-200 bg-white/60 hover:border-zinc-400'
                                    }`}
                                >
                                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-inner block" style={{ background: l.css }} />
                                    <span className="text-[8px] font-bold text-zinc-600 truncate w-full text-center px-1">{l.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aesthetic Color & Pattern Swatches */}
                    <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-charcoal/60 mb-2">Semua Palette &amp; Pattern Estetik</span>
                        <div className="grid grid-cols-6 gap-2 max-h-[180px] overflow-y-auto custom-scroll pr-1">
                            {frameColors.map((fc) => {
                                const isSelected = activeLineColor === fc.id || activeLineColor === fc.previewCss;
                                return (
                                    <div key={fc.id} className="relative group">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLineColor(fc.id);
                                                addRecentColor(fc.previewCss);
                                            }}
                                            title={fc.name}
                                            className={`flex items-center justify-center p-0.5 rounded-full transition-all duration-200 w-8 h-8 ${
                                                isSelected ? 'ring-2 ring-rose-500 ring-offset-1 scale-105 shadow-md' : 'hover:scale-105'
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
                </div>
            )}

            {/* Favorite Colors */}
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
                                    onClick={() => {
                                        setLineColor(c);
                                    }}
                                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                                    style={{ background: preview }}
                                    title={fc ? fc.name : c}
                                />
                            );
                        })}
                    </div>
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