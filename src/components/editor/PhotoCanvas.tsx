import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Rect, Text } from 'react-konva';
import { usePhotobooth, type FilterType, DEFAULT_PHOTO_ZOOM, CUSTOM_MIN_PHOTO_ZOOM, MAX_PHOTO_ZOOM } from '../../context/PhotoboothContext';
import { frameColors } from '../../data/frameColors';

interface PhotoCanvasProps {
  stageRef: React.RefObject<any>;
  containerWidth: number;
  isPreviewMode?: boolean;
}

function resolveColorToFill(
  colorId: string,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): string | CanvasGradient | CanvasPattern {
  if (!colorId || colorId === 'original') return '#18181b';

  if (colorId.startsWith('#') || colorId.startsWith('rgb') || colorId.startsWith('hsl')) {
    return colorId;
  }

  const matched = frameColors.find((fc) => fc.id === colorId);
  if (matched) {
    if (typeof matched.getFill === 'function') {
      try {
        const fill = matched.getFill(ctx, width, height);
        if (fill) return fill;
      } catch {
        return matched.previewCss || '#18181b';
      }
    }
    return matched.previewCss || '#18181b';
  }

  return colorId;
}



function applyFilterToImage(
  img: HTMLImageElement,
  filterType: FilterType,
  fineTuning?: any
): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!img) return resolve(img);

    try {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || img.width || 800;
      const h = img.naturalHeight || img.height || 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(img);

      const b = fineTuning?.brightness ?? 100;
      const c = fineTuning?.contrast ?? 100;
      const s = fineTuning?.saturation ?? 100;
      const sf = fineTuning?.softFocus ?? 0;

      const filterParts = [];
      if (b !== 100) filterParts.push(`brightness(${b}%)`);
      if (c !== 100) filterParts.push(`contrast(${c}%)`);
      if (s !== 100) filterParts.push(`saturate(${s}%)`);
      if (sf > 0) filterParts.push(`blur(${sf}px)`);

      if (filterParts.length > 0) {
        ctx.filter = filterParts.join(' ');
      }

      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      if (filterType !== 'normal') {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const bVal = data[i + 2];

          if (filterType === 'grayscale') {
            const avg = 0.299 * r + 0.587 * g + 0.114 * bVal;
            data[i] = avg; data[i + 1] = avg; data[i + 2] = avg;
          } else if (filterType === 'sepia') {
            data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * bVal);
            data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * bVal);
            data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * bVal);
          } else if (filterType === 'vintage') {
            data[i] = Math.min(255, r * 1.18 + 18);
            data[i + 1] = Math.min(255, g * 1.05 + 8);
            data[i + 2] = Math.min(255, bVal * 0.82);
          } else if (filterType === 'cool') {
            data[i] = Math.min(255, r * 0.82);
            data[i + 1] = Math.min(255, g * 0.95 + 18);
            data[i + 2] = Math.min(255, bVal * 1.28 + 28);
          } else if (filterType === 'vivid') {
            const factor = 1.35;
            data[i] = Math.max(0, Math.min(255, (r - 128) * factor + 128));
            data[i + 1] = Math.max(0, Math.min(255, (g - 128) * factor + 128));
            data[i + 2] = Math.max(0, Math.min(255, (bVal - 128) * factor + 128));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const filteredImg = new window.Image();
      filteredImg.crossOrigin = 'Anonymous';
      filteredImg.src = canvas.toDataURL('image/png');
      filteredImg.onload = () => resolve(filteredImg);
      filteredImg.onerror = () => resolve(img);
    } catch {
      resolve(img);
    }
  });
}

