import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Helper for category guessing
function guessCategory(filename) {
  const lower = filename.toLowerCase();
  if (lower.startsWith('film') || lower.startsWith('filmstrip')) return 'filmstrip';
  if (lower.startsWith('korean')) return 'korean';
  if (lower.startsWith('polaroid') || lower.includes('polaroid')) return 'polaroid';
  if (lower.startsWith('cute') || lower.includes('cute')) return 'cute';
  if (lower.startsWith('retro') || lower.startsWith('vintage') || lower.startsWith('y2k') || lower.includes('retro')) return 'retro';
  return 'cute'; // default to cute
}

// Helper for title casing names
function formatName(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .split('-')
    .map(word => {
      if (word === '4cut') return '4-Cut';
      if (word === 'y2k') return 'Y2K';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Intersect and merge bounding boxes
function mergeOverlappingRects(rects) {
  let changed = true;
  let currentRects = rects.map(r => ({ ...r }));
  
  while (changed) {
    changed = false;
    const nextRects = [];
    const mergedIndices = new Set();
    
    for (let i = 0; i < currentRects.length; i++) {
      if (mergedIndices.has(i)) continue;
      let r1 = currentRects[i];
      
      for (let j = i + 1; j < currentRects.length; j++) {
        if (mergedIndices.has(j)) continue;
        let r2 = currentRects[j];
        
        // Check if they intersect or are extremely close (within 15px)
        const margin = 15;
        const intersect = r1.x - margin < r2.x + r2.w && r1.x + r1.w + margin > r2.x &&
                          r1.y - margin < r2.y + r2.h && r1.y + r1.h + margin > r2.y;
                          
        if (intersect) {
          const x = Math.min(r1.x, r2.x);
          const y = Math.min(r1.y, r2.y);
          const w = Math.max(r1.x + r1.w, r2.x + r2.w) - x;
          const h = Math.max(r1.y + r1.h, r2.y + r2.h) - y;
          r1 = { x, y, w, h };
          mergedIndices.add(j);
          changed = true;
        }
      }
      nextRects.push(r1);
    }
    currentRects = nextRects;
  }
  
  return currentRects;
}

// Bounding box detection function
function detectSlotsFromRaw(data, w, h) {
  const step = 2;
  const visitedCols = Math.ceil(w / step);
  const visitedRows = Math.ceil(h / step);
  const visited = new Uint8Array(visitedCols * visitedRows);

  const candidates = [];

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const vIdx = Math.floor(y / step) * visitedCols + Math.floor(x / step);
      if (vIdx >= visited.length || visited[vIdx]) continue;

      const pixelIdx = (y * w + x) * 4;
      if (pixelIdx >= data.length) continue;

      const alpha = data[pixelIdx + 3];

      if (alpha < 50) {
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;

        const queue = [[x, y]];
        visited[vIdx] = 1;

        let head = 0;
        while (head < queue.length && queue.length < 1000000) {
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
                if (nPixelIdx < data.length && data[nPixelIdx + 3] < 50) {
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }

        const slotW = maxX - minX + step;
        const slotH = maxY - minY + step;

        const touchesEdge = minX <= 5 || minY <= 5 || maxX >= w - 5 || maxY >= h - 5;
        if (slotW > 30 && slotH > 30 && !touchesEdge) {
          candidates.push({
            x: minX,
            y: minY,
            w: slotW,
            h: slotH
          });
        }
      }
    }
  }

  // Merge overlapping candidates
  const merged = mergeOverlappingRects(candidates);

  // Sort geometrically: top-to-bottom, then left-to-right
  merged.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 30) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  return merged;
}

async function processAll() {
  const templatesDir = './public/templates';
  const framesFile = './src/data/frames.ts';

  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.png'));
  const framesContent = fs.readFileSync(framesFile, 'utf8');

  const missingFiles = files.filter(f => !framesContent.includes(f));
  console.log(`Found ${missingFiles.length} missing templates in config.`);

  if (missingFiles.length === 0) return;

  const results = [];

  for (const filename of missingFiles) {
    const filePath = path.join(templatesDir, filename);
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      const w = metadata.width;
      const h = metadata.height;

      const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const slotCoords = detectSlotsFromRaw(data, w, h);

      const rx = 10; // Default corner rounding
      const formattedSlotCoords = slotCoords.map(s => {
        const item = { x: s.x, y: s.y, w: s.w, h: s.h };
        const cat = guessCategory(filename);
        if (['korean', 'cute', 'retro'].includes(cat)) {
          item.rx = rx;
        }
        return item;
      });

      const frameObj = {
        id: filename.replace(/\.[^/.]+$/, ""),
        name: formatName(filename),
        slots: slotCoords.length,
        category: guessCategory(filename),
        src: `/templates/${filename}`,
        width: w,
        height: h,
        slotCoords: formattedSlotCoords
      };

      results.push(frameObj);
      console.log(`Detected: ${filename} -> slots: ${frameObj.slots}, size: ${w}x${h}, category: ${frameObj.category}`);
    } catch (e) {
      console.error(`Error processing ${filename}:`, e);
    }
  }

  fs.writeFileSync('./scripts/detected_results.json', JSON.stringify(results, null, 2));
  console.log('Saved detected results to scripts/detected_results.json');
}

processAll();
