import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Programmatically generates a high-quality stylized portrait placeholder image
 * using Canvas. Ideal for desktop testing or camera-disabled environments.
 */
export function generateDemoPhoto(slotIndex: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Elegant modern gradient background
  const grad = ctx.createLinearGradient(0, 0, 1200, 900);
  const gradients = [
    ['#FBCFE8', '#D8B4FE'], // Pink to Lavender
    ['#FEF3C7', '#FFCCD5'], // Soft Yellow to Soft Peach
    ['#CFFAFE', '#A5B4FC'], // Mint Blue to Royal Indigo
    ['#ECFDF5', '#A7F3D0'], // Soft Mint to Emerald Green
    ['#E0F2FE', '#F472B6'], // Sky Blue to Bright Pink
    ['#FFEDD5', '#FDA4AF'], // Peach to Rose Gold
  ];
  const pair = gradients[slotIndex % gradients.length];
  grad.addColorStop(0, pair[0]);
  grad.addColorStop(1, pair[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 900);
  
  // Decorative geometric circles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.arc(250, 250, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(950, 650, 250, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw elegant outline shapes
  ctx.strokeStyle = 'rgba(201, 166, 107, 0.4)'; // Muted gold
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(600, 450, 400, 0, Math.PI * 2);
  ctx.stroke();

  // Draw simple elegant silhouette/avatar face
  ctx.fillStyle = '#6B4A3A'; // Mahogany primary
  ctx.beginPath();
  ctx.arc(600, 360, 130, 0, Math.PI * 2); // Head
  ctx.fill();
  
  // Body shoulders
  ctx.beginPath();
  ctx.moveTo(380, 680);
  ctx.quadraticCurveTo(600, 520, 820, 680);
  ctx.lineTo(820, 900);
  ctx.lineTo(380, 900);
  ctx.closePath();
  ctx.fill();
  
  // Cute smile on avatar
  ctx.strokeStyle = '#FAF6F0'; // Ivory
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(600, 370, 60, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#FAF6F0';
  ctx.beginPath();
  ctx.arc(555, 330, 12, 0, Math.PI * 2);
  ctx.arc(645, 330, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Blush cheeks
  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.arc(525, 380, 16, 0, Math.PI * 2);
  ctx.arc(675, 380, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // Sparkle details in corner
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Simple diamond star
  ctx.moveTo(600, 140);
  ctx.quadraticCurveTo(600, 170, 630, 170);
  ctx.quadraticCurveTo(600, 170, 600, 200);
  ctx.quadraticCurveTo(600, 170, 570, 170);
  ctx.quadraticCurveTo(600, 170, 600, 140);
  ctx.fill();

  // Typography labels
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  
  ctx.fillStyle = '#6B4A3A';
  ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`BaliSnap Studio`, 600, 750);
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.font = '600 24px "Poppins", sans-serif';
  ctx.fillStyle = '#C9A66B'; // Gold accent
  ctx.fillText(`PORTRAIT CAPTURE - SLOT ${slotIndex + 1}`, 600, 800);
  
  return canvas.toDataURL('image/jpeg', 0.95);
}

export function applyFilterToImage(dataUrl: string, filter: string): Promise<string> {
  return new Promise((resolve) => {
    if (filter === 'normal') {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.src = dataUrl;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      if (filter === 'grayscale') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filter === 'sepia') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filter === 'vintage') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189) + 15);
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168) + 5);
          data[i + 2] = Math.max(0, (r * 0.272) + (g * 0.534) + (b * 0.131) - 15);
        }
        ctx.putImageData(imgData, 0, 0);
        // Multiply warm yellow tint
        ctx.fillStyle = 'rgba(217, 119, 6, 0.1)';
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (filter === 'cool') {
        // Boost blue channel, reduce red channel
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] - 10);
          data[i + 2] = Math.min(255, data[i + 2] + 20);
        }
        ctx.putImageData(imgData, 0, 0);
        // Soft blue overlay
        ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.globalCompositeOperation = 'color';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (filter === 'vivid') {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          // Saturation factor 1.4
          data[i] = Math.min(255, Math.max(0, gray + 1.45 * (r - gray)));
          data[i + 1] = Math.min(255, Math.max(0, gray + 1.45 * (g - gray)));
          data[i + 2] = Math.min(255, Math.max(0, gray + 1.45 * (b - gray)));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
  });
}

