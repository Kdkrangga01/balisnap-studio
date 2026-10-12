import React, { useState } from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { frameColors } from '../../data/frameColors';
import { presets } from '../../data/presets';
import {
    Palette,
    Sliders,
    Wand2,
    Heart,
    Crown,
    Lock,
    PenTool
} from 'lucide-react';
import { UpgradeModal } from '../UpgradeModal';

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
        setCardColor,
        packageTier
    } = usePhotobooth();

    const [subTab, setSubTab] = useState<'line' | 'detail' | 'preset'>('line');
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeModalTier, setUpgradeModalTier] = useState<'basic' | 'premium'>('premium');
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('Frame Color Studio');

    const handleApplyPreset = (preset: typeof presets[0]) => {
        if (packageTier !== 'premium') {
            setUpgradeModalTier('premium');
            setUpgradeFeatureName('Preset Studio Pro');
            setUpgradeModalOpen(true);
            return;
        }
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

    const triggerLockModal = (tier: 'basic' | 'premium', name: string) => {
        setUpgradeModalTier(tier);
        setUpgradeFeatureName(name);
        setUpgradeModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-4 text-stone-800 text-left">
            {/* Sub tabs - Clean Proportional Segmented Control */}
            <div className="bg-stone-100/90 p-1 rounded-xl flex gap-1 border border-stone-200/60">
                {[
                    { id: 'line', label: 'Warna Garis', icon: Palette },
                    { id: 'detail', label: 'Detail Studio Pro', icon: Sliders, isPremiumOnly: true },
                    { id: 'preset', label: 'Preset', icon: Wand2 },
                ].map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                            if (t.isPremiumOnly && packageTier !== 'premium') {
                                triggerLockModal('premium', 'Detail Studio Pro (Slider & Custom Controls)');
                                return;
                            }
                            setSubTab(t.id as any);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] tracking-wider uppercase transition-all cursor-pointer active:scale-95 ${
                            subTab === t.id
                                ? 'bg-white text-stone-900 shadow-xs font-bold border border-stone-200/60'
                                : 'text-stone-500 hover:text-stone-800 hover:bg-white/50 font-semibold'
                        }`}
                    >
                        {t.isPremiumOnly && packageTier !== 'premium' && <Crown className="w-2.5 h-2.5 text-amber-500" />}
                        <t.icon className={`w-3.5 h-3.5 ${subTab === t.id ? 'text-[#E15A6E]' : 'text-stone-400'}`} />
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* TAB: WARNA GARIS PEMBATAS (DIVIDERS & BORDER) */}
            {subTab === 'line' && (
                <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between px-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                            <PenTool className="w-3.5 h-3.5 text-[#E15A6E] inline" />
                            Warna Garis &amp; Pembatas
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">Ubah bingkai &amp; border</span>
                    </div>

                    {/* Custom Line Color Picker & HEX Input */}
                    {(() => {
                        const selectedFcOpt = frameColors.find(c => c.id === activeLineColor);
                        const previewBackground = selectedFcOpt ? selectedFcOpt.previewCss : (activeLineColor.startsWith('#') ? activeLineColor : (activeLineColor === 'original' ? 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 0/10px 10px' : '#18181b'));
                        const displayName = selectedFcOpt ? selectedFcOpt.name : (activeLineColor === 'original' ? 'Asli (Default)' : activeLineColor);

                        return (
                            <div className="flex items-center gap-2.5 bg-stone-50/80 p-2 rounded-2xl border border-stone-200/80 shadow-2xs">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-300 shadow-2xs shrink-0 cursor-pointer ring-2 ring-white">
                                    <input
                                        type="color"
                                        value={activeLineColor.startsWith('#') ? activeLineColor : '#18181b'}
                                        onClick={(e) => {
                                            if (packageTier !== 'premium') {
                                                e.preventDefault();
                                                triggerLockModal('premium', 'Custom HEX Color Picker Studio');
                                            }
                                        }}
                                        onChange={(e) => {
                                            if (packageTier !== 'premium') {
                                                triggerLockModal('premium', 'Custom HEX Color Picker Studio');
                                                return;
                                            }
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
                                        onClick={() => {
                                            if (packageTier !== 'premium') {
                                                triggerLockModal('premium', 'Custom HEX Input');
                                            }
                                        }}
                                        onChange={(e) => {
                                            if (packageTier !== 'premium') {
                                                triggerLockModal('premium', 'Custom HEX Input');
                                                return;
                                            }
                                            const v = e.target.value;
                                            setLineColor(v);
                                            setFrameColor(v);
                                            if (/^#[0-9A-F]{6}$/i.test(v)) {
                                                addRecentColor(v);
                                            }
                                        }}
                                        placeholder="#18181b"
                                        className="w-full bg-white border border-stone-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400 shadow-2xs"
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    {/* Quick Line Color Buttons */}
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 px-0.5">Warna Garis Populer</span>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { id: 'original', name: 'Asli', css: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 0/10px 10px', reqTier: 'free' },
                                { id: '#18181b', name: 'Hitam', css: '#18181b', reqTier: 'free' },
                                { id: '#ffffff', name: 'Putih', css: '#ffffff', reqTier: 'free' },
                                { id: '#3d261d', name: 'Coffee', css: '#3d261d', reqTier: 'basic' },
                                { id: '#d4a373', name: 'Rose Gold', css: '#d4a373', reqTier: 'basic' },
                                { id: '#475569', name: 'Slate Blue', css: '#475569', reqTier: 'basic' },
                                { id: '#5c1414', name: 'Maroon', css: '#5c1414', reqTier: 'basic' },
                                { id: '#ffd8e4', name: 'Pastel Pink', css: '#ffd8e4', reqTier: 'basic' },
                            ].map(l => {
                                const isSelected = activeLineColor === l.id;
                                return (
                                    <button
                                        key={l.id}
                                        type="button"
                                        onClick={() => {
                                            setLineColor(l.id);
                                            setFrameColor(l.id);
                                        }}
                                        title={l.name}
                                        className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all relative cursor-pointer active:scale-95 ${
                                            isSelected 
                                                ? 'border-stone-900 bg-white ring-2 ring-stone-900/10 shadow-xs' 
                                                : 'border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50/70'
                                        }`}
                                    >
                                        <span className="w-5 h-5 rounded-full border border-black/10 shadow-2xs block" style={{ background: l.css }} />
                                        <span className={`text-[9px] truncate w-full text-center px-0.5 ${isSelected ? 'font-bold text-stone-900' : 'font-semibold text-stone-600'}`}>{l.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Aesthetic Color & Pattern Swatches */}
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 px-0.5">Semua Palette &amp; Pattern Estetik</span>
                        <div className="grid grid-cols-6 gap-2.5 max-h-[185px] overflow-y-auto custom-scroll p-1">
                            {frameColors.map((fc) => {
                                const isSelected = activeLineColor === fc.id || activeLineColor === fc.previewCss;
                                const isLocked = false;
                                const reqTier = fc.requiredTier || 'premium';

                                return (
                                    <div key={fc.id} className="relative group flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isLocked) {
                                                    triggerLockModal(reqTier === 'premium' ? 'premium' : 'basic', `Warna ${fc.name}`);
                                                    return;
                                                }
                                                setLineColor(fc.id);
                                                setFrameColor(fc.id);
                                                addRecentColor(fc.previewCss);
                                            }}
                                            title={fc.name}
                                            className={`flex items-center justify-center rounded-full transition-all duration-150 w-8 h-8 relative cursor-pointer p-0.5 ${
                                                isSelected 
                                                    ? 'ring-2 ring-stone-900 ring-offset-2 scale-105 shadow-sm' 
                                                    : 'hover:scale-110 active:scale-95'
                                            }`}
                                        >
                                            <span
                                                className="w-full h-full rounded-full shadow-2xs border border-black/10 block overflow-hidden"
                                                style={{ background: fc.previewCss }}
                                            />
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white shadow-inner">
                                                    <Lock className="w-3 h-3 drop-shadow-sm text-white" />
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => toggleFavoriteColor(fc.id)}
                                            className="absolute -top-1 -right-1 p-0.5 rounded-full bg-white shadow-xs border border-stone-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <Heart
                                                className={`w-2.5 h-2.5 ${favoriteColors.includes(fc.id) ? 'fill-red-500 text-red-500' : 'text-stone-300'}`}
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
                <div className="pt-1 border-t border-stone-200/60">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 px-0.5">Favorit</span>
                    <div className="flex flex-wrap gap-2">
                        {favoriteColors.map(c => {
                            const fc = frameColors.find(o => o.id === c);
                            const preview = fc ? fc.previewCss : c;
                            return (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setLineColor(c);
                                    }}
                                    className="w-7 h-7 rounded-full border border-black/10 shadow-2xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                    style={{ background: preview }}
                                    title={fc ? fc.name : c}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {subTab === 'detail' && (
                <div className="flex flex-col gap-3.5 text-xs">
                    {/* Sliders */}
                    <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                        <div className="flex justify-between font-bold text-[10px] text-stone-700">
                            <span className="uppercase">Ketebalan Border</span>
                            <span className="text-stone-500">{borderThickness}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            value={borderThickness}
                            onChange={(e) => setBorderThickness(Number(e.target.value))}
                            className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                    </div>

                    <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                        <div className="flex justify-between font-bold text-[10px] text-stone-700">
                            <span className="uppercase">Sudut Radius</span>
                            <span className="text-stone-500">{borderRadius}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={borderRadius}
                            onChange={(e) => setBorderRadius(Number(e.target.value))}
                            className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                    </div>

                    <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                        <div className="flex justify-between font-bold text-[10px] text-stone-700">
                            <span className="uppercase">Padding Foto</span>
                            <span className="text-stone-500">{framePadding}px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            value={framePadding}
                            onChange={(e) => setFramePadding(Number(e.target.value))}
                            className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                    </div>

                    <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                        <div className="flex justify-between font-bold text-[10px] text-stone-700">
                            <span className="uppercase">Intensitas Bayangan</span>
                            <span className="text-stone-500">{shadowIntensity}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={shadowIntensity}
                            onChange={(e) => setShadowIntensity(Number(e.target.value))}
                            className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                            <span className="block text-[10px] font-bold uppercase text-stone-700">Blur Bayangan ({shadowBlur}px)</span>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                value={shadowBlur}
                                onChange={(e) => setShadowBlur(Number(e.target.value))}
                                className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                            />
                        </div>
                        <div className="w-[110px] bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                            <span className="block text-[10px] font-bold uppercase text-stone-700">Warna Bayangan</span>
                            <input
                                type="color"
                                value={shadowColor}
                                onChange={(e) => setShadowColor(e.target.value)}
                                className="w-full h-7 rounded-xl border border-stone-200 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/70 flex flex-col gap-1">
                        <div className="flex justify-between font-bold text-[10px] text-stone-700">
                            <span className="uppercase">Transparansi Frame</span>
                            <span className="text-stone-500">{Math.round(frameOpacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.2"
                            max="1"
                            step="0.05"
                            value={frameOpacity}
                            onChange={(e) => setFrameOpacity(Number(e.target.value))}
                            className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                        />
                    </div>
                </div>
            )}

            {subTab === 'preset' && (
                <div className="flex flex-col gap-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 px-0.5">Gaya Siap Pakai</span>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scroll">
                        {presets.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleApplyPreset(p)}
                                className="p-3 bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-stone-300 rounded-2xl text-left transition-all shadow-2xs hover:shadow-xs flex flex-col gap-1 relative overflow-hidden group cursor-pointer active:scale-98"
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base leading-none">{p.emoji}</span>
                                    <span className="font-bold text-xs leading-none text-stone-800">{p.name}</span>
                                </div>
                                <div className="flex gap-1 mt-1 text-[8px] text-stone-400 font-semibold uppercase">
                                    <span>Frame: {p.frameColor}</span>
                                    <span>•</span>
                                    <span>Filter: {p.appliedFilter}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                targetTier={upgradeModalTier}
                featureName={upgradeFeatureName}
            />
        </div>
    );
};