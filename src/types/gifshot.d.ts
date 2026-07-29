declare module 'gifshot' {
  export interface GifShotOptions {
    images?: string[];
    video?: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (captureProgress: number) => void;
    completeCallback?: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void;
  }

  export function createGIF(
    options: GifShotOptions,
    callback: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void
  ): void;

  export function isSupported(): boolean;
}
