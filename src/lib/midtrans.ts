/**
 * Midtrans Snap Client Integration Helper for BaliSnap Studio
 */

declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

/**
 * Load Midtrans Snap Script dynamically into the document
 */
export function loadMidtransSnapScript(clientKey: string, isSandbox = true): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.snap) {
      return resolve(true);
    }

    const scriptId = 'midtrans-snap-script';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);

    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Gagal memuat script Midtrans Snap.');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export interface TriggerSnapPaymentOptions {
  snapToken: string;
  clientKey: string;
  isSandbox?: boolean;
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

/**
 * Trigger Midtrans Snap Popup Window
 */
export async function triggerMidtransSnapPayment({
  snapToken,
  clientKey,
  isSandbox = true,
  onSuccess,
  onPending,
  onError,
  onClose,
}: TriggerSnapPaymentOptions): Promise<void> {
  const isLoaded = await loadMidtransSnapScript(clientKey, isSandbox);
  if (!isLoaded || !window.snap) {
    throw new Error('Midtrans Snap SDK gagal dimuat.');
  }

  window.snap.pay(snapToken, {
    onSuccess: (result) => {
      console.log('Payment success:', result);
      if (onSuccess) onSuccess(result);
    },
    onPending: (result) => {
      console.log('Payment pending:', result);
      if (onPending) onPending(result);
    },
    onError: (result) => {
      console.error('Payment error:', result);
      if (onError) onError(result);
    },
    onClose: () => {
      console.log('Payment popup closed');
      if (onClose) onClose();
    },
  });
}
