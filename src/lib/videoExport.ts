import { playSynthesizedTrack } from '../data/musicTracks';

export interface VideoExportOptions {
  snapshots: string[];
  trackId?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  progressCallback?: (pct: number) => void;
}

/**
 * Membuat file Video Story (format .webm / Instagram Story 9:16)
 * dari kumpulan snapshot bingkai foto strip dengan animasi & musik audio yang 100% terekam dan diputar lancar.
 */
export function generateVideoStory(options: VideoExportOptions): Promise<{ videoUrl: string; blob: Blob }> {
  return new Promise(async (resolve, reject) => {
    let canvas: HTMLCanvasElement | null = null;
    let synth: { stop: () => void; audioContext: AudioContext; stream: MediaStream } | null = null;

    try {
      const { snapshots, trackId = 'lofi', durationSeconds = 6, width = 540, height = 960 } = options;

      if (!snapshots || snapshots.length === 0) {
        reject(new Error('Tidak ada snapshot foto untuk membuat video.'));
        return;
      }

      // Preload semua gambar snapshot
      const loadedImages: HTMLImageElement[] = await Promise.all(
        snapshots.map(
          (src) =>
            new Promise<HTMLImageElement>((res, rej) => {
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              img.onload = () => res(img);
              img.onerror = () => rej(new Error('Gagal memuat snapshot foto.'));
              img.src = src;
            })
        )
      );

      // Buat Canvas dan tempelkan sementara ke DOM agar compositor browser aktif merender frame
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.style.cssText = 'position:fixed; top:0; left:-9999px; width:540px; height:960px; opacity:0; pointer-events:none; z-index:-999;';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (document.body.contains(canvas)) document.body.removeChild(canvas);
        reject(new Error('Browser tidak mendukung 2D Canvas context.'));
        return;
      }

      // Tangkap Stream Canvas (30 FPS)
      const canvasStream = canvas.captureStream(30);

      // Siapkan Pemutar Audio Synth & Resume Audio Context
      synth = playSynthesizedTrack(trackId, durationSeconds + 1);
      if (synth.audioContext && synth.audioContext.state === 'suspended') {
        try {
          await synth.audioContext.resume();
        } catch { }
      }

      // Gabungkan Video Track dari Canvas + Audio Track dari Synthesizer
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (synth.stream && synth.stream.getAudioTracks().length > 0) {
        combinedTracks.push(synth.stream.getAudioTracks()[0]);
      }
      const combinedStream = new MediaStream(combinedTracks);

      // Cari MimeType video yang didukung browser
      const candidates = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
      ];

      let selectedMimeType = 'video/webm';
      for (const mime of candidates) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (synth) synth.stop();
        if (canvas && document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }

        const blob = new Blob(chunks, { type: selectedMimeType });
        const videoUrl = URL.createObjectURL(blob);
        resolve({ videoUrl, blob });
      };

      // Mulai perekaman dengan timeslice 100ms
      mediaRecorder.start(100);

      // Render Loop Animasi Canvas
      const fps = 30;
      const totalFrames = Math.round(durationSeconds * fps);
      let currentFrame = 0;

      function renderNextFrame() {
        if (!ctx || !canvas) return;

        const progress = currentFrame / totalFrames; // 0.0 - 1.0
        const imageIndex = Math.floor(progress * loadedImages.length) % loadedImages.length;
        const currentImg = loadedImages[imageIndex];

        // Background Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#09090b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Zoom & Scale Effect
        const zoom = 1 + (currentFrame % (fps * 2)) * 0.002;
        const imgW = currentImg.width;
        const imgH = currentImg.height;

        const scale = Math.min((width * 0.85) / imgW, (height * 0.82) / imgH) * zoom;
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;

        // Shadow & Frame
        ctx.save();
        ctx.shadowColor = 'rgba(244, 114, 182, 0.5)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(currentImg, drawX, drawY, drawW, drawH);
        ctx.restore();

        // Watermark Text
        ctx.font = '900 14px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('✨ BALISNAP MEMORIES ✨', width / 2, height - 25);

        if (options.progressCallback) {
          options.progressCallback(Math.round(progress * 100));
        }

        currentFrame++;
        if (currentFrame < totalFrames) {
          setTimeout(renderNextFrame, 1000 / fps);
        } else {
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 300);
        }
      }

      // Trigger frame pertama
      renderNextFrame();
    } catch (err) {
      if (canvas && document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      if (synth) synth.stop();
      reject(err);
    }
  });
}
