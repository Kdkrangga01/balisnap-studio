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
    return stage.toDataURL({ mimeType: "image/png" });
  }
}

/**
 * Converts Base64 Data URI string to binary Blob object
 */
export function dataURItoBlob(dataURI: string): Blob {
  const arr = dataURI.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Triggers a browser download of a base64 URI or Blob URL
 */
export function downloadBase64Image(dataURI: string, filename: string) {
  try {
    const blob = dataURItoBlob(dataURI);
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = filename;
    link.href = blobUrl;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 15000);
  } catch {
    // Fallback if Blob conversion fails
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Smart saver for mobile devices (iOS / Android) and desktop browsers.
 * Triggers native Share Sheet ("Simpan Gambar" to Photos / Gallery) if available on mobile.
 */
export async function saveOrShareImage(dataURI: string, filename: string): Promise<boolean> {
  try {
    const blob = dataURItoBlob(dataURI);
    const file = new File([blob], filename, { type: 'image/png' });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'BaliSnap Studio Photo',
          text: 'Foto Photobooth BaliSnap Studio'
        });
        return true;
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return false;
        }
      }
    }
  } catch (err) {
    console.warn("Share preparation error:", err);
  }

  // Fallback to standard download
  downloadBase64Image(dataURI, filename);
  return true;
}