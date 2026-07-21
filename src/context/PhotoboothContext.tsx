import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FrameTemplate } from '../data/frames';
import type { FrameColorId } from '../data/frameColors';
import { saveCustomFrame, loadCustomFrames, removeCustomFrame } from '../lib/frameDb';
import { stickerPacks } from '../data/stickers';

export interface CanvasSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface CanvasText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  fontFamily: string;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export type StepType = 'landing' | 'select-frame' | 'capture' | 'editor' | 'preview';
export type FilterType = 'normal' | 'grayscale' | 'vintage' | 'cool' | 'vivid' | 'sepia';

interface PhotoboothContextProps {
  step: StepType;
  setStep: (step: StepType) => void;
  selectedFrame: FrameTemplate | null;
  selectFrame: (frame: FrameTemplate) => void;
  photos: (string | null)[];
  setPhotoAtSlot: (index: number, dataUrl: string | null) => void;
  clearPhotos: () => void;
  stickers: CanvasSticker[];
  addSticker: (stickerId: string, overridePosition?: { x: number; y: number }) => void;
  applyStickerPack: (packId: string) => void;
  updateSticker: (id: string, attrs: Partial<CanvasSticker>) => void;
  removeSticker: (id: string) => void;
  texts: CanvasText[];
  addText: (text: string, color?: string, fontFamily?: string, overrides?: { x?: number; y?: number; fontSize?: number }) => void;
  updateText: (id: string, attrs: Partial<CanvasText>) => void;
  removeText: (id: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  appliedFilter: FilterType;
  setAppliedFilter: (filter: FilterType) => void;
  frameColor: FrameColorId;
  setFrameColor: (color: FrameColorId) => void;

  frameStyle: string;
  setFrameStyle: (style: string) => void;
  borderThickness: number;
  setBorderThickness: (val: number) => void;
  borderRadius: number;
  setBorderRadius: (val: number) => void;
  shadowIntensity: number;
  setShadowIntensity: (val: number) => void;
  shadowBlur: number;
  setShadowBlur: (val: number) => void;
  shadowColor: string;
  setShadowColor: (val: string) => void;
  frameOpacity: number;
  setFrameOpacity: (val: number) => void;
  framePadding: number;
  setFramePadding: (val: number) => void;
  innerMargin: number;
  setInnerMargin: (val: number) => void;
  outerMargin: number;
  setOuterMargin: (val: number) => void;
  wallpaperId: string;
  setWallpaperId: (id: string) => void;
  wallpaperUpload: string;
  setWallpaperUpload: (src: string) => void;
  wallpaperBlur: number;
  setWallpaperBlur: (val: number) => void;
  wallpaperOpacity: number;
  setWallpaperOpacity: (val: number) => void;
  wallpaperScaleMode: 'fit' | 'fill' | 'crop' | 'stretch';
  setWallpaperScaleMode: (val: 'fit' | 'fill' | 'crop' | 'stretch') => void;
  favoriteColors: string[];
  toggleFavoriteColor: (color: string) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
  favoriteWallpapers: string[];
  toggleFavoriteWallpaper: (id: string) => void;
  recentWallpapers: string[];
  addRecentWallpaper: (id: string) => void;
  favoriteStickers: string[];
  toggleFavoriteSticker: (id: string) => void;
  resetAll: () => void;
  customFrames: FrameTemplate[];
  addCustomFrame: (frame: FrameTemplate) => void;
  deleteCustomFrame: (id: string) => void;
}

const PhotoboothContext = createContext<PhotoboothContextProps | undefined>(undefined);

export const PhotoboothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<StepType>('landing');
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>([]);
  const [stickers, setStickers] = useState<CanvasSticker[]>([]);
  const [texts, setTexts] = useState<CanvasText[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appliedFilter, setAppliedFilter] = useState<FilterType>('normal');
  const [frameColor, setFrameColor] = useState<FrameColorId>('original');
  const [customFrames, setCustomFrames] = useState<FrameTemplate[]>([]);

  const [frameStyle, setFrameStyle] = useState<string>('solid');
  const [borderThickness, setBorderThickness] = useState<number>(0);
  const [borderRadius, setBorderRadius] = useState<number>(10);
  const [shadowIntensity, setShadowIntensity] = useState<number>(0);
  const [shadowBlur, setShadowBlur] = useState<number>(5);
  const [shadowColor, setShadowColor] = useState<string>('#000000');
  const [frameOpacity, setFrameOpacity] = useState<number>(1);
  const [framePadding, setFramePadding] = useState<number>(0);
  const [innerMargin, setInnerMargin] = useState<number>(0);
  const [outerMargin, setOuterMargin] = useState<number>(0);
  const [wallpaperId, setWallpaperId] = useState<string>('');
  const [wallpaperUpload, setWallpaperUpload] = useState<string>('');
  const [wallpaperBlur, setWallpaperBlur] = useState<number>(0);
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(1);
  const [wallpaperScaleMode, setWallpaperScaleMode] = useState<'fit' | 'fill' | 'crop' | 'stretch'>('fill');

