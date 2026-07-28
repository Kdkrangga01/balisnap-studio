import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Group, Rect, Text } from 'react-konva';
import { usePhotobooth } from '../../context/PhotoboothContext';

interface PhotoCanvasProps {
  stageRef: React.RefObject<any>;
  containerWidth: number;
  isPreviewMode?: boolean;
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
    stickers,
    texts,
  } = usePhotobooth();

  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [loadedPhotos, setLoadedPhotos] = useState<(HTMLImageElement | null)[]>([]);
  const [loadedStickerImages, setLoadedStickerImages] = useState<Record<string, HTMLImageElement>>({});

  // Hitung skala canvas berdasarkan dimensi bingkai
  const frameWidth = selectedFrame?.width || 1200;
  const frameHeight = selectedFrame?.height || 1800;
  const scale = containerWidth / frameWidth;
  const stageHeight = frameHeight * scale;

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

  // Load Elemen Gambar Stiker secara Aman tanpa Error TypeScript
  useEffect(() => {
    const newLoadedImages: Record<string, HTMLImageElement> = {};
    let isMounted = true;

    const stickerPromises = stickers.map((st: any) => {
      return new Promise<void>((resolve) => {
        // Ambil URL gambar dari stiker (baik st.src, st.url, st.image, atau st.stickerId)
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
            const photoImg = loadedPhotos[index];
            const transform = photoTransforms[index] || { zoom: 1, x: 0, y: 0 };
            const isSelected = selectedId === `photo-${index}`;

            if (!photoImg) return null;

            const imgW = photoImg.naturalWidth || photoImg.width;
            const imgH = photoImg.naturalHeight || photoImg.height;

            // Skala dasar agar foto pas berada di dalam slot
            const baseScale = Math.min(slot.w / imgW, slot.h / imgH);
            const finalZoom = baseScale * transform.zoom;

            const centeredX = (slot.w - imgW * finalZoom) / 2 + transform.x;
            const centeredY = (slot.h - imgH * finalZoom) / 2 + transform.y;

            return (
              <Group
                key={`slot-group-${index}`}
                x={slot.x}
                y={slot.y}
                // Penguncian Clipping Area: foto tidak akan pernah meluber keluar bingkai saat di-zoom
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
          {frameImage && (
            <KonvaImage
              image={frameImage}
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
            />
          )}
        </Layer>

        {/* LAYER 4: ELEMEN DEKORASI STIKER DAN TEKS */}
        <Layer>
          {/* Render Stiker dengan Penanganan Tipe Data yang Aman */}
          {stickers.map((st: any) => {
            const stImg = loadedStickerImages[st.id];
            if (!stImg) return null;

            // Penentuan Ukuran Stiker secara Otomatis dan Fleksibel
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

          {/* Render Teks */}
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
      </Stage>
    </div>
  );
};