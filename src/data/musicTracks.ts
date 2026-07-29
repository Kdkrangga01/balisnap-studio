export interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  emoji: string;
  bpm: number;
  bgGradient: string;
}

export const musicTracks: MusicTrack[] = [
  {
    id: 'lofi',
    name: 'Lo-Fi Chill Sunset',
    genre: 'Lo-Fi Chill',
    emoji: '☕',
    bpm: 80,
    bgGradient: 'from-amber-500 to-rose-500',
  },
  {
    id: 'romantic',
    name: 'Sweet Acoustic Love',
    genre: 'Romantic Acoustic',
    emoji: '🌸',
    bpm: 95,
    bgGradient: 'from-pink-500 to-purple-500',
  },
  {
    id: 'y2k',
    name: 'Y2K Retro Pop Synth',
    genre: 'Y2K Pop',
    emoji: '✨',
    bpm: 120,
    bgGradient: 'from-cyan-500 to-pink-500',
  },
  {
    id: 'jazz',
    name: 'Midnight Jazz Studio',
    genre: 'Jazz Lounge',
    emoji: '🎷',
    bpm: 88,
    bgGradient: 'from-indigo-600 to-slate-900',
  },
  {
    id: 'party',
    name: 'Celebration Dance Party',
    genre: 'Upbeat Party',
    emoji: '🎉',
    bpm: 128,
    bgGradient: 'from-amber-400 to-pink-600',
  },
];

/**
 * Memutar musik background buatan Web Audio Synthesizer secara konsisten di semua browser/HP
 * tanpa bergantung pada file mp3 luar (100% offline & bebas masalah CORS).
 */
export function playSynthesizedTrack(trackId: string, durationSeconds = 10): { stop: () => void; audioContext: AudioContext; stream: MediaStream } {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();

  const mainGain = ctx.createGain();
  mainGain.gain.setValueAtTime(0.25, ctx.currentTime);
  mainGain.connect(ctx.destination);

  const mediaStreamDest = ctx.createMediaStreamDestination();
  mainGain.connect(mediaStreamDest);

  let isPlaying = true;
  let timerId: any = null;

  // Frekuensi tangga nada pentatonik / manis
  const notesMap: Record<string, number[]> = {
    lofi: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25], // C Major 7th
    romantic: [293.66, 369.99, 440.0, 554.37, 587.33],     // D Major 7th
    y2k: [329.63, 415.3, 493.88, 622.25, 659.25],         // E Major
    jazz: [220.0, 261.63, 311.13, 392.0, 440.0, 523.25],    // A Minor 7th
    party: [261.63, 329.63, 392.0, 440.0, 523.25, 659.25],
  };

  const notes = notesMap[trackId] || notesMap.lofi;
  const bpm = musicTracks.find((t) => t.id === trackId)?.bpm || 90;
  const beatInterval = (60 / bpm) * 1000;

  let noteIdx = 0;

  function scheduleNextNote() {
    if (!isPlaying) return;

    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      const freq = notes[noteIdx % notes.length];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = trackId === 'y2k' ? 'sawtooth' : trackId === 'party' ? 'square' : 'triangle';

      noteGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(noteGain);
      noteGain.connect(mainGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      noteIdx++;
    } catch { }

    timerId = setTimeout(scheduleNextNote, beatInterval / 2);
  }

  scheduleNextNote();

  // Matikan otomatis setelah durasi selesai
  setTimeout(() => {
    stop();
  }, durationSeconds * 1000);

  function stop() {
    isPlaying = false;
    if (timerId) clearTimeout(timerId);
    try {
      mainGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      setTimeout(() => ctx.close(), 150);
    } catch { }
  }

  return { stop, audioContext: ctx, stream: mediaStreamDest.stream };
}