  const [favoriteColors, setFavoriteColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('balisnap-fav-colors');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const toggleFavoriteColor = (color: string) => {
    setFavoriteColors(prev => {
      const next = prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color];
      localStorage.setItem('balisnap-fav-colors', JSON.stringify(next));
      return next;
    });
  };

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('balisnap-rec-colors');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const addRecentColor = (color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      const next = [color, ...filtered].slice(0, 12);
      localStorage.setItem('balisnap-rec-colors', JSON.stringify(next));
      return next;
    });
  };

  const [favoriteWallpapers, setFavoriteWallpapers] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('balisnap-fav-wallpapers');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const toggleFavoriteWallpaper = (id: string) => {
    setFavoriteWallpapers(prev => {
      const next = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      localStorage.setItem('balisnap-fav-wallpapers', JSON.stringify(next));
      return next;
    });
  };

  const [recentWallpapers, setRecentWallpapers] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('balisnap-rec-wallpapers');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const addRecentWallpaper = (id: string) => {
    setRecentWallpapers(prev => {
      const filtered = prev.filter(w => w !== id);
      const next = [id, ...filtered].slice(0, 12);
      localStorage.setItem('balisnap-rec-wallpapers', JSON.stringify(next));
      return next;
    });
  };

  const [favoriteStickers, setFavoriteStickers] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('balisnap-fav-stickers');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const toggleFavoriteSticker = (id: string) => {
    setFavoriteStickers(prev => {
      const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      localStorage.setItem('balisnap-fav-stickers', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const initCustomFrames = async () => {
      try {
        let dbFrames = await loadCustomFrames();
        const saved = localStorage.getItem('balisnap_custom_frames');
        if (saved) {
          try {
            const localFrames = JSON.parse(saved);
            if (Array.isArray(localFrames) && localFrames.length > 0) {
              const migratedList = [...dbFrames];
              for (const frame of localFrames) {
                if (!migratedList.some(f => f.id === frame.id)) {
                  await saveCustomFrame(frame);
                  migratedList.push(frame);
                }
              }
              dbFrames = migratedList;
              localStorage.removeItem('balisnap_custom_frames');
            }
          } catch (e) {
            console.error("Failed to parse local custom frames:", e);
          }
        }
        setCustomFrames(dbFrames);
      } catch (err) {
        console.error("Failed to load custom frames:", err);
      }
    };
    initCustomFrames();
  }, []);

  useEffect(() => {
    if (selectedFrame) {
      setPhotos(new Array(selectedFrame.slots).fill(null));
      setStickers([]);
      setTexts([]);
      setSelectedId(null);
      setAppliedFilter('normal');
      setFrameColor('original');
      setFrameStyle('solid');
      setBorderThickness(0);
      setBorderRadius(10);
      setShadowIntensity(0);
      setShadowBlur(5);
      setShadowColor('#000000');
      setFrameOpacity(1);
      setFramePadding(0);
      setInnerMargin(0);
      setOuterMargin(0);
      setWallpaperId('');
      setWallpaperUpload('');
      setWallpaperBlur(0);
      setWallpaperOpacity(1);
      setWallpaperScaleMode('fill');
    }
  }, [selectedFrame]);

  const selectFrame = (frame: FrameTemplate) => {
    setSelectedFrame(frame);
    setStep('capture');
  };

  const setPhotoAtSlot = (index: number, dataUrl: string | null) => {
    setPhotos(prev => {
      const next = [...prev];
      next[index] = dataUrl;
      return next;
    });
  };

  const clearPhotos = () => {
    if (selectedFrame) {
      setPhotos(new Array(selectedFrame.slots).fill(null));
    }
  };

  // 1. TAMBAH STIKER TUNGGAL
  const addSticker = (stickerId: string, overridePosition?: { x: number; y: number }) => {
    const id = `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let posX = selectedFrame ? selectedFrame.width / 2 : 150;
    let posY = selectedFrame ? selectedFrame.height / 2 : 150;

    if (overridePosition) {
      posX = overridePosition.x;
      posY = overridePosition.y;
    }

    const newSticker: CanvasSticker = {
      id,
      stickerId,
      x: posX,
      y: posY,
      scaleX: 0.4,
      scaleY: 0.4,
      rotation: (Math.random() * 20) - 10
    };

    setStickers(prev => [...prev, newSticker]);
    setSelectedId(id);
  };

  // 2. AUTO-SPREAD STIKER DENGAN SKALA PAS DI SUDUT FRAME FOTO
  const applyStickerPack = (packId: string) => {
    const pack = stickerPacks.find(p => p.id === packId);
    if (!pack || !selectedFrame) return;

    const shuffledStickers = [...pack.stickers].sort(() => 0.5 - Math.random());
    const newStickers: CanvasSticker[] = [];

    selectedFrame.slotCoords.forEach((slot, slotIdx) => {
      const offset = 25;
      const corners = [
        { x: slot.x + offset, y: slot.y + offset }, // Top-Left
        { x: slot.x + slot.w - offset, y: slot.y + offset }, // Top-Right
        { x: slot.x + offset, y: slot.y + slot.h - offset }, // Bottom-Left
        { x: slot.x + slot.w - offset, y: slot.y + slot.h - offset }, // Bottom-Right
      ];

      corners.forEach((spot, cornerIdx) => {
        const stIndex = (slotIdx + cornerIdx) % shuffledStickers.length;
        const stickerSrc = shuffledStickers[stIndex];
        const id = `auto-sticker-${Date.now()}-${slotIdx}-${cornerIdx}`;

        newStickers.push({
          id,
          stickerId: stickerSrc,
          x: spot.x,
          y: spot.y,
          scaleX: 0.35,
          scaleY: 0.35,
          rotation: (Math.random() * 24) - 12
        });
      });
    });

    setStickers(newStickers);
  };

  const updateSticker = (id: string, attrs: Partial<CanvasSticker>) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...attrs } : s));
  };

  const removeSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addText = (
    text: string,
    color = '#6B4A3A',
    fontFamily = '"Playfair Display", serif',
    overrides?: { x?: number; y?: number; fontSize?: number }
  ) => {
    const id = `text-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newText: CanvasText = {
      id,
      text,
      x: overrides?.x !== undefined ? overrides.x : (selectedFrame ? selectedFrame.width / 2 : 200),
      y: overrides?.y !== undefined ? overrides.y : (selectedFrame ? selectedFrame.height / 2 : 200),
      fontSize: overrides?.fontSize !== undefined ? overrides.fontSize : 48,
      fill: color,
      fontFamily,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    };
    setTexts(prev => [...prev, newText]);
    setSelectedId(id);
  };

  const updateText = (id: string, attrs: Partial<CanvasText>) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, ...attrs } : t));
  };

  const removeText = (id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addCustomFrame = (frame: FrameTemplate) => {
    setCustomFrames(prev => [...prev, frame]);
    saveCustomFrame(frame).catch(err => console.error("Error saving frame DB:", err));
  };

  const deleteCustomFrame = (id: string) => {
    setCustomFrames(prev => prev.filter(f => f.id !== id));
    removeCustomFrame(id).catch(err => console.error("Error deleting frame DB:", err));
  };

  const resetAll = () => {
    setStep('landing');
    setSelectedFrame(null);
    setPhotos([]);
    setStickers([]);
    setTexts([]);
    setSelectedId(null);
    setAppliedFilter('normal');
    setFrameColor('original');
    setFrameStyle('solid');
    setBorderThickness(0);
    setBorderRadius(10);
    setShadowIntensity(0);
    setShadowBlur(5);
    setShadowColor('#000000');
    setFrameOpacity(1);
    setFramePadding(0);
    setInnerMargin(0);
    setOuterMargin(0);
    setWallpaperId('');
    setWallpaperUpload('');
    setWallpaperBlur(0);
    setWallpaperOpacity(1);
    setWallpaperScaleMode('fill');
  };

  return (
    <PhotoboothContext.Provider value={{
      step, setStep, selectedFrame, selectFrame, photos, setPhotoAtSlot, clearPhotos,
      stickers, addSticker, applyStickerPack, updateSticker, removeSticker, texts, addText, updateText, removeText,
      selectedId, setSelectedId, appliedFilter, setAppliedFilter, frameColor, setFrameColor,
      frameStyle, setFrameStyle, borderThickness, setBorderThickness, borderRadius, setBorderRadius,
      shadowIntensity, setShadowIntensity, shadowBlur, setShadowBlur, shadowColor, setShadowColor,
      frameOpacity, setFrameOpacity, framePadding, setFramePadding, innerMargin, setInnerMargin,
      outerMargin, setOuterMargin, wallpaperId, setWallpaperId, wallpaperUpload, setWallpaperUpload,
      wallpaperBlur, setWallpaperBlur, wallpaperOpacity, setWallpaperOpacity, wallpaperScaleMode, setWallpaperScaleMode,
      favoriteColors, toggleFavoriteColor, recentColors, addRecentColor, favoriteWallpapers, toggleFavoriteWallpaper,
      recentWallpapers, addRecentWallpaper, favoriteStickers, toggleFavoriteSticker, resetAll, customFrames,
      addCustomFrame, deleteCustomFrame
    }}>
      {children}
    </PhotoboothContext.Provider>
  );
};

export const usePhotobooth = () => {
  const context = useContext(PhotoboothContext);
  if (!context) {
    throw new Error('usePhotobooth must be used within a PhotoboothProvider');
  }
  return context;
};