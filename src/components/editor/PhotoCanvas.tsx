import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect, Group } from 'react-konva';
import Konva from 'konva';
import { usePhotobooth } from '../../context/PhotoboothContext';
import type { CanvasSticker, CanvasText } from '../../context/PhotoboothContext';
import { applyFilterToImage, detectTransparentSlots } from '../../lib/utils';
import { frameColors } from '../../data/frameColors';
import { wallpapers } from '../../data/wallpapers';


// ====================================================================
// Robustly load an SVG frame image at EXACT pixel dimensions.
// ====================================================================
async function loadFrameAtExactSize(
  src: string,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement | null> {
  try {
    const isSvg = src.endsWith('.svg') || src.includes('.svg');
    let imgSrc = src;

    if (isSvg) {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`);
      let svgText = await response.text();

      svgText = svgText.replace(
        /<svg([^>]*)>/,
        (_match, attrs) => {
          let cleanAttrs = attrs
            .replace(/\bwidth\s*=\s*"[^"]*"/g, '')
            .replace(/\bheight\s*=\s*"[^"]*"/g, '')
            .trim();
          return `<svg width="${targetWidth}" height="${targetHeight}" ${cleanAttrs}>`;
        }
      );

      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      imgSrc = URL.createObjectURL(blob);
    }

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = 'Anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image load failed'));
      image.src = imgSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    if (isSvg && imgSrc !== src) {
      URL.revokeObjectURL(imgSrc);
    }

    return canvas;
  } catch (err) {
    console.error('Failed to load frame:', err);
    return null;
  }
}

// ====================================================================
// Chromakey helper to make solid frame backgrounds transparent
// ------------------------------------------------------------
// FIX (BaliSnap bugfix): Sebelumnya fungsi ini hanya sampling kotak
// 40x40 di POJOK KIRI-ATAS canvas untuk menebak warna dominan latar
// belakang frame. Kalau desain frame (mis. template tiket bioskop
// dengan barcode, teks "NOW SHOWING", garis putus-putus, dsb) punya
// elemen dekoratif persis di pojok kiri-atas, deteksi warna dominan
// jadi salah -> chroma-key gagal melubangi background -> frame SVG
// asli (opaque) tetap digambar utuh di atas warna/wallpaper baru yang
// dipilih user -> user merasa "diklik tapi gak ada perubahan sama
// sekali", padahal state di React sudah berubah dengan benar.
//
// Sekarang sampling dilakukan dari BEBERAPA region (4 pojok + tengah
// atas/bawah), supaya kalau satu region "terkontaminasi" elemen
// dekoratif, region lain tetap mewakili warna background asli dengan
// akurat.
// ====================================================================
function keyOutBackgroundColor(canvas: HTMLCanvasElement, tolerance = 28): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sampling dari beberapa titik region, bukan cuma 1 pojok
  const sampleSize = Math.max(8, Math.min(40, Math.floor(w / 3), Math.floor(h / 3)));
  const regions: { x0: number; y0: number }[] = [
    { x0: 0, y0: 0 },                                              // kiri-atas
    { x0: Math.max(0, w - sampleSize), y0: 0 },                    // kanan-atas
    { x0: 0, y0: Math.max(0, h - sampleSize) },                    // kiri-bawah
    { x0: Math.max(0, w - sampleSize), y0: Math.max(0, h - sampleSize) }, // kanan-bawah
    { x0: Math.max(0, Math.floor(w / 2 - sampleSize / 2)), y0: 0 }, // tengah-atas
    { x0: Math.max(0, Math.floor(w / 2 - sampleSize / 2)), y0: Math.max(0, h - sampleSize) }, // tengah-bawah
  ];

  const colorCounts: Record<string, number> = {};

  regions.forEach(({ x0, y0 }) => {
    for (let y = y0; y < y0 + sampleSize; y++) {
      for (let x = x0; x < x0 + sampleSize; x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 15) continue; // Skip transparent pixels

        // Quantize to group similar colors (divide by 16 to smooth out noise/gradients)
        const qr = Math.round(r / 16) * 16;
        const qg = Math.round(g / 16) * 16;
        const qb = Math.round(b / 16) * 16;
        const key = `${qr},${qg},${qb}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }
    }
  });

  // Sort colors by frequency
  const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

  if (sortedColors.length === 0) return canvas;

  // Dominant color A
  const parseRGB = (str: string) => str.split(',').map(Number);
  const colorA = parseRGB(sortedColors[0][0]);

  // Find dominant color B (must be visually distinct from color A)
  let colorB: number[] | null = null;
  for (let i = 1; i < sortedColors.length; i++) {
    const c = parseRGB(sortedColors[i][0]);
    const dist = Math.sqrt((c[0] - colorA[0]) ** 2 + (c[1] - colorA[1]) ** 2 + (c[2] - colorA[2]) ** 2);
    if (dist > 50) { // Distinct threshold
      colorB = c;
      break;
    }
  }

  // Key out pixels matching Color A or Color B
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const distA = Math.sqrt((r - colorA[0]) ** 2 + (g - colorA[1]) ** 2 + (b - colorA[2]) ** 2);
    let distB = 999999;
    if (colorB) {
      distB = Math.sqrt((r - colorB[0]) ** 2 + (g - colorB[1]) ** 2 + (b - colorB[2]) ** 2);
    }

    if (distA <= tolerance || distB <= tolerance) {
      data[i + 3] = 0; // Make transparent
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// Simple custom hook to load images programmatically
export function useLoadedImage(src: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load image:", src);
    };
  }, [src]);

  return image;
}

