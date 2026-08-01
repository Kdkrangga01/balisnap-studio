const SUPABASE_URL = 'https://uavkpgqvcrvfwtjfjutc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmtwZ3F2Y3J2Znd0amZqdXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjQxMzEsImV4cCI6MjEwMDk0MDEzMX0.bmffaNgd5Hi9pT-zdC9P7JmpQr9JFFcj7_jkI9slaWw';

const svgRaw = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
  <rect width="400" height="520" fill="#09090b" rx="24"/>
  <rect x="20" y="20" width="360" height="480" fill="#18181b" rx="20" stroke="#a855f7" stroke-width="2.5"/>
  <circle cx="200" cy="70" r="28" fill="#22c55e" fill-opacity="0.2" stroke="#22c55e" stroke-width="2"/>
  <path d="M190 70 l7 7 l14 -14" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="200" y="125" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle" font-family="sans-serif">PEMBAYARAN BERHASIL</text>
  <text x="200" y="148" fill="#a1a1aa" font-size="12" text-anchor="middle" font-family="sans-serif">QRIS / M-BANKING BRI</text>
  
  <line x1="40" y1="170" x2="360" y2="170" stroke="#27272a" stroke-width="2" stroke-dasharray="6,6"/>
  
  <text x="50" y="205" fill="#a1a1aa" font-size="13" font-family="sans-serif">Nama Pelanggan:</text>
  <text x="350" y="205" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="end" font-family="sans-serif">Iloza (Ceweku)</text>
  
  <text x="50" y="245" fill="#a1a1aa" font-size="13" font-family="sans-serif">Paket Photobooth:</text>
  <text x="350" y="245" fill="#ec4899" font-size="14" font-weight="bold" text-anchor="end" font-family="sans-serif">PREMIUM VIP (60 Hari)</text>
  
  <text x="50" y="285" fill="#a1a1aa" font-size="13" font-family="sans-serif">Metode Bayar:</text>
  <text x="350" y="285" fill="#c084fc" font-size="13" font-weight="bold" text-anchor="end" font-family="sans-serif">QRIS Transfer Bank</text>

  <text x="50" y="325" fill="#a1a1aa" font-size="13" font-family="sans-serif">Tanggal &amp; Waktu:</text>
  <text x="350" y="325" fill="#e4e4e7" font-size="13" text-anchor="end" font-family="sans-serif">01 Agustus 2026, 16:15 WITA</text>
  
  <line x1="40" y1="355" x2="360" y2="355" stroke="#27272a" stroke-width="2"/>
  
  <text x="50" y="395" fill="#a1a1aa" font-size="14" font-weight="bold" font-family="sans-serif">Total Transfer:</text>
  <text x="350" y="395" fill="#4ade80" font-size="22" font-weight="900" text-anchor="end" font-family="monospace">Rp 135.000</text>
  
  <rect x="50" y="425" width="300" height="42" fill="#22c55e" fill-opacity="0.15" rx="12" stroke="#22c55e" stroke-opacity="0.4"/>
  <text x="200" y="451" fill="#4ade80" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">✓ Terverifikasi Otomatis BaliSnap Studio</text>
</svg>`;

const validBase64Image = 'data:image/svg+xml;base64,' + Buffer.from(svgRaw).toString('base64');

async function updateRecord() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Prefer': 'return=representation'
  };

  // Delete old
  await fetch(SUPABASE_URL + '/rest/v1/transactions?id=eq.' + encodeURIComponent('#SNAP-399033'), {
    method: 'DELETE',
    headers
  });

  const payload = {
    id: '#SNAP-399033',
    date: '1/8/2026 16.15',
    customer_name: 'Iloza (Ceweku)',
    payment_proof_url: validBase64Image,
    package_name: 'Paket PREMIUM VIP Pass (60 Hari)',
    package_tier: 'premium',
    amount: 135000,
    payment_method: 'QRIS Pribadi',
    status: 'Lunas',
    customer_note: 'Bukti transfer QRIS m-Banking'
  };

  const res = await fetch(SUPABASE_URL + '/rest/v1/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('BASE64 PROOF UPDATE SUCCESS:', data ? data.length : 0);
}

updateRecord();
