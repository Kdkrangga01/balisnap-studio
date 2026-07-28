import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Rect, Text } from 'react-konva';
import { usePhotobooth, type FilterType } from '../../context/PhotoboothContext';
import { frameColors } from '../../data/frameColors';

interface PhotoCanvasProps {
  stageRef: React.RefObject<any>;
  containerWidth: number;
  isPreviewMode?: boolean;
}

// Helper function to resolve any color ID/HEX/pattern into valid Canvas fill
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

// Helper function to apply color filters & fine-tuning directly onto photo image
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

      // Apply Retouch Pro & Fine-Tuning filters
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
    texts,
    packageTier,
  } = usePhotobooth();

  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [recoloredFrameCanvas, setRecoloredFrameCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState<(HTMLImageElement | null)[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<(HTMLImageElement | null)[]>([]);
  const [loadedStickerImages, setLoadedStickerImages] = useState<Record<string, HTMLImageElement>>({});

  // Hitung skala canvas berdasarkan dimensi bingkai
  const frameWidth = selectedFrame?.width || 1200;
  const frameHeight = selectedFrame?.height || 1800;
  const scale = containerWidth / frameWidth;
  const stageHeight = frameHeight * scale;

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

      ctx.drawImage(frameImage, 0, 0, frameWidth, frameHeight);
      ctx.globalCompositeOperation = 'source-in';
      const fillStyle = resolveColorToFill(currentColor, ctx, frameWidth, frameHeight);
      ctx.fillStyle = fillStyle;
      ctx.fillRect(0, 0, frameWidth, frameHeight);

      setRecoloredFrameCanvas(c);
    } catch (err) {
      console.error("Frame recolor error:", err);
    }
  }, [frameImage, lineColor, frameColor, frameWidth, frameHeight]);

  // Load Gambar Bingkai Utama
  useEffect(() => {
    if (!selectedFrame?.src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = selectedFrame.src;
    img.onload = () => setFrameImage(img);
  }, [selectedFrame]);

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
            const transform = photoTransforms[index] || { zoom: 1, x: 0, y: 0 };
            const isSelected = selectedId === `photo-${index}`;

            if (!photoImg) return null;

            const imgW = photoImg.naturalWidth || photoImg.width;
            const imgH = photoImg.naturalHeight || photoImg.height;

            const baseScale = Math.min(slot.w / imgW, slot.h / imgH);
            const finalZoom = baseScale * transform.zoom;

            const centeredX = (slot.w - imgW * finalZoom) / 2 + transform.x;
            const centeredY = (slot.h - imgH * finalZoom) / 2 + transform.y;

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
                  width={imgW * finalZoom}
                  height={imgH * finalZoom}
                  draggable={!isPreviewMode}
                  onClick={() => !isPreviewMode && setSelectedId(`photo-${index}`)}
                  onTap={() => !isPreviewMode && setSelectedId(`photo-${index}`)}
                  onDragMove={(e) => {
                    if (isPreviewMode) return;
                    const newX = e.target.x() - (slot.w - imgW * finalZoom) / 2;
                    const newY = e.target.y() - (slot.h - imgH * finalZoom) / 2;
                    updatePhotoTransform(index, { x: newX, y: newY });
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

        {/* LAYER 4: ELEMEN DEKORASI STIKER DAN TEKS USER */}
        <Layer>
          {stickers.map((st: any) => {
            const stImg = loadedStickerImages[st.id];
            if (!stImg) return null;

            const baseW = stImg.naturalWidth || stImg.width || 100;
            const baseH = stImg.naturalHeight || stImg.height || 100;
            const scaleFactor = st.scale || 1;
            const finalWidth = st.width || baseW * scaleFactor;
            const finalHeight = st.height || baseH * scaleFactor;

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
                onClick={() => !isPreviewMode && setSelectedId(st.id)}
                onTap={() => !isPreviewMode && setSelectedId(st.id)}
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

        {/* LAYER 5: BRAND — BaliSnap Studio — tepi bawah frame, center */}
        <Layer listening={false}>
          {/* Outline shadow gelap — kontras di semua warna */}
          <Text
            x={Math.round(frameWidth * 0.08)}
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
          {/* Teks utama putih tebal */}
          <Text
            x={Math.round(frameWidth * 0.08)}
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