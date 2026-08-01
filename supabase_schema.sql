-- ===============================================================
-- BALISNAP STUDIO: SUPABASE DATABASE SCHEMA FOR TRANSACTIONS
-- Copy dan Paste seluruh script ini ke SQL Editor di Supabase
-- (https://app.supabase.com -> Project Anda -> SQL Editor -> New Query)
-- ===============================================================

-- 1. Buat Tabel `transactions`
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    customer_name TEXT DEFAULT 'Pelanggan Photobooth',
    payment_proof_url TEXT DEFAULT '',
    package_name TEXT NOT NULL,
    package_tier TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Lunas',
    customer_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan kolom jika tabel sudah ada sebelumnya
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT 'Pelanggan Photobooth';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_proof_url TEXT DEFAULT '';

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Hapus policy lama jika ada (agar tidak error saat di-run ulang)
DROP POLICY IF EXISTS "Allow public read access" ON public.transactions;
DROP POLICY IF EXISTS "Allow public insert access" ON public.transactions;
DROP POLICY IF EXISTS "Allow public update access" ON public.transactions;
DROP POLICY IF EXISTS "Allow public delete access" ON public.transactions;

-- 5. Izinkan Akses Baca (SELECT) untuk Publik/Anonim
CREATE POLICY "Allow public read access"
ON public.transactions
FOR SELECT
USING (true);

-- 6. Izinkan Akses Tambah (INSERT) untuk Publik/Anonim (Pembeli)
CREATE POLICY "Allow public insert access"
ON public.transactions
FOR INSERT
WITH CHECK (true);

-- 7. Izinkan Akses Update (UPDATE) untuk Publik/Anonim
CREATE POLICY "Allow public update access"
ON public.transactions
FOR UPDATE
USING (true);

-- 8. Izinkan Akses Hapus (DELETE) untuk Admin/Anonim
CREATE POLICY "Allow public delete access"
ON public.transactions
FOR DELETE
USING (true);

-- 8. Indeks untuk mempercepat pencarian data berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ===============================================================
-- 9. Buat Tabel `feedbacks` (Ulasan, Kritik & Saran)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Pengunjung Studio',
    rating INT NOT NULL DEFAULT 5,
    category TEXT NOT NULL DEFAULT 'ulasan',
    comment TEXT NOT NULL,
    avatar_color TEXT DEFAULT 'from-pink-500 to-rose-400',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) pada tabel feedbacks
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow public read access on feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Allow public insert access on feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Allow public delete access on feedbacks" ON public.feedbacks;

-- Izinkan Akses Baca (SELECT) untuk Publik/Anonim
CREATE POLICY "Allow public read access on feedbacks"
ON public.feedbacks FOR SELECT USING (true);

-- Izinkan Akses Tambah (INSERT) untuk Publik/Anonim
CREATE POLICY "Allow public insert access on feedbacks"
ON public.feedbacks FOR INSERT WITH CHECK (true);

-- Izinkan Akses Hapus (DELETE) untuk Admin/Anonim
CREATE POLICY "Allow public delete access on feedbacks"
ON public.feedbacks FOR DELETE USING (true);

-- Indeks untuk mempercepat pengurutan ulasan berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

