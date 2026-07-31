import type { FrameTemplate } from '../data/frames';

export interface CanvasStickerItem {
  x: number;
  y: number;
}

export interface SmartSpot {
  x: number;
  y: number;
  cornerName: string;
}

/**
 * Checks if a sticker bounding box overlaps any photo slot.
 */
export function doesOverlapPhotoSlot(
  x: number,
  y: number,
  w: number,
  h: number,
  scaledSlots: Array<{ x: number; y: number; w: number; h: number }>,
  padding = 4
): boolean {
  for (const slot of scaledSlots) {
    if (
      x < slot.x + slot.w + padding &&
      x + w > slot.x - padding &&
      y < slot.y + slot.h + padding &&
      y + h > slot.y - padding
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Computes safe outer corner anchor spots for EVERY photo slot in the frame.
 * Ensures the number of spots matches/covers all photo slots from top to bottom.
 */
export function getSlotCornerSpots(
  frame: FrameTemplate,
  canvasWidth: number,
  stickerW = 44,
  stickerH = 44
): SmartSpot[] {
  const scale = canvasWidth / frame.width;
  const canvasHeight = Math.round(frame.height * scale);

  const scaledSlots = frame.slotCoords.map((slot) => ({
    x: Math.round(slot.x * scale),
    y: Math.round(slot.y * scale),
    w: Math.round(slot.w * scale),
    h: Math.round(slot.h * scale),
  }));

  const spots: SmartSpot[] = [];

  scaledSlots.forEach((slot, idx) => {
    const isLeft = slot.x + slot.w / 2 <= canvasWidth / 2;
    const isTop = slot.y + slot.h / 2 <= canvasHeight / 2;

    const corner1 = {
      x: isLeft ? Math.max(6, slot.x - stickerW + 8) : Math.min(canvasWidth - stickerW - 6, slot.x + slot.w - 8),
      y: Math.max(6, slot.y - stickerH + 8),
      cornerName: `slot-${idx}-top`,
    };

    const corner2 = {
      x: isLeft ? Math.max(6, slot.x - stickerW + 8) : Math.min(canvasWidth - stickerW - 6, slot.x + slot.w - 8),
      y: Math.min(canvasHeight - stickerH - 6, slot.y + slot.h - 8),
      cornerName: `slot-${idx}-bottom`,
    };

    [corner1, corner2].forEach((c) => {
      let { x, y, cornerName } = c;
      let attempts = 0;
      while (doesOverlapPhotoSlot(x, y, stickerW, stickerH, scaledSlots, 2) && attempts < 15) {
        attempts++;
        if (isLeft) {
          x = Math.max(6, x - 5);
        } else {
          x = Math.min(canvasWidth - stickerW - 6, x + 5);
        }
        if (isTop) {
          y = Math.max(6, y - 5);
        } else {
          y = Math.min(canvasHeight - stickerH - 6, y + 5);
        }
      }

      x = Math.max(6, Math.min(canvasWidth - stickerW - 6, x));
      y = Math.max(6, Math.min(canvasHeight - stickerH - 6, y));

      spots.push({ x, y, cornerName });
    });
  });

  return spots;
}

/**
 * Calculates the exact corner spot for adding a new sticker.
 * Dynamically matches all photo slots in the frame.
 */
export function getStickerCornerPosition(
  frame: FrameTemplate,
  canvasWidth: number,
  stickerCount: number,
  stickerW = 44,
  stickerH = 44
): { x: number; y: number } {
  const spots = getSlotCornerSpots(frame, canvasWidth, stickerW, stickerH);

  if (spots.length === 0) {
    return { x: 12, y: 12 };
  }

  const spotIdx = stickerCount % spots.length;
  const ringIdx = Math.floor(stickerCount / spots.length);

  const base = spots[spotIdx];
  let finalX = base.x;
  let finalY = base.y;

  if (ringIdx > 0) {
    const step = 12 * ringIdx;
    finalX = Math.max(6, Math.min(canvasWidth - stickerW - 6, finalX + (spotIdx % 2 === 0 ? step : -step)));
    finalY = Math.max(6, Math.min(Math.round((frame.height / frame.width) * canvasWidth) - stickerH - 6, finalY + step));
  }

  return { x: finalX, y: finalY };
}

// Backward compatibility exports
export const getFrame4Corners = getSlotCornerSpots;
export const getSmartFrameAnchorSpots = getSlotCornerSpots;
export const findNextBestStickerPosition = (
  frame: FrameTemplate,
  canvasWidth: number,
  existingStickers: CanvasStickerItem[],
  stickerW = 44,
  stickerH = 44
) => getStickerCornerPosition(frame, canvasWidth, existingStickers.length, stickerW, stickerH);
