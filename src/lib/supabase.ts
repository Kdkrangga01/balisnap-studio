import type { TransactionRecord } from '../context/PhotoboothContext';

/**
 * Konfigurasi Supabase Client via REST API (PostgREST API)
 * Bebas dari kebergantungan library eksternal yang berat.
 */
const RAW_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_URL = RAW_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://your-project-id.supabase.co');
};


const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation',
});

/**
 * Mengambil daftar riwayat transaksi dari tabel `transactions` di Supabase Cloud.
 */
export async function fetchCloudTransactions(): Promise<TransactionRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.warn('Gagal mengambil transaksi dari Supabase:', await response.text());
      return null;
    }

    const data = await response.json();

    // Map database snake_case columns to TypeScript TransactionRecord format
    return data.map((item: any) => ({
      id: item.id || item.invoice_id,
      date: item.date || item.created_at,
      customerName: item.customer_name || 'Pelanggan Photobooth',
      paymentProofUrl: item.payment_proof_url || '',
      packageName: item.package_name,
      packageTier: item.package_tier,
      amount: Number(item.amount),
      paymentMethod: item.payment_method,
      status: item.status || 'Lunas',
      customerNote: item.customer_note || '',
    }));
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }
}

/**
 * Menyimpan transaksi baru ke tabel `transactions` di Supabase Cloud secara real-time.
 */
export async function saveCloudTransaction(record: TransactionRecord): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const payload = {
    id: record.id,
    date: record.date,
    customer_name: record.customerName || 'Pelanggan Photobooth',
    payment_proof_url: record.paymentProofUrl || '',
    package_name: record.packageName,
    package_tier: record.packageTier,
    amount: record.amount,
    payment_method: record.paymentMethod,
    status: record.status,
    customer_note: record.customerNote || '',
  };

  // Attempt save with up to 3 retries for high reliability on mobile networks
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return true;
      }

      const errText = await response.text();
      console.warn(`Supabase save attempt ${attempt} failed:`, errText);
    } catch (error) {
      console.error(`Supabase save attempt ${attempt} error:`, error);
    }
    // Wait 500ms before retry
    await new Promise(r => setTimeout(r, 500));
  }

  return false;
}

/**
 * Menghapus data transaksi berdasarkan ID dari Supabase Cloud.
 */
export async function deleteCloudTransaction(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return response.ok;
  } catch (error) {
    console.error('Supabase delete error:', error);
    return false;
  }
}
