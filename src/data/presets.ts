import type { FrameColorId } from './frameColors';
import type { FilterType } from '../context/PhotoboothContext';

export interface PhotoboothPreset {
  id: string;
  name: string;
  emoji: string;
  frameColor: FrameColorId;
  appliedFilter: FilterType;
  wallpaperId: string;
  borderThickness: number;
  borderRadius: number;
  shadowIntensity: number;
  framePadding: number;
  frameOpacity: number;
}

export const presets: PhotoboothPreset[] = [
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    emoji: '🌸',
    frameColor: 'pastelPink',
    appliedFilter: 'vintage',
    wallpaperId: 'cute-hearts',
    borderThickness: 4,
    borderRadius: 15,
    shadowIntensity: 4,
    framePadding: 10,
    frameOpacity: 0.95
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    emoji: '🌿',
    frameColor: 'pastelGreen',
    appliedFilter: 'normal',
    wallpaperId: 'floral-daisy',
    borderThickness: 2,
    borderRadius: 12,
    shadowIntensity: 2,
    framePadding: 8,
    frameOpacity: 1
  },
  {
    id: 'sakura-dream',
    name: 'Sakura Dream',
    emoji: '💮',
    frameColor: 'pastelPink',
    appliedFilter: 'vintage',
    wallpaperId: 'gradient-sakura',
    borderThickness: 6,
    borderRadius: 20,
    shadowIntensity: 3,
    framePadding: 14,
    frameOpacity: 0.9
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    emoji: '🌅',
    frameColor: 'pastelYellow',
    appliedFilter: 'cool',
    wallpaperId: 'sky-sunset',
    borderThickness: 4,
    borderRadius: 10,
    shadowIntensity: 5,
    framePadding: 12,
    frameOpacity: 0.95
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    emoji: '🌊',
    frameColor: 'pastelBlue',
    appliedFilter: 'cool',
    wallpaperId: 'ocean-calm',
    borderThickness: 2,
    borderRadius: 8,
    shadowIntensity: 3,
    framePadding: 6,
    frameOpacity: 1
  },
  {
    id: 'galaxy-starry',
    name: 'Starry Galaxy',
    emoji: '🌌',
    frameColor: 'black',
    appliedFilter: 'cool',
    wallpaperId: 'galaxy-starry',
    borderThickness: 8,
    borderRadius: 16,
    shadowIntensity: 7,
    framePadding: 18,
    frameOpacity: 0.85
  },
  {
    id: 'y2k-cyber',
    name: 'Y2K Cyber',
    emoji: '👾',
    frameColor: 'black',
    appliedFilter: 'vivid',
    wallpaperId: 'pixel-grid',
    borderThickness: 5,
    borderRadius: 0,
    shadowIntensity: 8,
    framePadding: 10,
    frameOpacity: 0.9
  }
];
