import gifshot from 'gifshot';

export interface GifOptions {
  photos: (string | null)[];
  interval?: number; // detik per frame (misal 0.3s)
  gifWidth?: number;
  gifHeight?: number;
  isPreLooped?: boolean;
  progressCallback?: (pct: number) => void;
}

export type BoomerangMode = 'bounce' | 'flash' | 'sway';

/**
 * Menghasilkan frame-frame animasi dinamis dari 1 snapshot photostrip
 * Menjamin hasil Boomerang GIF SELALU bergerak hidup & dinamis,
 * baik untuk foto tunggal, foto seragam, maupun foto rombongan.
 */
export async function createBoomerangFrames(
  baseImageUri: string,
  mode: BoomerangMode = 'bounce',
  targetWidth = 450
): Promise<{ frames: string[]; width: number; height: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'Anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Gagal memuat snapshot photostrip.'));
    el.src = baseImageUri;
  });

  const imgW = img.naturalWidth || img.width || 450;
  const imgH = img.naturalHeight || img.height || 675;
  const targetW = targetWidth;
  const targetH = Math.round(targetW * (imgH / imgW));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const frames: string[] = [];

  if (mode === 'flash') {
    // 5 frames: Normal -> Pre-flash glow -> Peak Studio Shutter Flash -> Warm Bloom -> Soft return
    const flashSteps = [
      { scale: 1.00, brightness: 1.00, flashOpacity: 0 },
      { scale: 1.018, brightness: 1.10, flashOpacity: 0.08 },
      { scale: 1.045, brightness: 1.38, flashOpacity: 0.32 },
      { scale: 1.025, brightness: 1.16, flashOpacity: 0.10 },
      { scale: 1.005, brightness: 1.04, flashOpacity: 0.02 },
    ];

    for (const step of flashSteps) {
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.scale(step.scale, step.scale);
      ctx.filter = `brightness(${Math.round(step.brightness * 100)}%)`;
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.filter = 'none';

      if (step.flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${step.flashOpacity})`;
        ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
      }
      ctx.restore();
      frames.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  } else if (mode === 'sway') {
    // 5 frames: Dynamic Sway & Tilt motion khas photostrip
    const swaySteps = [
      { rot: -2.8, scale: 1.015, dy: 0 },
      { rot: -1.3, scale: 1.03, dy: -3 },
      { rot: 0, scale: 1.045, dy: -5 },
      { rot: 1.3, scale: 1.03, dy: -3 },
      { rot: 2.8, scale: 1.015, dy: 0 },
    ];

    for (const step of swaySteps) {
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2 + step.dy);
      ctx.rotate((step.rot * Math.PI) / 180);
      ctx.scale(step.scale, step.scale);
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
      frames.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  } else {
    // Default: 'bounce' (Instagram / Photobooth Pop Pulse yang dinamis & ceria)
    const bounceSteps = [
      { scale: 1.00, dy: 0, brightness: 1.00 },
      { scale: 1.028, dy: -4, brightness: 1.03 },
      { scale: 1.06, dy: -8, brightness: 1.08 },
      { scale: 1.09, dy: -11, brightness: 1.15 },
      { scale: 1.045, dy: -5, brightness: 1.05 },
    ];

    for (const step of bounceSteps) {
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2 + step.dy);
      ctx.scale(step.scale, step.scale);
      ctx.filter = `brightness(${Math.round(step.brightness * 100)}%)`;
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
      frames.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  }

  return { frames, width: targetW, height: targetH };
}

/**
 * Mengubah array foto photobooth menjadi animasi GIF Boomerang beresolusi tinggi.
 */
export function generateBoomerangGif(options: GifOptions): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const validPhotos = options.photos.filter((p): p is string => Boolean(p));

    if (validPhotos.length === 0) {
      reject(new Error('Tidak ada foto untuk dibuat GIF animasi.'));
      return;
    }

    // Buat urutan Boomerang
    const boomerangSequence: string[] = [];
    
    if (options.isPreLooped) {
      boomerangSequence.push(...validPhotos);
    } else {
      // Urutan maju
      for (let i = 0; i < validPhotos.length; i++) {
        boomerangSequence.push(validPhotos[i]);
      }
      
      // Urutan mundur (tanpa mengulang elemen ujung)
      for (let i = validPhotos.length - 2; i > 0; i--) {
        boomerangSequence.push(validPhotos[i]);
      }
    }

    // Jika hanya 1 foto, duplikat agar membentuk animasi
    if (boomerangSequence.length === 1) {
      boomerangSequence.push(validPhotos[0]);
    }

    const gifWidth = options.gifWidth || 450;
    const gifHeight = options.gifHeight || 675;
    const interval = options.interval || 0.35; // ~350ms per frame

    gifshot.createGIF(
      {
        images: boomerangSequence,
        gifWidth: gifWidth,
        gifHeight: gifHeight,
        interval: interval,
        numWorkers: 4,
        sampleInterval: 8,
        progressCallback: (progress: number) => {
          if (options.progressCallback) {
            options.progressCallback(Math.round(progress * 100));
          }
        },
      },
      (obj) => {
        if (obj.error) {
          reject(new Error(obj.errorMsg || 'Gagal menghasilkan GIF.'));
        } else if (obj.image) {
          // Convert base64 dataUrl to Blob
          try {
            const byteString = atob(obj.image.split(',')[1]);
            const mimeString = obj.image.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            resolve({ dataUrl: obj.image, blob });
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error('Format keluaran GIF tidak valid.'));
        }
      }
    );
  });
}
