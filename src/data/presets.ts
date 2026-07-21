import type { FrameColorId } from './frameColors';
import type { FilterType } from '../context/PhotoboothContext';

export interface PhotoboothPreset {
  id: string;
  name: string;
  emoji: string;
  /** Kelompok tampilan opsional, untuk memudahkan grouping di UI nanti */
  category?: 'cute' | 'glam' | 'moody' | 'nature' | 'retro';
  frameColor: FrameColorId;
  appliedFilter: FilterType;
  wallpaperId: string;
  borderThickness: number;
  borderRadius: number;
  shadowIntensity: number;
  framePadding: number;
  frameOpacity: number;
}

/**
 * ATURAN WARNA (biar gak bentrok):
 * - frameOpacity SELALU 1 kecuali frameColor & wallpaper berasal dari
 *   keluarga hue yang sama (contoh: frame pink + wallpaper pink).
 *   Opacity < 1 dengan hue yang beda bikin warna wallpaper "nembus"
 *   dan campur jadi warna baru yang gak terduga -> itu sumber bug lama.
 * - Semua wallpaperId & frameColor di bawah sudah dicocokkan manual
 *   dengan hex asli di frameColors.ts & wallpapers.ts.
 */

export const presets: PhotoboothPreset[] = [
  // ---------- CUTE / GIRLY ----------
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    emoji: '🌸',
    category: 'cute',
    frameColor: 'pastelPink',       // #f7c9dd
    appliedFilter: 'vintage',
    wallpaperId: 'cute-hearts',     // bg #fdf2f8, aksen pink -> 1 keluarga
    borderThickness: 4,
    borderRadius: 18,
    shadowIntensity: 4,
    framePadding: 10,
    frameOpacity: 1                 // FIX: sebelumnya 0.95, bikin nembus
  },
  {
    id: 'sakura-dream',
    name: 'Sakura Dream',
    emoji: '💮',
    category: 'cute',
    frameColor: 'pastelPink',       // #f7c9dd
    appliedFilter: 'normal',        // FIX: vintage terlalu menuakan warna sakura
    wallpaperId: 'gradient-sakura', // blush #ffe4e6 -> #fbcfe8, 1 keluarga pink
    borderThickness: 6,
    borderRadius: 22,
    shadowIntensity: 3,
    framePadding: 14,
    frameOpacity: 0.95              // aman: sama-sama pink, blend tetap mulus
  },
  {
    id: 'cherry-soda',
    name: 'Cherry Soda',
    emoji: '🍒',
    category: 'cute',
    frameColor: 'maroon',           // #5c1414, senada aksen merah ceri
    appliedFilter: 'vintage',
    wallpaperId: 'cute-cherries',   // bg krem + ceri merah
    borderThickness: 5,
    borderRadius: 16,
    shadowIntensity: 4,
    framePadding: 10,
    frameOpacity: 1
  },
  {
    id: 'cotton-candy-sky',
    name: 'Cotton Candy Sky',
    emoji: '☁️',
    category: 'cute',
    frameColor: 'white',            // putih gak pernah bentrok, aman utk apapun
    appliedFilter: 'normal',
    wallpaperId: 'sky-clouds',      // biru cerah lembut
    borderThickness: 6,
    borderRadius: 24,
    shadowIntensity: 3,
    framePadding: 12,
    frameOpacity: 1
  },
  {
    id: 'milk-tea',
    name: 'Milk Tea',
    emoji: '🧋',
    category: 'cute',
    frameColor: 'pastelTan',        // #dcbe9c
    appliedFilter: 'sepia',
    wallpaperId: 'cute-peach-grid', // peach lembut #ffedd5, 1 keluarga hangat
    borderThickness: 4,
    borderRadius: 16,
    shadowIntensity: 2,
    framePadding: 10,
    frameOpacity: 0.95              // aman: tan & peach sehue, hangat semua
  },

  // ---------- NATURE ----------
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    emoji: '🌿',
    category: 'nature',
    frameColor: 'pastelGreen',      // #a9c98f
    appliedFilter: 'normal',
    wallpaperId: 'floral-daisy',    // bg mint pucat + aksen kuning, sehue hijau
    borderThickness: 2,
    borderRadius: 12,
    shadowIntensity: 2,
    framePadding: 8,
    frameOpacity: 1
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    emoji: '🌊',
    category: 'nature',
    frameColor: 'pastelBlue',       // #c2e4f2
    appliedFilter: 'cool',
    wallpaperId: 'ocean-calm',      // teal #0d9488 -> #2dd4bf, sekeluarga biru
    borderThickness: 2,
    borderRadius: 10,
    shadowIntensity: 3,
    framePadding: 6,
    frameOpacity: 1                 // FIX: sebelumnya 1 sudah benar, dipertahankan
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    emoji: '🌅',
    category: 'nature',
    frameColor: 'pastelYellow',     // #f6efb0
    appliedFilter: 'vivid',         // FIX: sebelumnya 'cool', kontra tema hangat
    wallpaperId: 'sky-sunset',      // oranye #fdba74 -> pink #f472b6, hangat
    borderThickness: 4,
    borderRadius: 14,
    shadowIntensity: 5,
    framePadding: 12,
    frameOpacity: 1                 // FIX: sebelumnya 0.95
  },

  // ---------- GLAM / MODERN ----------
  {
    id: 'aurora-dream',
    name: 'Aurora Dream',
    emoji: '🌈',
    category: 'glam',
    frameColor: 'pastelLavender',   // #cbb6e8, ada di spektrum gradient aurora
    appliedFilter: 'vivid',
    wallpaperId: 'gradient-aurora', // hijau-biru-ungu
    borderThickness: 4,
    borderRadius: 16,
    shadowIntensity: 5,
    framePadding: 12,
    frameOpacity: 1
  },
  {
    id: 'golden-hour-glam',
    name: 'Golden Hour Glam',
    emoji: '✨',
    category: 'glam',
    frameColor: 'creamSolid',       // #f4ecd8, sehue dengan gold dust
    appliedFilter: 'sepia',
    wallpaperId: 'glitter-gold',    // gelap + partikel emas
    borderThickness: 6,
    borderRadius: 10,
    shadowIntensity: 6,
    framePadding: 14,
    frameOpacity: 1                 // penting: gelap vs krem, jangan ditembusin
  },

  // ---------- MOODY / RETRO ----------
  {
    id: 'starry-galaxy',
    name: 'Starry Galaxy',
    emoji: '🌌',
    category: 'moody',
    frameColor: 'black',
    appliedFilter: 'cool',
    wallpaperId: 'galaxy-starry',
    borderThickness: 8,
    borderRadius: 16,
    shadowIntensity: 7,
    framePadding: 18,
    frameOpacity: 1                 // FIX: sebelumnya 0.85, bikin pinggiran belang ungu
  },
  {
    id: 'midnight-forest',
    name: 'Midnight Forest',
    emoji: '🌲',
    category: 'moody',
    frameColor: 'black',
    appliedFilter: 'cool',
    wallpaperId: 'gradient-dark-forest',
    borderThickness: 6,
    borderRadius: 8,
    shadowIntensity: 6,
    framePadding: 12,
    frameOpacity: 1
  },
  {
    id: 'y2k-cyber',
    name: 'Y2K Cyber',
    emoji: '👾',
    category: 'retro',
    frameColor: 'black',
    appliedFilter: 'vivid',
    wallpaperId: 'pixel-grid',
    borderThickness: 5,
    borderRadius: 0,
    shadowIntensity: 8,
    framePadding: 10,
    frameOpacity: 1                 // FIX: sebelumnya 0.9
  }
];