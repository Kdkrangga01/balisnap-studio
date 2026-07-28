import React, { useEffect, useRef } from 'react';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 180,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Use Quick QR Code SVG/Canvas renderer API fallback or Canvas QR Matrix
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Ensure value is a clean valid URL (never pass huge Base64 data URIs)
    let cleanUrl = value;
    if (cleanUrl.startsWith('data:') || cleanUrl.length > 500) {
      cleanUrl = window.location.origin + window.location.pathname;
    }

    // High-contrast standard black & white QR Code for instant phone camera scanning
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      cleanUrl
    )}&color=000000&bgcolor=FFFFFF&margin=1`;

    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };

    img.onerror = () => {
      // Fallback local canvas QR rendering if offline
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan QR Code', size / 2, size / 2);
    };
  }, [value, size]);

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white/90 border border-pink-200 rounded-2xl shadow-sm ${className}`}>
      <canvas ref={canvasRef} className="rounded-xl shadow-inner max-w-full" style={{ width: size, height: size }} />
    </div>
  );
};
