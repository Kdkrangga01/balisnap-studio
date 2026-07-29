/**
 * Helper modul audio mobile untuk kompatibilitas perekaman & pemutaran suara
 * di iOS Safari (iPhone/iPad), Android Chrome, dan Desktop Browser.
 */

export function getBestAudioMimeType(): string {
  const candidateTypes = [
    'audio/mp4',
    'audio/aac',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg',
    'audio/wav',
  ];

  if (typeof MediaRecorder !== 'undefined') {
    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  return '';
}

export function getAudioExtension(mimeType: string): string {
  const lower = (mimeType || '').toLowerCase();
  if (lower.includes('mp4') || lower.includes('aac') || lower.includes('m4a')) {
    return 'm4a';
  }
  if (lower.includes('wav')) {
    return 'wav';
  }
  if (lower.includes('ogg')) {
    return 'ogg';
  }
  return 'webm';
}

export function createMobileAudioElement(src: string): HTMLAudioElement {
  const audio = new Audio();
  audio.setAttribute('playsinline', 'true');
  audio.setAttribute('webkit-playsinline', 'true');
  audio.preload = 'auto';
  audio.src = src;
  return audio;
}