export const PhotoCanvas: React.FC<PhotoCanvasProps> = ({
  stageRef,
  containerWidth,
  isPreviewMode = false,
}) => {
  const {
    selectedFrame,
    photos,
    photoTransforms,
    updatePhotoTransform,
    selectedId,
    setSelectedId,
    frameColor,
    lineColor,
    appliedFilter,
    fineTuning,
    stickers,
    updateSticker,
    texts,
    packageTier,
    customHeadline,
  } = usePhotobooth();

  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [recoloredFrameCanvas, setRecoloredFrameCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState<(HTMLImageElement | null)[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<(HTMLImageElement | null)[]>([]);
  const [loadedStickerImages, setLoadedStickerImages] = useState<Record<string, HTMLImageElement>>({});
  const [hoveredPhotoIndex, setHoveredPhotoIndex] = useState<number | null>(null);

  const frameWidth = selectedFrame?.width || 1200;
  const frameHeight = selectedFrame?.height || 1800;
  const scale = containerWidth / frameWidth;
  const stageHeight = frameHeight * scale;

  const [headlineFrameCanvas, setHeadlineFrameCanvas] = useState<HTMLCanvasElement | null>(null);

  // Load Gambar Bingkai Utama
  useEffect(() => {
    if (!selectedFrame?.src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = selectedFrame.src;
    img.onload = () => setFrameImage(img);
  }, [selectedFrame]);

  // === HEADLINE + LOCATION CANVAS ENGINE ===
  // Menggambar ulang 2 area teks kustom pada bingkai koran/retro:
  // 1) Judul besar (mis. "DENPASAR" -> diganti nama daerah user)
  // 2) Kotak daftar "LOCATION" (5 baris nama tempat, bisa diganti user)
  useEffect(() => {
    if (!frameImage || !selectedFrame) {
      setHeadlineFrameCanvas(null);
      return;
    }

    const isNewspaper = selectedFrame.id.includes('newspaper') ||
      selectedFrame.id.includes('special') ||
      selectedFrame.name?.toLowerCase().includes('special') ||
      selectedFrame.name?.toLowerCase().includes('retro') ||
      selectedFrame.name?.toLowerCase().includes('newspaper');

    // KOORDINAT PENUTUP COVERRECT SANGAT PRESISI:
    // y: 195 (Mulai dari bawah pita BREKING NEWS)
    // h: 205 (Mencakup seluruh bodi huruf DENPASAR sampai garis bawah)
    const cfg = selectedFrame.headlineConfig || (isNewspaper ? {
      coverRect: { x: 30, y: 195, w: 1140, h: 205 },
      fontSize: 165,
      fontFamily: "'Oswald', 'Impact', 'Bebas Neue', sans-serif",
      defaultText: 'DENPASAR',
      fill: '#111827',
      letterSpacing: 4
    } : null);

    if (!cfg) {
      setHeadlineFrameCanvas(null);
      return;
    }

    try {
      const c = document.createElement('canvas');
      c.width = frameWidth;
      c.height = frameHeight;
      const ctx = c.getContext('2d');
      if (!ctx) return;

      // 1) Gambar bingkai asli
      ctx.drawImage(frameImage, 0, 0, frameWidth, frameHeight);

      // 2) Ambil sampel warna kertas krem di area atas pita hitam (x: 50, y: 185)
      const sampleX = 50;
      const sampleY = 185;
      const sampleData = ctx.getImageData(sampleX, sampleY, 1, 1).data;

      const isSampleValid = sampleData[0] > 120 && sampleData[1] > 120;
      const bgColor = isSampleValid
        ? `rgb(${sampleData[0]}, ${sampleData[1]}, ${sampleData[2]})`
        : '#F4ECE1';

      if (isNewspaper) {
        // HAPUS TOTAL KOTAK LOCATION: Lapisi seluruh area kotak LOCATION (header + 5 baris kota) dengan warna kertas krem
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 220, 340, 670);
      }

      if (cfg) {
        // 3) HAPUS TOTAL: Lapisi seluruh area DENPASAR dengan warna kertas krem
        ctx.fillStyle = bgColor;
        ctx.fillRect(cfg.coverRect.x, cfg.coverRect.y, cfg.coverRect.w, cfg.coverRect.h);

        // 4) Tuliskan Nama Daerah Baru (misal "PALEMBANG") tepat di posisi yang sudah dibersihkan.
        // Font di-cek lebarnya dulu (measureText) lalu diperkecil bertahap sampai
        // benar-benar MUAT dalam coverRect -> teks selalu presisi CENTER dan
        // tidak lagi terpotong/keluar di kiri-kanan bingkai seperti sebelumnya.
        const rawText = customHeadline && customHeadline.trim() ? customHeadline : cfg.defaultText;
        const textToDraw = rawText.toUpperCase();

        const baseFontSize = cfg.fontSize || 165;
        const horizontalPadding = 40; // jarak aman kiri-kanan supaya tidak mepet garis bingkai
        const maxTextWidth = cfg.coverRect.w - horizontalPadding * 2;
        const letterSpacingPx = cfg.letterSpacing ?? 4;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if ('letterSpacing' in ctx) {
          (ctx as any).letterSpacing = `${letterSpacingPx}px`;
        }

        let dynamicFontSize = baseFontSize;
        ctx.font = `bold ${dynamicFontSize}px ${cfg.fontFamily || "'Oswald', 'Impact', sans-serif"}`;
        let measuredWidth = ctx.measureText(textToDraw).width + letterSpacingPx * Math.max(0, textToDraw.length - 1);

        // Perkecil font sedikit demi sedikit sampai lebar teks pas di dalam kotak.
        const MIN_FONT_SIZE = 36;
        while (measuredWidth > maxTextWidth && dynamicFontSize > MIN_FONT_SIZE) {
          dynamicFontSize -= 2;
          ctx.font = `bold ${dynamicFontSize}px ${cfg.fontFamily || "'Oswald', 'Impact', sans-serif"}`;
          measuredWidth = ctx.measureText(textToDraw).width + letterSpacingPx * Math.max(0, textToDraw.length - 1);
        }

        ctx.fillStyle = cfg.fill || '#111827';

        const textX = cfg.coverRect.x + cfg.coverRect.w / 2;
        const textY = cfg.coverRect.y + cfg.coverRect.h / 2;
        ctx.fillText(textToDraw, textX, textY);

        // Reset letterSpacing supaya tidak "bocor" ke elemen lain yang digambar sesudahnya
        if ('letterSpacing' in ctx) {
          (ctx as any).letterSpacing = '0px';
        }

        // 5) Rapikan kembali 2 garis batas hitam tipis koran di bagian paling bawah
        ctx.fillStyle = '#111827';
        ctx.fillRect(cfg.coverRect.x, cfg.coverRect.y + cfg.coverRect.h - 6, cfg.coverRect.w, 3);
        ctx.fillRect(cfg.coverRect.x, cfg.coverRect.y + cfg.coverRect.h - 1, cfg.coverRect.w, 2);
      }

      setHeadlineFrameCanvas(c);
    } catch (err) {
      console.error("Headline canvas error:", err);
      setHeadlineFrameCanvas(null);
    }
  }, [frameImage, selectedFrame, customHeadline, frameWidth, frameHeight]);

  // Frame Recolor Engine
  useEffect(() => {
    if (!frameImage) {
      setRecoloredFrameCanvas(null);
      return;
    }
    const currentColor = lineColor || frameColor;
    if (!currentColor || currentColor === 'original') {
      setRecoloredFrameCanvas(null);
      return;
    }

    try {
      const c = document.createElement('canvas');
      c.width = frameWidth;
      c.height = frameHeight;
      const ctx = c.getContext('2d');
      if (!ctx) return;

      const sourceImage = headlineFrameCanvas || frameImage;
      ctx.drawImage(sourceImage, 0, 0, frameWidth, frameHeight);
      ctx.globalCompositeOperation = 'source-in';
      const fillStyle = resolveColorToFill(currentColor, ctx, frameWidth, frameHeight);
      ctx.fillStyle = fillStyle;
      ctx.fillRect(0, 0, frameWidth, frameHeight);

      setRecoloredFrameCanvas(c);
    } catch (err) {
      console.error("Frame recolor error:", err);
    }
  }, [frameImage, headlineFrameCanvas, lineColor, frameColor, frameWidth, frameHeight]);

  // Load Foto untuk Setiap Slot
  useEffect(() => {
    const photoElements = photos.map((src) => {
      if (!src) return null;
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      return img;
    });

    let isMounted = true;
    Promise.all(
      photoElements.map(
        (img) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            if (!img) return resolve(null);
            if (img.complete) return resolve(img);
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          })
      )
    ).then((results) => {
      if (isMounted) setLoadedPhotos(results);
    });

    return () => {
      isMounted = false;
    };
  }, [photos]);

  // Apply Filter Efek Warna pada Setiap Foto secara Realtime
  useEffect(() => {
    let isMounted = true;
    if (!loadedPhotos.length) {
      setFilteredPhotos([]);
      return;
    }

    Promise.all(
      loadedPhotos.map((img) => {
        if (!img) return Promise.resolve(null);
        return applyFilterToImage(img, appliedFilter, fineTuning);
      })
    ).then((results) => {
      if (isMounted) setFilteredPhotos(results);
    });

    return () => {
      isMounted = false;
    };
  }, [loadedPhotos, appliedFilter, fineTuning]);

  // Load Elemen Gambar Stiker
  useEffect(() => {
    const newLoadedImages: Record<string, HTMLImageElement> = {};
    let isMounted = true;

    const stickerPromises = stickers.map((st: any) => {
      return new Promise<void>((resolve) => {
        const imgSrc = st.src || st.url || st.image || st.stickerId;
        if (!imgSrc) return resolve();

        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgSrc;
        img.onload = () => {
          newLoadedImages[st.id] = img;
          resolve();
        };
        img.onerror = () => resolve();
      });
    });

    Promise.all(stickerPromises).then(() => {
      if (isMounted) {
        setLoadedStickerImages(newLoadedImages);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stickers]);

  if (!selectedFrame) return null;

  return (
    <div
      className="relative flex justify-center items-center select-none"
      style={{ width: containerWidth, height: stageHeight }}
    >
      <Stage
        ref={stageRef}
        width={containerWidth}
        height={stageHeight}
        scaleX={scale}
        scaleY={scale}
        pixelRatio={typeof window !== 'undefined' ? Math.max(2.5, window.devicePixelRatio || 2.5) : 2.5}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        {/* LAYER 1: WARNA DASAR / BACKGROUND BINGKAI */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={frameWidth}
            height={frameHeight}
            fill={frameColor || '#FFFFFF'}
          />
        </Layer>

        {/* LAYER 2: FOTO DENGAN MASKING/CLIPPING TERKUNCI DALAM SLOT */}
        <Layer>
          {selectedFrame.slotCoords.map((slot, index) => {
            const photoImg = filteredPhotos[index] || loadedPhotos[index];
            const transform = photoTransforms[index] || { zoom: DEFAULT_PHOTO_ZOOM, x: 0, y: 0 };
            const isSelected = selectedId === `photo-${index}`;
            const isHovered = hoveredPhotoIndex === index;

            if (!photoImg) return null;

            const imgW = photoImg.naturalWidth || photoImg.width;
            const imgH = photoImg.naturalHeight || photoImg.height;

            const baseScale = Math.min(slot.w / imgW, slot.h / imgH);
            const finalZoom = baseScale * transform.zoom;

            const scaledW = imgW * finalZoom;
            const scaledH = imgH * finalZoom;

            const offsetX = (slot.w - scaledW) / 2;
            const offsetY = (slot.h - scaledH) / 2;

            const centeredX = offsetX + transform.x;
            const centeredY = offsetY + transform.y;

            const maxPanX = Math.max(scaledW, slot.w) / 2 + slot.w * 0.15;
            const maxPanY = Math.max(scaledH, slot.h) / 2 + slot.h * 0.15;

            const setStageCursor = (target: any, cursor: string) => {
              const stage = target?.getStage?.();
              const container = stage?.container?.();
              if (container) container.style.cursor = cursor;
            };

            return (
              <Group
                key={`slot-group-${index}`}
                x={slot.x}
                y={slot.y}
                clipFunc={(ctx) => {
                  ctx.beginPath();
                  if (slot.rx && slot.rx > 0) {
                    const r = slot.rx;
                    ctx.moveTo(r, 0);
                    ctx.lineTo(slot.w - r, 0);
                    ctx.quadraticCurveTo(slot.w, 0, slot.w, r);
                    ctx.lineTo(slot.w, slot.h - r);
                    ctx.quadraticCurveTo(slot.w, slot.h, slot.w - r, slot.h);
                    ctx.lineTo(r, slot.h);
                    ctx.quadraticCurveTo(0, slot.h, 0, slot.h - r);
                    ctx.lineTo(0, r);
                    ctx.quadraticCurveTo(0, 0, r, 0);
                  } else {
                    ctx.rect(0, 0, slot.w, slot.h);
                  }
                  ctx.closePath();
                }}
              >
                <KonvaImage
                  image={photoImg}
                  x={centeredX}
                  y={centeredY}
                  width={scaledW}
                  height={scaledH}
                  draggable={!isPreviewMode}
                  onClick={() => !isPreviewMode && setSelectedId(`photo-${index}`)}
                  onTap={() => !isPreviewMode && setSelectedId(`photo-${index}`)}
                  onMouseEnter={(e) => {
                    if (isPreviewMode) return;
                    setHoveredPhotoIndex(index);
                    setStageCursor(e.target, 'grab');
                  }}
                  onMouseLeave={(e) => {
                    if (isPreviewMode) return;
                    setHoveredPhotoIndex((prev) => (prev === index ? null : prev));
                    setStageCursor(e.target, 'default');
                  }}
                  onDragStart={(e) => {
                    if (isPreviewMode) return;
                    setSelectedId(`photo-${index}`);
                    setStageCursor(e.target, 'grabbing');
                  }}
                  dragBoundFunc={(pos) => {
                    const localX = pos.x / scale - slot.x;
                    const localY = pos.y / scale - slot.y;
                    const clampedLocalX = Math.max(offsetX - maxPanX, Math.min(offsetX + maxPanX, localX));
                    const clampedLocalY = Math.max(offsetY - maxPanY, Math.min(offsetY + maxPanY, localY));
                    return {
                      x: (slot.x + clampedLocalX) * scale,
                      y: (slot.y + clampedLocalY) * scale,
                    };
                  }}
                  onDragEnd={(e) => {
                    if (isPreviewMode) return;
                    setStageCursor(e.target, 'grab');
                    const finalX = e.target.x() - offsetX;
                    const finalY = e.target.y() - offsetY;
                    updatePhotoTransform(index, { x: finalX, y: finalY });
                  }}
                  onWheel={(e) => {
                    if (isPreviewMode) return;
                    e.evt.preventDefault();
                    if (selectedId !== `photo-${index}`) setSelectedId(`photo-${index}`);
                    const ZOOM_WHEEL_STEP = 0.08;
                    const direction = e.evt.deltaY > 0 ? -1 : 1;
                    const nextZoom = Math.max(
                      CUSTOM_MIN_PHOTO_ZOOM,
                      Math.min(MAX_PHOTO_ZOOM, transform.zoom + direction * ZOOM_WHEEL_STEP)
                    );
                    updatePhotoTransform(index, { zoom: nextZoom });
                  }}
                />

                {isSelected && !isPreviewMode && (
                  <Rect
                    x={0}
                    y={0}
                    width={slot.w}
                    height={slot.h}
                    stroke="#A855F7"
                    strokeWidth={6}
                    listening={false}
                  />
                )}

                {isHovered && !isSelected && !isPreviewMode && (
                  <Rect
                    x={0}
                    y={0}
                    width={slot.w}
                    height={slot.h}
                    stroke="#C4B5FD"
                    strokeWidth={3}
                    dash={[10, 6]}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}
        </Layer>

        {/* LAYER 3: OVERLAY MASK BINGKAI */}
        <Layer listening={false}>
          {recoloredFrameCanvas ? (
            <KonvaImage
              image={recoloredFrameCanvas}
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
            />
          ) : headlineFrameCanvas ? (
            <KonvaImage
              image={headlineFrameCanvas}
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
            />
          ) : frameImage ? (
            <KonvaImage
              image={frameImage}
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
            />
          ) : null}
        </Layer>

        {/* LAYER 4: ELEMEN DEKORASI STIKER DAN TEKS USER (HD SMOOTHING) */}
        <Layer
          ref={(node) => {
            if (node) {
              const canvasEl = node.getCanvas()?._canvas;
              const ctx = canvasEl?.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
              }
            }
          }}
        >
          {stickers.map((st: any) => {
            const stImg = loadedStickerImages[st.id];
            if (!stImg) return null;

            const baseW = stImg.naturalWidth || stImg.width || 100;
            const baseH = stImg.naturalHeight || stImg.height || 100;
            const aspectRatio = baseH / baseW;

            // Target ukuran ideal stiker: sekitar 10.5% dari lebar bingkai (~105px - 115px)
            // pas di pojok-pojok bingkai tanpa menutupi area utama foto
            const defaultTargetW = Math.round(frameWidth * 0.105);
            const targetW = st.width || (baseW > defaultTargetW ? defaultTargetW : baseW);
            const targetH = st.height || Math.round(targetW * aspectRatio);

            const scaleFactor = st.scale || st.scaleX || 1;
            const finalWidth = Math.round(targetW * scaleFactor);
            const finalHeight = Math.round(targetH * scaleFactor);

            return (
              <KonvaImage
                key={st.id}
                image={stImg}
                x={st.x}
                y={st.y}
                width={finalWidth}
                height={finalHeight}
                rotation={st.rotation || 0}
                draggable={!isPreviewMode}
                perfectDrawEnabled={true}
                onClick={() => !isPreviewMode && setSelectedId(st.id)}
                onTap={() => !isPreviewMode && setSelectedId(st.id)}
                onDragEnd={(e) => {
                  if (isPreviewMode) return;
                  updateSticker(st.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              />
            );
          })}

          {texts.map((txt: any) => (
            <Text
              key={txt.id}
              text={txt.text}
              x={txt.x}
              y={txt.y}
              fontSize={txt.fontSize || 32}
              fontFamily={txt.fontFamily || 'sans-serif'}
              fill={txt.fill || '#000000'}
              rotation={txt.rotation || 0}
              draggable={!isPreviewMode}
              onClick={() => !isPreviewMode && setSelectedId(txt.id)}
              onTap={() => !isPreviewMode && setSelectedId(txt.id)}
            />
          ))}
        </Layer>

        {/* LAYER 5: BRAND — BaliSnap Studio */}
        {(() => {
          const isCustom = selectedFrame.category === 'custom' || selectedFrame.id.startsWith('custom-');
          const hasExistingBrand = selectedFrame.hasBrandName === true || selectedFrame.category !== 'studio';

          if (isCustom || hasExistingBrand) {
            return null;
          }

          return (
            <Layer listening={false}>
              <Text
                x={0}
                y={frameHeight - Math.round(frameWidth * 0.08)}
                width={frameWidth}
                align="center"
                text="BaliSnap Studio"
                fontSize={Math.max(16, Math.round(frameWidth * 0.026))}
                fontStyle="600"
                fontFamily="'Poppins', sans-serif"
                fill="rgba(0, 0, 0, 0.4)"
                letterSpacing={2}
                shadowColor="rgba(0, 0, 0, 0.6)"
                shadowBlur={5}
                shadowOffsetX={0}
                shadowOffsetY={0}
              />
              <Text
                x={0}
                y={frameHeight - Math.round(frameWidth * 0.08)}
                width={frameWidth}
                align="center"
                text="BaliSnap Studio"
                fontSize={Math.max(16, Math.round(frameWidth * 0.026))}
                fontStyle="600"
                fontFamily="'Poppins', sans-serif"
                fill="rgba(255, 255, 255, 0.85)"
                letterSpacing={2}
              />
            </Layer>
          );
        })()}

        {/* WATERMARK KHUSUS PAKET FREE */}
        {packageTier === 'free' && (
          <Layer listening={false}>
            <Group x={frameWidth - 290} y={frameHeight - 75}>
              <Rect
                x={0}
                y={0}
                width={270}
                height={55}
                fill="rgba(15, 23, 42, 0.82)"
                cornerRadius={16}
                shadowColor="rgba(0,0,0,0.4)"
                shadowBlur={10}
              />
              <Text
                x={18}
                y={18}
                text="📷 BALISNAP STUDIO • FREE"
                fontSize={14}
                fontStyle="bold"
                fontFamily="sans-serif"
                fill="#ffffff"
                letterSpacing={1.5}
              />
            </Group>
          </Layer>
        )}
      </Stage>
    </div>
  );
};