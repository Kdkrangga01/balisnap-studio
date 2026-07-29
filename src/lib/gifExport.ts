import gifshot from 'gifshot';

export interface GifOptions {
  photos: (string | null)[];
  interval?: number; // detik per frame (misal 0.3s)
  gifWidth?: number;
  gifHeight?: number;
  progressCallback?: (pct: number) => void;
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

    // Buat urutan Boomerang (Maju lalu Mundur: 1 -> 2 -> 3 -> 4 -> 3 -> 2)
    const boomerangSequence: string[] = [];
    
    // Urutan maju
    for (let i = 0; i < validPhotos.length; i++) {
      boomerangSequence.push(validPhotos[i]);
    }
    
    // Urutan mundur (tanpa mengulang elemen ujung)
    for (let i = validPhotos.length - 2; i > 0; i--) {
      boomerangSequence.push(validPhotos[i]);
    }

    // Jika hanya 1 foto, duplikat agar membentuk animasi
    if (boomerangSequence.length === 1) {
      boomerangSequence.push(validPhotos[0]);
    }

    const gifWidth = options.gifWidth || 600;
    const gifHeight = options.gifHeight || 800;
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
