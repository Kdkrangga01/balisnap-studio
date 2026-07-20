/**
 * Exports the Konva Stage to a high-resolution PNG data URL and triggers browser download.
 * By using pixelRatio, Konva redrafts all image layers, text, and vector coordinates at 
 * the target HD width (e.g. 1800px) instead of the low-res editor canvas display resolution.
 */
export function exportHighResCanvas(stage: any, targetWidth = 1800): string | null {
  if (!stage) return null;

  const currentStageWidth = stage.width();
  if (!currentStageWidth || currentStageWidth <= 0) return null;

  const ratioMultiplier = targetWidth / currentStageWidth;

  // Guard: batasi pixelRatio biar tidak melebihi limit ukuran canvas browser
  // (kebanyakan browser mentok di ~16384px per sisi). Di atas itu toDataURL
  // bisa gagal diam-diam atau menghasilkan canvas kosong.
  const MAX_OUTPUT_DIMENSION = 8000;
  const projectedWidth = currentStageWidth * ratioMultiplier;
  const projectedHeight = stage.height() * ratioMultiplier;
  const safeRatioMultiplier =
    projectedWidth > MAX_OUTPUT_DIMENSION || projectedHeight > MAX_OUTPUT_DIMENSION
      ? Math.min(
        MAX_OUTPUT_DIMENSION / currentStageWidth,
        MAX_OUTPUT_DIMENSION / stage.height()
      )
      : ratioMultiplier;

  try {
    // Pastikan setiap layer pakai smoothing kualitas tinggi saat redraw
    // (mencegah hasil scale-up terlihat kasar/aliased pada tepi frame).
    stage.getLayers().forEach((layer: any) => {
      const canvasEl = layer.getCanvas()?._canvas as HTMLCanvasElement | undefined;
      const ctx = canvasEl?.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    });

    const dataURL = stage.toDataURL({
      pixelRatio: safeRatioMultiplier,
      mimeType: "image/png",
      quality: 1.0
    });

    return dataURL;
  } catch (error) {
    console.error("Failed to render high resolution canvas:", error);
    // Fallback to standard resolution if high-res fails
    return stage.toDataURL({ mimeType: "image/png" });
  }
}

/**
 * Triggers a browser download of a base64 URI
 */
export function downloadBase64Image(dataURI: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURI;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}