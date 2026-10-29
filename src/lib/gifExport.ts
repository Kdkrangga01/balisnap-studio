import gifshot from 'gifshot';

export interface GifOptions {
  photos: (string | null)[];
  interval?: number; // detik per frame (misal 0.3s)
  gifWidth?: number;
  gifHeight?: number;
  isPreLooped?: boolean;
  progressCallback?: (pct: number) => void;
}

export type BoomerangMode = 'sequence' | 'pop' | 'flash';

/**
 * Smooth easing function (sine in-out) for natural motion.
 * t: 0..1 -> 0..1 with smooth acceleration/deceleration
 */
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Menghasilkan frame-frame animasi dinamis dari 1 snapshot photostrip
 * Menggunakan interpolasi halus dengan banyak frame untuk hasil boomerang
 * yang mulus, natural, dan tidak kaku seperti photobooth offline profesional.
 */
export async function createBoomerangFrames(
  baseImageUri: string,
  mode: BoomerangMode = 'sequence',
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
    // Studio Flash: 10 frames with smooth brightness and subtle scale pulse
    // Simulates a camera flash burst effect with natural falloff
    const totalSteps = 10;
    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1); // 0..1
      // Flash peaks at ~25% through, then decays smoothly
      const flashT = t < 0.25
        ? easeInOutSine(t / 0.25)               // ramp up
        : easeInOutSine(1 - (t - 0.25) / 0.75); // smooth decay
      
      const flashOpacity = flashT * 0.35;
      const scale = 1 + flashT * 0.04;
      const brightness = 1 + flashT * 0.25;

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.scale(scale, scale);
      ctx.filter = `brightness(${Math.round(brightness * 100)}%)`;
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.filter = 'none';

      if (flashOpacity > 0.005) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
      }
      ctx.restore();
      frames.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  } else if (mode === 'pop') {
    // Pop Pulse: 12 frames with smooth sinusoidal bounce
    // Natural pop-in/pop-out motion like a heartbeat
    const totalSteps = 12;
    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1); // 0..1
      // Smooth pulse: peaks at center, symmetric
      const pulse = Math.sin(t * Math.PI);
      
      const scale = 1 + pulse * 0.05;
      const dy = -pulse * 4;
      const brightness = 1 + pulse * 0.03;

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2 + dy);
      ctx.scale(scale, scale);
      ctx.filter = `brightness(${Math.round(brightness * 100)}%)`;
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.filter = 'none';
      ctx.restore();
      frames.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  } else {
    // Default 'sequence': Smooth breathing animation
    // 12 frames with gentle, organic motion that loops seamlessly
    const totalSteps = 12;
    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1); // 0..1
      // Smooth sine wave for organic breathing motion
      const wave = Math.sin(t * Math.PI);
      
      const scale = 1 + wave * 0.035;
      const dy = -wave * 3;
      const brightness = 1 + wave * 0.04;

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(targetW / 2, targetH / 2 + dy);
      ctx.scale(scale, scale);
      ctx.filter = `brightness(${Math.round(brightness * 100)}%)`;
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
      frames.push(canvas.toDataURL('image/jpeg', 0.92));
    }
  }

  return { frames, width: targetW, height: targetH };
}

/**
 * Mengubah array foto photobooth menjadi animasi GIF Boomerang beresolusi tinggi.
 * Mendukung looping maju-mundur otomatis (boomerang) yang mulus dan natural.
 */
export function generateBoomerangGif(options: GifOptions): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise(async (resolve, reject) => {
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
      
      // Urutan mundur (tanpa mengulang elemen ujung) untuk smooth boomerang loop
      for (let i = validPhotos.length - 2; i > 0; i--) {
        boomerangSequence.push(validPhotos[i]);
      }
    }

    // Jika hanya 1 foto, duplikat agar membentuk animasi
    if (boomerangSequence.length === 1) {
      boomerangSequence.push(validPhotos[0]);
    }

    // Hitung aspek rasio asli dari frame pertama agar BINGKAI TIDAK PERNAH TERPOTONG
    let autoHeight = options.gifHeight;
    const targetWidth = options.gifWidth || 420;

    if (!autoHeight && boomerangSequence[0]) {
      try {
        const sampleImg = await new Promise<HTMLImageElement>((res, rej) => {
          const el = new Image();
          el.crossOrigin = 'Anonymous';
          el.onload = () => res(el);
          el.onerror = rej;
          el.src = boomerangSequence[0];
        });
        const w = sampleImg.naturalWidth || sampleImg.width || targetWidth;
        const h = sampleImg.naturalHeight || sampleImg.height || targetWidth * 1.5;
        autoHeight = Math.round(targetWidth * (h / w));
      } catch {
        autoHeight = Math.round(targetWidth * 1.5);
      }
    }

    const gifWidth = targetWidth;
    const gifHeight = autoHeight || 630;
    const interval = options.interval || 0.12; // ~120ms per frame for smooth playback

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
