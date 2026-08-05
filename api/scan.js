// Vercel Serverless Function / API Endpoint
// Handles QR Code scan events, sends WA notifications to 3 phone numbers, and redirects visitor to target form.

export default async function handler(req, res) {
  try {
    const now = new Date();
    
    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(now);

    const timeFormatted = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now).replace('.', ':') + ' WITA';

    // Target WhatsApp Phone Numbers (3 authorized receivers)
    const phone1 = process.env.PHONE_NUMBER_1 || '082144957565';
    const phone2 = process.env.PHONE_NUMBER_2 || '085337475146';
    const phone3 = process.env.PHONE_NUMBER_3 || '082363501506';
    const fonnteToken = process.env.FONNTE_TOKEN || '45RbgTcwycDSsk1v3tjZ';

    const targets = [phone1, phone2, phone3].filter(Boolean).join(',');

    const message = `📢 *[INFO AKSES LAYANAN SIGAP]*
*SMP NEGERI 3 NUSA PENIDA*
─────────────────────────

Halo Tim SIGAP,

Seseorang baru saja membuka QR Code Layanan Pencegahan & Pengaduan Perundungan.

📊 *Detail Informasi:*
  🗓️ *Tanggal* : ${dateFormatted}
  ⏰ *Waktu*   : ${timeFormatted}
  📍 *Lokasi*  : QR Code Poster Anti-Bullying
  📌 *Status*  : Halaman Utama Pengaduan Berhasil Terbuka

─────────────────────────
_Pesan ini dikirimkan secara otomatis oleh Sistem SIGAP._`;

    if (fonnteToken && targets) {
      fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: targets,
          message: message
        })
      }).catch(err => console.error('WA API Error:', err));
    }

    const destinationUrl = 'https://near.tl/sm/fp1ti-Gmk';
    
    res.writeHead(302, { Location: destinationUrl });
    res.end();
  } catch (error) {
    console.error('Scan handler error:', error);
    res.writeHead(302, { Location: 'https://near.tl/sm/fp1ti-Gmk' });
    res.end();
  }
}
