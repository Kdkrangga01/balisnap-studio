import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  lanIp?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 190,
  className = '',
  lanIp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    let targetUrl = value;

    // Perbaiki isu localhost agar HP bisa mengakses URL di jaringan WiFi lokal / domain
    if (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
      const activeIp = lanIp || localStorage.getItem('balisnap_dev_ip') || '';
      if (activeIp) {
        targetUrl = targetUrl.replace(/localhost|127\.0\.0\.1/g, activeIp);
      }
    }

    // Render QR Code 100% offline & jernih menggunakan library qrcode lokal
    QRCode.toCanvas(
      canvasRef.current,
      targetUrl,
      {
        width: size,
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          console.error('Gagal membuat QR Code:', err);
        }
      }
    );
  }, [value, size, lanIp]);

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white border border-pink-200 rounded-2xl shadow-sm ${className}`}>
      <canvas ref={canvasRef} className="rounded-xl shadow-inner max-w-full" style={{ width: size, height: size }} />
    </div>
  );
};
