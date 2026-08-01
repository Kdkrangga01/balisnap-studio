const SUPABASE_URL = 'https://uavkpgqvcrvfwtjfjutc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmtwZ3F2Y3J2Znd0amZqdXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjQxMzEsImV4cCI6MjEwMDk0MDEzMX0.bmffaNgd5Hi9pT-zdC9P7JmpQr9JFFcj7_jkI9slaWw';

const sampleProofSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%231e1b4b" rx="20"/><rect x="15" y="15" width="270" height="370" fill="%230f172a" rx="15" stroke="%23818cf8" stroke-width="2"/><text x="150" y="50" fill="%23a7f3d0" font-size="18" font-weight="bold" text-anchor="middle">BUKTI TRANSFER SUCCESS</text><text x="150" y="80" fill="%23ffffff" font-size="14" text-anchor="middle">BANK BRI / QRIS DANA</text><line x1="30" y1="100" x2="270" y2="100" stroke="%23334155" stroke-width="2"/><text x="40" y="130" fill="%2394a3b8" font-size="12">Pengirim:</text><text x="260" y="130" fill="%23ffffff" font-size="12" font-weight="bold" text-anchor="end">Iloza (Ceweku)</text><text x="40" y="160" fill="%2394a3b8" font-size="12">Penerima:</text><text x="260" y="160" fill="%23ffffff" font-size="12" font-weight="bold" text-anchor="end">BaliSnap Studio</text><text x="40" y="190" fill="%2394a3b8" font-size="12">Paket:</text><text x="260" y="190" fill="%23fb7185" font-size="12" font-weight="bold" text-anchor="end">PREMIUM VIP (60 Hari)</text><text x="40" y="220" fill="%2394a3b8" font-size="12">Nominal:</text><text x="260" y="220" fill="%2334d399" font-size="16" font-weight="bold" text-anchor="end">Rp 135.000</text><line x1="30" y1="250" x2="270" y2="250" stroke="%23334155" stroke-width="2"/><text x="150" y="290" fill="%2338bdf8" font-size="12" text-anchor="middle">Status: TERVERIFIKASI LUNAS ✅</text><text x="150" y="320" fill="%2364748b" font-size="10" text-anchor="middle">Ref: #SNAP-VIP-2026-OK</text></svg>';

async function replaceRecord() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Prefer': 'return=representation'
  };

  // 1. Delete old
  await fetch(SUPABASE_URL + '/rest/v1/transactions?id=eq.' + encodeURIComponent('#SNAP-399033'), {
    method: 'DELETE',
    headers
  });

  // 2. Insert new with full data
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

  const payload = {
    id: '#SNAP-399033',
    date: formattedDate,
    customer_name: 'Iloza (Ceweku)',
    payment_proof_url: sampleProofSvg,
    package_name: 'Paket PREMIUM VIP Pass (60 Hari)',
    package_tier: 'premium',
    amount: 135000,
    payment_method: 'QRIS Pribadi',
    status: 'Lunas',
    customer_note: 'Bukti transfer terverifikasi & diupload pelanggan'
  };

  const res = await fetch(SUPABASE_URL + '/rest/v1/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('REPLACE SUCCESS:', data);
}

replaceRecord();
