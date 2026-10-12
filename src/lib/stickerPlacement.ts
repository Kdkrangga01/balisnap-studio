import type { FrameTemplate } from '../data/frames';

export interface CanvasStickerItem {
  x: number;
  y: number;
}

export type CornerPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface SmartSpot {
  x: number;
  y: number;
  rotation: number;
  cornerName: string;
  slotIndex: number;
}

/**
 * Mendapatkan ukuran ideal stiker proporsional terhadap resolusi bingkai asli
 * (sekitar 12.5% dari lebar bingkai, e.g. 150px pada bingkai 1200px, 100px pada bingkai 800px)
 */
export function getIdealStickerSize(frame: FrameTemplate): { width: number; height: number } {
  const w = Math.round(frame.width * 0.125);
  return { width: w, height: w };
}

/**
 * Menghitung koordinat sudut tertentu dari suatu slot foto dalam koordinat asli bingkai
 */
export function getSlotCornerPosition(
  frame: FrameTemplate,
  slotIndex: number,
  corner: CornerPlacement,
  stickerW?: number,
  stickerH?: number
): { x: number; y: number; rotation: number } {
  const ideal = getIdealStickerSize(frame);
  const w = stickerW || ideal.width;
  const h = stickerH || ideal.height;

  const validIndex = Math.max(0, Math.min(frame.slotCoords.length - 1, slotIndex));
  const slot = frame.slotCoords[validIndex] || {
    x: 40,
    y: 40,
    w: frame.width - 80,
    h: frame.height - 80,
  };

  let x = slot.x;
  let y = slot.y;
  let rotation = 0;

  switch (corner) {
    case 'top-left':
      x = slot.x - w * 0.15;
      y = slot.y - h * 0.22;
      rotation = -4;
      break;
    case 'top-right':
      x = slot.x + slot.w - w * 0.85;
      y = slot.y - h * 0.22;
      rotation = 4;
      break;
    case 'bottom-left':
      x = slot.x - w * 0.15;
      y = slot.y + slot.h - h * 0.78;
      rotation = -5;
      break;
    case 'bottom-right':
      x = slot.x + slot.w - w * 0.85;
      y = slot.y + slot.h - h * 0.78;
      rotation = 5;
      break;
  }

  // Batasi agar tidak keluar kanvas bingkai
  x = Math.max(10, Math.min(frame.width - w - 10, x));
  y = Math.max(10, Math.min(frame.height - h - 10, y));

  return {
    x: Math.round(x),
    y: Math.round(y),
    rotation,
  };
}

/**
 * Menghasilkan daftar seluruh titik dekoratif estetis (Aesthetic Spots) pada bingkai
 * Disusun dengan urutan zig-zag harmonis khas photobooth profesional:
 * Slot 0 (TR), Slot 1 (TL), Slot 2 (TR), Slot 0 (BL), Slot 1 (BR), Slot 2 (BL), dst.
 */
export function getAestheticSpotsList(
  frame: FrameTemplate,
  stickerW?: number,
  stickerH?: number
): SmartSpot[] {
  const ideal = getIdealStickerSize(frame);
  const w = stickerW || ideal.width;
  const h = stickerH || ideal.height;

  const spots: SmartSpot[] = [];
  const slotCount = frame.slotCoords.length;

  if (slotCount === 0) {
    return [
      { x: 30, y: 30, rotation: -3, cornerName: 'top-left', slotIndex: 0 },
      { x: frame.width - w - 30, y: 30, rotation: 3, cornerName: 'top-right', slotIndex: 0 },
      { x: 30, y: frame.height - h - 30, rotation: -4, cornerName: 'bottom-left', slotIndex: 0 },
      { x: frame.width - w - 30, y: frame.height - h - 30, rotation: 4, cornerName: 'bottom-right', slotIndex: 0 },
    ];
  }

  // Urutan prioritas sudut bergantian (zig-zag pattern)
  // Genap (0, 2, 4): TR -> BL -> TL -> BR
  // Ganjil (1, 3, 5): TL -> BR -> TR -> BL
  const pass1: SmartSpot[] = [];
  const pass2: SmartSpot[] = [];
  const pass3: SmartSpot[] = [];
  const pass4: SmartSpot[] = [];

  frame.slotCoords.forEach((_, idx) => {
    const isEven = idx % 2 === 0;
    const corner1: CornerPlacement = isEven ? 'top-right' : 'top-left';
    const corner2: CornerPlacement = isEven ? 'bottom-left' : 'bottom-right';
    const corner3: CornerPlacement = isEven ? 'top-left' : 'top-right';
    const corner4: CornerPlacement = isEven ? 'bottom-right' : 'bottom-left';

    const p1 = getSlotCornerPosition(frame, idx, corner1, w, h);
    pass1.push({ ...p1, cornerName: corner1, slotIndex: idx });

    const p2 = getSlotCornerPosition(frame, idx, corner2, w, h);
    pass2.push({ ...p2, cornerName: corner2, slotIndex: idx });

    const p3 = getSlotCornerPosition(frame, idx, corner3, w, h);
    pass3.push({ ...p3, cornerName: corner3, slotIndex: idx });

    const p4 = getSlotCornerPosition(frame, idx, corner4, w, h);
    pass4.push({ ...p4, cornerName: corner4, slotIndex: idx });
  });

  spots.push(...pass1, ...pass2, ...pass3, ...pass4);

  // Spot tambahan jika ada ruang di header atau footer bingkai
  const firstSlot = frame.slotCoords[0];
  const lastSlot = frame.slotCoords[slotCount - 1];

  if (firstSlot && firstSlot.y > h * 1.1) {
    spots.push({
      x: Math.round(frame.width - w - 30),
      y: Math.round(firstSlot.y * 0.3),
      rotation: 3,
      cornerName: 'header-right',
      slotIndex: 0,
    });
  }

  if (lastSlot && (frame.height - (lastSlot.y + lastSlot.h)) > h * 1.1) {
    spots.push({
      x: 30,
      y: Math.round(lastSlot.y + lastSlot.h + 20),
      rotation: -3,
      cornerName: 'footer-left',
      slotIndex: slotCount - 1,
    });
  }

  return spots;
}

