import React from 'react';
import { usePhotobooth } from '../../context/PhotoboothContext';
import { Sun, Contrast, Palette, Sparkles, RotateCcw, Crown } from 'lucide-react';

export const RetouchPanel: React.FC = () => {
  const { fineTuning, setFineTuning, resetFineTuning } = usePhotobooth();

  return (
    <div className="flex flex-col gap-4 text-left p-1 select-none">
      {/* Header Badge */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 p-3 rounded-2xl border border-purple-200/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              Retouch Pro & Fine-Tuning
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Kontrol presisi warna &amp; kelembutan kulit</p>
          </div>
        </div>

        <button
          onClick={resetFineTuning}
          className="p-1.5 hover:bg-white rounded-xl text-slate-500 hover:text-slate-800 transition-all border border-transparent hover:border-slate-200 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
          title="Reset Pengaturan"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
          Reset
        </button>
      </div>

      {/* Brightness Adjustment */}
      <div className="bg-white/80 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-amber-600">
            <Sun className="w-4 h-4" /> Kecerahan (Brightness)
          </span>
          <span className="font-mono text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200/60">
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
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
          <span>Redup (50%)</span>
          <span>Normal (100%)</span>
          <span>Sangat Terang (150%)</span>
        </div>
      </div>

      {/* Contrast Adjustment */}
      <div className="bg-white/80 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-purple-600">
            <Contrast className="w-4 h-4" /> Kontras (Contrast)
          </span>
          <span className="font-mono text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200/60">
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
          className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
          <span>Soft (50%)</span>
          <span>Normal (100%)</span>
          <span>Tajam (150%)</span>
        </div>
      </div>

      {/* Saturation Adjustment */}
      <div className="bg-white/80 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-rose-600">
            <Palette className="w-4 h-4" /> Saturation (Saturasi Warna)
          </span>
          <span className="font-mono text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200/60">
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
          className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
          <span>Hitam Putih (0%)</span>
          <span>Normal (100%)</span>
          <span>Pop Color (200%)</span>
        </div>
      </div>

      {/* Soft Focus / Skin Smooth Blur */}
      <div className="bg-white/80 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5 text-pink-600">
            <Sparkles className="w-4 h-4" /> Soft Focus (Skin Retouch)
          </span>
          <span className="font-mono text-[11px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-lg border border-pink-200/60">
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
          className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-medium">
          <span>Matikan (0px)</span>
          <span>Halus (2px)</span>
          <span>Glow (5px)</span>
        </div>
      </div>
    </div>
  );
};
