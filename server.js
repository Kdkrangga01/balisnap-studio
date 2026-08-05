import http from 'http';
import fs from 'fs';

if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) {
      process.env[key.trim()] = val.trim();
    }
  });
}

const PORT = process.env.PORT || 3000;
const DESTINATION_URL = 'https://near.tl/sm/fp1ti-Gmk';

const server = http.createServer(async (req, res) => {
  const url = req.url;

  if (url === '/scan' || url.startsWith('/scan?')) {
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
        console.log(`[SIGAP System] Sending WA notification to 3 numbers: ${targets}`);
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
        }).then(r => r.json()).then(resData => {
          console.log('[SIGAP System] Fonnte API Result:', resData);
        }).catch(err => console.error('[SIGAP System] Fonnte Error:', err));
      }

      res.writeHead(302, { Location: DESTINATION_URL });
      res.end();
      return;
    } catch (err) {
      console.error('Error handling scan:', err);
      res.writeHead(302, { Location: DESTINATION_URL });
      res.end();
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>SIGAP SMPN 3 Nusa Penida - Scan Server Active</h1><p>Test Scan Endpoint: <a href="/scan">/scan</a></p>');
});

server.listen(PORT, () => {
  console.log(`[SIGAP Server] Running on http://localhost:${PORT}`);
  console.log(`[SIGAP Server] Test Scan Link: http://localhost:${PORT}/scan`);
});