/**
 * Mencari posisi rapi dan pas berikutnya untuk stiker yang baru diklik.
 * Otomatis mendeteksi stiker yang sudah ada di frame sehingga:
 * 1. Tidak menumpuk di atas stiker lain
 * 2. Tidak menutup wajah di tengah foto (menempel rapi di sudut/tepi bingkai)
 * 3. Menyebar seimbang dan harmonis di seluruh frame
 */
export function findNextBestStickerPosition(
  frame: FrameTemplate,
  existingStickers: CanvasStickerItem[],
  stickerW?: number,
  stickerH?: number
): { x: number; y: number; rotation: number } {
  const ideal = getIdealStickerSize(frame);
  const w = stickerW || ideal.width;
  const h = stickerH || ideal.height;

  const candidateSpots = getAestheticSpotsList(frame, w, h);
  if (candidateSpots.length === 0) {
    return { x: 30, y: 30, rotation: 0 };
  }

  // Ambang batas jarak minimal untuk mendeteksi apakah spot sudah ditempati stiker lain
  const minClearance = w * 0.72;

  // 1. Cari kandidat spot pertama yang belum ditempati stiker lain
  for (const spot of candidateSpots) {
    const isOccupied = existingStickers.some((stk) => {
      const dist = Math.hypot(stk.x - spot.x, stk.y - spot.y);
      return dist < minClearance;
    });

    if (!isOccupied) {
      return {
        x: spot.x,
        y: spot.y,
        rotation: spot.rotation,
      };
    }
  }

  // 2. Jika seluruh spot utama sudah terisi (stiker banyak sekali):
  // Pilih spot dengan jarak rata-rata terjauh dari stiker yang ada + beri offset spiral lembut
  let bestSpot = candidateSpots[0];
  let maxMinDist = -1;

  for (const spot of candidateSpots) {
    let minDistToAny = Infinity;
    for (const stk of existingStickers) {
      const dist = Math.hypot(stk.x - spot.x, stk.y - spot.y);
      if (dist < minDistToAny) minDistToAny = dist;
    }
    if (minDistToAny > maxMinDist) {
      maxMinDist = minDistToAny;
      bestSpot = spot;
    }
  }

  // Tambahkan sedikit offset lembut agar tidak menimpa 100% tepat di koordinat yang sama
  const offsetStep = ((existingStickers.length * 16) % 48) - 24;
  const finalX = Math.max(10, Math.min(frame.width - w - 10, bestSpot.x + offsetStep));
  const finalY = Math.max(10, Math.min(frame.height - h - 10, bestSpot.y + offsetStep));
  const finalRot = bestSpot.rotation + (existingStickers.length % 2 === 0 ? 3 : -3);

  return {
    x: Math.round(finalX),
    y: Math.round(finalY),
    rotation: finalRot,
  };
}

/**
 * Backward compatibility: getStickerCornerPosition
 * Mengembalikan koordinat asli bingkai (frame coordinates) agar pas dan rapi
 */
export function getStickerCornerPosition(
  frame: FrameTemplate,
  _canvasWidthOrIgnored: number,
  stickerCount: number,
  stickerW?: number,
  stickerH?: number
): { x: number; y: number } {
  const ideal = getIdealStickerSize(frame);
  const w = stickerW || ideal.width;
  const h = stickerH || ideal.height;

  const spots = getAestheticSpotsList(frame, w, h);
  if (spots.length === 0) return { x: 30, y: 30 };

  const spot = spots[stickerCount % spots.length];
  return { x: spot.x, y: spot.y };
}

export const getFrame4Corners = (
  frame: FrameTemplate,
  _w: number,
  stickerW?: number,
  stickerH?: number
) => getAestheticSpotsList(frame, stickerW, stickerH);

export const getSmartFrameAnchorSpots = (
  frame: FrameTemplate,
  _w: number,
  stickerW?: number,
  stickerH?: number
) => getAestheticSpotsList(frame, stickerW, stickerH);
