const SUPABASE_URL = 'https://uavkpgqvcrvfwtjfjutc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmtwZ3F2Y3J2Znd0amZqdXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjQxMzEsImV4cCI6MjEwMDk0MDEzMX0.bmffaNgd5Hi9pT-zdC9P7JmpQr9JFFcj7_jkI9slaWw';

async function updateZifaName() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Prefer': 'return=representation'
  };

  try {
    // 1. Fetch current transaction record for #SNAP-390800
    const resGet = await fetch(SUPABASE_URL + '/rest/v1/transactions?id=eq.' + encodeURIComponent('#SNAP-390800'), { headers });
    const records = await resGet.json();
    console.log('FOUND RECORD:', records);

    if (records && records.length > 0) {
      const rec = records[0];
      rec.customer_name = 'Zifa';

      // Delete old
      await fetch(SUPABASE_URL + '/rest/v1/transactions?id=eq.' + encodeURIComponent('#SNAP-390800'), {
        method: 'DELETE',
        headers
      });

      // Insert updated
      const resPost = await fetch(SUPABASE_URL + '/rest/v1/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify(rec)
      });
      const data = await resPost.json();
      console.log('ZIFA NAME UPDATE SUCCESS:', data);
    }
  } catch (e) {
    console.error('ERROR:', e);
  }
}

updateZifaName();