interface PhotoCanvasProps {
  stageRef: React.RefObject<any>;
  containerWidth: number;
  isPreviewMode?: boolean;
}

export const PhotoCanvas: React.FC<PhotoCanvasProps> = ({ stageRef, containerWidth, isPreviewMode = false }) => {
  const {
    selectedFrame,
    photos,
    stickers,
    updateSticker,
    texts,
    updateText,
    selectedId,
    setSelectedId,
    appliedFilter,
    frameColor,
    frameStyle,
    borderThickness,
    borderRadius,
    shadowIntensity,
    shadowBlur,
    shadowColor,
    frameOpacity,
    framePadding,
    wallpaperId,
    wallpaperUpload,
    wallpaperBlur,
    wallpaperOpacity,
    wallpaperScaleMode
  } = usePhotobooth();


  const trRef = useRef<any>(null);
  const wallpaperRef = useRef<any>(null);

  if (!selectedFrame) return null;

  const { width: frameWidth, height: frameHeight, slotCoords, src: frameSrc } = selectedFrame;

  // Calculate scaling factor to fit the stage inside the editor workspace
  const scale = containerWidth / frameWidth;
  const stageWidth = containerWidth;
  const stageHeight = frameHeight * scale;

  // ====================================================================
  // WALLPAPER LAYER SETUP
  // ====================================================================
  const [wallpaperCanvas, setWallpaperCanvas] = useState<HTMLCanvasElement | null>(null);
  const uploadedWallpaperImg = useLoadedImage(wallpaperUpload || null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (wallpaperId) {
      const activeWallpaper = wallpapers.find(w => w.id === wallpaperId);
      if (activeWallpaper) {
        const fillVal = activeWallpaper.getFill(ctx, frameWidth, frameHeight);
        ctx.fillStyle = fillVal;
        ctx.fillRect(0, 0, frameWidth, frameHeight);
        setWallpaperCanvas(canvas);
      } else {
        console.warn('BaliSnap Debug - Wallpaper id not found in wallpapers list:', wallpaperId);
        setWallpaperCanvas(null);
      }
    } else if (uploadedWallpaperImg) {
      const imgW = uploadedWallpaperImg.width;
      const imgH = uploadedWallpaperImg.height;
      if (wallpaperScaleMode === 'stretch') {
        ctx.drawImage(uploadedWallpaperImg, 0, 0, frameWidth, frameHeight);
      } else if (wallpaperScaleMode === 'fit') {
        const ratio = Math.min(frameWidth / imgW, frameHeight / imgH);
        const w = imgW * ratio;
        const h = imgH * ratio;
        const x = (frameWidth - w) / 2;
        const y = (frameHeight - h) / 2;
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, frameWidth, frameHeight);
        ctx.drawImage(uploadedWallpaperImg, x, y, w, h);
      } else {
        const ratio = Math.max(frameWidth / imgW, frameHeight / imgH);
        const w = imgW * ratio;
        const h = imgH * ratio;
        const x = (frameWidth - w) / 2;
        const y = (frameHeight - h) / 2;
        ctx.drawImage(uploadedWallpaperImg, x, y, w, h);
      }
      setWallpaperCanvas(canvas);
    } else {
      setWallpaperCanvas(null);
    }
  }, [wallpaperId, uploadedWallpaperImg, wallpaperScaleMode, frameWidth, frameHeight]);

  useEffect(() => {
    if (wallpaperRef.current) {
      wallpaperRef.current.cache();
      wallpaperRef.current.getLayer()?.batchDraw();
    }
  }, [wallpaperBlur, wallpaperCanvas, uploadedWallpaperImg]);

  // ====================================================================
  // FRAME OVERLAY: Load SVG and dynamically process cutouts.
  // We automatically detect actual transparent slots and compare with
  // hardcoded slotCoords, then pick whichever is more accurate (larger/
  // closer to the real cutout) so the photo never renders too small.
  // ====================================================================
  const [processedFrameImg, setProcessedFrameImg] = useState<HTMLCanvasElement | null>(null);
  const [activeSlotCoords, setActiveSlotCoords] = useState<typeof slotCoords>(slotCoords);


  useEffect(() => {
    let cancelled = false;

    async function processFrame() {
      // Step 1: Load the SVG/image at exact frameWidth x frameHeight
      const frameCanvas = await loadFrameAtExactSize(frameSrc, frameWidth, frameHeight);
      if (cancelled || !frameCanvas) {
        if (!cancelled) {
          console.error('BaliSnap Debug - Frame failed to load, cannot render color/wallpaper changes. Src:', frameSrc);
          setProcessedFrameImg(null);
          setActiveSlotCoords(slotCoords);
        }
        return;
      }

      // Step 2: Try to detect actual transparent slot locations from frame image
      const detected = detectTransparentSlots(frameCanvas, slotCoords.length);

      // Step 2b: Key out the background color if custom frame color is selected
      if (frameColor !== 'original') {
        keyOutBackgroundColor(frameCanvas, 28);
      }

      console.log('BaliSnap Debug - Frame Src:', frameSrc);
      console.log('BaliSnap Debug - Hardcoded slotCoords:', slotCoords);
      console.log('BaliSnap Debug - Detected slots:', detected);

      let finalSlotCoords = slotCoords;

      if (detected.length === slotCoords.length) {
        // ------------------------------------------------------------
        // Jangan langsung pakai hasil deteksi mentah-mentah.
        // Bandingkan luas area terdeteksi vs hardcoded per-slot, lalu
        // pilih yang paling "pas" (lebih besar/mendekati lubang asli
        // di frame). Ini mencegah foto tampil kekecilan (ada celah
        // putih di sekeliling foto).
        // ------------------------------------------------------------
        finalSlotCoords = detected.map((dSlot, idx) => {
          const hardcoded = slotCoords[idx];
          if (!hardcoded) return dSlot;

          const detectedArea = dSlot.w * dSlot.h;
          const hardcodedArea = hardcoded.w * hardcoded.h;

          const isTooSmall = hardcodedArea > detectedArea * 1.08;
          const isTooLarge = detectedArea > hardcodedArea * 1.15;
          const useHardcoded = isTooSmall || isTooLarge;
          const chosen = useHardcoded ? hardcoded : dSlot;

          console.log(
            `BaliSnap Debug - Slot ${idx}: detectedArea=${detectedArea.toFixed(0)}, hardcodedArea=${hardcodedArea.toFixed(0)}, using=${useHardcoded ? 'hardcoded' : 'detected'}`
          );

          return {
            ...chosen,
            rx: hardcoded.rx,
          };
        });
      } else {
        console.log(`BaliSnap Debug - Detection FALLBACK (detected ${detected.length} slots, expected ${slotCoords.length})`);
      }

      if (!cancelled) {
        setActiveSlotCoords(finalSlotCoords);
      }

      // Step 3: Create final output canvas at exact dimensions
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = frameWidth;
      outputCanvas.height = frameHeight;
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) {
        setProcessedFrameImg(frameCanvas);
        return;
      }

      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.globalAlpha = frameOpacity;

      // 1. Draw custom color / gradient background
      if (frameColor !== 'original') {
        let fillStyle: string | CanvasGradient | CanvasPattern = '#ffffff';
        if (frameColor.startsWith('#')) {
          fillStyle = frameColor;
        } else {
          const colorOpt = frameColors.find(c => c.id === frameColor);
          if (colorOpt) {
            fillStyle = colorOpt.getFill(ctx, frameWidth, frameHeight);
          } else {
            console.warn('BaliSnap Debug - frameColor id not found in frameColors list:', frameColor);
          }
        }
        ctx.fillStyle = fillStyle;
        ctx.fillRect(0, 0, frameWidth, frameHeight);
      }

      // 2. Apply glassmorphism or special styles
      if (frameStyle === 'glassmorphism') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, 0, frameWidth, frameHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, frameWidth - 4, frameHeight - 4);
      } else if (frameStyle === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, 0, frameHeight);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, frameWidth, frameHeight);
      }

      // 3. Draw the original frame template image
      if (frameColor !== 'original') {
        // Draw white glow/outline to isolate borders, text, and logos from the custom background pattern
        ctx.filter = 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.95)) drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.85))';
        ctx.drawImage(frameCanvas, 0, 0);

        // Draw soft dark drop shadow for realistic 3D depth
        ctx.filter = 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25))';
        ctx.drawImage(frameCanvas, 0, 0);

        // Reset filter for final original rendering
        ctx.filter = 'none';
      }

      ctx.drawImage(frameCanvas, 0, 0);
      ctx.globalAlpha = 1;

      // 4. Apply diagonal premium shine (glossy / reflection) overlay on top of frame
      if (frameStyle === 'glossy') {
        const shineGrad = ctx.createLinearGradient(0, 0, frameWidth, frameHeight);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        shineGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.0)');
        shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
        shineGrad.addColorStop(0.32, 'rgba(255, 255, 255, 0.35)');
        shineGrad.addColorStop(0.34, 'rgba(255, 255, 255, 0.15)');
        shineGrad.addColorStop(0.39, 'rgba(255, 255, 255, 0.0)');
        shineGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.0)');
        shineGrad.addColorStop(0.44, 'rgba(255, 255, 255, 0.2)');
        shineGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = shineGrad;
        ctx.fillRect(0, 0, frameWidth, frameHeight);
      }

      // Check if the frame canvas already has transparent pixels (alpha < 220)
      let hasAlpha = false;
      const frameImgData = ctx.getImageData(0, 0, frameWidth, frameHeight);
      const frameData = frameImgData.data;
      for (let i = 3; i < frameData.length; i += 40) {
        if (frameData[i] < 220) {
          hasAlpha = true;
          break;
        }
      }

      if (!hasAlpha) {
        // Cut out slot areas (makes it double-safe even if there was no transparency)
        ctx.globalCompositeOperation = 'destination-out';
        finalSlotCoords.forEach((slot) => {
          const rx = slot.rx || 0;
          if (rx > 0) {
            ctx.beginPath();
            ctx.moveTo(slot.x + rx, slot.y);
            ctx.lineTo(slot.x + slot.w - rx, slot.y);
            ctx.quadraticCurveTo(slot.x + slot.w, slot.y, slot.x + slot.w, slot.y + rx);
            ctx.lineTo(slot.x + slot.w, slot.y + slot.h - rx);
            ctx.quadraticCurveTo(slot.x + slot.w, slot.y + slot.h, slot.x + slot.w - rx, slot.y + slot.h);
            ctx.lineTo(slot.x + rx, slot.y + slot.h);
            ctx.quadraticCurveTo(slot.x, slot.y + slot.h, slot.x, slot.y + slot.h - rx);
            ctx.lineTo(slot.x, slot.y + rx);
            ctx.quadraticCurveTo(slot.x, slot.y, slot.x + rx, slot.y);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
          }
        });
      }

      if (!cancelled) {
        setProcessedFrameImg(outputCanvas);
      }
    }

    processFrame();
    return () => { cancelled = true; };
  }, [frameSrc, slotCoords, frameWidth, frameHeight, frameColor, frameStyle, frameOpacity]);


  // ====================================================================
  // PHOTO LOADING: Load all photos with applied filters
  // ====================================================================
  const [loadedPhotos, setLoadedPhotos] = useState<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const loadAllPhotos = async () => {
      const promises = photos.map(async (photo) => {
        if (!photo) return null;
        try {
          const filteredUrl = await applyFilterToImage(photo, appliedFilter);
          return new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.src = filteredUrl;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          });
        } catch (err) {
          console.error(err);
          return null;
        }
      });
      const resolved = await Promise.all(promises);
      setLoadedPhotos(resolved);
    };
    loadAllPhotos();
  }, [photos, appliedFilter]);

  // Handle selection transformer updates
  useEffect(() => {
    if (trRef.current) {
      if (selectedId) {
        const stage = stageRef.current;
        const selectedNode = stage.findOne(`#${selectedId}`);
        if (selectedNode) {
          trRef.current.nodes([selectedNode]);
          trRef.current.getLayer().batchDraw();
          return;
        }
      }
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, stickers, texts, stageRef]);

  // Click outside to deselect
  const handleStageMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'frame-overlay';
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };



  return (
    <div className="relative border-4 border-white shadow-2xl rounded-lg overflow-hidden bg-white max-w-full">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
      >
        <Layer>
          {/* 0. RENDER WALLPAPER BACKGROUND */}
          {(wallpaperCanvas || uploadedWallpaperImg) && (
            <KonvaImage
              ref={wallpaperRef}
              image={wallpaperCanvas || uploadedWallpaperImg || undefined}
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
              opacity={wallpaperOpacity}
              filters={wallpaperBlur > 0 ? [Konva.Filters.Blur] : []}
              blurRadius={wallpaperBlur}
              listening={false}
            />
          )}

          {/* 1. RENDER PHOTOS (BEHIND THE FRAME OVERLAY) */}
          {activeSlotCoords.map((slot, index) => {
            const photoImg = loadedPhotos[index];

            // Apply framePadding dynamically to shrink/offset photos
            const pX = slot.x + framePadding;
            const pY = slot.y + framePadding;
            const pW = slot.w - 2 * framePadding;
            const pH = slot.h - 2 * framePadding;

            // Calculate a dynamic bleed (e.g. 4% of the slot's smallest dimension, bounded between 8px and 24px)
            // This ensures that the photo is drawn slightly larger and extends under the frame's opaque borders,
            // hiding any gaps caused by minor slot coordinates differences or border shadows.
            const bleed = Math.max(8, Math.min(24, Math.round(Math.min(pW, pH) * 0.04)));

            const hasShadow = shadowIntensity > 0;

            const clipFunc = (ctx: any) => {
              const x = pX - bleed;
              const y = pY - bleed;
              const w = pW + bleed * 2;
              const h = pH + bleed * 2;
              const cr = borderRadius > 0 ? borderRadius + bleed : 0;

              if (cr > 0) {
                ctx.beginPath();
                ctx.moveTo(x + cr, y);
                ctx.lineTo(x + w - cr, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
                ctx.lineTo(x + w, y + h - cr);
                ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
                ctx.lineTo(x + cr, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
                ctx.lineTo(x, y + cr);
                ctx.quadraticCurveTo(x, y, x + cr, y);
                ctx.closePath();
              } else {
                ctx.rect(x, y, w, h);
              }
            };

            if (!photoImg) {
              return (
                <Group key={`placeholder-${index}`}>
                  {hasShadow && (
                    <Rect
                      x={pX}
                      y={pY}
                      width={pW}
                      height={pH}
                      cornerRadius={borderRadius}
                      fill="#EAE0D5"
                      shadowColor={shadowColor}
                      shadowBlur={shadowBlur}
                      shadowOffset={{ x: shadowIntensity, y: shadowIntensity }}
                      shadowOpacity={0.4}
                    />
                  )}
                  <Group clipFunc={clipFunc}>
                    <Rect
                      x={pX - bleed}
                      y={pY - bleed}
                      width={pW + bleed * 2}
                      height={pH + bleed * 2}
                      fill="#EAE0D5"
                    />
                  </Group>
                  {borderThickness > 0 && (
                    <Rect
                      x={pX}
                      y={pY}
                      width={pW}
                      height={pH}
                      cornerRadius={borderRadius}
                      stroke={frameColor !== 'original' && !frameColor.startsWith('#') ? '#ffffff' : '#e5e7eb'}
                      strokeWidth={borderThickness}
                      listening={false}
                    />
                  )}
                </Group>
              );
            }

            // Object-fit: cover coordinates (expanded by bleed)
            const drawX = pX - bleed;
            const drawY = pY - bleed;
            const drawW = pW + bleed * 2;
            const drawH = pH + bleed * 2;

            const imgW = photoImg.width;
            const imgH = photoImg.height;
            const imageRatio = imgW / imgH;
            const drawRatio = drawW / drawH;

            let cropWidth = imgW;
            let cropHeight = imgH;
            let cropX = 0;
            let cropY = 0;

            if (imageRatio > drawRatio) {
              cropWidth = imgH * drawRatio;
              cropX = (imgW - cropWidth) / 2;
            } else {
              cropHeight = imgW / drawRatio;
              cropY = (imgH - cropHeight) / 2;
            }

            return (
              <Group key={`photo-${index}`}>
                {/* Shadow element under photo slot */}
                {hasShadow && (
                  <Rect
                    x={pX}
                    y={pY}
                    width={pW}
                    height={pH}
                    cornerRadius={borderRadius}
                    fill="transparent"
                    shadowColor={shadowColor}
                    shadowBlur={shadowBlur}
                    shadowOffset={{ x: shadowIntensity, y: shadowIntensity }}
                    shadowOpacity={0.4}
                  />
                )}

                {/* Photo clipped element */}
                <Group clipFunc={clipFunc}>
                  <KonvaImage
                    image={photoImg}
                    x={drawX}
                    y={drawY}
                    width={drawW}
                    height={drawH}
                    crop={{
                      x: cropX,
                      y: cropY,
                      width: cropWidth,
                      height: cropHeight
                    }}
                  />
                </Group>

                {/* Border outline on top of photo */}
                {borderThickness > 0 && (
                  <Rect
                    x={pX}
                    y={pY}
                    width={pW}
                    height={pH}
                    cornerRadius={borderRadius}
                    stroke={frameColor !== 'original' && !frameColor.startsWith('#') ? '#ffffff' : '#e5e7eb'}
                    strokeWidth={borderThickness}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}


          {/* 2. RENDER THE FRAME OVERLAY ON TOP OF PHOTOS */}
          {processedFrameImg && (
            <KonvaImage
              image={processedFrameImg}
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
              name="frame-overlay"
              listening={!isPreviewMode}
            />
          )}

          {/* 3. RENDER STICKERS */}
          {stickers.map((st) => (
            <StickerElement
              key={st.id}
              sticker={st}
              isSelected={selectedId === st.id}
              onClick={isPreviewMode ? () => { } : () => setSelectedId(st.id)}
              onChange={(newAttrs) => updateSticker(st.id, newAttrs)}
              isPreviewMode={isPreviewMode}
            />
          ))}

          {/* 4. RENDER TEXTS */}
          {texts.map((t) => (
            <TextElement
              key={t.id}
              textData={t}
              isSelected={selectedId === t.id}
              onClick={isPreviewMode ? () => { } : () => setSelectedId(t.id)}
              onChange={(newAttrs) => updateText(t.id, newAttrs)}
              isPreviewMode={isPreviewMode}
            />
          ))}

          {/* 5. INTERACTIVE TRANSFORMER (HANDLES ROTATE & SCALE RESIZE) */}
          {!isPreviewMode && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 30 || Math.abs(newBox.height) < 30) {
                  return oldBox;
                }
                return newBox;
              }}
              keepRatio={true}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              anchorSize={16}
              anchorCornerRadius={8}
              anchorFill="#C9A66B"
              anchorStroke="#6B4A3A"
              borderStroke="#C9A66B"
              borderDash={[4, 4]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

// ==========================================
// STICKER CHILD NODE COMPONENT
// ==========================================
interface StickerElementProps {
  sticker: CanvasSticker;
  isSelected: boolean;
  onClick: () => void;
  onChange: (attrs: Partial<CanvasSticker>) => void;
  isPreviewMode?: boolean;
}

const StickerElement: React.FC<StickerElementProps> = ({ sticker, onClick, onChange, isPreviewMode = false }) => {
  const loadedImg = useLoadedImage(sticker.stickerId);
  const shapeRef = useRef<any>(null);
  const { selectedFrame } = usePhotobooth();

  if (!loadedImg || !selectedFrame) return null;
  const { width: frameWidth, height: frameHeight } = selectedFrame;

  return (
    <KonvaImage
      ref={shapeRef}
      id={sticker.id}
      image={loadedImg}
      x={sticker.x}
      y={sticker.y}
      scaleX={sticker.scaleX}
      scaleY={sticker.scaleY}
      rotation={sticker.rotation}
      draggable={!isPreviewMode}
      onClick={onClick}
      onTouchStart={onClick}
      onDragMove={(e) => {
        const node = e.target;
        let x = node.x();
        let y = node.y();
        const snapTolerance = 15;

        // 1. Snap to center
        if (Math.abs(x - frameWidth / 2) < snapTolerance) x = frameWidth / 2;
        if (Math.abs(y - frameHeight / 2) < snapTolerance) y = frameHeight / 2;

        // 2. Snap to borders of photo slots (bingkai)
        if (selectedFrame.slotCoords) {
          selectedFrame.slotCoords.forEach(slot => {
            // Snap to slot vertical bounds
            if (Math.abs(x - slot.x) < snapTolerance) x = slot.x;
            if (Math.abs(x - (slot.x + slot.w)) < snapTolerance) x = slot.x + slot.w;
            if (Math.abs(x - (slot.x + slot.w / 2)) < snapTolerance) x = slot.x + slot.w / 2;

            // Snap to slot horizontal bounds
            if (Math.abs(y - slot.y) < snapTolerance) y = slot.y;
            if (Math.abs(y - (slot.y + slot.h)) < snapTolerance) y = slot.y + slot.h;
            if (Math.abs(y - (slot.y + slot.h / 2)) < snapTolerance) y = slot.y + slot.h / 2;
          });
        }

        // 3. Snap to outer frame bounds
        const padding = 50;
        if (Math.abs(x - padding) < snapTolerance) x = padding;
        if (Math.abs(x - (frameWidth - padding)) < snapTolerance) x = frameWidth - padding;
        if (Math.abs(y - padding) < snapTolerance) y = padding;
        if (Math.abs(y - (frameHeight - padding)) < snapTolerance) y = frameHeight - padding;

        node.x(x);
        node.y(y);
      }}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation()
        });
      }}
      offsetX={loadedImg.width / 2}
      offsetY={loadedImg.height / 2}
    />
  );
};


// ==========================================
// TEXT CHILD NODE COMPONENT
// ==========================================
interface TextElementProps {
  textData: CanvasText;
  isSelected: boolean;
  onClick: () => void;
  onChange: (attrs: Partial<CanvasText>) => void;
  isPreviewMode?: boolean;
}

const TextElement: React.FC<TextElementProps> = ({ textData, onClick, onChange, isPreviewMode = false }) => {
  const shapeRef = useRef<any>(null);
  const { selectedFrame } = usePhotobooth();

  if (!selectedFrame) return null;
  const { width: frameWidth, height: frameHeight } = selectedFrame;

  return (
    <KonvaText
      ref={shapeRef}
      id={textData.id}
      text={textData.text}
      x={textData.x}
      y={textData.y}
      fontSize={textData.fontSize}
      fontFamily={textData.fontFamily}
      fill={textData.fill}
      scaleX={textData.scaleX}
      scaleY={textData.scaleY}
      rotation={textData.rotation}
      draggable={!isPreviewMode}
      onClick={onClick}
      onTouchStart={onClick}
      align="center"
      onDragMove={(e) => {
        const node = e.target;
        let x = node.x();
        let y = node.y();
        const snapTolerance = 15;

        // Snap to center
        if (Math.abs(x - frameWidth / 2) < snapTolerance) x = frameWidth / 2;
        if (Math.abs(y - frameHeight / 2) < snapTolerance) y = frameHeight / 2;

        node.x(x);
        node.y(y);
      }}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation()
        });
      }}
      offsetX={shapeRef.current ? shapeRef.current.width() / 2 : 0}
      offsetY={shapeRef.current ? shapeRef.current.height() / 2 : 0}
    />
  );
};