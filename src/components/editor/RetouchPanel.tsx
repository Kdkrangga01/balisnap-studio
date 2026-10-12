import React from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { Sun, Contrast, Palette, Wand2, RotateCcw, Crown } from 'lucide-react';

export const RetouchPanel: React.FC = () => {
  const { fineTuning, setFineTuning, resetFineTuning } = usePhotobooth();

  return (
    <div className="flex flex-col gap-3.5 text-left select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-stone-50/90 p-3 rounded-2xl border border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-[#E15A6E] shadow-2xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
              Retouch Studio Pro
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </h3>
            <p className="text-[10px] text-stone-500 font-normal">Fine-tuning warna &amp; kelembutan kulit</p>
          </div>
        </div>

        <button
          onClick={resetFineTuning}
          className="px-2.5 py-1 bg-white hover:bg-stone-100 rounded-xl text-stone-600 border border-stone-200/80 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer active:scale-95 shadow-2xs"
          title="Reset Pengaturan"
        >
          <RotateCcw className="w-3 h-3 text-[#E15A6E]" />
          <span>Reset</span>
        </button>
      </div>

      {/* Brightness Adjustment */}
      <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-stone-700">
          <span className="flex items-center gap-1.5 text-stone-800">
            <Sun className="w-4 h-4 text-amber-500" /> Kecerahan
          </span>
          <span className="text-[11px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200/60">
            {fineTuning.brightness}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={150}
          step={1}
          value={fineTuning.brightness}
          onChange={(e) => setFineTuning({ brightness: Number(e.target.value) })}
          className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[9px] text-stone-400 font-medium">
          <span>Redup (50%)</span>
          <span>Normal (100%)</span>
          <span>Terang (150%)</span>
        </div>
      </div>

      {/* Contrast Adjustment */}
      <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-stone-700">
          <span className="flex items-center gap-1.5 text-stone-800">
            <Contrast className="w-4 h-4 text-stone-600" /> Kontras
          </span>
          <span className="text-[11px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200/60">
            {fineTuning.contrast}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={150}
          step={1}
          value={fineTuning.contrast}
          onChange={(e) => setFineTuning({ contrast: Number(e.target.value) })}
          className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[9px] text-stone-400 font-medium">
          <span>Soft (50%)</span>
          <span>Normal (100%)</span>
          <span>Tajam (150%)</span>
        </div>
      </div>

      {/* Saturation Adjustment */}
      <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-stone-700">
          <span className="flex items-center gap-1.5 text-stone-800">
            <Palette className="w-4 h-4 text-[#E15A6E]" /> Saturasi Warna
          </span>
          <span className="text-[11px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200/60">
            {fineTuning.saturation}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={1}
          value={fineTuning.saturation}
          onChange={(e) => setFineTuning({ saturation: Number(e.target.value) })}
          className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[9px] text-stone-400 font-medium">
          <span>B&amp;W (0%)</span>
          <span>Normal (100%)</span>
          <span>Vivid (200%)</span>
        </div>
      </div>

      {/* Soft Focus / Skin Smooth Blur */}
      <div className="bg-white border border-stone-200/80 p-3.5 rounded-2xl shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-stone-700">
          <span className="flex items-center gap-1.5 text-stone-800">
            <Wand2 className="w-4 h-4 text-purple-500" /> Kelembutan Kulit (Smooth)
          </span>
          <span className="text-[11px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200/60">
            {fineTuning.softFocus}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={fineTuning.softFocus}
          onChange={(e) => setFineTuning({ softFocus: Number(e.target.value) })}
          className="w-full accent-[#E15A6E] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[9px] text-stone-400 font-medium">
          <span>Murni (0px)</span>
          <span>Halus (2px)</span>
          <span>Glow (5px)</span>
        </div>
      </div>
    </div>
  );
};