/**
 * Automatically detects transparent rectangles (slots) in an image or canvas.
 * Useful for both real-time canvas rendering and automatic custom frame slot calibration.
 */
export interface DetectedSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Helper to determine if a pixel is likely part of a photo slot placeholder
function isSlotPixel(r: number, g: number, b: number, a: number): boolean {
  // 1. Transparent
  if (a < 50) return true;
  // 2. Solid White (common for JPEG/PNG slots with white screens)
  if (r > 240 && g > 240 && b > 240 && a > 200) return true;
  // 3. Solid Black (common for film strip slots)
  if (r < 15 && g < 15 && b < 15 && a > 200) return true;
  // 4. Chroma Green
  if (g > 200 && r < 60 && b < 60 && a > 200) return true;
  // 5. Chroma Blue
  if (b > 200 && r < 60 && g < 60 && a > 200) return true;
  
  return false;
}

export function detectTransparentSlots(
  source: HTMLImageElement | HTMLCanvasElement,
  expectedCount?: number
): DetectedSlot[] {
  let canvas: HTMLCanvasElement;
  if (source instanceof HTMLImageElement) {
    canvas = document.createElement('canvas');
    canvas.width = source.width || source.naturalWidth;
    canvas.height = source.height || source.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(source, 0, 0);
  } else {
    canvas = source;
  }

  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Scan using a step size of 2 for fast, sub-pixel accurate boundary tracking
  const step = 2;
  const visitedCols = Math.ceil(w / step);
  const visitedRows = Math.ceil(h / step);
  const visited = new Uint8Array(visitedCols * visitedRows);

  const candidates: { x: number; y: number; w: number; h: number; area: number }[] = [];

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const vIdx = Math.floor(y / step) * visitedCols + Math.floor(x / step);
      if (vIdx >= visited.length || visited[vIdx]) continue;

      const pixelIdx = (y * w + x) * 4;
      if (pixelIdx >= data.length) continue;
      
      const r = data[pixelIdx];
      const g = data[pixelIdx + 1];
      const b = data[pixelIdx + 2];
      const alpha = data[pixelIdx + 3];

      // Slot pixel seed detection
      if (isSlotPixel(r, g, b, alpha)) {
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;

        const queue: [number, number][] = [[x, y]];
        visited[vIdx] = 1;

        let head = 0;
        while (head < queue.length && queue.length < 50000) {
          const [cx, cy] = queue[head++];

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const neighbors = [
            [cx - step, cy],
            [cx + step, cy],
            [cx, cy - step],
            [cx, cy + step],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nvIdx = Math.floor(ny / step) * visitedCols + Math.floor(nx / step);
              if (nvIdx < visited.length && !visited[nvIdx]) {
                visited[nvIdx] = 1;
                const nPixelIdx = (ny * w + nx) * 4;
                if (nPixelIdx < data.length) {
                  const nr = data[nPixelIdx];
                  const ng = data[nPixelIdx + 1];
                  const nb = data[nPixelIdx + 2];
                  const na = data[nPixelIdx + 3];
                  if (isSlotPixel(nr, ng, nb, na)) {
                    queue.push([nx, ny]);
                  }
                }
              }
            }
          }
        }

        const slotW = maxX - minX + step;
        const slotH = maxY - minY + step;
        const area = slotW * slotH;

        // Bounding box filter to ignore small transparencies (e.g. sprocket holes)
        // and background regions touching the outer edge margins.
        const touchesEdge = minX <= 5 || minY <= 5 || maxX >= w - 5 || maxY >= h - 5;
        if (slotW > 40 && slotH > 40 && !touchesEdge) {
          candidates.push({
            x: minX,
            y: minY,
            w: slotW,
            h: slotH,
            area: area,
          });
        }
      }
    }
  }

  if (expectedCount !== undefined && expectedCount > 0) {
    candidates.sort((a, b) => b.area - a.area);
    const selected = candidates.slice(0, expectedCount);

    if (selected.length !== expectedCount) {
      return [];
    }

    // Sort geometrically: top-to-bottom, left-to-right
    selected.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 30) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    return selected.map((c) => ({
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
    }));
  }

  // Return all detected candidates sorted geometrically
  candidates.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 30) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  return candidates.map((c) => ({
    x: c.x,
    y: c.y,
    w: c.w,
    h: c.h,
  }));
}
