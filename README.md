# BaliSnap Studio

Aplikasi photobooth digital interaktif berbasis web untuk pengambilan, kustomisasi, dan pencetakan foto strip virtual. Dibangun dengan arsitektur modern menggunakan React 19, TypeScript, Konva canvas engine, Tailwind CSS, dan terintegrasi dengan Midtrans Payment Gateway serta Supabase.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud%20Storage%20%26%20DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Konva](https://img.shields.io/badge/Canvas-React%20Konva-0D9488?style=flat-square)](https://konvajs.org/)

---

## Alur Aplikasi (User Workflow)

1. **Halaman Utama (Landing)**: Pengenalan produk, showcase hasil foto strip, dan tombol mulai sesi.
2. **Pilihan Frame (Select Frame)**: Pemilihan tata letak strip foto (2-pose, 3-pose, 4-pose, format Polaroid, dan tema kustom).
3. **Sesi Pemotretan (Live Capture)**:
   - Akses kamera real-time via `react-webcam`.
   - Countdown otomatis antar pose dan efek flash visual.
   - Pilihan retake pose individual jika hasil foto belum sesuai.
4. **Editor Kanvas (Studio Editor)**:
   - Manipulasi objek foto menggunakan engine grafis `Konva` / `react-konva`.
   - Penerapan filter warna (Normal, B&W, Vintage, Cyberpunk, Warm, Cool).
   - Penambahan stiker dekoratif interaktif (drag, drop, rotate, scale).
   - Pilihan warna latar belakang dan teks kustom.
5. **Finalisasi & Pembayaran (Preview & Checkout)**:
   - Integrasi Midtrans Snap untuk pembayaran digital (QRIS, GoPay, Bank Transfer).
   - Pembuatan Digital Envelope berisikan tautan dan QR Code unik untuk mengunduh strip foto resolusi tinggi serta format animasi GIF.
   - Backup otomatis hasil cetak ke cloud storage Supabase.

---

## Fitur Teknis Utama

- **High-Performance Canvas Rendering**: Manipulasi layer foto, stiker, dan teks secara deklaratif dengan `react-konva` tanpa degradasi performa frame rate.
- **Generator Animasi GIF**: Penggabungan deretan pose menjadi moving GIF secara client-side via library `gifshot`.
- **Payment Gateway Midtrans**: Verifikasi pembayaran otomatis sebelum akses unduh hasil cetak terbuka.
- **Digital Envelope & QR Code**: Pembuatan QR code client-side menggunakan library `qrcode` untuk mempermudah transfer foto langsung ke smartphone pengunjung.
- **Export Laporan Transaksi**: Kemampuan ekspor riwayat sesi pemotretan ke format spreadsheet Excel (`exceljs`) untuk rekap pendapatan.
- **Penyimpanan Cloud Supabase**: Manajemen database transaksi dan media storage bucket untuk menyimpan hasil render strip beresolusi tinggi.

---

## Spesifikasi Stack Teknologi

| Komponen | Library / Layanan |
|---|---|
| **Core Framework** | React 19, TypeScript |
| **Build Tool** | Vite 8 |
| **Canvas Manipulation** | Konva, React-Konva |
| **Webcam Integration** | react-webcam |
| **UI & Styling** | Tailwind CSS v4, Lucide React, Framer Motion |
| **Media Export** | gifshot, canvas-confetti, qrcode, sharp |
| **Backend & Storage** | Supabase (PostgreSQL, Storage Bucket, Edge Functions) |
| **Payment Gateway** | Midtrans Snap (QRIS, E-Wallet) |
| **Linter** | Oxlint |

---

## Struktur Direktori Proyek

```text
balisnap-studio/
├── public/                 # Aset statis publik, logo, audio shutter
├── src/
│   ├── components/         # Komponen UI modular
│   │   ├── editor/         # Tool panel filter, stiker, text, background
│   │   ├── CheckoutModal.tsx
│   │   ├── DigitalEnvelopeModal.tsx
│   │   └── Navbar.tsx
│   ├── context/            # PhotoboothContext (state pose, frame, stiker)
│   ├── data/               # Katalog frame dan aset stiker
│   ├── lib/                # Modul ekspor gambar, koneksi Midtrans, Supabase
│   ├── pages/              # Landing, SelectFrame, Capture, Editor, Preview
│   ├── App.tsx             # Manajemen rute aplikasi
│   └── main.tsx            # Entry point React
├── supabase/               # Edge Functions & skema SQL
├── index.html              # Template root HTML
├── package.json            # Daftar dependensi modul
└── vite.config.ts          # Konfigurasi bundler Vite
