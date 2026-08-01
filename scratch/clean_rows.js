const SUPABASE_URL = 'https://uavkpgqvcrvfwtjfjutc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmtwZ3F2Y3J2Znd0amZqdXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjQxMzEsImV4cCI6MjEwMDk0MDEzMX0.bmffaNgd5Hi9pT-zdC9P7JmpQr9JFFcj7_jkI9slaWw';

async function cleanDuplicateRows() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Prefer': 'return=representation'
  };

  // Delete test row #SNAP-399033
  await fetch(SUPABASE_URL + '/rest/v1/transactions?id=eq.' + encodeURIComponent('#SNAP-399033'), {
    method: 'DELETE',
    headers
  });

  // Delete double/accidental Basic row #SNAP-873940
  await fetch(SUPABASE_URL + '/rest/v1/transactions?id=eq.' + encodeURIComponent('#SNAP-873940'), {
    method: 'DELETE',
    headers
  });

  // Check remaining rows
  const res = await fetch(SUPABASE_URL + '/rest/v1/transactions?select=*', { headers });
  const data = await res.json();
  console.log('REMAINING CLEAN ROWS:', data);
}

cleanDuplicateRows();
